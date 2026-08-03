import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateUserSchema, userIdSchema } from "@/lib/validators/user";
import { hashPassword } from "@/lib/auth";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

/**
 * PATCH /api/v1/settings/users/[id]
 * Spec: Sección 12.7 — Actualización de rol y estado activo
 * Auth: Sí (via middleware: ADMIN)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userIdParam } = await params;
    const parsedParams = userIdSchema.safeParse({ id: userIdParam });
    if (!parsedParams.success) {
      throw new AppError("VALIDATION_ERROR", "ID de usuario inválido", 400);
    }

    const { id: targetUserId } = parsedParams.data;

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Datos de entrada inválidos", 400, result.error.errors);
    }

    const { role, isActive, password } = result.data;

    // Obtener usuario que realiza la petición
    const currentUserIdHeader = request.headers.get("x-user-id");
    const currentUserId = currentUserIdHeader ? parseInt(currentUserIdHeader, 10) : null;

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new AppError("NOT_FOUND", "Usuario no encontrado.", 404);
    }

    // Regla de Protección: Un Admin no puede deshabilitarse a sí mismo
    if (currentUserId === targetUserId && isActive === false) {
      throw new AppError(
        "FORBIDDEN",
        "Por razones de seguridad, un administrador no puede deshabilitar su propia cuenta.",
        403
      );
    }

    // Regla de Protección: Un Admin no puede quitarse su propio rol de ADMIN
    if (currentUserId === targetUserId && role !== undefined && role !== "ADMIN") {
      throw new AppError(
        "FORBIDDEN",
        "Por razones de seguridad, no puedes removerte tu propio rol de administrador.",
        403
      );
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error actualizando al usuario.", 500));
  }
}
