import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";

import * as categoryController from "./category.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", categoryController.createCategory);

router.get("/", categoryController.listCategories);

router.get("/:id", categoryController.getCategory);

router.patch("/:id", categoryController.updateCategory);

router.delete("/:id", categoryController.deleteCategory);

router.post(
  "/:categoryId/subcategories",
  categoryController.createSubcategory,
);

router.patch(
  "/:categoryId/subcategories/:id",
  categoryController.updateSubcategory,
);

router.delete(
  "/:categoryId/subcategories/:id",
  categoryController.deleteSubcategory,
);

export default router;