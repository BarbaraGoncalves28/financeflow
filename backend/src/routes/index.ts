import { Router } from "express";
import accountRoutes from "../modules/accounts/account.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import categoryRoutes from "../modules/categories/category.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "financeflow-api",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/categories", categoryRoutes);

export default router;