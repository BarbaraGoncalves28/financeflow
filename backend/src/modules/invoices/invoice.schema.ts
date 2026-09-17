import { z } from "zod";

const invoiceStatuses = [
  "OPEN",
  "CLOSED",
  "PAID",
  "OVERDUE",
] as const;

const positiveMoney = z
  .string()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "O valor deve ser um número positivo com no máximo 2 casas decimais.",
  )
  .refine(
    (value) => Number(value) > 0,
    "O valor deve ser maior que zero.",
  );

export const createInvoiceSchema = z.object({
  creditCardId: z
    .string()
    .min(1, "O cartão é obrigatório."),

  referenceMonth: z
    .number()
    .int("O mês deve ser um número inteiro.")
    .min(1, "O mês deve estar entre 1 e 12.")
    .max(12, "O mês deve estar entre 1 e 12."),

  referenceYear: z
    .number()
    .int("O ano deve ser um número inteiro.")
    .min(2000, "O ano informado é inválido.")
    .max(2100, "O ano informado é inválido."),

  closingDate: z
    .string()
    .datetime({
      message: "A data de fechamento deve estar no formato ISO 8601.",
    }),

  dueDate: z
    .string()
    .datetime({
      message: "A data de vencimento deve estar no formato ISO 8601.",
    }),

  totalAmount: positiveMoney.optional(),
});

export const updateInvoiceSchema = z
  .object({
    status: z.enum(invoiceStatuses).optional(),

    totalAmount: positiveMoney.optional(),

    paidAmount: z
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "O valor deve ser um número positivo com no máximo 2 casas decimais.",
      )
      .refine(
        (value) => Number(value) >= 0,
        "O valor não pode ser negativo.",
      )
      .optional(),
  })
  .strict();

export const payInvoiceSchema = z.object({
  paymentAccountId: z
    .string()
    .min(1, "A conta para pagamento é obrigatória."),

  paidAmount: positiveMoney.optional(),
});

export type CreateInvoiceInput = z.infer<
  typeof createInvoiceSchema
>;

export type UpdateInvoiceInput = z.infer<
  typeof updateInvoiceSchema
>;

export type PayInvoiceInput = z.infer<
  typeof payInvoiceSchema
>;