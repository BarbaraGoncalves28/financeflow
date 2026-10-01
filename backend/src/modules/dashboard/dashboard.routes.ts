import { Router } from "express";

import {
  getDashboardCashFlowController,
  getDashboardInsightsController,
  getDashboardOverviewController,
  getDashboardSummaryController,
} from "./dashboard.controller.js";

const router = Router();

router.get("/summary", getDashboardSummaryController);
router.get("/overview", getDashboardOverviewController);
router.get("/cash-flow", getDashboardCashFlowController);
router.get("/insights", getDashboardInsightsController);

export default router;