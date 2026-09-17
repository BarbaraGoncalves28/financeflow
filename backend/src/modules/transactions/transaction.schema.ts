import { z } from "zod";

const transactionTypes = ["INCOME", "EXPENSE"] as const;
const transactionStatuses = ["PENDING", "COMPLETED", "CANCELLED"] as const;

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, "A conta é obrigatória."),
  categoryId: z.string().min(1, "A categoria é obrigatória."),
  subcategoryId: z
    .string()
    .min(1, "A subcategoria deve ser válida.")
    .optional(),

  type: z.enum(transactionTypes),

  status: z.enum(transactionStatuses).default("COMPLETED"),

  description: z
    .string()
    .trim()
    .min(2, "A descrição deve ter pelo menos 2 caracteres.")
    .max(200, "A descrição deve ter no máximo 200 caracteres."),

  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "O valor deve ser um número positivo com no máximo 2 casas decimais.",
    ),

  date: z
    .string()
    .datetime({
      message: "Informe uma data válida no formato ISO 8601.",
    }),

  notes: z
    .string()
    .trim()
    .max(1000, "As observações devem ter no máximo 1000 caracteres.")
    .optional(),

  isRecurring: z.boolean().default(false),
});

export const updateTransactionSchema = z
  .object({
    accountId: z.string().min(1, "A conta é obrigatória.").optional(),

    categoryId: z.string().min(1, "A categoria é obrigatória.").optional(),

    subcategoryId: z
      .string()
      .min(1, "A subcategoria deve ser válida.")
      .nullable()
      .optional(),

    type: z.enum(transactionTypes).optional(),

    status: z.enum(transactionStatuses).optional(),

    description: z
      .string()
      .trim()
      .min(2, "A descrição deve ter pelo menos 2 caracteres.")
      .max(200, "A descrição deve ter no máximo 200 caracteres.")
      .optional(),

    amount: z
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "O valor deve ser um número positivo com no máximo 2 casas decimais.",
      )
      .optional(),

    date: z
      .string()
      .datetime({
        message: "Informe uma data válida no formato ISO 8601.",
      })
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "As observações devem ter no máximo 1000 caracteres.")
      .nullable()
      .optional(),

    isRecurring: z.boolean().optional(),
  })
  .strict();

export const listTransactionsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, "A página deve ser maior ou igual a 1.")
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "O limite deve ser maior ou igual a 1.")
    .max(100, "O limite máximo é 100.")
    .default(20),

  type: z.enum(transactionTypes).optional(),

  status: z.enum(transactionStatuses).optional(),

  accountId: z.string().min(1).optional(),

  categoryId: z.string().min(1).optional(),

  startDate: z
    .string()
    .datetime({
      message: "A data inicial deve estar no formato ISO 8601.",
    })
    .optional(),

  endDate: z
    .string()
    .datetime({
      message: "A data final deve estar no formato ISO 8601.",
    })
    .optional(),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>;

export type UpdateTransactionInput = z.infer<
  typeof updateTransactionSchema
>;

export type ListTransactionsInput = z.infer<
  typeof listTransactionsSchema
>;