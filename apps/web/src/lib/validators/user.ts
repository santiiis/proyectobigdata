import { z } from "zod";

/**
 * User Validators — Zod Schemas
 *
 * Spec: Sección 12.7 — Configuración y Gestión de Usuarios
 */

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Correo electrónico inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(["ADMIN", "DIRECTOR", "TUTOR"]),
});

export const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "DIRECTOR", "TUTOR"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").optional(),
});

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
