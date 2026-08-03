import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        career: true,
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
