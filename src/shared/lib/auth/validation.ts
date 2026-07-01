import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Adresse e-mail invalide.");
const strongPassword = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.");

export const signupSchema = z.object({
  email,
  password: strongPassword,
  fullName: z.string().trim().max(120).optional(),
});

export const signinSchema = z.object({
  email,
  password: z.string().min(1, "Mot de passe requis."),
});

export const resetRequestSchema = z.object({ email });

export const updatePasswordSchema = z.object({ password: strongPassword });

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
