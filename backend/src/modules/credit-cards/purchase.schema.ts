import { z } from "zod";

const moneySchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Valor deve ter no máximo 2 casas decimais.")
  .refine((value) => Number(value) > 0, "Valor deve ser maior que zero.");

export const createPurchaseSchema = z.object({
  categoryId: z.string().cuid().optional(),

  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(150, "Descrição deve ter no máximo 150 caracteres."),

  purchaseDate: z.coerce.date(),

  amount: moneySchema,

  installments: z
    .number()
    .int("Parcelas devem ser um número inteiro.")
    .min(1, "Mínimo de 1 parcela.")
    .max(48, "Máximo de 48 parcelas.")
    .default(1),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;