import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCourseSchema, idSchema } from "@/lib/validators/admin";
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
    const result = updateCourseSchema.safeParse(body);
    if (!result.success) throw new AppError("VALIDATION_ERROR", "Datos inválidos", 400, result.error.errors);

    const { name, credits } = result.data;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Curso no encontrado", 404);

    const updated = await prisma.course.update({
      where: { id },
      data: { 
        ...(name && { name }),
        ...(credits && { credits })
      },
      include: {
        semester: {
          select: { code: true, name: true }
        }
      }
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error actualizando curso.", 500));
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

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Curso no encontrado", 404);

    await prisma.course.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error eliminando curso.", 500));
  }
}
