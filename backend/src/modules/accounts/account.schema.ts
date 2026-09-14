import { z } from "zod";

const accountTypes = [
  "CHECKING",
  "SAVINGS",
  "DIGITAL",
  "INVESTMENT",
  "WALLET",
] as const;

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da conta deve ter pelo menos 2 caracteres.")
    .max(100, "O nome da conta deve ter no máximo 100 caracteres."),

  bank: z
    .string()
    .trim()
    .max(100, "O nome do banco deve ter no máximo 100 caracteres.")
    .optional(),

  type: z.enum(accountTypes),

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

  initialBalance: z
    .string()
    .regex(
      /^-?\d+(\.\d{1,2})?$/,
      "O saldo inicial deve ser um valor monetário válido.",
    ),
});

export const updateAccountSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome da conta deve ter pelo menos 2 caracteres.")
      .max(100, "O nome da conta deve ter no máximo 100 caracteres.")
      .optional(),

    bank: z
      .string()
      .trim()
      .max(100, "O nome do banco deve ter no máximo 100 caracteres.")
      .nullable()
      .optional(),

    type: z.enum(accountTypes).optional(),

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

    isActive: z.boolean().optional(),
  })
  .strict();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;