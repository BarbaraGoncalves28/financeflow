import { Prisma } from "../../../generated/prisma/client.js";

import prisma from "../../config/prisma.js";

import type {
  CreateTransactionInput,
  ListTransactionsInput,
  UpdateTransactionInput,
} from "./transaction.schema.js";

function getBalanceImpact(
  type: "INCOME" | "EXPENSE",
  status: "PENDING" | "COMPLETED" | "CANCELLED",
  amount: Prisma.Decimal,
) {
  if (status !== "COMPLETED") {
    return new Prisma.Decimal(0);
  }

  return type === "INCOME"
    ? amount
    : amount.negated();
}

async function validateReferences(
  tx: Prisma.TransactionClient,
  userId: string,
  accountId: string,
  categoryId: string,
  subcategoryId: string | null | undefined,
  type: "INCOME" | "EXPENSE",
) {
  const account = await tx.account.findFirst({
    where: {
      id: accountId,
      userId,
      isActive: true,
    },
  });

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  const category = await tx.category.findFirst({
    where: {
      id: categoryId,
      userId,
      isActive: true,
    },
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  if (category.type !== type) {
    throw new Error("CATEGORY_TYPE_MISMATCH");
  }

  if (subcategoryId) {
    const subcategory = await tx.subcategory.findFirst({
      where: {
        id: subcategoryId,
        categoryId,
      },
    });

    if (!subcategory) {
      throw new Error("SUBCATEGORY_NOT_FOUND");
    }
  }

  return {
    account,
    category,
  };
}

export async function createTransaction(
  userId: string,
  data: CreateTransactionInput,
) {
  const amount = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    await validateReferences(
      tx,
      userId,
      data.accountId,
      data.categoryId,
      data.subcategoryId,
      data.type,
    );

    const transaction = await tx.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        status: data.status,
        description: data.description,
        amount,
        date: new Date(data.date),
        isRecurring: data.isRecurring,

        ...(data.subcategoryId !== undefined && {
          subcategoryId: data.subcategoryId,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
      select: {
        id: true,
        accountId: true,
        categoryId: true,
        subcategoryId: true,
        type: true,
        status: true,
        description: true,
        amount: true,
        date: true,
        notes: true,
        isRecurring: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const balanceImpact = getBalanceImpact(
      data.type,
      data.status,
      amount,
    );

    if (!balanceImpact.isZero()) {
      await tx.account.update({
        where: {
          id: data.accountId,
        },
        data: {
          currentBalance: {
            increment: balanceImpact,
          },
        },
      });
    }

    return transaction;
  });
}

export async function listTransactions(
  userId: string,
  filters: ListTransactionsInput,
) {
  const {
    page,
    limit,
    type,
    status,
    accountId,
    categoryId,
    startDate,
    endDate,
  } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    userId,

    ...(type !== undefined && {
      type,
    }),

    ...(status !== undefined && {
      status,
    }),

    ...(accountId !== undefined && {
      accountId,
    }),

    ...(categoryId !== undefined && {
      categoryId,
    }),

    ...(startDate !== undefined || endDate !== undefined
      ? {
          date: {
            ...(startDate !== undefined && {
              gte: new Date(startDate),
            }),

            ...(endDate !== undefined && {
              lte: new Date(endDate),
            }),
          },
        }
      : {}),
  };

  const [transactions, total, incomeResult, expenseResult] =
    await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            date: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: {
          id: true,
          accountId: true,
          categoryId: true,
          subcategoryId: true,
          type: true,
          status: true,
          description: true,
          amount: true,
          date: true,
          notes: true,
          isRecurring: true,
          createdAt: true,
          updatedAt: true,

          account: {
            select: {
              id: true,
              name: true,
              bank: true,
              type: true,
              color: true,
              icon: true,
            },
          },

          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
            },
          },

          subcategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.transaction.count({
        where,
      }),

      prisma.transaction.aggregate({
        where: {
          ...where,
          type: "INCOME",
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          ...where,
          type: "EXPENSE",
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

  const income =
    incomeResult._sum.amount ?? new Prisma.Decimal(0);

  const expenses =
    expenseResult._sum.amount ?? new Prisma.Decimal(0);

  const balance = income.minus(expenses);

  const totalPages = Math.ceil(total / limit);

  return {
    transactions,

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },

    summary: {
      income,
      expenses,
      balance,
    },
  };
}

export async function findTransactionById(
  userId: string,
  transactionId: string,
) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    select: {
      id: true,
      accountId: true,
      categoryId: true,
      subcategoryId: true,
      type: true,
      status: true,
      description: true,
      amount: true,
      date: true,
      notes: true,
      isRecurring: true,
      createdAt: true,
      updatedAt: true,

      account: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
          color: true,
          icon: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
          type: true,
          icon: true,
          color: true,
        },
      },

      subcategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    const nextAccountId =
      data.accountId ?? existing.accountId;

    const nextCategoryId =
      data.categoryId ?? existing.categoryId;

    const nextSubcategoryId =
      data.subcategoryId === undefined
        ? existing.subcategoryId
        : data.subcategoryId;

    const nextType =
      data.type ?? existing.type;

    const nextStatus =
      data.status ?? existing.status;

    const nextAmount =
      data.amount !== undefined
        ? new Prisma.Decimal(data.amount)
        : existing.amount;

    await validateReferences(
      tx,
      userId,
      nextAccountId,
      nextCategoryId,
      nextSubcategoryId,
      nextType,
    );

    const oldImpact = getBalanceImpact(
      existing.type,
      existing.status,
      existing.amount,
    );

    const newImpact = getBalanceImpact(
      nextType,
      nextStatus,
      nextAmount,
    );

    if (!oldImpact.isZero()) {
      await tx.account.update({
        where: {
          id: existing.accountId,
        },
        data: {
          currentBalance: {
            increment: oldImpact.negated(),
          },
        },
      });
    }

    if (!newImpact.isZero()) {
      await tx.account.update({
        where: {
          id: nextAccountId,
        },
        data: {
          currentBalance: {
            increment: newImpact,
          },
        },
      });
    }

    const updateData: Prisma.TransactionUpdateInput = {
      ...(data.accountId !== undefined && {
        accountId: data.accountId,
      }),

      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),

      ...(data.subcategoryId !== undefined && {
        subcategoryId: data.subcategoryId,
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.amount !== undefined && {
        amount: nextAmount,
      }),

      ...(data.date !== undefined && {
        date: new Date(data.date),
      }),

      ...(data.notes !== undefined && {
        notes: data.notes,
      }),

      ...(data.isRecurring !== undefined && {
        isRecurring: data.isRecurring,
      }),
    };

    return tx.transaction.update({
      where: {
        id: transactionId,
      },
      data: updateData,
      select: {
        id: true,
        accountId: true,
        categoryId: true,
        subcategoryId: true,
        type: true,
        status: true,
        description: true,
        amount: true,
        date: true,
        notes: true,
        isRecurring: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    const balanceImpact = getBalanceImpact(
      existing.type,
      existing.status,
      existing.amount,
    );

    if (!balanceImpact.isZero()) {
      await tx.account.update({
        where: {
          id: existing.accountId,
        },
        data: {
          currentBalance: {
            increment: balanceImpact.negated(),
          },
        },
      });
    }

    await tx.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  });
}