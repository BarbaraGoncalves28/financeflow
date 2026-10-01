import { Router } from "express";
import {
  getCategoryComparisonController,
  getAccountsReportController,
  getCreditCardsReportController,
  getExpensesByCategoryController,
  getFinancialSummaryController,
  getIncomeByCategoryController,
  getMonthlyReportController,
  getInstallmentsReportController,
} from "./reports.controller.js";

const router = Router();

router.get(
  "/summary",
  getFinancialSummaryController,
);

router.get(
  "/monthly",
  getMonthlyReportController,
);

router.get(
    "/expenses-by-category",
    getExpensesByCategoryController,
);

router.get(
    "/income-by-category",
    getIncomeByCategoryController,
);

router.get(
    "/accounts",
    getAccountsReportController,
);

router.get(
  "/credit-cards",
  getCreditCardsReportController,
);

router.get(
  "/installments",
  getInstallmentsReportController,
);

router.get(
  "/category-comparison",
  getCategoryComparisonController,
);

export default router;