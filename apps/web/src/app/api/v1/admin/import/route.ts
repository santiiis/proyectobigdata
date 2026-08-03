import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const jobId = crypto.randomUUID();

    // Insert job into database so the monitor can track it
    await prisma.importJob.create({
      data: {
        jobId: jobId,
        fileName: file.name,
        status: "PROCESSING",
        totalRecords: 0,
        processed: 0
      }
    });

    // Forward the actual file bytes to the FastAPI backend (multipart)
    const backendUrl = process.env.ML_SERVICE_URL || "http://localhost:8000/api/v1/import/oulad";
    const apiKey = process.env.ML_API_KEY || "ml-api-key-cambiar-en-produccion";

    const body = new FormData();
    body.append("file", file);
    body.append("jobId", jobId);

    // Start background fetch (fire and forget)
    fetch(backendUrl, {
      method: "POST",
      headers: {
        "x-worker-secret": apiKey,
      },
      body,
    }).catch(async (error) => {
      console.error("Error calling backend:", error);
      try {
        await prisma.importJob.update({
          where: { jobId },
          data: { status: "FAILED", errorMessage: "No se pudo conectar con el servicio de ML." }
        });
      } catch (_) {}
    });

    // Return 202 Accepted with the jobId immediately
    return NextResponse.json({ jobId, status: "accepted" }, { status: 202 });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
