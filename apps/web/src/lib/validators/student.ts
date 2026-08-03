/**
 * Student Validators — Zod Schemas
 *
 * Spec: Sección 12.3 — Módulo de Estudiantes
 * Validation schemas for student query parameters and path params.
 */

import { z } from "zod";

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  facultyId: z.coerce.number().int().positive().optional(),
  careerId: z.coerce.number().int().positive().optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  search: z.string().max(100).optional(),
});

export const studentIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID del estudiante debe ser un número positivo."),
});

export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
export type StudentIdInput = z.infer<typeof studentIdSchema>;
