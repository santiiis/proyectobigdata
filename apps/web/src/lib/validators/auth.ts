/**
 * Auth Validators — Zod Schemas
 *
 * Spec: Sección 12.2 — Módulo de Autenticación
 * Validation schemas for auth-related API endpoints.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("El correo electrónico no es válido.")
    .max(191),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(255),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(191),
  email: z
    .string()
    .email("El correo electrónico no es válido.")
    .max(191),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(255),
  role: z.enum(["ADMIN", "DIRECTOR", "TUTOR"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
