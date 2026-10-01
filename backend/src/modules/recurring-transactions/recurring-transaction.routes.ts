import { Router } from "express";
import {
  createRecurringTransactionController,
  deleteRecurringTransactionController,
  executeRecurringTransactionController,
  executeDueRecurringTransactionsController,
  getRecurringTransactionController,
  listRecurringTransactionsController,
  pauseRecurringTransactionController,
  resumeRecurringTransactionController,
  listRecurringTransactionExecutionsController,
  updateRecurringTransactionController,
} from "./recurring-transaction.controller.js";

const router = Router();

router.post(
  "/",
  createRecurringTransactionController,
);

router.get(
  "/",
  listRecurringTransactionsController,
);

router.get(
  "/:id/executions",
  listRecurringTransactionExecutionsController,
);

router.get(
  "/:id",
  getRecurringTransactionController,
);

router.patch(
  "/:id",
  updateRecurringTransactionController,
);

router.delete(
  "/:id",
  deleteRecurringTransactionController,
);

router.post(
  "/:id/pause",
  pauseRecurringTransactionController,
);

router.post(
  "/:id/resume",
  resumeRecurringTransactionController,
);

router.post(
  "/execute-due",
  executeDueRecurringTransactionsController,
);

router.post(
  "/:id/execute",
  executeRecurringTransactionController,
);

export default router;