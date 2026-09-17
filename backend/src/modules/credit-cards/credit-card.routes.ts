import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import * as creditCardController from "./credit-card.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", creditCardController.createCreditCard);
router.get("/", creditCardController.listCreditCards);
router.get("/:id", creditCardController.getCreditCard);
router.patch("/:id", creditCardController.updateCreditCard);
router.delete("/:id", creditCardController.deleteCreditCard);

export default router;