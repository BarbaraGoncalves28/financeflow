import type { Request, Response } from "express";

import {
  getBudgetInsights,
  getExpenseConcentrationInsights,
  getFinancialIntelligence,
  getGoalInsights,
  getMonthlyExpenseProjection,
  getMonthlySpendingComparison,
  getRecurringInsights,
  getSpendingInsights,
} from "./insights.service.js";

function getUserId(req: Request): string {
  return req.userId;
}

export async function getSpendingInsightsController(
  req: Request,
  res: Response,
) {
  const insights = await getSpendingInsights(
    getUserId(req),
  );

  return res.json(insights);
}

export async function getExpenseConcentrationInsightsController(
  req: Request,
  res: Response,
) {
  const insight =
    await getExpenseConcentrationInsights(
      getUserId(req),
    );

  return res.json(insight);
}

export async function getMonthlyExpenseProjectionController(
  req: Request,
  res: Response,
) {
  const projection =
    await getMonthlyExpenseProjection(
      getUserId(req),
    );

  return res.json(projection);
}

export async function getMonthlySpendingComparisonController(
  req: Request,
  res: Response,
) {
  const comparison =
    await getMonthlySpendingComparison(
      getUserId(req),
    );

  return res.json(comparison);
}

export async function getBudgetInsightsController(
  req: Request,
  res: Response,
) {
  const insights = await getBudgetInsights(
    getUserId(req),
  );

  return res.json(insights);
}

export async function getGoalInsightsController(
  req: Request,
  res: Response,
) {
  const insights = await getGoalInsights(
    getUserId(req),
  );

  return res.json(insights);
}

export async function getRecurringInsightsController(
  req: Request,
  res: Response,
) {
  const insights = await getRecurringInsights(
    getUserId(req),
  );

  return res.json(insights);
}

export async function getFinancialIntelligenceController(
  req: Request,
  res: Response,
) {
  const intelligence =
    await getFinancialIntelligence(
      getUserId(req),
    );

  return res.json(intelligence);
}