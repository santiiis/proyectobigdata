import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const job = await prisma.importJob.findUnique({
      where: { jobId }
    });

    if (!job) {
      throw new AppError("NOT_FOUND", "Trabajo de importación no encontrado", 404);
    }

    return successResponse({
      jobId: job.jobId,
      fileName: job.fileName,
      status: job.status,
      totalRecords: job.totalRecords,
      processed: job.processed,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      // Helper param to know if it finished
      isFinished: job.status === "COMPLETED" || job.status === "FAILED"
    });

  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error consultando el estado del trabajo.", 500));
  }
}
