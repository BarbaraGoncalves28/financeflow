import { Router } from 'express';
import { InvestmentsController } from './investments.controller';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated'; // Ajuste o caminho do seu middleware

const investmentsRoutes = Router();
const investmentsController = new InvestmentsController();

// Todas as rotas de investimentos precisam de autenticação
investmentsRoutes.use(ensureAuthenticated);

investmentsRoutes.get('/portfolios', investmentsController.getPortfolios);
investmentsRoutes.post('/portfolios', investmentsController.createPortfolio);

investmentsRoutes.post('/portfolios/:portfolioId/assets', investmentsController.addAsset);
investmentsRoutes.post('/assets/:assetId/transactions', investmentsController.registerTransaction);

export { investmentsRoutes };