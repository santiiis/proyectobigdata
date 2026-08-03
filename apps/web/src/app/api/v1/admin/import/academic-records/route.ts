import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

// Constantes
const WORKER_SECRET = process.env.ML_API_KEY || "ml-api-key-cambiar-en-produccion";
const FASTAPI_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new AppError("VALIDATION_ERROR", "No se proporcionó ningún archivo.", 400);
    }

    if (!file.name.endsWith(".zip") && !file.name.endsWith(".parquet")) {
      throw new AppError("VALIDATION_ERROR", "Formato no soportado. Debe ser .zip o .parquet", 400);
    }

    // 1. Create the ImportJob
    const jobId = `import_job_${Date.now()}`;
    await prisma.importJob.create({
      data: {
        jobId,
        fileName: file.name,
        status: "PROCESSING"
      }
    });

    // 2. Forward the actual file bytes to FastAPI (multipart). Enviar la ruta
    // local no funciona cuando el ML service corre en un contenedor Docker.
    const body = new FormData();
    body.append("file", file);
    body.append("jobId", jobId);

    fetch(`${FASTAPI_URL}/api/v1/import/oulad`, {
      method: "POST",
      headers: {
        "X-Internal-API-Key": WORKER_SECRET
      },
      body
    }).catch(async (err) => {
      console.error("Failed to dispatch import to ML service:", err);
      // Marcar el trabajo como fallido para que el frontend no quede en espera
      try {
        await prisma.importJob.update({
          where: { jobId },
          data: { status: "FAILED", errorMessage: "No se pudo conectar con el servicio de ML." }
        });
      } catch (_) {}
    });

    // 3. Return immediately to the client
    return successResponse({
      jobId,
      status: "PROCESSING",
      message: "El archivo ha sido recibido y está siendo procesado en segundo plano."
    }, 202);

  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error iniciando la importación.", 500));
  }
}
