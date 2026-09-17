import { z } from "zod";

const transferStatuses = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

export const createTransferSchema = z.object({
  fromAccountId: z
    .string()
    .min(1, "A conta de origem é obrigatória."),

  toAccountId: z
    .string()
    .min(1, "A conta de destino é obrigatória."),

  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "O valor deve ser um número positivo com no máximo 2 casas decimais.",
    ),

  date: z
    .string()
    .datetime({
      message:
        "Informe uma data válida no formato ISO 8601.",
    }),

  description: z
    .string()
    .trim()
    .max(
      200,
      "A descrição deve ter no máximo 200 caracteres.",
    )
    .optional(),

  notes: z
    .string()
    .trim()
    .max(
      1000,
      "As observações devem ter no máximo 1000 caracteres.",
    )
    .optional(),

  status: z
    .enum(transferStatuses)
    .default("COMPLETED"),
});

export const updateTransferSchema = z
  .object({
    fromAccountId: z
      .string()
      .min(1, "A conta de origem é obrigatória.")
      .optional(),

    toAccountId: z
      .string()
      .min(1, "A conta de destino é obrigatória.")
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
        message:
          "Informe uma data válida no formato ISO 8601.",
      })
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        200,
        "A descrição deve ter no máximo 200 caracteres.",
      )
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(
        1000,
        "As observações devem ter no máximo 1000 caracteres.",
      )
      .nullable()
      .optional(),

    status: z
      .enum(transferStatuses)
      .optional(),
  })
  .strict();

export type CreateTransferInput = z.infer<
  typeof createTransferSchema
>;

export type UpdateTransferInput = z.infer<
  typeof updateTransferSchema
>;