import prisma from "../../config/prisma.js";
import type {
  AddBudgetCategoryInput,
  CreateBudgetInput,
  UpdateBudgetCategoryInput,
  UpdateBudgetInput,
} from "./budget.schema.js";

function toNumber(value: unknown): number {
  return Number(value);
}

function validateDateRange(
  startDate: Date,
  endDate: Date,
) {
  if (endDate <= startDate) {
    throw new Error(
      "A data final deve ser posterior à data inicial.",
    );
  }
}

async function validateCategories(
  userId: string,
  categories: CreateBudgetInput["categories"],
) {
  if (categories.length === 0) {
    return;
  }

  const categoryIds = categories.map(
    (category) => category.categoryId,
  );

  const uniqueCategoryIds = new Set(categoryIds);

  if (uniqueCategoryIds.size !== categoryIds.length) {
    throw new Error(
      "Uma categoria não pode ser adicionada duas vezes ao mesmo orçamento.",
    );
  }

  const userCategories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
      userId,
      type: "EXPENSE",
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (userCategories.length !== categoryIds.length) {
    throw new Error(
      "Uma ou mais categorias de despesa não foram encontradas.",
    );
  }
}

export async function createBudget(
  userId: string,
  data: CreateBudgetInput,
) {
  validateDateRange(data.startDate, data.endDate);

  await validateCategories(userId, data.categories);

  const budget = await prisma.budget.create({
    data: {
      userId,
      name: data.name,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      totalLimit: data.totalLimit,

      categories: {
        create: data.categories.map((category) => ({
          categoryId: category.categoryId,
          limitAmount: category.limitAmount,
        })),
      },
    },

    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });

  return {
    ...budget,

    totalLimit: budget.totalLimit.toString(),

    categories: budget.categories.map(
      (budgetCategory) => ({
        ...budgetCategory,

        limitAmount:
          budgetCategory.limitAmount.toString(),
      }),
    ),
  };
}

export async function listBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
    },

    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },

    orderBy: {
      startDate: "desc",
    },
  });

  return budgets.map((budget) => ({
    ...budget,

    totalLimit: budget.totalLimit.toString(),

    categories: budget.categories.map(
      (budgetCategory) => ({
        ...budgetCategory,

        limitAmount:
          budgetCategory.limitAmount.toString(),
      }),
    ),
  }));
}

export async function getBudget(
  userId: string,
  budgetId: string,
) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },

    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });

  if (!budget) {
    throw new Error("Orçamento não encontrado.");
  }

  return {
    ...budget,

    totalLimit: budget.totalLimit.toString(),

    categories: budget.categories.map(
      (budgetCategory) => ({
        ...budgetCategory,

        limitAmount:
          budgetCategory.limitAmount.toString(),
      }),
    ),
  };
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  data: UpdateBudgetInput,
) {
  const existingBudget =
    await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

  if (!existingBudget) {
    throw new Error("Orçamento não encontrado.");
  }

  const budget = await prisma.budget.update({
    where: {
      id: existingBudget.id,
    },

    data: {
  ...(data.name !== undefined && {
    name: data.name,
  }),
  ...(data.totalLimit !== undefined && {
    totalLimit: data.totalLimit,
  }),
  ...(data.isActive !== undefined && {
    isActive: data.isActive,
  }),
},

    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });

  return {
    ...budget,

    totalLimit: budget.totalLimit.toString(),

    categories: budget.categories.map(
      (budgetCategory) => ({
        ...budgetCategory,

        limitAmount:
          budgetCategory.limitAmount.toString(),
      }),
    ),
  };
}

export async function deleteBudget(
  userId: string,
  budgetId: string,
) {
  const existingBudget =
    await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

  if (!existingBudget) {
    throw new Error("Orçamento não encontrado.");
  }

  await prisma.budget.update({
    where: {
      id: existingBudget.id,
    },

    data: {
      isActive: false,
    },
  });

  return {
    message: "Orçamento desativado com sucesso.",
  };
}

export async function getBudgetSummary(
  userId: string,
  budgetId: string,
) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },

    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });

  if (!budget) {
    throw new Error("Orçamento não encontrado.");
  }

  const transactions =
    await prisma.transaction.findMany({
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
      },

      select: {
        amount: true,
        categoryId: true,
      },
    });

  const totalSpent = transactions.reduce(
    (total, transaction) =>
      total + toNumber(transaction.amount),
    0,
  );

  const totalLimit = toNumber(
    budget.totalLimit,
  );

  const totalRemaining = Math.max(
    totalLimit - totalSpent,
    0,
  );

  const totalPercentage =
    totalLimit > 0
      ? (totalSpent / totalLimit) * 100
      : 0;

  const categorySummaries =
    budget.categories.map(
      (budgetCategory) => {
        const spent = transactions
          .filter(
            (transaction) =>
              transaction.categoryId ===
              budgetCategory.categoryId,
          )
          .reduce(
            (total, transaction) =>
              total + toNumber(transaction.amount),
            0,
          );

        const limit = toNumber(
          budgetCategory.limitAmount,
        );

        const remaining = Math.max(
          limit - spent,
          0,
        );

        const percentage =
          limit > 0
            ? (spent / limit) * 100
            : 0;

        return {
          category: budgetCategory.category,

          limit: limit.toFixed(2),

          spent: spent.toFixed(2),

          remaining: remaining.toFixed(2),

          percentage: Number(
            percentage.toFixed(2),
          ),

          exceeded: spent > limit,
        };
      },
    );

  return {
    budget: {
      id: budget.id,
      name: budget.name,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      isActive: budget.isActive,
    },

    total: {
      limit: totalLimit.toFixed(2),
      spent: totalSpent.toFixed(2),
      remaining: totalRemaining.toFixed(2),
      percentage: Number(
        totalPercentage.toFixed(2),
      ),
      exceeded: totalSpent > totalLimit,
    },

    categories: categorySummaries,
  };
}

export async function addBudgetCategory(
  userId: string,
  budgetId: string,
  data: AddBudgetCategoryInput,
) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error("Orçamento não encontrado.");
  }

  if (!budget.isActive) {
    throw new Error(
      "Não é possível alterar um orçamento desativado.",
    );
  }

  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      userId,
      type: "EXPENSE",
      isActive: true,
    },
  });

  if (!category) {
    throw new Error(
      "Categoria de despesa não encontrada.",
    );
  }

  const existingCategory =
    await prisma.budgetCategory.findUnique({
      where: {
        budgetId_categoryId: {
          budgetId,
          categoryId: data.categoryId,
        },
      },
    });

  if (existingCategory) {
    throw new Error(
      "Esta categoria já está vinculada ao orçamento.",
    );
  }

  const budgetCategory =
    await prisma.budgetCategory.create({
      data: {
        budgetId,
        categoryId: data.categoryId,
        limitAmount: data.limitAmount,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

  return {
    ...budgetCategory,
    limitAmount:
      budgetCategory.limitAmount.toString(),
  };
}

export async function updateBudgetCategory(
  userId: string,
  budgetId: string,
  categoryId: string,
  data: UpdateBudgetCategoryInput,
) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error("Orçamento não encontrado.");
  }

  if (!budget.isActive) {
    throw new Error(
      "Não é possível alterar um orçamento desativado.",
    );
  }

  const budgetCategory =
    await prisma.budgetCategory.findUnique({
      where: {
        budgetId_categoryId: {
          budgetId,
          categoryId,
        },
      },
    });

  if (!budgetCategory) {
    throw new Error(
      "Categoria não encontrada neste orçamento.",
    );
  }

  const updatedCategory =
    await prisma.budgetCategory.update({
      where: {
        id: budgetCategory.id,
      },
      data: {
        limitAmount: data.limitAmount,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

  return {
    ...updatedCategory,
    limitAmount:
      updatedCategory.limitAmount.toString(),
  };
}

export async function removeBudgetCategory(
  userId: string,
  budgetId: string,
  categoryId: string,
) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw new Error("Orçamento não encontrado.");
  }

  if (!budget.isActive) {
    throw new Error(
      "Não é possível alterar um orçamento desativado.",
    );
  }

  const budgetCategory =
    await prisma.budgetCategory.findUnique({
      where: {
        budgetId_categoryId: {
          budgetId,
          categoryId,
        },
      },
    });

  if (!budgetCategory) {
    throw new Error(
      "Categoria não encontrada neste orçamento.",
    );
  }

  await prisma.budgetCategory.delete({
    where: {
      id: budgetCategory.id,
    },
  });

  return {
    message:
      "Categoria removida do orçamento com sucesso.",
  };
}