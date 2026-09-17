import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import * as invoiceController from "./invoice.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", invoiceController.createInvoice);

router.get(
  "/credit-card/:creditCardId",
  invoiceController.listInvoices,
);

router.get("/:id", invoiceController.getInvoice);

router.patch("/:id", invoiceController.updateInvoice);

router.post(
  "/:id/close",
  invoiceController.closeInvoice,
);

router.post(
  "/:id/pay",
  invoiceController.payInvoice,
);

router.post(
  "/:id/overdue",
  invoiceController.markInvoiceOverdue,
);

export default router;