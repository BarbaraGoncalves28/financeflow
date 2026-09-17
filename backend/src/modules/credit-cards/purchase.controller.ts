import type { Request, Response } from "express";

import { createPurchaseSchema } from "./purchase.schema.js";
import {
  cancelPurchase,
  createPurchase,
  getPurchase,
  listPurchases,
} from "./purchase.service.js";

type CreditCardParams = {
  creditCardId: string;
};

type PurchaseParams = {
  id: string;
};

export async function createPurchaseController(
  req: Request<CreditCardParams>,
  res: Response,
) {
  try {
    const { creditCardId } = req.params;

    if (!creditCardId) {
      return res.status(400).json({
        message: "ID do cartão é obrigatório.",
      });
    }

    const data = createPurchaseSchema.parse(req.body);

    const purchase = await createPurchase(
      req.userId,
      creditCardId,
      data,
    );

    return res.status(201).json(purchase);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function listPurchasesController(
  req: Request,
  res: Response,
) {
  try {
    const purchases = await listPurchases(req.userId);

    return res.status(200).json(purchases);
  } catch {
    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function getPurchaseController(
  req: Request<PurchaseParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID da compra é obrigatório.",
      });
    }

    const purchase = await getPurchase(req.userId, id);

    return res.status(200).json(purchase);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

export async function cancelPurchaseController(
  req: Request<PurchaseParams>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID da compra é obrigatório.",
      });
    }

    const purchase = await cancelPurchase(
      req.userId,
      id,
    );

    return res.status(200).json(purchase);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}