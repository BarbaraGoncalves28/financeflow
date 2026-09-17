import type { Request, Response } from "express";

import {
  createTransactionSchema,
  listTransactionsSchema,
  updateTransactionSchema,
} from "./transaction.schema.js";

import * as transactionService from "./transaction.service.js";

type TransactionParams = {
  id: string;
};

export async function createTransaction(
  request: Request,
  response: Response,
) {
  const { userId } = request;

  const result = createTransactionSchema.safeParse(
    request.body,
  );

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da transação inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const transaction =
      await transactionService.createTransaction(
        userId,
        result.data,
      );

    return response.status(201).json({
      transaction,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ACCOUNT_NOT_FOUND":
          return response.status(404).json({
            message: "Conta não encontrada.",
          });

        case "CATEGORY_NOT_FOUND":
          return response.status(404).json({
            message: "Categoria não encontrada.",
          });

        case "CATEGORY_TYPE_MISMATCH":
          return response.status(400).json({
            message:
              "O tipo da categoria não corresponde ao tipo da transação.",
          });

        case "SUBCATEGORY_NOT_FOUND":
          return response.status(404).json({
            message: "Subcategoria não encontrada.",
          });
      }
    }

    throw error;
  }
}

export async function listTransactions(
  request: Request,
  response: Response,
) {
  const { userId } = request;

  const result = listTransactionsSchema.safeParse(
    request.query,
  );

  if (!result.success) {
    return response.status(400).json({
      message: "Filtros de transação inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  if (
    result.data.startDate !== undefined &&
    result.data.endDate !== undefined &&
    new Date(result.data.startDate) >
      new Date(result.data.endDate)
  ) {
    return response.status(400).json({
      message:
        "A data inicial não pode ser maior que a data final.",
    });
  }

  const resultData =
    await transactionService.listTransactions(
      userId,
      result.data,
    );

  return response.status(200).json(resultData);
}

export async function getTransaction(
  request: Request<TransactionParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "ID da transação não informado.",
    });
  }

  const transaction =
    await transactionService.findTransactionById(
      userId,
      id,
    );

  if (!transaction) {
    return response.status(404).json({
      message: "Transação não encontrada.",
    });
  }

  return response.status(200).json({
    transaction,
  });
}

export async function updateTransaction(
  request: Request<TransactionParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "ID da transação não informado.",
    });
  }

  const result = updateTransactionSchema.safeParse(
    request.body,
  );

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da transação inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const transaction =
      await transactionService.updateTransaction(
        userId,
        id,
        result.data,
      );

    return response.status(200).json({
      transaction,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "TRANSACTION_NOT_FOUND":
          return response.status(404).json({
            message: "Transação não encontrada.",
          });

        case "ACCOUNT_NOT_FOUND":
          return response.status(404).json({
            message: "Conta não encontrada.",
          });

        case "CATEGORY_NOT_FOUND":
          return response.status(404).json({
            message: "Categoria não encontrada.",
          });

        case "CATEGORY_TYPE_MISMATCH":
          return response.status(400).json({
            message:
              "O tipo da categoria não corresponde ao tipo da transação.",
          });

        case "SUBCATEGORY_NOT_FOUND":
          return response.status(404).json({
            message: "Subcategoria não encontrada.",
          });
      }
    }

    throw error;
  }
}

export async function deleteTransaction(
  request: Request<TransactionParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "ID da transação não informado.",
    });
  }

  try {
    await transactionService.deleteTransaction(
      userId,
      id,
    );

    return response.status(200).json({
      message: "Transação excluída com sucesso.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TRANSACTION_NOT_FOUND"
    ) {
      return response.status(404).json({
        message: "Transação não encontrada.",
      });
    }

    throw error;
  }
}