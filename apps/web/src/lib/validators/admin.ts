import { z } from "zod";

export const facultySchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres."),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});

export const careerSchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres."),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  facultyId: z.coerce.number().int().positive(),
});

export const semesterSchema = z.object({
  code: z.string().min(4, "El código debe tener al menos 4 caracteres. Ej: 2026-A"),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  startDate: z.string().datetime("La fecha de inicio debe ser formato ISO 8601 válido"),
  endDate: z.string().datetime("La fecha de fin debe ser formato ISO 8601 válido"),
  isCurrent: z.boolean().optional().default(false),
});

export const updateSemesterSchema = z.object({
  name: z.string().min(3).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().optional(),
});

export const courseSchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres."),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  credits: z.coerce.number().int().positive(),
  semesterId: z.coerce.number().int().positive(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(3).optional(),
  credits: z.coerce.number().int().positive().optional(),
});

export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});
