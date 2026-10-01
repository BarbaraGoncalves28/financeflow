import prisma from "../../config/prisma.js";
import { getFinancialIntelligence } from "../insights/insights.service.js";

export async function getDashboardSummary(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const [
    accounts,
    transactions,
    creditCards,
    goals,
    budgets,
  ] = await Promise.all([
    prisma.account.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        currentBalance: "desc",
      },
    }),

    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    }),

    prisma.creditCard.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        invoices: {
          where: {
            status: {
              in: ["OPEN", "CLOSED"],
            },
          },
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    }),

    prisma.financialGoal.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        targetDate: "asc",
      },
    }),

    prisma.budget.findMany({
      where: {
        userId,
      },
      include: {
        categories: true,
      },
    }),
  ]);

  const totalBalance = accounts.reduce(
    (total, account) =>
      total + Number(account.currentBalance),
    0,
  );

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    );

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0,
    );

  const balanceVariation =
    totalIncome - totalExpenses;

  const expensesByCategory = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      amount: number;
    }
  >();

  for (const transaction of transactions) {
    if (transaction.type !== "EXPENSE") {
      continue;
    }

    const existing = expensesByCategory.get(
      transaction.categoryId,
    );

    if (existing) {
      existing.amount += Number(transaction.amount);
    } else {
      expensesByCategory.set(transaction.categoryId, {
        categoryId: transaction.categoryId,
        categoryName: transaction.category.name,
        amount: Number(transaction.amount),
      });
    }
  }

  const categoryExpenses = Array.from(
    expensesByCategory.values(),
  ).sort((a, b) => b.amount - a.amount);

  const recentTransactions = transactions
    .slice(0, 10)
    .map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      amount: Number(transaction.amount),
      date: transaction.date,
      status: transaction.status,
      account: {
        id: transaction.account.id,
        name: transaction.account.name,
      },
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
      },
    }));

  const activeGoals = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: Number(goal.targetAmount),
    currentAmount: Number(goal.currentAmount),
    remainingAmount: Math.max(
      Number(goal.targetAmount) -
        Number(goal.currentAmount),
      0,
    ),
    progress:
      Number(goal.targetAmount) > 0
        ? Math.min(
            (Number(goal.currentAmount) /
              Number(goal.targetAmount)) *
              100,
            100,
          )
        : 0,
    targetDate: goal.targetDate,
    status: goal.status,
  }));

  const totalCreditLimit = creditCards.reduce(
    (total, card) =>
      total + Number(card.creditLimit),
    0,
  );

  const totalAvailableCredit = creditCards.reduce(
    (total, card) =>
      total + Number(card.availableLimit),
    0,
  );

  return {
    period: {
      startDate,
      endDate,
    },

    summary: {
      totalBalance,
      totalIncome,
      totalExpenses,
      balanceVariation,
    },

    accounts: {
      total: accounts.length,
      items: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        currentBalance: Number(
          account.currentBalance,
        ),
      })),
    },

    expensesByCategory: categoryExpenses,

    recentTransactions,

    creditCards: {
      total: creditCards.length,
      totalCreditLimit,
      totalAvailableCredit,
      totalUsedCredit:
        totalCreditLimit - totalAvailableCredit,
    },

    goals: {
      total: activeGoals.length,
      items: activeGoals,
    },

    budgets: {
      total: budgets.length,
      items: budgets,
    },
  };
}

export async function getDashboardOverview(
  userId: string,
) {
  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
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

  const transactions =
    await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
      orderBy: {
        date: "asc",
      },
    });

  const months = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1,
      );

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
      };
    },
  );

  const overview = months.map(({ year, month }) => {
    const monthTransactions =
      transactions.filter((transaction) => {
        const transactionDate =
          new Date(transaction.date);

        return (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() === month
        );
      });

    const income = monthTransactions
      .filter(
        (transaction) =>
          transaction.type === "INCOME",
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0,
      );

    const expenses = monthTransactions
      .filter(
        (transaction) =>
          transaction.type === "EXPENSE",
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0,
      );

    return {
      year,
      month: month + 1,
      label: new Intl.DateTimeFormat("pt-BR", {
        month: "short",
      }).format(
        new Date(year, month, 1),
      ),
      income,
      expenses,
      balance: income - expenses,
    };
  });

  return {
    period: {
      startDate,
      endDate,
    },
    months: overview,
  };
}

export async function getDashboardCashFlow(userId: string) {
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
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    orderBy: {
      date: "asc",
    },
  });

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const dailyData = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const day = index + 1;

      return {
        day,
        date: new Date(
          now.getFullYear(),
          now.getMonth(),
          day,
        ),
        income: 0,
        expenses: 0,
        balance: 0,
        accumulatedBalance: 0,
      };
    },
  );

  for (const transaction of transactions) {
    const transactionDate = new Date(transaction.date);

    const day = transactionDate.getDate();

    const item = dailyData[day - 1];

    if (!item) {
      continue;
    }

    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      item.income += amount;
    }

    if (transaction.type === "EXPENSE") {
      item.expenses += amount;
    }
  }

  let accumulatedBalance = 0;

  for (const item of dailyData) {
    item.balance = item.income - item.expenses;

    accumulatedBalance += item.balance;

    item.accumulatedBalance = accumulatedBalance;
  }

  return {
    period: {
      startDate,
      endDate,
    },
    days: dailyData,
  };
}

export async function getDashboardInsights(
  userId: string,
) {
  const intelligence =
    await getFinancialIntelligence(userId);

  return {
    generatedAt: intelligence.generatedAt,

    spending: intelligence.spending,
    concentration: intelligence.concentration,
    projection: intelligence.projection,
    monthlyComparison: intelligence.monthlyComparison,
    budget: intelligence.budget,
    goals: intelligence.goals,
    recurring: intelligence.recurring,
  };
}