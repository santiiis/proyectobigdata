import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const distribution = await prisma.prediction.groupBy({
      by: ['riskLevel'],
      _count: { riskLevel: true },
      where: { isActive: true }
    });

    const data = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0
    };

    for (const item of distribution) {
      if (item.riskLevel === "LOW") data.LOW = item._count.riskLevel;
      if (item.riskLevel === "MEDIUM") data.MEDIUM = item._count.riskLevel;
      if (item.riskLevel === "HIGH") data.HIGH = item._count.riskLevel;
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error obteniendo distribución de riesgo.", 500));
  }
}
