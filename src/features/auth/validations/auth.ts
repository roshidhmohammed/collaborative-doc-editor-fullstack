import { z } from "zod";

// Reusable field validators
const fullNameSchema = z
  .string({
    message: "Please enter your full name.",
  })
  .min(2, {
    message:
      "Please enter a valid name with at least 2 characters and no more than 100 characters.",
  })
  .max(100, {
    message:
      "Please enter a valid name with at least 2 characters and no more than 100 characters.",
  });

const emailSchema = z
  .string({
    message: "Please enter your email address.",
  })
  .min(1, {
    message: "Please enter your email address.",
  })
  .email({
    message: "Please enter a valid email address.",
  });

const passwordSchema = z
  .string({
    message: "Please enter your password.",
  })
  .min(1, {
    message: "Please enter your password.",
  })
  .min(8, {
    message: "Password must be at least 8 characters long.",
  })
  .max(100, {
    message: "Password must not exceed 100 characters.",
  })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  );

const confirmPasswordSchema = z
  .string({
    message: "Please confirm your password.",
  })
  .min(1, {
    message: "Please confirm your password.",
  });

/**
 * Register Schema
 */
export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Types
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
