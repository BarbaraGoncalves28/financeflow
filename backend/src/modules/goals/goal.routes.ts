import { Router } from "express";
import {
  addContributionController,
  createGoalController,
  deleteContributionController,
  deleteGoalController,
  getGoalController,
  listContributionsController,
  listGoalsController,
  updateGoalController,
} from "./goal.controller.js";

const router = Router();

router.post("/", createGoalController);

router.get("/", listGoalsController);

router.get("/:id", getGoalController);

router.patch("/:id", updateGoalController);

router.delete("/:id", deleteGoalController);

router.post(
  "/:id/contributions",
  addContributionController,
);

router.get(
  "/:id/contributions",
  listContributionsController,
);

router.delete(
  "/:id/contributions/:contributionId",
  deleteContributionController,
);

export default router;