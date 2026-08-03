/**
 * Intervention Validators — Zod Schemas
 *
 * Spec: Sección 12.5 — Módulo de Intervenciones
 * Validation schemas for creating and updating interventions.
 */

import { z } from "zod";

export const createInterventionSchema = z.object({
  studentId: z.number().int().positive(),
  assignedUserId: z.number().int().positive(), // Maps to userId in Prisma
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(191),
  notes: z
    .string()
    .min(10, "Las notas deben tener al menos 10 caracteres."),
});

export const updateInterventionSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  notes: z
    .string()
    .min(10, "Las notas deben tener al menos 10 caracteres.")
    .optional(),
  updatedAt: z.string().datetime("Debe ser una fecha ISO 8601 válida").optional(),
});

export const interventionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateInterventionInput = z.infer<typeof createInterventionSchema>;
export type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>;
