import { Prisma } from "../../generated/prisma/client";
import prisma from "../../config/prisma.js";
import type {
  CreateContributionInput,
  CreateGoalInput,
  UpdateGoalInput,
} from "./goal.schema.js";

function toNumber(value: Prisma.Decimal | number): number {
  return Number(value);
}

function calculateProgress(
  currentAmount: Prisma.Decimal | number,
  targetAmount: Prisma.Decimal | number,
) {
  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);

  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
}

function serializeGoal<
  T extends {
    currentAmount: Prisma.Decimal | number;
    targetAmount: Prisma.Decimal | number;
  },
>(goal: T) {
  const progress = calculateProgress(
    goal.currentAmount,
    goal.targetAmount,
  );

  const currentAmount = toNumber(goal.currentAmount);
  const targetAmount = toNumber(goal.targetAmount);

  return {
    ...goal,
    currentAmount,
    targetAmount,
    progress,
    remainingAmount: Math.max(targetAmount - currentAmount, 0),
  };
}

export async function createGoal(
  userId: string,
  data: CreateGoalInput,
) {
  const goal = await prisma.financialGoal.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate,
      color: data.color,
      icon: data.icon,
    },
  });

  return serializeGoal(goal);
}

export async function listGoals(userId: string) {
  const goals = await prisma.financialGoal.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          contributions: true,
        },
      },
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        targetDate: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return goals.map(serializeGoal);
}

export async function getGoal(
  userId: string,
  goalId: string,
) {
  const goal = await prisma.financialGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    include: {
      contributions: {
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: {
          contributions: true,
        },
      },
    },
  });

  if (!goal) {
    throw new Error("Meta não encontrada.");
  }

  return serializeGoal(goal);
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: UpdateGoalInput,
) {
  const existingGoal = await prisma.financialGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!existingGoal) {
    throw new Error("Meta não encontrada.");
  }

  const updateData: Prisma.FinancialGoalUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.targetAmount !== undefined) {
    updateData.targetAmount = data.targetAmount;
  }

  if (data.targetDate !== undefined) {
    updateData.targetDate = data.targetDate;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  const goal = await prisma.financialGoal.update({
    where: {
      id: goalId,
    },
    data: updateData,
  });

  return serializeGoal(goal);
}

export async function deleteGoal(
  userId: string,
  goalId: string,
) {
  const existingGoal = await prisma.financialGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
  });

  if (!existingGoal) {
    throw new Error("Meta não encontrada.");
  }

  await prisma.financialGoal.update({
    where: {
      id: goalId,
    },
    data: {
      status: "CANCELLED",
    },
  });
}

export async function addContribution(
  userId: string,
  goalId: string,
  data: CreateContributionInput,
) {
  return prisma.$transaction(async (tx) => {
    const goal = await tx.financialGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new Error("Meta não encontrada.");
    }

    if (goal.status === "CANCELLED") {
      throw new Error(
        "Não é possível adicionar contribuição a uma meta cancelada.",
      );
    }

    const remainingAmount =
      Number(goal.targetAmount) - Number(goal.currentAmount);

    if (remainingAmount <= 0) {
      throw new Error("Esta meta já atingiu o valor desejado.");
    }

    if (data.amount > remainingAmount) {
      throw new Error(
        `A contribuição não pode ser maior que o valor restante de R$ ${remainingAmount.toFixed(2)}.`,
      );
    }

    const contribution = await tx.goalContribution.create({
      data: {
        goalId,
        amount: data.amount,
        date: data.date,
        description: data.description,
      },
    });

    const newCurrentAmount =
      Number(goal.currentAmount) + data.amount;

    const newStatus =
      newCurrentAmount >= Number(goal.targetAmount)
        ? "COMPLETED"
        : "ACTIVE";

    const updatedGoal = await tx.financialGoal.update({
      where: {
        id: goalId,
      },
      data: {
        currentAmount: newCurrentAmount,
        status: newStatus,
      },
    });

    return {
      contribution,
      goal: serializeGoal(updatedGoal),
    };
  });
}

export async function listContributions(
  userId: string,
  goalId: string,
) {
  const goal = await prisma.financialGoal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!goal) {
    throw new Error("Meta não encontrada.");
  }

  return prisma.goalContribution.findMany({
    where: {
      goalId,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function deleteContribution(
  userId: string,
  goalId: string,
  contributionId: string,
) {
  return prisma.$transaction(async (tx) => {
    const goal = await tx.financialGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new Error("Meta não encontrada.");
    }

    const contribution = await tx.goalContribution.findFirst({
      where: {
        id: contributionId,
        goalId,
      },
    });

    if (!contribution) {
      throw new Error("Contribuição não encontrada.");
    }

    const newCurrentAmount = Math.max(
      Number(goal.currentAmount) - Number(contribution.amount),
      0,
    );

    await tx.goalContribution.delete({
      where: {
        id: contributionId,
      },
    });

    const newStatus =
      goal.status === "CANCELLED"
        ? "CANCELLED"
        : newCurrentAmount >= Number(goal.targetAmount)
          ? "COMPLETED"
          : "ACTIVE";

    const updatedGoal = await tx.financialGoal.update({
      where: {
        id: goalId,
      },
      data: {
        currentAmount: newCurrentAmount,
        status: newStatus,
      },
    });

    return serializeGoal(updatedGoal);
  });
}