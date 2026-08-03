import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.intervention.findMany({
      include: {
        student: true
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const payload = accessToken ? await verifyAccessToken(accessToken) : null;
    if (!payload) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const studentId = Number(body.studentId);
    const title = String(body.title || "").trim();
    const notes = String(body.notes || "");

    if (!Number.isInteger(studentId) || !title) {
      return NextResponse.json(
        { success: false, error: "studentId y title son requeridos" },
        { status: 400 }
      );
    }

    // Determine assigned tutor: if the requester is a student, assign an active tutor automatically
    let assignedUserId = payload.userId;
    if (payload.role === "STUDENT") {
      const tutor = await prisma.user.findFirst({
        where: { role: "TUTOR", isActive: true },
        select: { id: true },
      });
      if (tutor) {
        assignedUserId = tutor.id;
      }
    }

    const data = await prisma.intervention.create({
      data: {
        studentId,
        userId: assignedUserId,
        title,
        notes
      },
      include: {
        assignedTo: { select: { name: true, email: true } },
        student: true
      }
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: payload.userId,
          action: "INTERVENTION_CREATE",
          entity: "Intervention",
          entityId: String(data.id),
          details: { studentId, title },
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        },
      });
    } catch (_) {}

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
