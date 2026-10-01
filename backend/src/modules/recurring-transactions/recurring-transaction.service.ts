import prisma from "../../config/prisma.js";
import { Prisma } from "../../../generated/prisma/client";
import type {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "./recurring-transaction.schema.js";

async function validateReferences(
  userId: string,
  data: {
    accountId?: string;
    categoryId?: string;
    subcategoryId?: string | null;
    type?: "INCOME" | "EXPENSE";
  },
) {
  if (data.accountId) {
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        userId,
        isActive: true,
      },
    });

    if (!account) {
      throw new Error("Conta não encontrada ou inativa.");
    }
  }

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
        isActive: true,
      },
    });

    if (!category) {
      throw new Error("Categoria não encontrada ou inativa.");
    }

    if (data.type && category.type !== data.type) {
      throw new Error(
        "A categoria não corresponde ao tipo da transação.",
      );
    }
  }

  if (data.subcategoryId) {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        id: data.subcategoryId,
        category: {
          userId,
        },
      },
    });

    if (!subcategory) {
      throw new Error("Subcategoria não encontrada.");
    }

    if (data.categoryId && subcategory.categoryId !== data.categoryId) {
      throw new Error(
        "A subcategoria não pertence à categoria informada.",
      );
    }
  }
}

function validateDates(
  startDate?: Date,
  endDate?: Date | null,
  nextRunDate?: Date,
) {
  if (startDate && endDate && endDate < startDate) {
    throw new Error(
      "A data final não pode ser anterior à data inicial.",
    );
  }

  if (startDate && nextRunDate && nextRunDate < startDate) {
    throw new Error(
      "A próxima execução não pode ser anterior à data inicial.",
    );
  }

  if (endDate && nextRunDate && nextRunDate > endDate) {
    throw new Error(
      "A próxima execução não pode ser posterior à data final.",
    );
  }
}

function calculateNextRunDate(
  currentDate: Date,
  frequency:
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY"
    | "YEARLY",
) {
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createRecurringTransaction(
  userId: string,
  data: CreateRecurringTransactionInput,
) {
  await validateReferences(userId, data);

  const nextRunDate =
    data.nextRunDate ?? new Date(data.startDate);

  validateDates(
    data.startDate,
    data.endDate,
    nextRunDate,
  );

  const recurringTransaction =
    await prisma.recurringTransaction.create({
      data: {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        nextRunDate,
        notes: data.notes,
      },
      include: {
        account: true,
        category: true,
        subcategory: true,
      },
    });

  return recurringTransaction;
}

export async function listRecurringTransactions(
  userId: string,
) {
  return prisma.recurringTransaction.findMany({
    where: {
      userId,
    },
    include: {
      account: true,
      category: true,
      subcategory: true,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        nextRunDate: "asc",
      },
    ],
  });
}

export async function getRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
) {
  const recurringTransaction =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
      include: {
        account: true,
        category: true,
        subcategory: true,
      },
    });

  if (!recurringTransaction) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  return recurringTransaction;
}

export async function updateRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
  data: UpdateRecurringTransactionInput,
) {
  const existing =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
    });

  if (!existing) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  const finalType = data.type ?? existing.type;

  await validateReferences(userId, {
    accountId: data.accountId,
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId,
    type: finalType,
  });

  const finalStartDate =
    data.startDate ?? existing.startDate;

  const finalEndDate =
    data.endDate !== undefined
      ? data.endDate
      : existing.endDate;

  const finalNextRunDate =
    data.nextRunDate ?? existing.nextRunDate;

  validateDates(
    finalStartDate,
    finalEndDate,
    finalNextRunDate,
  );

  const recurringTransaction =
    await prisma.recurringTransaction.update({
      where: {
        id: recurringTransactionId,
      },
      data: {
        accountId: data.accountId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        nextRunDate: data.nextRunDate,
        notes: data.notes,
        status: data.status,
      },
      include: {
        account: true,
        category: true,
        subcategory: true,
      },
    });

  return recurringTransaction;
}

export async function deleteRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
) {
  const existing =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
    });

  if (!existing) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  return prisma.recurringTransaction.update({
    where: {
      id: recurringTransactionId,
    },
    data: {
      status: "CANCELLED",
    },
  });
}

export async function pauseRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
) {
  const existing =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
    });

  if (!existing) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  if (existing.status === "CANCELLED") {
    throw new Error(
      "Uma transação recorrente cancelada não pode ser pausada.",
    );
  }

  return prisma.recurringTransaction.update({
    where: {
      id: recurringTransactionId,
    },
    data: {
      status: "PAUSED",
    },
  });
}

export async function resumeRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
) {
  const existing =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
    });

  if (!existing) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  if (existing.status === "CANCELLED") {
    throw new Error(
      "Uma transação recorrente cancelada não pode ser reativada.",
    );
  }

  return prisma.recurringTransaction.update({
    where: {
      id: recurringTransactionId,
    },
    data: {
      status: "ACTIVE",
    },
  });
}

export async function executeRecurringTransaction(
  userId: string,
  recurringTransactionId: string,
) {
  const recurring =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
    });

  if (!recurring) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  if (recurring.status !== "ACTIVE") {
    throw new Error(
      "A transação recorrente não está ativa.",
    );
  }

  const scheduledDate = new Date(
    recurring.nextRunDate,
  );

  if (
    recurring.endDate &&
    scheduledDate > recurring.endDate
  ) {
    await prisma.recurringTransaction.update({
      where: {
        id: recurring.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    throw new Error(
      "A transação recorrente chegou ao fim do período definido.",
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const current =
        await tx.recurringTransaction.findUnique({
          where: {
            id: recurring.id,
          },
        });

      if (!current || current.status !== "ACTIVE") {
        throw new Error(
          "A transação recorrente não está mais ativa.",
        );
      }

      const transaction =
        await tx.transaction.create({
          data: {
            userId: current.userId,
            accountId: current.accountId,
            categoryId: current.categoryId,
            subcategoryId: current.subcategoryId,
            type: current.type,
            status: "COMPLETED",
            description: current.description,
            amount: current.amount,
            date: scheduledDate,
            notes: current.notes,
            isRecurring: true,
          },
        });

      await tx.recurringTransactionExecution.create({
        data: {
          recurringTransactionId: current.id,
          transactionId: transaction.id,
          scheduledDate,
        },
      });

      const balanceChange =
        current.type === "INCOME"
          ? current.amount
          : -current.amount;

      await tx.account.update({
        where: {
          id: current.accountId,
        },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });

      const nextRunDate = calculateNextRunDate(
        scheduledDate,
        current.frequency,
      );

      const shouldFinish =
        current.endDate &&
        nextRunDate > current.endDate;

      await tx.recurringTransaction.update({
        where: {
          id: current.id,
        },
        data: {
          nextRunDate,
          status: shouldFinish
            ? "CANCELLED"
            : "ACTIVE",
        },
      });

      return transaction;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const execution =
        await prisma.recurringTransactionExecution.findUnique({
          where: {
            recurringTransactionId_scheduledDate: {
              recurringTransactionId: recurring.id,
              scheduledDate,
            },
          },
          include: {
            transaction: true,
          },
        });

      if (execution) {
        return execution.transaction;
      }
    }

    throw error;
  }
}

export async function executeDueRecurringTransactions() {
  const now = new Date();

  const recurringTransactions =
    await prisma.recurringTransaction.findMany({
      where: {
        status: "ACTIVE",
        nextRunDate: {
          lte: now,
        },
      },
    });

  const results = [];

  for (const recurring of recurringTransactions) {
    let scheduledDate = new Date(
      recurring.nextRunDate,
    );

    let lastTransaction = null;
    let lastNextRunDate = scheduledDate;

    while (scheduledDate <= now) {
      if (
        recurring.endDate &&
        scheduledDate > recurring.endDate
      ) {
        await prisma.recurringTransaction.update({
          where: {
            id: recurring.id,
          },
          data: {
            status: "CANCELLED",
          },
        });

        break;
      }

      const nextRunDate = calculateNextRunDate(
        scheduledDate,
        recurring.frequency,
      );

      const shouldFinish =
        recurring.endDate &&
        nextRunDate > recurring.endDate;

      try {
        const transaction =
          await prisma.$transaction(async (tx) => {
            const current =
              await tx.recurringTransaction.findUnique({
                where: {
                  id: recurring.id,
                },
              });

            if (
              !current ||
              current.status !== "ACTIVE"
            ) {
              return null;
            }

            if (
              current.nextRunDate.getTime() !==
              scheduledDate.getTime()
            ) {
              return null;
            }

            const transaction =
              await tx.transaction.create({
                data: {
                  userId: current.userId,
                  accountId: current.accountId,
                  categoryId: current.categoryId,
                  subcategoryId: current.subcategoryId,
                  type: current.type,
                  status: "COMPLETED",
                  description: current.description,
                  amount: current.amount,
                  date: scheduledDate,
                  notes: current.notes,
                  isRecurring: true,
                },
              });

            await tx.recurringTransactionExecution.create({
              data: {
                recurringTransactionId: current.id,
                transactionId: transaction.id,
                scheduledDate,
              },
            });

            const balanceChange =
              current.type === "INCOME"
                ? current.amount
                : -current.amount;

            await tx.account.update({
              where: {
                id: current.accountId,
              },
              data: {
                currentBalance: {
                  increment: balanceChange,
                },
              },
            });

            await tx.recurringTransaction.update({
              where: {
                id: current.id,
              },
              data: {
                nextRunDate,
                status: shouldFinish
                  ? "CANCELLED"
                  : "ACTIVE",
              },
            });

            return transaction;
          });

        if (transaction) {
          lastTransaction = transaction;
          lastNextRunDate = nextRunDate;
        }
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
      }

      scheduledDate = new Date(nextRunDate);

      if (shouldFinish) {
        break;
      }
    }

    if (lastTransaction) {
      results.push({
        recurringTransactionId: recurring.id,
        transaction: lastTransaction,
        nextRunDate: lastNextRunDate,
      });
    }
  }

  return results;
}

export async function listRecurringTransactionExecutions(
  userId: string,
  recurringTransactionId: string,
) {
  const recurringTransaction =
    await prisma.recurringTransaction.findFirst({
      where: {
        id: recurringTransactionId,
        userId,
      },
    });

  if (!recurringTransaction) {
    throw new Error(
      "Transação recorrente não encontrada.",
    );
  }

  return prisma.recurringTransactionExecution.findMany({
    where: {
      recurringTransactionId,
    },
    include: {
      transaction: true,
    },
    orderBy: {
      scheduledDate: "desc",
    },
  });
}