import { NextRequest, NextResponse } from "next/server";
import { reportExportSchema } from "@/lib/validators/report";
import { generateReport } from "@/services/report-generator";

import { AppError, errorResponse } from "@/lib/errors";

/**
 * GET /api/v1/reports/export
 * Spec: Sección 12.6 — Exportar reportes
 * Auth: Sí (via middleware: ADMIN, DIRECTOR)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    // Convertir format/type a UPPER/lower según el schema para asegurar matching
    if (searchParams.format) searchParams.format = searchParams.format.toLowerCase();
    if (searchParams.type) searchParams.type = searchParams.type.toUpperCase();

    const result = reportExportSchema.safeParse(searchParams);

    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Parámetros de reporte inválidos", 400, result.error.errors);
    }

    const query = result.data;

    // Solo soportado CSV en esta iteración del MVP
    if (query.format !== "csv") {
      throw new AppError("VALIDATION_ERROR", `Formato ${query.format.toUpperCase()} no soportado en esta fase.`, 400);
    }

    // Generar archivo
    const { csvString, filename } = await generateReport(query);

    // Retornar archivo crudo (no JSON) usando Response
    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error generando el reporte.", 500));
  }
}
