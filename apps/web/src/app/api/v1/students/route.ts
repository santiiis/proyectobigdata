import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.student.findMany({
      include: {
        career: true,
        predictions: {
          where: { isActive: true },
          take: 1,
          orderBy: { createdAt: "desc" }
        },
        academicRecords: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
