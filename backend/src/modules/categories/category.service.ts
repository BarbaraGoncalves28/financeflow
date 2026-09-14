import { Prisma } from "../../../generated/prisma/client.js";

import prisma from "../../config/prisma.js";

import type {
  CreateCategoryInput,
  CreateSubcategoryInput,
  UpdateCategoryInput,
  UpdateSubcategoryInput,
} from "./category.schema.js";

export async function createCategory(
  userId: string,
  data: CreateCategoryInput,
) {
  return prisma.category.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      icon: data.icon ?? null,
      color: data.color ?? null,
    },
    select: {
      id: true,
      name: true,
      type: true,
      icon: true,
      color: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      subcategories: {
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      type: true,
      icon: true,
      color: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      subcategories: {
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function findCategoryById(
  userId: string,
  categoryId: string,
) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
    select: {
      id: true,
      name: true,
      type: true,
      icon: true,
      color: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      subcategories: {
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: UpdateCategoryInput,
) {
  const updateData: Prisma.CategoryUpdateManyMutationInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  return prisma.category.updateMany({
    where: {
      id: categoryId,
      userId,
    },
    data: updateData,
  });
}

export async function deactivateCategory(
  userId: string,
  categoryId: string,
) {
  return prisma.category.updateMany({
    where: {
      id: categoryId,
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
}

export async function createSubcategory(
  userId: string,
  categoryId: string,
  data: CreateSubcategoryInput,
) {
  return prisma.subcategory.create({
    data: {
      categoryId,
      name: data.name,
    },
    select: {
      id: true,
      name: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findSubcategoryById(
  userId: string,
  categoryId: string,
  subcategoryId: string,
) {
  return prisma.subcategory.findFirst({
    where: {
      id: subcategoryId,
      categoryId,
      category: {
        userId,
      },
    },
    select: {
      id: true,
      name: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateSubcategory(
  userId: string,
  categoryId: string,
  subcategoryId: string,
  data: UpdateSubcategoryInput,
) {
  return prisma.subcategory.updateMany({
    where: {
      id: subcategoryId,
      categoryId,
      category: {
        userId,
      },
    },
    data,
  });
}

export async function deleteSubcategory(
  userId: string,
  categoryId: string,
  subcategoryId: string,
) {
  return prisma.subcategory.deleteMany({
    where: {
      id: subcategoryId,
      categoryId,
      category: {
        userId,
      },
    },
  });
}