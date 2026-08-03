import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // Find the job
    const job = await prisma.importJob.findUnique({
      where: { jobId }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "PROCESSING") {
      return NextResponse.json({ error: "Job is not in PROCESSING status" }, { status: 400 });
    }

    // Cancel the job
    await prisma.importJob.update({
      where: { jobId },
      data: {
        status: "FAILED",
        errorMessage: "Cancelado por el usuario."
      }
    });

    // Also try to cancel batch jobs related to this import
    await prisma.batchJob.updateMany({
      where: {
        status: "PROCESSING"
      },
      data: {
        status: "FAILED",
        errorMessage: "Cancelado por el usuario (importación cancelada)."
      }
    });

    return NextResponse.json({ success: true, message: "Job cancelled" });
  } catch (error: any) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
