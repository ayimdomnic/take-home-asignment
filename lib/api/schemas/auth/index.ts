import { z } from "zod";
import { emailSchema } from "../general";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: emailSchema,
  name: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"]
    });
  }
});