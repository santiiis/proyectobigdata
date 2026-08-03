/**
 * GET /api/students/[id]/predictions — Prediction history for a student
 * Spec: Sección 3.1 — Relación Student 1:N Prediction
 */
export async function GET() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
