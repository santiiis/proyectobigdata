import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // Try to cancel as import job
    const importJob = await prisma.importJob.findUnique({
      where: { jobId }
    });

    if (importJob && importJob.status === "PROCESSING") {
      await prisma.importJob.update({
        where: { jobId },
        data: {
          status: "FAILED",
          errorMessage: "Cancelado por el usuario."
        }
      });
    }

    // Try to cancel as batch job
    const batchJob = await prisma.batchJob.findUnique({
      where: { jobId }
    });

    if (batchJob && batchJob.status === "PROCESSING") {
      await prisma.batchJob.update({
        where: { jobId },
        data: {
          status: "FAILED",
          errorMessage: "Cancelado por el usuario."
        }
      });
    }

    // Also cancel any other processing batch jobs
    await prisma.batchJob.updateMany({
      where: {
        status: "PROCESSING"
      },
      data: {
        status: "FAILED",
        errorMessage: "Cancelado por el usuario."
      }
    });

    return NextResponse.json({ success: true, message: "Job(s) cancelled" });
  } catch (error: any) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
