import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Para la tendencia histórica (MVP) recuperaremos los trabajos masivos (BatchJobs) recientes
    // Si queremos granularidad (riesgo medio histórico), haríamos un query a PredictionHistory.
    // Usaremos los BatchJobs exitosos como puntos en el tiempo de procesamiento.
    const recentJobs = await prisma.batchJob.findMany({
      where: { status: "COMPLETED" },
      orderBy: { processedAt: "asc" },
      take: 12
    });

    const data = recentJobs.map(job => ({
      semester: job.semesterCode,
      date: job.processedAt?.toISOString(),
      studentsProcessed: job.totalStudents
    }));

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error obteniendo tendencia histórica.", 500));
  }
}
