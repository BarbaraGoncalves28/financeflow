import { Router } from 'express';
import { NetWorthController } from './net-worth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js'

const netWorthRoutes = Router();
const netWorthController = new NetWorthController();
netWorthRoutes.use(authenticate);
netWorthRoutes.get('/', netWorthController.getConsolidated);

export {netWorthRoutes};