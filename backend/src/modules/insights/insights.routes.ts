import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";

import {
  getBudgetInsightsController,
  getExpenseConcentrationInsightsController,
  getFinancialIntelligenceController,
  getGoalInsightsController,
  getMonthlyExpenseProjectionController,
  getMonthlySpendingComparisonController,
  getRecurringInsightsController,
  getSpendingInsightsController,
} from "./insights.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/spending",
  getSpendingInsightsController,
);

router.get(
  "/concentration",
  getExpenseConcentrationInsightsController,
);

router.get(
  "/projection",
  getMonthlyExpenseProjectionController,
);

router.get(
  "/monthly-comparison",
  getMonthlySpendingComparisonController,
);

router.get(
  "/budget",
  getBudgetInsightsController,
);

router.get(
  "/goals",
  getGoalInsightsController,
);

router.get(
  "/recurring",
  getRecurringInsightsController,
);

router.get(
  "/",
  getFinancialIntelligenceController,
);

export default router;