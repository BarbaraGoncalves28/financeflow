import type { Request, Response } from "express";

import {
  createCategorySchema,
  createSubcategorySchema,
  updateCategorySchema,
  updateSubcategorySchema,
} from "./category.schema.js";

import * as categoryService from "./category.service.js";

type CategoryParams = {
  id: string;
};

type CategorySubcategoryParams = {
  categoryId: string;
  id: string;
};

type CategoryOnlyParams = {
  categoryId: string;
};

export async function createCategory(
  request: Request,
  response: Response,
) {
  const { userId } = request;

  const result = createCategorySchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da categoria inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const category = await categoryService.createCategory(
      userId,
      result.data,
    );

    return response.status(201).json({
      category,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return response.status(409).json({
        message: "Já existe uma categoria com esse nome e tipo.",
      });
    }

    throw error;
  }
}

export async function listCategories(
  request: Request,
  response: Response,
) {
  const { userId } = request;

  const categories = await categoryService.listCategories(userId);

  return response.status(200).json({
    categories,
  });
}

export async function getCategory(
  request: Request<CategoryParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "ID da categoria não informado.",
    });
  }

  const category = await categoryService.findCategoryById(
    userId,
    id,
  );

  if (!category) {
    return response.status(404).json({
      message: "Categoria não encontrada.",
    });
  }

  return response.status(200).json({
    category,
  });
}

export async function updateCategory(
  request: Request<CategoryParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "ID da categoria não informado.",
    });
  }

  const result = updateCategorySchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da categoria inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const existingCategory =
    await categoryService.findCategoryById(userId, id);

  if (!existingCategory) {
    return response.status(404).json({
      message: "Categoria não encontrada.",
    });
  }

  if (!existingCategory.isActive) {
    return response.status(409).json({
      message: "Não é possível editar uma categoria desativada.",
    });
  }

  try {
    await categoryService.updateCategory(
      userId,
      id,
      result.data,
    );

    const category = await categoryService.findCategoryById(
      userId,
      id,
    );

    return response.status(200).json({
      category,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return response.status(409).json({
        message: "Já existe uma categoria com esse nome e tipo.",
      });
    }

    throw error;
  }
}

export async function deleteCategory(
  request: Request<CategoryParams>,
  response: Response,
) {
  const { userId } = request;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "ID da categoria não informado.",
    });
  }

  const existingCategory =
    await categoryService.findCategoryById(userId, id);

  if (!existingCategory) {
    return response.status(404).json({
      message: "Categoria não encontrada.",
    });
  }

  if (!existingCategory.isActive) {
    return response.status(409).json({
      message: "A categoria já está desativada.",
    });
  }

  await categoryService.deactivateCategory(userId, id);

  return response.status(200).json({
    message: "Categoria desativada com sucesso.",
  });
}

export async function createSubcategory(
  request: Request<CategoryOnlyParams>,
  response: Response,
) {
  const { userId } = request;
  const { categoryId } = request.params;

  if (!categoryId) {
    return response.status(400).json({
      message: "ID da categoria não informado.",
    });
  }

  const result = createSubcategorySchema.safeParse(
    request.body,
  );

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da subcategoria inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const category = await categoryService.findCategoryById(
    userId,
    categoryId,
  );

  if (!category) {
    return response.status(404).json({
      message: "Categoria não encontrada.",
    });
  }

  if (!category.isActive) {
    return response.status(409).json({
      message:
        "Não é possível criar uma subcategoria em uma categoria desativada.",
    });
  }

  try {
    const subcategory =
      await categoryService.createSubcategory(
        userId,
        categoryId,
        result.data,
      );

    return response.status(201).json({
      subcategory,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return response.status(409).json({
        message:
          "Já existe uma subcategoria com esse nome nessa categoria.",
      });
    }

    throw error;
  }
}

export async function updateSubcategory(
  request: Request<CategorySubcategoryParams>,
  response: Response,
) {
  const { userId } = request;
  const { categoryId, id } = request.params;

  if (!categoryId || !id) {
    return response.status(400).json({
      message: "IDs da categoria e da subcategoria são obrigatórios.",
    });
  }

  const result = updateSubcategorySchema.safeParse(
    request.body,
  );

  if (!result.success) {
    return response.status(400).json({
      message: "Dados da subcategoria inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const category = await categoryService.findCategoryById(
    userId,
    categoryId,
  );

  if (!category) {
    return response.status(404).json({
      message: "Categoria não encontrada.",
    });
  }

  if (!category.isActive) {
    return response.status(409).json({
      message:
        "Não é possível editar subcategorias de uma categoria desativada.",
    });
  }

  const existingSubcategory =
    await categoryService.findSubcategoryById(
      userId,
      categoryId,
      id,
    );

  if (!existingSubcategory) {
    return response.status(404).json({
      message: "Subcategoria não encontrada.",
    });
  }

  try {
    await categoryService.updateSubcategory(
      userId,
      categoryId,
      id,
      result.data,
    );

    const subcategory =
      await categoryService.findSubcategoryById(
        userId,
        categoryId,
        id,
      );

    return response.status(200).json({
      subcategory,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return response.status(409).json({
        message:
          "Já existe uma subcategoria com esse nome nessa categoria.",
      });
    }

    throw error;
  }
}

export async function deleteSubcategory(
  request: Request<CategorySubcategoryParams>,
  response: Response,
) {
  const { userId } = request;
  const { categoryId, id } = request.params;

  if (!categoryId || !id) {
    return response.status(400).json({
      message: "IDs da categoria e da subcategoria são obrigatórios.",
    });
  }

  const existingSubcategory =
    await categoryService.findSubcategoryById(
      userId,
      categoryId,
      id,
    );

  if (!existingSubcategory) {
    return response.status(404).json({
      message: "Subcategoria não encontrada.",
    });
  }

  await categoryService.deleteSubcategory(
    userId,
    categoryId,
    id,
  );

  return response.status(200).json({
    message: "Subcategoria excluída com sucesso.",
  });
}