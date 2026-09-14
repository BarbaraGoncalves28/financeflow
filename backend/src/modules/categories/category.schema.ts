import { z } from "zod";

const categoryTypes = ["INCOME", "EXPENSE"] as const;

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da categoria deve ter pelo menos 2 caracteres.")
    .max(100, "O nome da categoria deve ter no máximo 100 caracteres."),

  type: z.enum(categoryTypes),

  icon: z
    .string()
    .trim()
    .max(50, "O ícone deve ter no máximo 50 caracteres.")
    .optional(),

  color: z
    .string()
    .trim()
    .max(20, "A cor deve ter no máximo 20 caracteres.")
    .optional(),
});

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome da categoria deve ter pelo menos 2 caracteres.")
      .max(100, "O nome da categoria deve ter no máximo 100 caracteres.")
      .optional(),

    type: z.enum(categoryTypes).optional(),

    icon: z
      .string()
      .trim()
      .max(50, "O ícone deve ter no máximo 50 caracteres.")
      .nullable()
      .optional(),

    color: z
      .string()
      .trim()
      .max(20, "A cor deve ter no máximo 20 caracteres.")
      .nullable()
      .optional(),

    isActive: z.boolean().optional(),
  })
  .strict();

export const createSubcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da subcategoria deve ter pelo menos 2 caracteres.")
    .max(100, "O nome da subcategoria deve ter no máximo 100 caracteres."),
});

export const updateSubcategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome da subcategoria deve ter pelo menos 2 caracteres.")
      .max(100, "O nome da subcategoria deve ter no máximo 100 caracteres."),
  })
  .strict();

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;

export type UpdateCategoryInput = z.infer<
  typeof updateCategorySchema
>;

export type CreateSubcategoryInput = z.infer<
  typeof createSubcategorySchema
>;

export type UpdateSubcategoryInput = z.infer<
  typeof updateSubcategorySchema
>;