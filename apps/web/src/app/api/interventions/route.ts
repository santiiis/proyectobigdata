/**
 * GET  /api/interventions — List interventions (filtered by role)
 * POST /api/interventions — Create new intervention
 * Spec: Sección 1.2 — Gestión y Seguimiento de Intervenciones
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
