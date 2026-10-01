import { Request, Response } from 'express';
import { InvestmentsService } from './investments.service';

const investmentsService = new InvestmentsService();

export class InvestmentsController {
  async getPortfolios(req: Request, res: Response) {
    try {
      const userId = req.user.id; // Assumindo que seu middleware de auth injeta o req.user
      const portfolios = await investmentsService.getPortfolios(userId);
      return res.json(portfolios);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async createPortfolio(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { name, description } = req.body;
      const portfolio = await investmentsService.createPortfolio(userId, { name, description });
      return res.status(201).json(portfolio);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async addAsset(req: Request, res: Response) {
    try {
      const { portfolioId } = req.params;
      const { ticker, name, type } = req.body;
      const asset = await investmentsService.addAsset(portfolioId, { ticker, name, type });
      return res.status(201).json(asset);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async registerTransaction(req: Request, res: Response) {
    try {
      const { assetId } = req.params;
      const { type, quantity, price, fees, date } = req.body;
      
      const result = await investmentsService.registerTransaction(assetId, {
        type,
        quantity: Number(quantity),
        price: Number(price),
        fees: fees ? Number(fees) : 0,
        date: new Date(date),
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}