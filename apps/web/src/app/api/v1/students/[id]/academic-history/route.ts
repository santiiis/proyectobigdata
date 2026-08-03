import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentIdSchema } from "@/lib/validators/student";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentIdParam } = await params;
    const parsedParams = studentIdSchema.safeParse({ id: studentIdParam });
    if (!parsedParams.success) {
      throw new AppError("VALIDATION_ERROR", "ID de estudiante inválido", 400);
    }
    const { id } = parsedParams.data;

    const studentExists = await prisma.student.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!studentExists) {
      throw new AppError("NOT_FOUND", "Estudiante no encontrado.", 404);
    }

    const records = await prisma.academicRecord.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        period: true,
        gpa: true,
        failedSubjects: true,
        attendanceRate: true,
        lmsScore: true,
        createdAt: true,
      }
    });

    return successResponse(records);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error al obtener historial académico.", 500));
  }
}
