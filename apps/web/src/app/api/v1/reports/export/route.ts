import { NextRequest, NextResponse } from "next/server";
import { reportExportSchema } from "@/lib/validators/report";
import { generateReport, generateReportData } from "@/services/report-generator";

import { AppError, errorResponse } from "@/lib/errors";

/**
 * GET /api/v1/reports/export
 * Spec: Sección 12.6 — Exportar reportes
 * Auth: Sí (via middleware: ADMIN, DIRECTOR)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    // Convertir format/type a UPPER/LOWER según el schema para asegurar matching
    if (searchParams.format) searchParams.format = searchParams.format.toLowerCase();
    if (searchParams.type) searchParams.type = searchParams.type.toUpperCase();

    const result = reportExportSchema.safeParse(searchParams);

    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Parámetros de reporte inválidos", 400, result.error.errors);
    }

    const query = result.data;
    const { data, filename } = await generateReportData(query);

    if (query.format === "csv") {
      const { csvString } = await generateReport(query);
      return new NextResponse(csvString, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (query.format === "xlsx") {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename.replace(/\.csv$/, '.xlsx')}"`,
        },
      });
    }

    if (query.format === "pdf") {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.text(`Reporte: ${query.type}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, 14, 28);

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map((row: any) => headers.map(h => String(row[h] ?? "")));
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 34,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [37, 99, 235] },
        });
      }

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename.replace(/\.csv$/, '.pdf')}"`,
        },
      });
    }

    throw new AppError("VALIDATION_ERROR", `Formato ${String(query.format).toUpperCase()} no soportado.`, 400);

  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error generando el reporte.", 500));
  }
}
