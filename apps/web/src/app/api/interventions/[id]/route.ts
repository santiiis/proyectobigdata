/**
 * PUT /api/interventions/[id] — Update intervention status and notes
 * Spec: Sección 1.2 — InterventionStatus: PENDING → IN_PROGRESS → RESOLVED → CLOSED
 */
export async function PUT() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
