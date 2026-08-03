import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validators/admin";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.course.findMany({
      include: {
        semester: true
      }
    });
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error obteniendo asignaturas.", 500));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = courseSchema.safeParse(body);
    if (!result.success) throw new AppError("VALIDATION_ERROR", "Datos inválidos", 400, result.error.errors);

    const { code, name, credits, semesterId } = result.data;

    const existing = await prisma.course.findUnique({ where: { code_semesterId: { code, semesterId } } });
    if (existing) throw new AppError("CONFLICT", "La asignatura ya existe en ese semestre", 409);

    const created = await prisma.course.create({
      data: { code, name, credits, semesterId },
      include: { semester: true }
    });
    return successResponse(created, 201);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error creando asignatura.", 500));
  }
}
