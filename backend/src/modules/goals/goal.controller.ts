import type { Request, Response } from "express";
import {
  addContribution,
  createGoal,
  deleteContribution,
  deleteGoal,
  getGoal,
  listContributions,
  listGoals,
  updateGoal,
} from "./goal.service.js";
import {
  createContributionSchema,
  createGoalSchema,
  updateGoalSchema,
} from "./goal.schema.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new Error("Usuário não autenticado.");
  }

  return req.user.id;
}

export async function createGoalController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const data = createGoalSchema.parse(req.body);

  const goal = await createGoal(userId, data);

  return res.status(201).json(goal);
}

export async function listGoalsController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goals = await listGoals(userId);

  return res.json(goals);
}

export async function getGoalController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goalId = req.params.id;

  const goal = await getGoal(userId, goalId);

  return res.json(goal);
}

export async function updateGoalController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goalId = req.params.id;

  const data = updateGoalSchema.parse(req.body);

  const goal = await updateGoal(userId, goalId, data);

  return res.json(goal);
}

export async function deleteGoalController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goalId = req.params.id;

  await deleteGoal(userId, goalId);

  return res.status(204).send();
}

export async function addContributionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goalId = req.params.id;

  const data = createContributionSchema.parse(req.body);

  const result = await addContribution(
    userId,
    goalId,
    data,
  );

  return res.status(201).json(result);
}

export async function listContributionsController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goalId = req.params.id;

  const contributions = await listContributions(
    userId,
    goalId,
  );

  return res.json(contributions);
}

export async function deleteContributionController(
  req: Request,
  res: Response,
) {
  const userId = getUserId(req);

  const goalId = req.params.id;
  const contributionId = req.params.contributionId;

  const goal = await deleteContribution(
    userId,
    goalId,
    contributionId,
  );

  return res.json(goal);
}