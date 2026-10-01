import type { Request, Response } from "express";

import { getDashboardCashFlow,  getDashboardInsights, getDashboardOverview, getDashboardSummary } from "./dashboard.service.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new Error("Usuário não autenticado.");
  }

  return req.user.id;
}

export async function getDashboardSummaryController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const summary = await getDashboardSummary(
    userId,
    startDate,
    endDate,
  );

  return res.json(summary);
}

export async function getDashboardOverviewController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const overview =
    await getDashboardOverview(userId);

  return res.json(overview);
}

export async function getDashboardCashFlowController(
    req: Request,
    res: Response, 
) {
    const userId = getUserId(req);

    const cashFlow = await getDashboardCashFlow(userId);

    return res.json(cashFlow);
}

export async function getDashboardInsightsController(
    req: Request,
    res: Response,
) {
    const userId = getUserId(req);
    const insights = await getDashboardInsights(userId);

    return res.json(insights);
}

