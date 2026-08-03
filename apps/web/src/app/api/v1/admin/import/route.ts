import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the file from the request
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique jobId
    const jobId = crypto.randomUUID();

    // Save the file temporarily to the OS
    const tempDir = os.tmpdir();
    const extension = path.extname(file.name) || '.zip';
    const tempFilePath = path.join(tempDir, `${jobId}${extension}`);
    await fs.writeFile(tempFilePath, buffer);

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

    // Call the FastAPI backend
    const backendUrl = "http://localhost:8000/api/v1/import/oulad";
    const apiKey = process.env.ML_API_KEY || "ml-api-key-cambiar-en-produccion";

    // Start background fetch (fire and forget)
    fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": apiKey,
      },
      body: JSON.stringify({
        jobId: jobId,
        filePath: tempFilePath,
      }),
    }).catch((error) => {
      console.error("Error calling backend:", error);
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
