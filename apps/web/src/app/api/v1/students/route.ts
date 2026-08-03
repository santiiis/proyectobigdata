import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const career = searchParams.get("career") || "Todas";
    const risk = searchParams.get("risk") || "Todos";

    const whereClause: any = {};
    
    if (search) {
      const searchTerms = search.split(' ').filter(Boolean);
      whereClause.AND = searchTerms.map(term => ({
        OR: [
          { firstName: { contains: term } },
          { lastName: { contains: term } },
          { studentCode: { contains: term } }
        ]
      }));
    }
    
    if (career !== "Todas") {
      whereClause.career = { name: career };
    }
    
    if (risk !== "Todos") {
      const riskMapping: Record<string, any> = {
        "Alto": "HIGH",
        "Medio": "MEDIUM",
        "Bajo": "LOW"
      };
      if (riskMapping[risk]) {
        whereClause.predictions = {
          some: {
            isActive: true,
            riskLevel: riskMapping[risk]
          }
        };
      }
    }

    const data = await prisma.student.findMany({
      take: limit,
      skip: skip,
      where: whereClause,
      orderBy: { id: 'asc' },
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
