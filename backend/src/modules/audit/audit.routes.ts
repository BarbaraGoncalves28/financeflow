import { Router } from "express";
import { getAuditLogsController } from "./audit.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

export const auditRoutes = Router();

auditRoutes.use(authenticate);
auditRoutes.get('/', getAuditLogsController);