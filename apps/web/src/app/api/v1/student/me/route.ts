import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const payload = accessToken ? await verifyAccessToken(accessToken) : null;
    if (!payload) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.studentId) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'No hay estudiante vinculado a este usuario' } }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        career: { include: { faculty: true } },
        academicRecords: { orderBy: { period: 'desc' }, take: 4 },
        enrollments: { include: { course: true } },
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
        interventions: { include: { assignedTo: true }, orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Estudiante no encontrado' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('GET /api/v1/student/me error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Error interno' } }, { status: 500 });
  }
}
