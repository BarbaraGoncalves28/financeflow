import prisma from "../../config/prisma.js";

import { createNotification } from "./notifications.service.js";

import {
  getExpenseConcentrationInsights,
  getGoalInsights,
  getMonthlyExpenseProjection,
  getSpendingInsights,
} from "../insights/insights.service.js";

function startOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

async function checkBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      categories: true,
    },
  });

  for (const budget of budgets) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        status: {
          not: "CANCELLED",
        },
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
        ...(budget.categories.length > 0
          ? {
              categoryId: {
                in: budget.categories.map(
                  (budgetCategory) => budgetCategory.categoryId,
                ),
              },
            }
          : {}),
      },
      select: {
        amount: true,
      },
    });

    const spent = transactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    );

    const limit = Number(budget.totalLimit);

    if (limit <= 0) {
      continue;
    }

    const percentage = (spent / limit) * 100;

    let threshold: 80 | 90 | 100 | null = null;

    if (percentage >= 100) {
      threshold = 100;
    } else if (percentage >= 90) {
      threshold = 90;
    } else if (percentage >= 80) {
      threshold = 80;
    }

    if (!threshold) {
      continue;
    }

    await createNotification({
      userId,
      type: "BUDGET",
      title:
        threshold === 100
          ? "Orçamento atingido"
          : "Orçamento próximo do limite",
      message:
        threshold === 100
          ? `O orçamento "${budget.name}" atingiu ou ultrapassou o limite de R$ ${limit.toFixed(2)}.`
          : `O orçamento "${budget.name}" já utilizou ${percentage.toFixed(0)}% do limite.`,
      notificationKey: `budget:${budget.id}:${threshold}`,
      metadata: {
        budgetId: budget.id,
        budgetName: budget.name,
        spent,
        limit,
        percentage,
        threshold,
      },
    });
  }
}

async function checkGoals(userId: string) {
  const goals = await prisma.financialGoal.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  for (const goal of goals) {
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);

    if (target <= 0) {
      continue;
    }

    const percentage = (current / target) * 100;

    let threshold: 50 | 75 | 100 | null = null;

    if (percentage >= 100) {
      threshold = 100;
    } else if (percentage >= 75) {
      threshold = 75;
    } else if (percentage >= 50) {
      threshold = 50;
    }

    if (!threshold) {
      continue;
    }

    await createNotification({
      userId,
      type: "GOAL",
      title:
        threshold === 100
          ? "Meta alcançada"
          : "Progresso da sua meta",
      message:
        threshold === 100
          ? `Parabéns! A meta "${goal.name}" foi alcançada.`
          : `Você já alcançou ${percentage.toFixed(0)}% da meta "${goal.name}".`,
      notificationKey: `goal:${goal.id}:${threshold}`,
      metadata: {
        goalId: goal.id,
        goalName: goal.name,
        currentAmount: current,
        targetAmount: target,
        percentage,
        threshold,
      },
    });
  }
}

async function checkInvoices(userId: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      creditCard: {
        userId,
      },
      status: {
        in: ["OPEN", "CLOSED"],
      },
    },
    include: {
      creditCard: {
        select: {
          name: true,
          lastFourDigits: true,
        },
      },
    },
  });

  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const threeDaysFromNow = endOfDay(addDays(now, 3));

  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate);

    if (invoice.status === "CLOSED" && dueDate < today) {
      await createNotification({
        userId,
        type: "INVOICE",
        title: "Fatura vencida",
        message: `A fatura do cartão "${invoice.creditCard.name}" está vencida.`,
        notificationKey: `invoice:${invoice.id}:overdue`,
        metadata: {
          invoiceId: invoice.id,
          creditCardName: invoice.creditCard.name,
          dueDate: invoice.dueDate.toISOString(),
          totalAmount: Number(invoice.totalAmount),
        },
      });

      continue;
    }

    if (dueDate >= today && dueDate <= todayEnd) {
      await createNotification({
        userId,
        type: "INVOICE",
        title: "Fatura vence hoje",
        message: `A fatura do cartão "${invoice.creditCard.name}" vence hoje.`,
        notificationKey: `invoice:${invoice.id}:today`,
        metadata: {
          invoiceId: invoice.id,
          creditCardName: invoice.creditCard.name,
          dueDate: invoice.dueDate.toISOString(),
          totalAmount: Number(invoice.totalAmount),
        },
      });

      continue;
    }

    if (dueDate > todayEnd && dueDate <= threeDaysFromNow) {
      await createNotification({
        userId,
        type: "INVOICE",
        title: "Fatura próxima do vencimento",
        message: `A fatura do cartão "${invoice.creditCard.name}" vence nos próximos dias.`,
        notificationKey: `invoice:${invoice.id}:upcoming`,
        metadata: {
          invoiceId: invoice.id,
          creditCardName: invoice.creditCard.name,
          dueDate: invoice.dueDate.toISOString(),
          totalAmount: Number(invoice.totalAmount),
        },
      });
    }
  }
}

async function checkRecurringTransactions(userId: string) {
  const recurringTransactions =
    await prisma.recurringTransaction.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const upcomingLimit = endOfDay(addDays(now, 3));

  for (const recurring of recurringTransactions) {
    const nextRunDate = new Date(recurring.nextRunDate);

    if (nextRunDate >= today && nextRunDate <= todayEnd) {
      await createNotification({
        userId,
        type: "RECURRING",
        title: "Lançamento recorrente hoje",
        message: `O lançamento recorrente "${recurring.description}" está programado para hoje.`,
        notificationKey: `recurring:${recurring.id}:today:${today.toISOString().slice(0, 10)}`,
        metadata: {
          recurringTransactionId: recurring.id,
          description: recurring.description,
          amount: Number(recurring.amount),
          nextRunDate: recurring.nextRunDate.toISOString(),
        },
      });

      continue;
    }

    if (nextRunDate > todayEnd && nextRunDate <= upcomingLimit) {
      await createNotification({
        userId,
        type: "RECURRING",
        title: "Lançamento recorrente próximo",
        message: `O lançamento recorrente "${recurring.description}" está programado para os próximos dias.`,
        notificationKey: `recurring:${recurring.id}:upcoming:${nextRunDate.toISOString().slice(0, 10)}`,
        metadata: {
          recurringTransactionId: recurring.id,
          description: recurring.description,
          amount: Number(recurring.amount),
          nextRunDate: recurring.nextRunDate.toISOString(),
        },
      });
    }
  }
}

async function checkSpendingInsights(userId: string) {
  const result = await getSpendingInsights(userId);

  for (const insight of result.insights) {
    await createNotification({
      userId,
      type: "INSIGHT",
      title: insight.title,
      message: insight.message,
      notificationKey:
        `insight:spending-increase:` +
        `${insight.category.id}:` +
        `${result.period.current.startDate.toISOString().slice(0, 7)}`,
      metadata: {
        insightType: insight.type,
        severity: insight.severity,
        category: insight.category,
        currentAmount: insight.currentAmount,
        previousAmount: insight.previousAmount,
        difference: insight.difference,
        percentageChange: insight.percentageChange,
        period: result.period,
      },
    });
  }
}

async function checkExpenseConcentration(userId: string) {
  const result = await getExpenseConcentrationInsights(userId);

  if (!result.insight) {
    return;
  }

  const periodKey =
    result.period.startDate.toISOString().slice(0, 7);

  await createNotification({
    userId,
    type: "INSIGHT",
    title: result.insight.title,
    message: result.insight.message,
    notificationKey:
      `insight:expense-concentration:${periodKey}`,
    metadata: {
      insightType: result.insight.type,
      severity: result.insight.severity,
      totalExpenses: result.totalExpenses,
      categoryCount: result.categoryCount,
      topCategories: result.topCategories,
      concentration: result.concentration,
      period: result.period,
    },
  });
}

async function checkMonthlyProjection(userId: string) {
  const result = await getMonthlyExpenseProjection(userId);

  if (result.current.totalExpenses <= 0) {
    return;
  }

  const currentMonth =
    result.period.startDate.toISOString().slice(0, 7);

  const currentTotal = result.current.totalExpenses;
  const projectedTotal = result.projection.projectedTotal;

  if (projectedTotal <= currentTotal) {
    return;
  }

  const projectionIncrease =
    ((projectedTotal - currentTotal) / currentTotal) * 100;

  if (projectionIncrease < 20) {
    return;
  }

  await createNotification({
    userId,
    type: "INSIGHT",
    title: "Projeção de gastos elevada",
    message:
      `Mantendo o ritmo atual de gastos, sua despesa mensal ` +
      `pode chegar a R$ ${projectedTotal.toFixed(2)}.`,
    notificationKey:
      `insight:monthly-projection:${currentMonth}`,
    metadata: {
      insightType: "MONTHLY_EXPENSE_PROJECTION",
      totalExpenses: currentTotal,
      projectedTotal,
      projectedRemaining:
        result.projection.projectedRemaining,
      averageDailyExpense:
        result.current.averageDailyExpense,
      projectionIncrease,
      days: result.days,
      period: result.period,
    },
  });
}

async function checkGoalInsights(userId: string) {
  const result = await getGoalInsights(userId);

  for (const insight of result.insights) {
    if (
      insight.status !== "OVERDUE" &&
      insight.status !== "REQUIRES_CONTRIBUTION"
    ) {
      continue;
    }

    const goalId = insight.goal.id;

    const notificationType =
      insight.status === "OVERDUE"
        ? "overdue"
        : "requires-contribution";

    await createNotification({
      userId,
      type: "GOAL",
      title:
        insight.status === "OVERDUE"
          ? "Meta atrasada"
          : "Meta exige atenção",
      message:
        insight.status === "OVERDUE"
          ? `A meta "${insight.goal.name}" está atrasada.`
          : `A meta "${insight.goal.name}" precisa de uma contribuição mensal de aproximadamente R$ ${insight.timeline.requiredMonthlyContribution?.toFixed(2)} para atingir o objetivo no prazo.`,
      notificationKey:
        `goal-insight:${goalId}:${notificationType}`,
      metadata: {
        insightType: insight.type,
        severity: insight.severity,
        goal: insight.goal,
        progress: insight.progress,
        timeline: insight.timeline,
        status: insight.status,
      },
    });
  }
}

export async function runNotificationChecks() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  for (const user of users) {
    await checkBudgets(user.id);
    await checkGoals(user.id);
    await checkInvoices(user.id);
    await checkRecurringTransactions(user.id);

    await checkSpendingInsights(user.id);
    await checkExpenseConcentration(user.id);
    await checkMonthlyProjection(user.id);
    await checkGoalInsights(user.id);
  }
}