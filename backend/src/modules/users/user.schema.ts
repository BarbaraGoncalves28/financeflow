import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .optional(),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .toLowerCase()
    .optional(),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;