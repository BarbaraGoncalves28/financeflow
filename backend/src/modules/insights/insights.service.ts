import prisma from "../../config/prisma.js";

export async function getSpendingInsights(userId: string) {
  const now = new Date();

  const currentStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const currentEndDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const previousStartDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const previousEndDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: previousStartDate,
        lte: currentEndDate,
      },
    },
    select: {
      amount: true,
      date: true,
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
  });

  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
      currentAmount: number;
      previousAmount: number;
    }
  >();

  for (const transaction of transactions) {
    const category = transaction.category;
    const transactionDate = new Date(transaction.date);

    const existing = categoryMap.get(category.id);

    if (existing) {
      if (
        transactionDate >= currentStartDate &&
        transactionDate <= currentEndDate
      ) {
        existing.currentAmount += Number(transaction.amount);
      } else {
        existing.previousAmount += Number(transaction.amount);
      }

      continue;
    }

    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      currentAmount:
        transactionDate >= currentStartDate &&
        transactionDate <= currentEndDate
          ? Number(transaction.amount)
          : 0,
      previousAmount:
        transactionDate < currentStartDate
          ? Number(transaction.amount)
          : 0,
    });
  }

  const insights = Array.from(categoryMap.values())
    .filter(
      (category) =>
        category.currentAmount > 0 &&
        category.previousAmount > 0,
    )
    .map((category) => {
      const difference =
        category.currentAmount -
        category.previousAmount;

      const percentageChange =
        (difference / category.previousAmount) * 100;

      return {
        type: "SPENDING_INCREASE",
        severity:
          percentageChange >= 50
            ? "HIGH"
            : "MEDIUM",
        title: `Aumento nos gastos com ${category.name}`,
        message:
          `Os gastos aumentaram ${percentageChange.toFixed(1)}% ` +
          `em relação ao mês anterior.`,
        category: {
          id: category.id,
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
        currentAmount: category.currentAmount,
        previousAmount: category.previousAmount,
        difference,
        percentageChange,
      };
    })
    .filter(
      (category) =>
        category.percentageChange >= 20 &&
        category.difference >= 50,
    )
    .sort(
      (a, b) =>
        b.percentageChange - a.percentageChange,
    );

  return {
    generatedAt: now,
    period: {
      current: {
        startDate: currentStartDate,
        endDate: currentEndDate,
      },
      previous: {
        startDate: previousStartDate,
        endDate: previousEndDate,
      },
    },
    total: insights.length,
    insights,
  };
}

export async function getExpenseConcentrationInsights(
  userId: string,
) {
  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
  });

  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
      amount: number;
    }
  >();

  let totalExpenses = 0;

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);

    totalExpenses += amount;

    const category = transaction.category;
    const existing = categoryMap.get(category.id);

    if (existing) {
      existing.amount += amount;
      continue;
    }

    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      amount,
    });
  }

  const categories = Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      percentage:
        totalExpenses > 0
          ? (category.amount / totalExpenses) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategories = categories.slice(0, 3);

  const topCategoriesAmount = topCategories.reduce(
    (total, category) => total + category.amount,
    0,
  );

  const topCategoriesPercentage =
    totalExpenses > 0
      ? (topCategoriesAmount / totalExpenses) * 100
      : 0;

  const hasSignificantConcentration =
    topCategories.length >= 2 &&
    topCategoriesPercentage >= 70;

  return {
    generatedAt: now,

    period: {
      startDate,
      endDate,
    },

    totalExpenses,

    categoryCount: categories.length,

    topCategories,

    concentration: {
      topCategoriesCount: topCategories.length,
      amount: topCategoriesAmount,
      percentage: topCategoriesPercentage,
      threshold: 70,
      isSignificant: hasSignificantConcentration,
    },

    insight: hasSignificantConcentration
      ? {
          type: "EXPENSE_CONCENTRATION",
          severity: "INFO",
          title:
            "Grande parte dos gastos está concentrada em poucas categorias",
          message:
            `As ${topCategories.length} maiores categorias representam ` +
            `${topCategoriesPercentage.toFixed(1)}% dos gastos do período.`,
        }
      : null,
  };
}

export async function getMonthlyExpenseProjection(
  userId: string,
) {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1);

  const endDate = new Date(
    year,
    month + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      date: true,
    },
  });

  const totalExpenses = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0,
  );

  const currentDay = now.getDate();

  const totalDaysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const daysElapsed = Math.max(currentDay, 1);

  const daysRemaining = Math.max(
    totalDaysInMonth - currentDay,
    0,
  );

  const averageDailyExpense =
    totalExpenses / daysElapsed;

  const projectedTotal =
    averageDailyExpense * totalDaysInMonth;

  const projectedRemaining =
    averageDailyExpense * daysRemaining;

  return {
    generatedAt: now,

    period: {
      startDate,
      endDate,
    },

    days: {
      elapsed: daysElapsed,
      remaining: daysRemaining,
      total: totalDaysInMonth,
    },

    current: {
      totalExpenses,
      averageDailyExpense,
    },

    projection: {
      projectedTotal,
      projectedRemaining,
    },
  };
}

export async function getMonthlySpendingComparison(
  userId: string,
) {
  const now = new Date();

  const currentStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const currentDay = now.getDate();

  const currentEndDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    currentDay,
    23,
    59,
    59,
    999,
  );

  const previousStartDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const previousEndDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    currentDay,
    23,
    59,
    59,
    999,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: previousStartDate,
        lte: currentEndDate,
      },
    },
    select: {
      amount: true,
      date: true,
    },
  });

  let currentAmount = 0;
  let previousAmount = 0;

  for (const transaction of transactions) {
    const transactionDate = new Date(transaction.date);
    const amount = Number(transaction.amount);

    if (
      transactionDate >= currentStartDate &&
      transactionDate <= currentEndDate
    ) {
      currentAmount += amount;
      continue;
    }

    if (
      transactionDate >= previousStartDate &&
      transactionDate <= previousEndDate
    ) {
      previousAmount += amount;
    }
  }

  const difference =
    currentAmount - previousAmount;

  const percentageChange =
    previousAmount > 0
      ? (difference / previousAmount) * 100
      : null;

  return {
    generatedAt: now,

    period: {
      current: {
        startDate: currentStartDate,
        endDate: currentEndDate,
      },
      previous: {
        startDate: previousStartDate,
        endDate: previousEndDate,
      },
    },

    current: {
      amount: currentAmount,
    },

    previous: {
      amount: previousAmount,
    },

    comparison: {
      difference,
      percentageChange,
      direction:
        difference > 0
          ? "INCREASE"
          : difference < 0
            ? "DECREASE"
            : "STABLE",
    },
  };
}

export async function getBudgetInsights(userId: string) {
  const now = new Date();

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      isActive: true,
      startDate: {
        lte: now,
      },
      endDate: {
        gte: now,
      },
    },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
            },
          },
        },
      },
    },
  });

  if (budgets.length === 0) {
    return {
      generatedAt: now,
      totalBudgets: 0,
      totalCategories: 0,
      insights: [],
    };
  }

  const budgetStartDate = new Date(
    Math.min(
      ...budgets.map((budget) =>
        budget.startDate.getTime(),
      ),
    ),
  );

  const budgetEndDate = new Date(
    Math.max(
      ...budgets.map((budget) =>
        budget.endDate.getTime(),
      ),
    ),
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: budgetStartDate,
        lte: budgetEndDate,
      },
    },
    select: {
      amount: true,
      date: true,
      categoryId: true,
    },
  });

  const insights = [];

  for (const budget of budgets) {
    for (const budgetCategory of budget.categories) {
      const categoryTransactions =
        transactions.filter(
          (transaction) =>
            transaction.categoryId ===
              budgetCategory.categoryId &&
            transaction.date >= budget.startDate &&
            transaction.date <= budget.endDate,
        );

      const spent = categoryTransactions.reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0,
      );

      const limit = Number(
        budgetCategory.limitAmount,
      );

      const remaining = limit - spent;

      const percentageUsed =
        limit > 0
          ? (spent / limit) * 100
          : 0;

      let status:
        | "ON_TRACK"
        | "NEAR_LIMIT"
        | "OVER_LIMIT";

      if (percentageUsed >= 100) {
        status = "OVER_LIMIT";
      } else if (percentageUsed >= 80) {
        status = "NEAR_LIMIT";
      } else {
        status = "ON_TRACK";
      }

      insights.push({
        type: "BUDGET_USAGE",
        severity:
          status === "OVER_LIMIT"
            ? "HIGH"
            : status === "NEAR_LIMIT"
              ? "MEDIUM"
              : "INFO",

        budget: {
          id: budget.id,
          name: budget.name,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
        },

        category: {
          id: budgetCategory.category.id,
          name: budgetCategory.category.name,
          color: budgetCategory.category.color,
          icon: budgetCategory.category.icon,
        },

        limit,
        spent,
        remaining,
        percentageUsed,
        status,
      });
    }
  }

  return {
    generatedAt: now,
    totalBudgets: budgets.length,
    totalCategories: insights.length,
    insights,
  };
}

export async function getGoalInsights(userId: string) {
  const now = new Date();

  const goals = await prisma.financialGoal.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      contributions: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  const insights = goals.map((goal) => {
    const targetAmount = Number(goal.targetAmount);
    const currentAmount = Number(goal.currentAmount);

    const remainingAmount = Math.max(
      targetAmount - currentAmount,
      0,
    );

    const progressPercentage =
      targetAmount > 0
        ? (currentAmount / targetAmount) * 100
        : 0;

    let daysUntilTarget: number | null = null;
    let monthsUntilTarget: number | null = null;
    let requiredMonthlyContribution: number | null = null;

    if (goal.targetDate) {
      const targetDate = new Date(goal.targetDate);

      const millisecondsPerDay =
        1000 * 60 * 60 * 24;

      daysUntilTarget = Math.ceil(
        (targetDate.getTime() - now.getTime()) /
          millisecondsPerDay,
      );

      monthsUntilTarget = Math.max(
        1,
        Math.ceil(daysUntilTarget / 30),
      );

      requiredMonthlyContribution =
        remainingAmount > 0
          ? remainingAmount / monthsUntilTarget
          : 0;
    }

    let status:
      | "COMPLETED"
      | "ON_TRACK"
      | "REQUIRES_CONTRIBUTION"
      | "OVERDUE";

    if (remainingAmount <= 0) {
      status = "COMPLETED";
    } else if (
      daysUntilTarget !== null &&
      daysUntilTarget < 0
    ) {
      status = "OVERDUE";
    } else if (
      requiredMonthlyContribution !== null
    ) {
      status = "REQUIRES_CONTRIBUTION";
    } else {
      status = "ON_TRACK";
    }

    return {
      type: "FINANCIAL_GOAL",
      severity:
        status === "OVERDUE"
          ? "HIGH"
          : status === "REQUIRES_CONTRIBUTION"
            ? "MEDIUM"
            : "INFO",

      goal: {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        targetDate: goal.targetDate,
        status: goal.status,
        color: goal.color,
        icon: goal.icon,
      },

      progress: {
        targetAmount,
        currentAmount,
        remainingAmount,
        percentage: progressPercentage,
      },

      timeline: {
        daysUntilTarget,
        monthsUntilTarget,
        requiredMonthlyContribution,
      },

      contributions: {
        count: goal.contributions.length,
        total: goal.contributions.reduce(
          (total, contribution) =>
            total + Number(contribution.amount),
          0,
        ),
        lastContribution:
          goal.contributions.length > 0
            ? goal.contributions[
                goal.contributions.length - 1
              ]
            : null,
      },

      status,
    };
  });

  return {
    generatedAt: now,
    total: insights.length,
    insights,
  };
}

export async function getRecurringInsights(
  userId: string,
) {
  const now = new Date();

  const recurringTransactions =
    await prisma.recurringTransaction.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
        frequency: true,
        startDate: true,
        endDate: true,
        nextRunDate: true,
        notes: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        amount: "desc",
      },
    });

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  const insights = recurringTransactions.map(
    (recurring) => {
      const amount = Number(recurring.amount);

      let monthlyAmount = amount;
      let annualAmount = amount;

      switch (recurring.frequency) {
        case "DAILY":
          monthlyAmount = amount * 30;
          annualAmount = amount * 365;
          break;

        case "WEEKLY":
          monthlyAmount = (amount * 52) / 12;
          annualAmount = amount * 52;
          break;

        case "MONTHLY":
          monthlyAmount = amount;
          annualAmount = amount * 12;
          break;

        case "YEARLY":
          monthlyAmount = amount / 12;
          annualAmount = amount;
          break;
      }

      if (recurring.type === "EXPENSE") {
        monthlyExpenses += monthlyAmount;
      }

      if (recurring.type === "INCOME") {
        monthlyIncome += monthlyAmount;
      }

      return {
        id: recurring.id,
        description: recurring.description,
        type: recurring.type,
        frequency: recurring.frequency,
        amount,
        monthlyAmount,
        annualAmount,
        startDate: recurring.startDate,
        endDate: recurring.endDate,
        nextRunDate: recurring.nextRunDate,
        notes: recurring.notes,
        category: recurring.category,
        account: recurring.account,
      };
    },
  );

  const monthlyNetImpact =
    monthlyIncome - monthlyExpenses;

  const annualIncome = monthlyIncome * 12;
  const annualExpenses = monthlyExpenses * 12;

  const annualNetImpact =
    annualIncome - annualExpenses;

  const nextRecurring =
    [...insights]
      .filter(
        (recurring) =>
          new Date(recurring.nextRunDate) >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.nextRunDate).getTime() -
          new Date(b.nextRunDate).getTime(),
      )[0] ?? null;

  return {
    generatedAt: now,

    total: insights.length,

    summary: {
      monthlyIncome,
      monthlyExpenses,
      monthlyNetImpact,
      annualIncome,
      annualExpenses,
      annualNetImpact,
    },

    nextRecurring,

    insights,
  };
}

export async function getFinancialIntelligence(
  userId: string,
) {
  const [
    spending,
    concentration,
    projection,
    monthlyComparison,
    budget,
    goals,
    recurring,
  ] = await Promise.all([
    getSpendingInsights(userId),
    getExpenseConcentrationInsights(userId),
    getMonthlyExpenseProjection(userId),
    getMonthlySpendingComparison(userId),
    getBudgetInsights(userId),
    getGoalInsights(userId),
    getRecurringInsights(userId),
  ]);

  return {
    generatedAt: new Date(),
    spending,
    concentration,
    projection,
    monthlyComparison,
    budget,
    goals,
    recurring,
  };
}