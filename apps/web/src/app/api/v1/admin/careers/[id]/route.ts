import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { careerSchema, idSchema } from "@/lib/validators/admin";
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
    const result = careerSchema.safeParse(body);
    if (!result.success) throw new AppError("VALIDATION_ERROR", "Datos inválidos", 400, result.error.errors);

    const { code, name, facultyId } = result.data;

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Carrera no encontrada", 404);

    const facultyExists = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!facultyExists) throw new AppError("VALIDATION_ERROR", "La facultad indicada no existe.", 400);

    if (existing.code !== code) {
      const codeTaken = await prisma.career.findUnique({ where: { code } });
      if (codeTaken) throw new AppError("CONFLICT", "El código ya está en uso", 409);
    }

    const updated = await prisma.career.update({
      where: { id },
      data: { code, name, facultyId },
      include: {
        faculty: {
          select: { name: true }
        }
      }
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error actualizando carrera.", 500));
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

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Carrera no encontrada", 404);

    await prisma.career.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error eliminando carrera.", 500));
  }
}
