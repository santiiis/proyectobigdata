import { loginSchema } from "@/lib/validators/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signAccessToken, createRefreshToken, setAuthCookies } from "@/lib/auth";
import { AppError, errorResponse } from "@/lib/errors";
import { successResponse } from "@/lib/responses";
import type { LoginResponseData } from "@/lib/types";

/**
 * POST /api/v1/auth/login
 * Spec: Sección 12.2 — Login con JWT y Cookies HttpOnly
 * Auth: Público
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Datos de entrada inválidos", 400, result.error.errors);
    }

    const { email, password } = result.data;

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error("====== DATABASE ERROR ======");
      console.error(dbError);
      if (dbError.stack) console.error(dbError.stack);
      console.error("============================");
      throw new AppError("INTERNAL_SERVER_ERROR", "Error de base de datos.", 500);
    }

    if (!user || !user.isActive) {
      throw new AppError("INVALID_CREDENTIALS", "Credenciales incorrectas o usuario inactivo.", 401);
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError("INVALID_CREDENTIALS", "Credenciales incorrectas.", 401);
    }

    // Generate tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await createRefreshToken(user.id);

    // Set secure cookies
    await setAuthCookies(accessToken, refreshToken);

    const responseData: LoginResponseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    return successResponse<LoginResponseData>(responseData);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error procesando el login.", 500));
  }
}
