/**
 * POST /api/auth/refresh
 * Spec: Sección 4.1 — Refresh Token rotation
 * TODO: Validate refresh token from cookie, rotate tokens, issue new pair
 */
export async function POST() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
