import { z } from "zod";

const recurrenceFrequencySchema = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);

const transactionTypeSchema = z.enum([
  "INCOME",
  "EXPENSE",
]);

const recurringTransactionStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
]);

export const createRecurringTransactionSchema = z.object({
  accountId: z
    .string()
    .min(1, "A conta é obrigatória."),

  categoryId: z
    .string()
    .min(1, "A categoria é obrigatória."),

  subcategoryId: z
    .string()
    .min(1)
    .optional(),

  type: transactionTypeSchema,

  description: z
    .string()
    .trim()
    .min(2, "A descrição deve ter pelo menos 2 caracteres.")
    .max(150, "A descrição deve ter no máximo 150 caracteres."),

  amount: z
    .number()
    .positive("O valor deve ser maior que zero."),

  frequency: recurrenceFrequencySchema,

  startDate: z.coerce.date(),

  endDate: z
    .coerce
    .date()
    .optional(),

  nextRunDate: z.coerce.date().optional(),

  notes: z
    .string()
    .trim()
    .max(500, "As observações devem ter no máximo 500 caracteres.")
    .optional(),
});

export const updateRecurringTransactionSchema = z.object({
  accountId: z
    .string()
    .min(1)
    .optional(),

  categoryId: z
    .string()
    .min(1)
    .optional(),

  subcategoryId: z
    .string()
    .min(1)
    .nullable()
    .optional(),

  type: transactionTypeSchema.optional(),

  description: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .optional(),

  amount: z
    .number()
    .positive("O valor deve ser maior que zero.")
    .optional(),

  frequency: recurrenceFrequencySchema.optional(),

  startDate: z
    .coerce
    .date()
    .optional(),

  endDate: z
    .coerce
    .date()
    .nullable()
    .optional(),

  nextRunDate: z
    .coerce
    .date()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional(),

  status: recurringTransactionStatusSchema.optional(),
});

export type CreateRecurringTransactionInput = z.infer<
  typeof createRecurringTransactionSchema
>;

export type UpdateRecurringTransactionInput = z.infer<
  typeof updateRecurringTransactionSchema
>;