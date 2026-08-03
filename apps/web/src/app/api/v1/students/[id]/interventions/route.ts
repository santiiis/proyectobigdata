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

    const interventions = await prisma.intervention.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { name: true }
        }
      }
    });

    const data = interventions.map(inv => ({
      id: inv.id,
      title: inv.title,
      status: inv.status,
      assignedTo: inv.assignedTo.name,
      notes: inv.notes,
      createdAt: inv.createdAt
    }));

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error al obtener historial de intervenciones.", 500));
  }
}
