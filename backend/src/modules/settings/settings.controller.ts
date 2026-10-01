import { Request, Response } from "express";
import { Prisma } from "../../../generated/prisma/client.js";

export class SettingsController {
    async getSettings(req: Request, res: Response){
        const userId = req.userId;

        let settings = await prisma.userSettings.findUnique({
            where: {userId},
        });

        if(!settings) {
            settings = await prisma.userSettings.create({
                data: { userId },
            });
        }

        return res.json(settings);
    }

    async updateSettings(req: Request, res: Response) {
        const userId = req.userId;
        const { hideValues } = req.body;

        const settings = await prisma.userSettings.upsert({
            where: { userId },
            update: { hideValues },
            create: { userId, hideValues },
        });

        return res.json(settings);
    }
}