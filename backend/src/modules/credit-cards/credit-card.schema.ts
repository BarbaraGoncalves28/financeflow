import { z } from "zod";

const creditCardStatuses = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;

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

const dayOfMonth = z
  .number()
  .int("O dia deve ser um número inteiro.")
  .min(1, "O dia deve ser maior ou igual a 1.")
  .max(31, "O dia deve ser menor ou igual a 31.");

export const createCreditCardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome do cartão deve ter pelo menos 2 caracteres.")
    .max(100, "O nome do cartão deve ter no máximo 100 caracteres."),

  bank: z
    .string()
    .trim()
    .min(2, "O banco deve ter pelo menos 2 caracteres.")
    .max(100, "O banco deve ter no máximo 100 caracteres.")
    .optional(),

  lastFourDigits: z
    .string()
    .regex(
      /^\d{4}$/,
      "Os últimos 4 dígitos devem conter exatamente 4 números.",
    ),

  creditLimit: positiveMoney,

  closingDay: dayOfMonth,

  dueDay: dayOfMonth,

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

  status: z.enum(creditCardStatuses).default("ACTIVE"),
}).superRefine((data, ctx) => {
  if (data.closingDay === data.dueDay) {
    ctx.addIssue({
      code: "custom",
      path: ["dueDay"],
      message: "O dia de vencimento deve ser diferente do dia de fechamento.",
    });
  }
});

export const updateCreditCardSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome do cartão deve ter pelo menos 2 caracteres.")
      .max(100, "O nome do cartão deve ter no máximo 100 caracteres.")
      .optional(),

    bank: z
      .string()
      .trim()
      .min(2, "O banco deve ter pelo menos 2 caracteres.")
      .max(100, "O banco deve ter no máximo 100 caracteres.")
      .nullable()
      .optional(),

    lastFourDigits: z
      .string()
      .regex(
        /^\d{4}$/,
        "Os últimos 4 dígitos devem conter exatamente 4 números.",
      )
      .optional(),

    creditLimit: positiveMoney.optional(),

    closingDay: dayOfMonth.optional(),

    dueDay: dayOfMonth.optional(),

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

    status: z.enum(creditCardStatuses).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.closingDay !== undefined &&
      data.dueDay !== undefined &&
      data.closingDay === data.dueDay
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDay"],
        message:
          "O dia de vencimento deve ser diferente do dia de fechamento.",
      });
    }
  });

export type CreateCreditCardInput = z.infer<
  typeof createCreditCardSchema
>;

export type UpdateCreditCardInput = z.infer<
  typeof updateCreditCardSchema
>;