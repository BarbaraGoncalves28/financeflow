import { Prisma } from "../../../generated/prisma/client.js";

import prisma from "../../config/prisma.js";

import type {
  CreateTransferInput,
  UpdateTransferInput,
} from "./transfer.schema.js";

function getBalanceImpact(
  status: "PENDING" | "COMPLETED" | "CANCELLED",
  amount: Prisma.Decimal,
) {
  if (status !== "COMPLETED") {
    return new Prisma.Decimal(0);
  }

  return amount;
}

async function validateAccounts(
  tx: Prisma.TransactionClient,
  userId: string,
  fromAccountId: string,
  toAccountId: string,
) {
  if (fromAccountId === toAccountId) {
    throw new Error("SAME_ACCOUNT");
  }

  const [fromAccount, toAccount] = await Promise.all([
    tx.account.findFirst({
      where: {
        id: fromAccountId,
        userId,
        isActive: true,
      },
    }),

    tx.account.findFirst({
      where: {
        id: toAccountId,
        userId,
        isActive: true,
      },
    }),
  ]);

  if (!fromAccount) {
    throw new Error("FROM_ACCOUNT_NOT_FOUND");
  }

  if (!toAccount) {
    throw new Error("TO_ACCOUNT_NOT_FOUND");
  }

  return {
    fromAccount,
    toAccount,
  };
}

export async function createTransfer(
  userId: string,
  data: CreateTransferInput,
) {
  const amount = new Prisma.Decimal(data.amount);

  return prisma.$transaction(async (tx) => {
    await validateAccounts(
      tx,
      userId,
      data.fromAccountId,
      data.toAccountId,
    );

    const balanceImpact = getBalanceImpact(
      data.status,
      amount,
    );

    if (
      !balanceImpact.isZero()
    ) {
      const fromAccount =
        await tx.account.findFirst({
          where: {
            id: data.fromAccountId,
            userId,
            isActive: true,
          },
        });

      if (!fromAccount) {
        throw new Error("FROM_ACCOUNT_NOT_FOUND");
      }

      if (
        fromAccount.currentBalance.lt(
          balanceImpact,
        )
      ) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      await tx.account.update({
        where: {
          id: data.fromAccountId,
        },
        data: {
          currentBalance: {
            decrement: balanceImpact,
          },
        },
      });

      await tx.account.update({
        where: {
          id: data.toAccountId,
        },
        data: {
          currentBalance: {
            increment: balanceImpact,
          },
        },
      });
    }

    return tx.transfer.create({
      data: {
        userId,
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount,
        date: new Date(data.date),
        status: data.status,

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
      select: {
        id: true,
        fromAccountId: true,
        toAccountId: true,
        amount: true,
        date: true,
        description: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
}

export async function listTransfers(
  userId: string,
) {
  return prisma.transfer.findMany({
    where: {
      userId,
    },
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
      fromAccountId: true,
      toAccountId: true,
      amount: true,
      date: true,
      description: true,
      notes: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      fromAccount: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
          color: true,
          icon: true,
        },
      },

      toAccount: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
          color: true,
          icon: true,
        },
      },
    },
  });
}

export async function findTransferById(
  userId: string,
  transferId: string,
) {
  return prisma.transfer.findFirst({
    where: {
      id: transferId,
      userId,
    },
    select: {
      id: true,
      fromAccountId: true,
      toAccountId: true,
      amount: true,
      date: true,
      description: true,
      notes: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      fromAccount: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
          color: true,
          icon: true,
        },
      },

      toAccount: {
        select: {
          id: true,
          name: true,
          bank: true,
          type: true,
          color: true,
          icon: true,
        },
      },
    },
  });
}

export async function updateTransfer(
  userId: string,
  transferId: string,
  data: UpdateTransferInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing =
      await tx.transfer.findFirst({
        where: {
          id: transferId,
          userId,
        },
      });

    if (!existing) {
      throw new Error("TRANSFER_NOT_FOUND");
    }

    const nextFromAccountId =
      data.fromAccountId ??
      existing.fromAccountId;

    const nextToAccountId =
      data.toAccountId ??
      existing.toAccountId;

    const nextAmount =
      data.amount !== undefined
        ? new Prisma.Decimal(data.amount)
        : existing.amount;

    const nextStatus =
      data.status ?? existing.status;

    await validateAccounts(
      tx,
      userId,
      nextFromAccountId,
      nextToAccountId,
    );

    const oldImpact = getBalanceImpact(
      existing.status,
      existing.amount,
    );

    const newImpact = getBalanceImpact(
      nextStatus,
      nextAmount,
    );

    if (!oldImpact.isZero()) {
      await tx.account.update({
        where: {
          id: existing.fromAccountId,
        },
        data: {
          currentBalance: {
            increment: oldImpact,
          },
        },
      });

      await tx.account.update({
        where: {
          id: existing.toAccountId,
        },
        data: {
          currentBalance: {
            decrement: oldImpact,
          },
        },
      });
    }

    if (!newImpact.isZero()) {
      const fromAccount =
        await tx.account.findFirst({
          where: {
            id: nextFromAccountId,
            userId,
            isActive: true,
          },
        });

      if (!fromAccount) {
        throw new Error(
          "FROM_ACCOUNT_NOT_FOUND",
        );
      }

      if (
        fromAccount.currentBalance.lt(
          newImpact,
        )
      ) {
        throw new Error(
          "INSUFFICIENT_BALANCE",
        );
      }

      await tx.account.update({
        where: {
          id: nextFromAccountId,
        },
        data: {
          currentBalance: {
            decrement: newImpact,
          },
        },
      });

      await tx.account.update({
        where: {
          id: nextToAccountId,
        },
        data: {
          currentBalance: {
            increment: newImpact,
          },
        },
      });
    }

    const updateData: Prisma.TransferUpdateInput =
      {
        ...(data.fromAccountId !== undefined && {
          fromAccountId: data.fromAccountId,
        }),

        ...(data.toAccountId !== undefined && {
          toAccountId: data.toAccountId,
        }),

        ...(data.amount !== undefined && {
          amount: nextAmount,
        }),

        ...(data.date !== undefined && {
          date: new Date(data.date),
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),
      };

    return tx.transfer.update({
      where: {
        id: transferId,
      },
      data: updateData,
      select: {
        id: true,
        fromAccountId: true,
        toAccountId: true,
        amount: true,
        date: true,
        description: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
}

export async function deleteTransfer(
  userId: string,
  transferId: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing =
      await tx.transfer.findFirst({
        where: {
          id: transferId,
          userId,
        },
      });

    if (!existing) {
      throw new Error("TRANSFER_NOT_FOUND");
    }

    const balanceImpact = getBalanceImpact(
      existing.status,
      existing.amount,
    );

    if (!balanceImpact.isZero()) {
      await tx.account.update({
        where: {
          id: existing.fromAccountId,
        },
        data: {
          currentBalance: {
            increment: balanceImpact,
          },
        },
      });

      await tx.account.update({
        where: {
          id: existing.toAccountId,
        },
        data: {
          currentBalance: {
            decrement: balanceImpact,
          },
        },
      });
    }

    await tx.transfer.delete({
      where: {
        id: transferId,
      },
    });
  });
}