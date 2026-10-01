import { Router } from "express";
import accountRoutes from "../modules/accounts/account.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import categoryRoutes from "../modules/categories/category.routes.js";
import transactionRoutes from "../modules/transactions/transaction.routes.js";
import transferRoutes from "../modules/transfers/transfer.routes.js"; 
import creditCardRoutes from "../modules/credit-cards/credit-card.routes.js";
import invoiceRoutes from "../modules/invoices/invoice.routes.js";
import purchaseRoutes from "../modules/credit-cards/purchase.routes.js";
import budgetRoutes from "../modules/budgets/budget.routes.js";
import goalRoutes from "../modules/goals/goal.routes.js";
import recurringTransactionRoutes from "../modules/recurring-transactions/recurring-transaction.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import reportsRoutes from "../modules/reports/reports.routes.js";
import insightsRoutes from "../modules/insights/insights.routes.js";
import notificationsRoutes from "../modules/notifications/notifications.routes.js";
import { auditRoutes } from "../modules/audit/audit.routes.js";
import { investmentsRoutes } from "../modules/investments/investments.routes.js";
import { settingsRoutes } from "../modules/settings/settings.routes.js";
import { netWorthRoutes } from "../modules/net-worth/net-worth.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "financeflow-api",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/transfers", transferRoutes);
router.use("/credit-cards", creditCardRoutes);
router.use("/invoices", invoiceRoutes);
router.use(purchaseRoutes);
router.use(budgetRoutes);
router.use("/goals", goalRoutes);
router.use("/recurring-transactions",
  recurringTransactionRoutes,);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportsRoutes);
router.use("/insights", insightsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/audit", auditRoutes);
router.use("/investments", investmentsRoutes);
router.use('/net-worth', netWorthRoutes);
router.use('/settings', settingsRoutes);

export default router;