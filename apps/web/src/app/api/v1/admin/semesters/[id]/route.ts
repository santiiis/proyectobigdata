import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSemesterSchema, idSchema } from "@/lib/validators/admin";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const parsedParams = idSchema.safeParse({ id: rawId });
    if (!parsedParams.success) throw new AppError("VALIDATION_ERROR", "ID inválido", 400);
    const { id } = parsedParams.data;

    const body = await request.json();
    const result = updateSemesterSchema.safeParse(body);
    if (!result.success) throw new AppError("VALIDATION_ERROR", "Datos inválidos", 400, result.error.errors);

    const { name, startDate, endDate, isCurrent } = result.data;

    const existing = await prisma.semester.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Semestre no encontrado", 404);

    if (isCurrent && !existing.isCurrent) {
      // Desmarcar otros semestres actuales
      await prisma.semester.updateMany({
        where: { isCurrent: true, id: { not: id } },
        data: { isCurrent: false }
      });
    }

    const updated = await prisma.semester.update({
      where: { id },
      data: { 
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isCurrent !== undefined && { isCurrent })
      }
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error actualizando semestre.", 500));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const parsedParams = idSchema.safeParse({ id: rawId });
    if (!parsedParams.success) throw new AppError("VALIDATION_ERROR", "ID inválido", 400);
    const { id } = parsedParams.data;

    const existing = await prisma.semester.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Semestre no encontrado", 404);

    await prisma.semester.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error eliminando semestre.", 500));
  }
}
