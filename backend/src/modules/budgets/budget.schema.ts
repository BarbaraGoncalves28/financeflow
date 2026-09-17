import { z } from "zod";

const moneySchema = z
  .string()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Valor deve ter no máximo 2 casas decimais.",
  )
  .refine(
    (value) => Number(value) > 0,
    "Valor deve ser maior que zero.",
  );

const dateSchema = z.coerce.date();

export const createBudgetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),

  period: z.enum(["MONTHLY", "YEARLY"]),

  startDate: dateSchema,

  endDate: dateSchema,

  totalLimit: moneySchema,

  categories: z
    .array(
      z.object({
        categoryId: z.string().cuid(),

        limitAmount: moneySchema,
      }),
    )
    .default([]),
});

export const updateBudgetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    totalLimit: moneySchema.optional(),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Informe pelo menos um campo para atualizar.",
  );

export type CreateBudgetInput = z.infer<
  typeof createBudgetSchema
>;

export type UpdateBudgetInput = z.infer<
  typeof updateBudgetSchema
>;

export const addBudgetCategorySchema = z.object({
  categoryId: z.string().cuid(),

  limitAmount: moneySchema,
});

export const updateBudgetCategorySchema = z.object({
  limitAmount: moneySchema,
});

export type AddBudgetCategoryInput = z.infer<
  typeof addBudgetCategorySchema
>;

export type UpdateBudgetCategoryInput = z.infer<
  typeof updateBudgetCategorySchema
>;