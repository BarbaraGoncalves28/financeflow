import type { Request, Response } from "express";

import {
  createCreditCardSchema,
  updateCreditCardSchema,
} from "./credit-card.schema.js";
import * as creditCardService from "./credit-card.service.js";

type AuthenticatedRequest = Request & {
  userId: string;
};

type CreditCardParams = {
  id: string;
};

export async function createCreditCard(
  req: Request,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const parsed = createCreditCardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const creditCard = await creditCardService.createCreditCard(
      authenticatedRequest.userId,
      parsed.data,
    );

    return res.status(201).json({
      creditCard,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CREDIT_CARD_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "Já existe um cartão com esses dados.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao criar cartão.",
    });
  }
}

export async function listCreditCards(
  req: Request,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  try {
    const creditCards = await creditCardService.listCreditCards(
      authenticatedRequest.userId,
    );

    return res.status(200).json({
      creditCards,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao listar cartões.",
    });
  }
}

export async function getCreditCard(
  req: Request<CreditCardParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const creditCard = await creditCardService.findCreditCardById(
    authenticatedRequest.userId,
    req.params.id,
  );

  if (!creditCard) {
    return res.status(404).json({
      message: "Cartão não encontrado.",
    });
  }

  return res.status(200).json({
    creditCard,
  });
}

export async function updateCreditCard(
  req: Request<CreditCardParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const parsed = updateCreditCardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const creditCard = await creditCardService.updateCreditCard(
      authenticatedRequest.userId,
      req.params.id,
      parsed.data,
    );

    return res.status(200).json({
      creditCard,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CREDIT_CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Cartão não encontrado.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_INVOICE_DAYS"
    ) {
      return res.status(400).json({
        message:
          "O dia de vencimento deve ser diferente do dia de fechamento.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CREDIT_CARD_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "Já existe um cartão com esses dados.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao atualizar cartão.",
    });
  }
}

export async function deleteCreditCard(
  req: Request<CreditCardParams>,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  try {
    const creditCard =
      await creditCardService.deactivateCreditCard(
        authenticatedRequest.userId,
        req.params.id,
      );

    return res.status(200).json({
      message: "Cartão desativado com sucesso.",
      creditCard,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CREDIT_CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Cartão não encontrado.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao desativar cartão.",
    });
  }
}