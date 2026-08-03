/**
 * POST /api/auth/login
 * Spec: Sección 4.1 — Autenticación JWT + Cookies HTTP-Only
 * TODO: Validate credentials with Zod, verify with Bcrypt, issue JWT pair
 */
export async function POST() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
