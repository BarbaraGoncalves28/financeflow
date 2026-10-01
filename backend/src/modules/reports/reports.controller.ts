import type { Request, Response } from "express";
import { getFinancialSummary, getMonthlyReport,
getCategoryComparison,
getAccountsReport,
getCreditCardsReport,
getInstallmentsReport,
getIncomeByCategory, 
getExpensesByCategory } from "./reports.service.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new Error("Usuário não autenticado.");
  }

  return req.user.id;
}

function parseDate(
  value: unknown,
  fieldName: string,
): Date {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} é obrigatório.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} inválido.`);
  }

  return date;
}

export async function getFinancialSummaryController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const summary = await getFinancialSummary(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(summary);
}

export async function getMonthlyReportController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const report = await getMonthlyReport(userId);

  return res.json(report);
}

export async function getExpensesByCategoryController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const report = await getExpensesByCategory(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(report);
}

export async function getIncomeByCategoryController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const report = await getIncomeByCategory(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(report);
}

export async function getAccountsReportController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const report = await getAccountsReport(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(report);
}

export async function getCreditCardsReportController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const report = await getCreditCardsReport(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(report);
}

export async function getInstallmentsReportController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const report = await getInstallmentsReport(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(report);
}

export async function getCategoryComparisonController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const startDate = parseDate(
    req.query.startDate,
    "startDate",
  );

  const endDate = parseDate(
    req.query.endDate,
    "endDate",
  );

  if (startDate > endDate) {
    throw new Error(
      "startDate deve ser anterior ou igual a endDate.",
    );
  }

  const report = await getCategoryComparison(
    userId,
    {
      startDate,
      endDate,
    },
  );

  return res.json(report);
}