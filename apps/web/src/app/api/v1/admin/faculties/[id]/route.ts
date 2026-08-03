import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { facultySchema, idSchema } from "@/lib/validators/admin";
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
    const result = facultySchema.safeParse(body);
    if (!result.success) throw new AppError("VALIDATION_ERROR", "Datos inválidos", 400, result.error.errors);

    const { code, name } = result.data;

    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Facultad no encontrada", 404);

    if (existing.code !== code) {
      const codeTaken = await prisma.faculty.findUnique({ where: { code } });
      if (codeTaken) throw new AppError("CONFLICT", "El código ya está en uso", 409);
    }

    const updated = await prisma.faculty.update({
      where: { id },
      data: { code, name }
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error actualizando facultad.", 500));
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

    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Facultad no encontrada", 404);

    await prisma.faculty.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error eliminando facultad.", 500));
  }
}
