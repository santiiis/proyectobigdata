import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clearAuthCookies } from "@/lib/auth";
import { AppError, errorResponse } from "@/lib/errors";
import { successResponse } from "@/lib/responses";

/**
 * POST /api/v1/auth/logout
 * Spec: Sección 12.2 — Cerrar sesión
 * Auth: Sí
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      // Invalidate token in DB to prevent reuse
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Always clear cookies regardless of DB state
    await clearAuthCookies();

    return successResponse({ message: "Sesión cerrada correctamente." });
  } catch (error) {
    // Even on error, attempt to clear cookies
    await clearAuthCookies();
    return errorResponse(new AppError("LOGOUT_ERROR", "Error al cerrar sesión.", 500));
  }
}
