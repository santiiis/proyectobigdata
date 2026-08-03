import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const latestJob = await prisma.batchJob.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: latestJob
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error fetching latest job" }, { status: 500 });
  }
}
