import { prisma } from "@/lib/prisma";
import type { ReportExportInput } from "@/lib/validators/report";

/**
 * Servicio Generador de Reportes (CSV CSV-based for MVP)
 * 
 * Centraliza las consultas complejas de agregación en Prisma para construir
 * datos tabulares que luego serán exportados a CSV u otros formatos futuros.
 */

// Función auxiliar para convertir Array de Objetos a string CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((fieldName) => {
        const val = row[fieldName];
        if (val === null || val === undefined) return "";
        // Escapar comillas dobles y envolver en comillas si contiene comas
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export async function generateReport(query: ReportExportInput): Promise<{ csvString: string; filename: string }> {
  const data = await generateReportDataInternal(query);
  const filename = `report_${query.type.toLowerCase()}_${new Date().getTime()}.csv`;

  return {
    csvString: convertToCSV(data),
    filename,
  };
}

export async function generateReportData(query: ReportExportInput): Promise<{ data: any[]; filename: string }> {
  const data = await generateReportDataInternal(query);
  const filename = `report_${query.type.toLowerCase()}_${new Date().getTime()}.csv`;
  return { data, filename };
}

async function generateReportDataInternal(query: ReportExportInput): Promise<any[]> {
  switch (query.type) {
    case "FACULTY":
      return generateFacultyReport();
    case "CAREER":
      return generateCareerReport(query.careerId);
    case "PERIOD":
      return generatePeriodReport(query.semesterCode);
    case "AUDIT":
      return generateAuditReport();
    default:
      return [];
  }
}

async function generateFacultyReport() {
  const students = await prisma.student.findMany({
    include: {
      career: { include: { faculty: true } },
      predictions: { where: { isActive: true }, take: 1 },
    },
  });

  const aggregate: Record<string, { total: number; low: number; medium: number; high: number; unclassified: number }> = {};

  for (const s of students) {
    const facName = s.career.faculty.name;
    if (!aggregate[facName]) {
      aggregate[facName] = { total: 0, low: 0, medium: 0, high: 0, unclassified: 0 };
    }
    
    aggregate[facName].total++;
    const pred = s.predictions[0];
    if (pred) {
      if (pred.riskLevel === "LOW") aggregate[facName].low++;
      else if (pred.riskLevel === "MEDIUM") aggregate[facName].medium++;
      else if (pred.riskLevel === "HIGH") aggregate[facName].high++;
    } else {
      aggregate[facName].unclassified++;
    }
  }

  return Object.entries(aggregate).map(([faculty, stats]) => ({
    Facultad: faculty,
    "Estudiantes Totales": stats.total,
    "Riesgo BAJO": stats.low,
    "Riesgo MEDIO": stats.medium,
    "Riesgo ALTO": stats.high,
    "Sin Predicción": stats.unclassified,
  }));
}

async function generateCareerReport(careerId?: number) {
  const where: any = {};
  if (careerId) where.careerId = careerId;

  const students = await prisma.student.findMany({
    where,
    include: {
      career: true,
      predictions: { where: { isActive: true }, take: 1 },
    },
  });

  const aggregate: Record<string, { total: number; low: number; medium: number; high: number; unclassified: number }> = {};

  for (const s of students) {
    const carName = s.career.name;
    if (!aggregate[carName]) {
      aggregate[carName] = { total: 0, low: 0, medium: 0, high: 0, unclassified: 0 };
    }
    
    aggregate[carName].total++;
    const pred = s.predictions[0];
    if (pred) {
      if (pred.riskLevel === "LOW") aggregate[carName].low++;
      else if (pred.riskLevel === "MEDIUM") aggregate[carName].medium++;
      else if (pred.riskLevel === "HIGH") aggregate[carName].high++;
    } else {
      aggregate[carName].unclassified++;
    }
  }

  return Object.entries(aggregate).map(([career, stats]) => ({
    Carrera: career,
    "Estudiantes Totales": stats.total,
    "Riesgo BAJO": stats.low,
    "Riesgo MEDIO": stats.medium,
    "Riesgo ALTO": stats.high,
    "Sin Predicción": stats.unclassified,
  }));
}

async function generatePeriodReport(semesterCode?: string) {
  const where: any = {};
  if (semesterCode) where.semesterCode = semesterCode;
  
  const jobs = await prisma.batchJob.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return jobs.map(j => ({
    "Job ID": j.jobId,
    "Semestre": j.semesterCode,
    "Estado": j.status,
    "Estudiantes Procesados": j.totalStudents ?? 0,
    "Iniciado": j.createdAt.toISOString(),
    "Finalizado": j.processedAt ? j.processedAt.toISOString() : "Pendiente",
    "Fallo": j.errorMessage ?? "N/A"
  }));
}

async function generateAuditReport() {
  const interventions = await prisma.intervention.findMany({
    include: {
      assignedTo: true,
      student: true
    },
    orderBy: { createdAt: "desc" }
  });

  return interventions.map(inv => ({
    "ID Intervención": inv.id,
    "Tutor": inv.assignedTo.name,
    "Estudiante": `${inv.student.firstName} ${inv.student.lastName}`,
    "Código": inv.student.studentCode,
    "Estado": inv.status,
    "Creado": inv.createdAt.toISOString(),
    "Actualizado": inv.updatedAt.toISOString(),
  }));
}
