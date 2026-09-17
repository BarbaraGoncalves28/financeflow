import { Router } from "express";

import {
  cancelPurchaseController,
  createPurchaseController,
  getPurchaseController,
  listPurchasesController,
} from "./purchase.controller.js";

const router = Router();

router.post(
  "/credit-cards/:creditCardId/purchases",
  createPurchaseController,
);

router.get(
  "/credit-card-purchases",
  listPurchasesController,
);

router.get(
  "/credit-card-purchases/:id",
  getPurchaseController,
);

router.post(
  "/credit-card-purchases/:id/cancel",
  cancelPurchaseController,
);

export default router;