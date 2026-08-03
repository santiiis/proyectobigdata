import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { interventionIdSchema, updateInterventionSchema } from "@/lib/validators/intervention";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

/**
 * PATCH /api/v1/interventions/[id]
 * Spec: Sección 12.5 — Actualizar intervención
 * Auth: Sí (via middleware: ADMIN, TUTOR)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interventionIdParam } = await params;
    const parsedParams = interventionIdSchema.safeParse({ id: interventionIdParam });
    if (!parsedParams.success) {
      throw new AppError("VALIDATION_ERROR", "ID de intervención inválido", 400);
    }

    const { id } = parsedParams.data;

    const body = await request.json();
    const result = updateInterventionSchema.safeParse(body);

    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Datos de entrada inválidos", 400, result.error.errors);
    }

    const { status, notes, updatedAt: clientUpdatedAt } = result.data;

    const existingIntervention = await prisma.intervention.findUnique({
      where: { id },
    });

    if (!existingIntervention) {
      throw new AppError("NOT_FOUND", "Intervención no encontrada.", 404);
    }

    // Optimistic Concurrency Control
    if (clientUpdatedAt && existingIntervention.updatedAt.toISOString() !== clientUpdatedAt) {
      throw new AppError(
        "CONFLICT",
        "La intervención fue modificada por otro usuario recientemente. Por favor, recarga los datos.",
        409
      );
    }

    const updatedIntervention = await prisma.intervention.update({
      where: { id },
      data: { status, notes },
    });

    return successResponse(updatedIntervention);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error actualizando intervención.", 500));
  }
}
