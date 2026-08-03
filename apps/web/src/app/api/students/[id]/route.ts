/**
 * GET    /api/students/[id] — Student detail with relations
 * PUT    /api/students/[id] — Update student
 * DELETE /api/students/[id] — Deactivate student
 */
export async function GET() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}

export async function PUT() {
  return Response.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Endpoint pendiente de implementación" } },
    { status: 501 }
  );
}
