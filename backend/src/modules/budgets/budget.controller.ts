import type { Request, Response } from "express";

import {
  addBudgetCategorySchema,
  createBudgetSchema,
  updateBudgetCategorySchema,
  updateBudgetSchema,
} from "./budget.schema.js";

import {
  addBudgetCategory,
  createBudget,
  deleteBudget,
  getBudget,
  getBudgetSummary,
  listBudgets,
  removeBudgetCategory,
  updateBudget,
  updateBudgetCategory,
} from "./budget.service.js";

type BudgetParams = {
  id: string;
};

type BudgetCategoryParams = {
  id: string;
  categoryId: string;
};

export async function createBudgetController(
  req: Request,
  res: Response,
) {
  try {
    const data = createBudgetSchema.parse(
      req.body,
    );

    const budget = await createBudget(
      req.userId,
      data,
    );

    return res.status(201).json(budget);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function listBudgetsController(
  req: Request,
  res: Response,
) {
  try {
    const budgets = await listBudgets(req.userId);

    return res.status(200).json(budgets);
  } catch {
    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function getBudgetController(
  req: Request<BudgetParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do orçamento é obrigatório.",
      });
    }

    const budget = await getBudget(
      req.userId,
      id,
    );

    return res.status(200).json(budget);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function updateBudgetController(
  req: Request<BudgetParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do orçamento é obrigatório.",
      });
    }

    const data = updateBudgetSchema.parse(
      req.body,
    );

    const budget = await updateBudget(
      req.userId,
      id,
      data,
    );

    return res.status(200).json(budget);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function deleteBudgetController(
  req: Request<BudgetParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do orçamento é obrigatório.",
      });
    }

    const result = await deleteBudget(
      req.userId,
      id,
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function getBudgetSummaryController(
  req: Request<BudgetParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do orçamento é obrigatório.",
      });
    }

    const summary = await getBudgetSummary(
      req.userId,
      id,
    );

    return res.status(200).json(summary);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function addBudgetCategoryController(
  req: Request<BudgetParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do orçamento é obrigatório.",
      });
    }

    const data = addBudgetCategorySchema.parse(
      req.body,
    );

    const budgetCategory =
      await addBudgetCategory(
        req.userId,
        id,
        data,
      );

    return res.status(201).json(budgetCategory);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function updateBudgetCategoryController(
  req: Request<BudgetCategoryParams>,
  res: Response,
) {
  try {
    const { id, categoryId } = req.params;

    if (!id || !categoryId) {
      return res.status(400).json({
        message:
          "ID do orçamento e da categoria são obrigatórios.",
      });
    }

    const data =
      updateBudgetCategorySchema.parse(
        req.body,
      );

    const budgetCategory =
      await updateBudgetCategory(
        req.userId,
        id,
        categoryId,
        data,
      );

    return res.status(200).json(budgetCategory);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function removeBudgetCategoryController(
  req: Request<BudgetCategoryParams>,
  res: Response,
) {
  try {
    const { id, categoryId } = req.params;

    if (!id || !categoryId) {
      return res.status(400).json({
        message:
          "ID do orçamento e da categoria são obrigatórios.",
      });
    }

    const result =
      await removeBudgetCategory(
        req.userId,
        id,
        categoryId,
      );

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}