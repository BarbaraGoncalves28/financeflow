import { Request, Response } from 'express';
import { NetWorthService } from './net-worth.service.js';

const netWorthService = new NetWorthService();

export class NetWorthController {
    async getConsolidated(req: Request, res: Response) {
        try{
            const userId = req.userId;
            const data = await netWorthService.getConsolidatedNetWorth(userId);
            return res.json(data);
        } catch (error: any) {
            return res.status(400).json({error: error.message});
        }
    }
}