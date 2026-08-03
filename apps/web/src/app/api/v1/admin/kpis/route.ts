import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalStudents = await prisma.student.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const activeJobs = await prisma.batchJob.count({ where: { status: "PROCESSING" } });
    const activePredictions = await prisma.prediction.count({ where: { isActive: true } });

    const latestPrediction = await prisma.prediction.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { modelVersion: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        activeUsers,
        modelVersion: latestPrediction?.modelVersion || "v1.0.0",
        activeJobs,
        activePredictions
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error fetch KPIs" }, { status: 500 });
  }
}
