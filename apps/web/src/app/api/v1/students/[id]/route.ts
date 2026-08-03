import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        career: {
          include: { faculty: true }
        },
        academicRecords: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        predictions: {
          where: { isActive: true },
          take: 1
        },
        enrollments: {
          include: {
            course: true,
            attendances: true
          }
        },
        interventions: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error fetching student' }, { status: 500 });
  }
}
