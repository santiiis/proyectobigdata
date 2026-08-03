import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";
import fs from "fs";
import path from "path";
import os from "os";

// Constantes
const WORKER_SECRET = process.env.WORKER_SECRET || "internal-dev-secret-123";
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

    // 1. Save file locally to a temp directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = os.tmpdir();
    const fileName = `import_${Date.now()}_${file.name}`;
    const filePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(filePath, buffer);

    // 2. Create the ImportJob
    const jobId = `import_job_${Date.now()}`;
    const importJob = await prisma.importJob.create({
      data: {
        jobId,
        fileName: file.name,
        status: "PROCESSING"
      }
    });

    // 3. Dispatch to FastAPI as a background task
    fetch(`${FASTAPI_URL}/api/v1/import/oulad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": WORKER_SECRET
      },
      body: JSON.stringify({ 
        jobId, 
        filePath 
      })
    }).catch(err => {
      console.error("Failed to dispatch import to ML service:", err);
    });

    // 4. Return immediately to the client
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
