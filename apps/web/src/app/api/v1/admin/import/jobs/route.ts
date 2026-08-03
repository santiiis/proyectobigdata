import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 10;

    const jobs = await prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Auto-detect stuck jobs (PROCESSING for more than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const stuckJobs = await prisma.importJob.findMany({
      where: {
        status: "PROCESSING",
        createdAt: { lt: fiveMinutesAgo }
      }
    });

    if (stuckJobs.length > 0) {
      await prisma.importJob.updateMany({
        where: {
          id: { in: stuckJobs.map(j => j.id) }
        },
        data: {
          status: "FAILED",
          errorMessage: "Timeout: El proceso tardó demasiado tiempo."
        }
      });
      
      // Re-fetch jobs after cleanup
      const updatedJobs = await prisma.importJob.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return successResponse(updatedJobs);
    }

    return successResponse(jobs);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error listando import jobs.", 500));
  }
}
