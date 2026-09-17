import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";

import * as transferController from "./transfer.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  transferController.createTransfer,
);

router.get(
  "/",
  transferController.listTransfers,
);

router.get(
  "/:id",
  transferController.getTransfer,
);

router.patch(
  "/:id",
  transferController.updateTransfer,
);

router.delete(
  "/:id",
  transferController.deleteTransfer,
);

export default router;