import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const [
      totalActiveStudents,
      highRiskStudents,
      activeInterventions,
      resolvedInterventions
    ] = await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.prediction.count({ where: { isActive: true, riskLevel: "HIGH" } }),
      prisma.intervention.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.intervention.count({ where: { status: "RESOLVED" } })
    ]);

    const data = {
      totalActiveStudents,
      highRiskStudents,
      activeInterventions,
      resolvedInterventions
    };

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error obteniendo KPIs del dashboard.", 500));
  }
}
