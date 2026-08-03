/**
 * Prediction Validators — Zod Schemas
 *
 * Spec: Sección 12.4 — Módulo de Predicciones
 * Validation schemas for batch run trigger.
 */

import { z } from "zod";

export const batchRunSchema = z.object({
  semesterCode: z
    .string()
    .min(3, "El código de semestre es requerido.")
    .max(50),
  forceRetrain: z.boolean().default(false),
});

export type BatchRunInput = z.infer<typeof batchRunSchema>;
