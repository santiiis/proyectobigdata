import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentIdSchema } from "@/lib/validators/student";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parsedParams = studentIdSchema.safeParse({ id: params.id });
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

    const predictions = await prisma.prediction.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        score: true,
        riskLevel: true,
        topRiskFactors: true,
        modelVersion: true,
        createdAt: true,
      }
    });

    // Map createdAt to calculatedAt to match the requested format
    const data = predictions.map(p => ({
      ...p,
      calculatedAt: p.createdAt
    }));

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error al obtener historial de predicciones.", 500));
  }
}
