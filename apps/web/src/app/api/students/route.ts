/**
 * GET  /api/students — Paginated student listing
 * POST /api/students — Create student (ADMIN only)
 * Spec: Sección 11.4 — Paginación obligatoria
 * TODO: Implement with Prisma, Zod validation, pagination, filtering
 */
export async function GET() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}

export async function POST() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
