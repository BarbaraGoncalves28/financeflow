import { Router } from "express";

import {
  addBudgetCategoryController,
  createBudgetController,
  deleteBudgetController,
  getBudgetController,
  getBudgetSummaryController,
  listBudgetsController,
  removeBudgetCategoryController,
  updateBudgetCategoryController,
  updateBudgetController,
} from "./budget.controller.js";

const router = Router();

router.post(
  "/budgets",
  createBudgetController,
);

router.get(
  "/budgets",
  listBudgetsController,
);

router.get(
  "/budgets/:id/summary",
  getBudgetSummaryController,
);

router.get(
  "/budgets/:id",
  getBudgetController,
);

router.patch(
  "/budgets/:id",
  updateBudgetController,
);

router.delete(
  "/budgets/:id",
  deleteBudgetController,
);

router.post(
  "/budgets/:id/categories",
  addBudgetCategoryController,
);

router.patch(
  "/budgets/:id/categories/:categoryId",
  updateBudgetCategoryController,
);

router.delete(
  "/budgets/:id/categories/:categoryId",
  removeBudgetCategoryController,
);

export default router;