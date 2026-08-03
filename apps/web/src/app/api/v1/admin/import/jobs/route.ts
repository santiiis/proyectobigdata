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

    return successResponse(jobs);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error listando import jobs.", 500));
  }
}
