import { Router } from "express";

import * as accountController from "./account.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.post("/", accountController.createAccount);

router.get("/", accountController.listAccounts);

router.get("/:id", accountController.getAccount);

router.patch("/:id", accountController.updateAccount);

router.delete("/:id", accountController.deleteAccount);

export default router;