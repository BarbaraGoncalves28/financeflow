import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";

import * as transactionController from "./transaction.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", transactionController.createTransaction);

router.get("/", transactionController.listTransactions);

router.get("/:id", transactionController.getTransaction);

router.patch(
  "/:id",
  transactionController.updateTransaction,
);

router.delete(
  "/:id",
  transactionController.deleteTransaction,
);

export default router;