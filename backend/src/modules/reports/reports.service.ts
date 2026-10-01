import prisma from "../../config/prisma.js";

interface ReportPeriod {
  startDate: Date;
  endDate: Date;
}

export async function getFinancialSummary(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    select: {
      id: true,
      type: true,
      amount: true,
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      totalIncome += amount;
    }

    if (transaction.type === "EXPENSE") {
      totalExpenses += amount;
    }
  }

  const balance = totalIncome - totalExpenses;

  return {
    period: {
      startDate,
      endDate,
    },
    summary: {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
    },
  };
}

export async function getMonthlyReport(userId: string) {
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

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    select: {
      type: true,
      amount: true,
      date: true,
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

  const report = months.map(({ year, month }) => {
    const monthTransactions = transactions.filter(
      (transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() === month
        );
      },
    );

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
      }).format(new Date(year, month, 1)),
      income,
      expenses,
      balance: income - expenses,
      transactionCount: monthTransactions.length,
    };
  });

  return {
    period: {
      startDate,
      endDate,
    },
    months: report,
  };
}

export async function getExpensesByCategory(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
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
      transactionCount: number;
    }
  >();

  for (const transaction of transactions) {
    const category = transaction.category;

    const existing = categoryMap.get(category.id);

    if (existing) {
      existing.amount += Number(transaction.amount);
      existing.transactionCount += 1;
      continue;
    }

    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      amount: Number(transaction.amount),
      transactionCount: 1,
    });
  }

  const totalExpenses = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0,
  );

  const categories = Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      percentage:
        totalExpenses > 0
          ? (category.amount / totalExpenses) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    period: {
      startDate,
      endDate,
    },
    totalExpenses,
    categories,
  };
}

export async function getIncomeByCategory(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "INCOME",
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
      transactionCount: number;
    }
  >();

  for (const transaction of transactions) {
    const category = transaction.category;

    const existing = categoryMap.get(category.id);

    if (existing) {
      existing.amount += Number(transaction.amount);
      existing.transactionCount += 1;
      continue;
    }

    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      amount: Number(transaction.amount),
      transactionCount: 1,
    });
  }

  const totalIncome = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0,
  );

  const categories = Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      percentage:
        totalIncome > 0
          ? (category.amount / totalIncome) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    period: {
      startDate,
      endDate,
    },
    totalIncome,
    categories,
  };
}

export async function getAccountsReport(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      bank: true,
      type: true,
      color: true,
      icon: true,
      currentBalance: true,
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    select: {
      accountId: true,
      type: true,
      amount: true,
    },
  });

  const report = accounts
    .map((account) => {
      const accountTransactions = transactions.filter(
        (transaction) =>
          transaction.accountId === account.id,
      );

      const income = accountTransactions
        .filter(
          (transaction) =>
            transaction.type === "INCOME",
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0,
        );

      const expenses = accountTransactions
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
        id: account.id,
        name: account.name,
        bank: account.bank,
        type: account.type,
        color: account.color,
        icon: account.icon,
        currentBalance: Number(account.currentBalance),
        income,
        expenses,
        netMovement: income - expenses,
        transactionCount: accountTransactions.length,
      };
    })
    .sort((a, b) => b.netMovement - a.netMovement);

  const totalIncome = report.reduce(
    (total, account) =>
      total + account.income,
    0,
  );

  const totalExpenses = report.reduce(
    (total, account) =>
      total + account.expenses,
    0,
  );

  return {
    period: {
      startDate,
      endDate,
    },
    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      netMovement: totalIncome - totalExpenses,
    },
    accounts: report,
  };
}

export async function getCreditCardsReport(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
  const creditCards = await prisma.creditCard.findMany({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "BLOCKED"],
      },
    },
    select: {
      id: true,
      name: true,
      bank: true,
      lastFourDigits: true,
      creditLimit: true,
      availableLimit: true,
      closingDay: true,
      dueDay: true,
      color: true,
      icon: true,
    },
  });

  const purchases = await prisma.creditCardPurchase.findMany({
    where: {
      userId,
      purchaseDate: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    select: {
      id: true,
      creditCardId: true,
      totalAmount: true,
      installmentsCount: true,
      purchaseDate: true,
    },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      creditCard: {
        userId,
      },
      OR: [
        {
          closingDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    select: {
      id: true,
      creditCardId: true,
      referenceMonth: true,
      referenceYear: true,
      totalAmount: true,
      paidAmount: true,
      status: true,
      closingDate: true,
      dueDate: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const cards = creditCards.map((card) => {
    const cardPurchases = purchases.filter(
      (purchase) =>
        purchase.creditCardId === card.id,
    );

    const cardInvoices = invoices.filter(
      (invoice) =>
        invoice.creditCardId === card.id,
    );

    const purchaseAmount = cardPurchases.reduce(
      (total, purchase) =>
        total + Number(purchase.totalAmount),
      0,
    );

    const invoiceAmount = cardInvoices.reduce(
      (total, invoice) =>
        total + Number(invoice.totalAmount),
      0,
    );

    const paidAmount = cardInvoices.reduce(
      (total, invoice) =>
        total + Number(invoice.paidAmount),
      0,
    );

    const pendingAmount = Math.max(
      invoiceAmount - paidAmount,
      0,
    );

    const creditLimit = Number(card.creditLimit);
    const availableLimit = Number(card.availableLimit);
    const usedLimit = Math.max(
      creditLimit - availableLimit,
      0,
    );

    const usagePercentage =
      creditLimit > 0
        ? (usedLimit / creditLimit) * 100
        : 0;

    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      lastFourDigits: card.lastFourDigits,
      creditLimit,
      availableLimit,
      usedLimit,
      usagePercentage,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      color: card.color,
      icon: card.icon,
      purchases: {
        count: cardPurchases.length,
        amount: purchaseAmount,
        installments: cardPurchases.reduce(
          (total, purchase) =>
            total + purchase.installmentsCount,
          0,
        ),
      },
      invoices: {
        count: cardInvoices.length,
        totalAmount: invoiceAmount,
        paidAmount,
        pendingAmount,
        items: cardInvoices.map((invoice) => ({
          id: invoice.id,
          referenceMonth: invoice.referenceMonth,
          referenceYear: invoice.referenceYear,
          totalAmount: Number(invoice.totalAmount),
          paidAmount: Number(invoice.paidAmount),
          pendingAmount: Math.max(
            Number(invoice.totalAmount) -
              Number(invoice.paidAmount),
            0,
          ),
          status: invoice.status,
          closingDate: invoice.closingDate,
          dueDate: invoice.dueDate,
        })),
      },
    };
  });

  const totals = cards.reduce(
    (result, card) => {
      result.creditLimit += card.creditLimit;
      result.availableLimit += card.availableLimit;
      result.usedLimit += card.usedLimit;
      result.purchaseAmount += card.purchases.amount;
      result.purchaseCount += card.purchases.count;
      result.invoiceAmount += card.invoices.totalAmount;
      result.paidAmount += card.invoices.paidAmount;
      result.pendingAmount += card.invoices.pendingAmount;

      return result;
    },
    {
      creditLimit: 0,
      availableLimit: 0,
      usedLimit: 0,
      purchaseAmount: 0,
      purchaseCount: 0,
      invoiceAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    },
  );

  return {
    period: {
      startDate,
      endDate,
    },
    totals,
    cards,
  };
}

export async function getInstallmentsReport(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
  const installments = await prisma.installment.findMany({
    where: {
      status: "PENDING",
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
      invoiceItem: {
        invoice: {
          creditCard: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
      installmentNumber: true,
      totalInstallments: true,
      amount: true,
      dueDate: true,
      invoiceItem: {
        select: {
          description: true,
          purchaseId: true,
          invoice: {
            select: {
              creditCard: {
                select: {
                  id: true,
                  name: true,
                  lastFourDigits: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const totalPending = installments.reduce(
    (total, installment) =>
      total + Number(installment.amount),
    0,
  );

  const monthlyMap = new Map<
    string,
    {
      year: number;
      month: number;
      label: string;
      amount: number;
      installmentCount: number;
    }
  >();

  for (const installment of installments) {
    const dueDate = new Date(installment.dueDate);
    const year = dueDate.getFullYear();
    const month = dueDate.getMonth();

    const key = `${year}-${month}`;

    const existing = monthlyMap.get(key);

    if (existing) {
      existing.amount += Number(installment.amount);
      existing.installmentCount += 1;
      continue;
    }

    monthlyMap.set(key, {
      year,
      month: month + 1,
      label: new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        year: "numeric",
      }).format(dueDate),
      amount: Number(installment.amount),
      installmentCount: 1,
    });
  }

  const monthly = Array.from(monthlyMap.values()).sort(
    (a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return a.month - b.month;
    },
  );

  const cardMap = new Map<
    string,
    {
      id: string;
      name: string;
      lastFourDigits: string;
      amount: number;
      installmentCount: number;
    }
  >();

  for (const installment of installments) {
    const card =
      installment.invoiceItem.invoice.creditCard;

    const existing = cardMap.get(card.id);

    if (existing) {
      existing.amount += Number(installment.amount);
      existing.installmentCount += 1;
      continue;
    }

    cardMap.set(card.id, {
      id: card.id,
      name: card.name,
      lastFourDigits: card.lastFourDigits,
      amount: Number(installment.amount),
      installmentCount: 1,
    });
  }

  const cards = Array.from(cardMap.values()).sort(
    (a, b) => b.amount - a.amount,
  );

  const items = installments.map((installment) => ({
    id: installment.id,
    description:
      installment.invoiceItem.description,
    purchaseId:
      installment.invoiceItem.purchaseId,
    installmentNumber:
      installment.installmentNumber,
    totalInstallments:
      installment.totalInstallments,
    amount: Number(installment.amount),
    dueDate: installment.dueDate,
    creditCard: {
      id:
        installment.invoiceItem.invoice.creditCard.id,
      name:
        installment.invoiceItem.invoice.creditCard.name,
      lastFourDigits:
        installment.invoiceItem.invoice.creditCard
          .lastFourDigits,
    },
  }));

  return {
    period: {
      startDate,
      endDate,
    },
    summary: {
      pendingInstallmentCount: installments.length,
      totalPending,
    },
    monthly,
    cards,
    items,
  };
}

export async function getCategoryComparison(
  userId: string,
  { startDate, endDate }: ReportPeriod,
) {
  const periodDuration =
    endDate.getTime() - startDate.getTime();

  const previousEndDate = new Date(
    startDate.getTime() - 1,
  );

  const previousStartDate = new Date(
    previousEndDate.getTime() - periodDuration,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: previousStartDate,
        lte: endDate,
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
    const transactionDate = new Date(
      transaction.date,
    );

    const existing = categoryMap.get(category.id);

    if (existing) {
      if (
        transactionDate >= startDate &&
        transactionDate <= endDate
      ) {
        existing.currentAmount += Number(
          transaction.amount,
        );
      } else {
        existing.previousAmount += Number(
          transaction.amount,
        );
      }

      continue;
    }

    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      currentAmount:
        transactionDate >= startDate &&
        transactionDate <= endDate
          ? Number(transaction.amount)
          : 0,
      previousAmount:
        transactionDate < startDate
          ? Number(transaction.amount)
          : 0,
    });
  }

  const categories = Array.from(
    categoryMap.values(),
  )
    .map((category) => {
      const difference =
        category.currentAmount -
        category.previousAmount;

      let percentageChange = 0;

      if (category.previousAmount > 0) {
        percentageChange =
          (difference /
            category.previousAmount) *
          100;
      } else if (category.currentAmount > 0) {
        percentageChange = 100;
      }

      return {
        ...category,
        difference,
        percentageChange,
        increased: difference > 0,
        decreased: difference < 0,
      };
    })
    .sort(
      (a, b) =>
        Math.abs(b.difference) -
        Math.abs(a.difference),
    );

  const currentTotal = categories.reduce(
    (total, category) =>
      total + category.currentAmount,
    0,
  );

  const previousTotal = categories.reduce(
    (total, category) =>
      total + category.previousAmount,
    0,
  );

  const totalDifference =
    currentTotal - previousTotal;

  const totalPercentageChange =
    previousTotal > 0
      ? (totalDifference / previousTotal) * 100
      : currentTotal > 0
        ? 100
        : 0;

  return {
    currentPeriod: {
      startDate,
      endDate,
      totalExpenses: currentTotal,
    },
    previousPeriod: {
      startDate: previousStartDate,
      endDate: previousEndDate,
      totalExpenses: previousTotal,
    },
    comparison: {
      difference: totalDifference,
      percentageChange: totalPercentageChange,
      increased: totalDifference > 0,
      decreased: totalDifference < 0,
    },
    categories,
  };
}