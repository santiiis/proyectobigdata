/**
 * Report Validators — Zod Schemas
 *
 * Spec: Sección 12.6 — Módulo de Reportes
 * Validation schemas for report export query parameters.
 */

import { z } from "zod";

export const reportExportSchema = z.object({
  format: z.enum(["pdf", "xlsx", "csv"]),
  type: z.enum(["FACULTY", "CAREER", "PERIOD", "AUDIT"]),
  careerId: z.coerce.number().int().positive().optional(),
  semesterCode: z.string().max(50).optional(),
});

export type ReportExportInput = z.infer<typeof reportExportSchema>;
