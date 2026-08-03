import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { batchRunSchema } from "@/lib/validators/prediction";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";
import type { BatchRunResponseData } from "@/lib/types";
import { runBatchInference } from "@/services/ml-job-runner";

// Secret to authenticate internal worker calls
const WORKER_SECRET = process.env.WORKER_SECRET || "internal-dev-secret-123";

/**
 * POST /api/v1/predictions/batch-run
 * Spec: Sección 12.4 — Ejecución de Inferencia Masiva
 * Auth: Sí (ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = batchRunSchema.safeParse(body);

    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Parámetros inválidos", 400, result.error.errors);
    }

    const { semesterCode, forceRetrain } = result.data;
    const userIdHeader = request.headers.get("x-user-id");
    const triggeredById = userIdHeader ? parseInt(userIdHeader, 10) : null;

    // Check for concurrency and create job atomically
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newJob = await prisma.$transaction(async (tx) => {
      const activeJob = await tx.batchJob.findFirst({
        where: { status: "PROCESSING" },
      });

      if (activeJob) {
        throw new AppError("CONFLICT", "Ya existe un proceso masivo en ejecución.", 409);
      }

      return await tx.batchJob.create({
        data: {
          jobId,
          semesterCode,
          forceRetrain,
          triggeredById,
          status: "PROCESSING",
        },
      });
    });

    // Fire off async worker directly (without await)
    // We avoid fetch() to self to prevent loopback networking issues on local dev.
    runBatchInference(jobId, forceRetrain).catch(err => {
      console.error("Error disparando worker interno directamente:", err);
    });

    // Return 202 Accepted immediately
    const responseData: BatchRunResponseData = {
      jobId,
      status: "PROCESSING",
      message: "El procesamiento masivo ha iniciado en segundo plano.",
    };

    return successResponse<BatchRunResponseData>(responseData, 202);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error al iniciar proceso masivo.", 500));
  }
}
