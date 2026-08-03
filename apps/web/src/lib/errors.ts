/**
 * Error handling utilities
 *
 * Spec: Sección 11.3 — Manejo Centralizado de Errores
 *
 * TODO: Implement AppError class extending Error
 * TODO: Implement error response formatter
 *
 * Response format:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "STUDENT_NOT_FOUND",
 *     "message": "El estudiante solicitado no existe.",
 *     "details": null
 *   },
 *   "timestamp": "2026-08-02T18:00:00.000Z"
 * }
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details: unknown = null
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: AppError) {
  return Response.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    },
    { status: error.statusCode }
  );
}
