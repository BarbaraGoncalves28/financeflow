import type { Request, Response } from "express";

import {
  createTransferSchema,
  updateTransferSchema,
} from "./transfer.schema.js";

import * as transferService from "./transfer.service.js";

type TransferParams = {
  id: string;
};

export async function createTransfer(
  request: Request,
  response: Response,
) {
  const { userId } = request;

  const result = createTransferSchema.safeParse(
    request.body,
  );

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da transferência inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const transfer =
      await transferService.createTransfer(
        userId,
        result.data,
      );

    return response.status(201).json({
      transfer,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "SAME_ACCOUNT":
          return response.status(400).json({
            message:
              "A conta de origem e a conta de destino devem ser diferentes.",
          });

        case "FROM_ACCOUNT_NOT_FOUND":
          return response.status(404).json({
            message:
              "Conta de origem não encontrada.",
          });

        case "TO_ACCOUNT_NOT_FOUND":
          return response.status(404).json({
            message:
              "Conta de destino não encontrada.",
          });

        case "INSUFFICIENT_BALANCE":
          return response.status(400).json({
            message:
              "Saldo insuficiente na conta de origem.",
          });
      }
    }

    throw error;
  }
}

export async function listTransfers(
  request: Request,
  response: Response,
) {
  const { userId } = request;

  const transfers =
    await transferService.listTransfers(userId);

  return response.status(200).json({
    transfers,
  });
}

export async function getTransfer(
  request: Request<TransferParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message:
        "ID da transferência não informado.",
    });
  }

  const transfer =
    await transferService.findTransferById(
      userId,
      id,
    );

  if (!transfer) {
    return response.status(404).json({
      message:
        "Transferência não encontrada.",
    });
  }

  return response.status(200).json({
    transfer,
  });
}

export async function updateTransfer(
  request: Request<TransferParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message:
        "ID da transferência não informado.",
    });
  }

  const result = updateTransferSchema.safeParse(
    request.body,
  );

  if (!result.success) {
    return response.status(400).json({
      message:
        "Dados da transferência inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const transfer =
      await transferService.updateTransfer(
        userId,
        id,
        result.data,
      );

    return response.status(200).json({
      transfer,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "TRANSFER_NOT_FOUND":
          return response.status(404).json({
            message:
              "Transferência não encontrada.",
          });

        case "SAME_ACCOUNT":
          return response.status(400).json({
            message:
              "A conta de origem e a conta de destino devem ser diferentes.",
          });

        case "FROM_ACCOUNT_NOT_FOUND":
          return response.status(404).json({
            message:
              "Conta de origem não encontrada.",
          });

        case "TO_ACCOUNT_NOT_FOUND":
          return response.status(404).json({
            message:
              "Conta de destino não encontrada.",
          });

        case "INSUFFICIENT_BALANCE":
          return response.status(400).json({
            message:
              "Saldo insuficiente na conta de origem.",
          });
      }
    }

    throw error;
  }
}

export async function deleteTransfer(
  request: Request<TransferParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message:
        "ID da transferência não informado.",
    });
  }

  try {
    await transferService.deleteTransfer(
      userId,
      id,
    );

    return response.status(200).json({
      message:
        "Transferência excluída com sucesso.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TRANSFER_NOT_FOUND"
    ) {
      return response.status(404).json({
        message:
          "Transferência não encontrada.",
      });
    }

    throw error;
  }
}