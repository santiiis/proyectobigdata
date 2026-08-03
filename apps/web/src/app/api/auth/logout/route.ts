/**
 * POST /api/auth/logout
 * Spec: Sección 4.1 — Clear cookies and invalidate refresh token
 * TODO: Delete refresh token from DB, clear HTTP-only cookies
 */
export async function POST() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
