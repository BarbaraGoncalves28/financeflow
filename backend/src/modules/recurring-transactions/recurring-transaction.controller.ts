import type { Request, Response } from "express";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  executeRecurringTransaction,
  executeDueRecurringTransactions,
  getRecurringTransaction,
  listRecurringTransactions,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
  listRecurringTransactionExecutions,
  updateRecurringTransaction,
} from "./recurring-transaction.service.js";
import {
  createRecurringTransactionSchema,
  updateRecurringTransactionSchema,
} from "./recurring-transaction.schema.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new Error("Usuário não autenticado.");
  }

  return req.user.id;
}

export async function createRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const data = createRecurringTransactionSchema.parse(
    req.body,
  );

  const recurringTransaction =
    await createRecurringTransaction(userId, data);

  return res.status(201).json(recurringTransaction);
}

export async function listRecurringTransactionsController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactions =
    await listRecurringTransactions(userId);

  return res.json(recurringTransactions);
}

export async function getRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactionId = req.params.id;

  const recurringTransaction =
    await getRecurringTransaction(
      userId,
      recurringTransactionId,
    );

  return res.json(recurringTransaction);
}

export async function updateRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactionId = req.params.id;

  const data = updateRecurringTransactionSchema.parse(
    req.body,
  );

  const recurringTransaction =
    await updateRecurringTransaction(
      userId,
      recurringTransactionId,
      data,
    );

  return res.json(recurringTransaction);
}

export async function deleteRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactionId = req.params.id;

  await deleteRecurringTransaction(
    userId,
    recurringTransactionId,
  );

  return res.status(204).send();
}

export async function pauseRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactionId = req.params.id;

  const recurringTransaction =
    await pauseRecurringTransaction(
      userId,
      recurringTransactionId,
    );

  return res.json(recurringTransaction);
}

export async function resumeRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactionId = req.params.id;

  const recurringTransaction =
    await resumeRecurringTransaction(
      userId,
      recurringTransactionId,
    );

  return res.json(recurringTransaction);
}

export async function executeRecurringTransactionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const recurringTransactionId = req.params.id;

  const transaction =
    await executeRecurringTransaction(
      userId,
      recurringTransactionId,
    );

  return res.status(201).json(transaction);
}

export async function executeDueRecurringTransactionsController(
  req: Request,
  res: Response,
) {
  const transactions =
    await executeDueRecurringTransactions();

  return res.json({
    processed: transactions.length,
    transactions,
  });
}

export async function listRecurringTransactionExecutionsController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);
  const recurringTransactionId = req.params.id;

  const executions =
    await listRecurringTransactionExecutions(
      userId,
      recurringTransactionId,
    );

  return res.json(executions);
}