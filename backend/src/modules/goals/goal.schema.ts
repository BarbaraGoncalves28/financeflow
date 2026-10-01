import { z } from "zod";

export const createGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da meta deve ter pelo menos 2 caracteres.")
    .max(100, "O nome da meta deve ter no máximo 100 caracteres."),

  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional(),

  targetAmount: z
    .number()
    .positive("O valor da meta deve ser maior que zero."),

  targetDate: z
    .coerce
    .date()
    .optional(),

  color: z
    .string()
    .trim()
    .max(20, "A cor deve ter no máximo 20 caracteres.")
    .optional(),

  icon: z
    .string()
    .trim()
    .max(50, "O ícone deve ter no máximo 50 caracteres.")
    .optional(),
});

export const updateGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da meta deve ter pelo menos 2 caracteres.")
    .max(100, "O nome da meta deve ter no máximo 100 caracteres.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .nullable()
    .optional(),

  targetAmount: z
    .number()
    .positive("O valor da meta deve ser maior que zero.")
    .optional(),

  targetDate: z
    .coerce
    .date()
    .nullable()
    .optional(),

  color: z
    .string()
    .trim()
    .max(20, "A cor deve ter no máximo 20 caracteres.")
    .nullable()
    .optional(),

  icon: z
    .string()
    .trim()
    .max(50, "O ícone deve ter no máximo 50 caracteres.")
    .nullable()
    .optional(),

  status: z
    .enum(["ACTIVE", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const createContributionSchema = z.object({
  amount: z
    .number()
    .positive("O valor da contribuição deve ser maior que zero."),

  date: z.coerce.date(),

  description: z
    .string()
    .trim()
    .max(300, "A descrição deve ter no máximo 300 caracteres.")
    .optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateContributionInput = z.infer<
  typeof createContributionSchema
>;