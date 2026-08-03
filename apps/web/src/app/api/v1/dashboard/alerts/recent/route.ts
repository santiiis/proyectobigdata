import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const recentHighRisk = await prisma.prediction.findMany({
      where: { 
        isActive: true, 
        riskLevel: "HIGH" 
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            firstName: true,
            lastName: true,
            career: { select: { name: true } }
          }
        }
      }
    });

    const data = recentHighRisk.map(pred => ({
      predictionId: pred.id,
      studentId: pred.student.id,
      studentName: `${pred.student.firstName} ${pred.student.lastName}`,
      studentCode: pred.student.studentCode,
      career: pred.student.career.name,
      score: pred.score,
      topRiskFactors: pred.topRiskFactors,
      date: pred.createdAt.toISOString()
    }));

    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error obteniendo alertas recientes.", 500));
  }
}
