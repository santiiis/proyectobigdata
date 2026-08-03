import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signAccessToken, createRefreshToken, setAuthCookies } from "@/lib/auth";
import { AppError, errorResponse } from "@/lib/errors";
import { successResponse } from "@/lib/responses";

/**
 * POST /api/v1/auth/refresh
 * Spec: Sección 12.2 — Renovación de token
 * Auth: Sí (refreshToken cookie)
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get("refreshToken")?.value;

    if (!oldRefreshToken) {
      throw new AppError("MISSING_REFRESH_TOKEN", "No se proporcionó token de refresco.", 401);
    }

    // Find token in DB
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!dbToken) {
      throw new AppError("INVALID_REFRESH_TOKEN", "Token de refresco inválido o revocado.", 401);
    }

    if (dbToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      throw new AppError("EXPIRED_REFRESH_TOKEN", "El token de refresco ha expirado.", 401);
    }

    const { user } = dbToken;

    if (!user.isActive) {
      throw new AppError("USER_INACTIVE", "Usuario inactivo.", 403);
    }

    // Delete old token (Rotation)
    await prisma.refreshToken.delete({ where: { id: dbToken.id } });

    // Issue new tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await createRefreshToken(user.id);

    await setAuthCookies(newAccessToken, newRefreshToken);

    return successResponse({ message: "Token renovado exitosamente." });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error renovando el token.", 500));
  }
}
