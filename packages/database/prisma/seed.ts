import { PrismaClient, Role, StudentStatus, RiskLevel, InterventionStatus, BatchJobStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  // 1. Limpiar base de datos (Opcional, cuidado en producción)
  // await prisma.student.deleteMany();
  // await prisma.faculty.deleteMany();
  // await prisma.user.deleteMany();

  // 2. Crear Facultad y Carreras
  const faculty = await prisma.faculty.upsert({
    where: { code: 'FAC_ING' },
    update: {},
    create: {
      code: 'FAC_ING',
      name: 'Facultad de Ingeniería',
      careers: {
        create: [
          { code: 'SIS', name: 'Ingeniería de Sistemas' },
          { code: 'IND', name: 'Ingeniería Industrial' }
        ]
      }
    }
  });

  const careers = await prisma.career.findMany();
  const sisCareer = careers.find(c => c.code === 'SIS')!;
  const indCareer = careers.find(c => c.code === 'IND')!;

  // 3. Crear Usuarios
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@uide.edu.ec' },
    update: { role: Role.ADMIN },
    create: {
      email: 'admin@uide.edu.ec',
      name: 'Administrador Principal',
      password: passwordHash,
      role: Role.ADMIN
    }
  });

  const tutorUser = await prisma.user.upsert({
    where: { email: 'tutor@uide.edu.ec' },
    update: {},
    create: {
      email: 'tutor@uide.edu.ec',
      name: 'Dr. Roberto Tutor',
      password: passwordHash,
      role: Role.TUTOR
    }
  });

  // 4. Crear Semestre
  const semester = await prisma.semester.upsert({
    where: { code: '2026-A' },
    update: {},
    create: {
      code: '2026-A',
      name: 'Primer Semestre 2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-07-30'),
      isCurrent: true
    }
  });

  // 5. Crear 15 Estudiantes con Predicciones
  const mockStudents = [
    { code: 'STU001', first: 'Ana', last: 'García', risk: RiskLevel.HIGH, score: 0.89, car: sisCareer.id },
    { code: 'STU002', first: 'Carlos', last: 'López', risk: RiskLevel.LOW, score: 0.12, car: indCareer.id },
    { code: 'STU003', first: 'María', last: 'Martínez', risk: RiskLevel.MEDIUM, score: 0.55, car: sisCareer.id },
    { code: 'STU004', first: 'Jorge', last: 'Rodríguez', risk: RiskLevel.HIGH, score: 0.95, car: indCareer.id },
    { code: 'STU005', first: 'Elena', last: 'Sánchez', risk: RiskLevel.LOW, score: 0.05, car: sisCareer.id },
    { code: 'STU006', first: 'Luis', last: 'Pérez', risk: RiskLevel.MEDIUM, score: 0.45, car: indCareer.id },
    { code: 'STU007', first: 'Carmen', last: 'Gómez', risk: RiskLevel.HIGH, score: 0.78, car: sisCareer.id },
    { code: 'STU008', first: 'Miguel', last: 'Díaz', risk: RiskLevel.LOW, score: 0.18, car: indCareer.id },
    { code: 'STU009', first: 'Laura', last: 'Torres', risk: RiskLevel.MEDIUM, score: 0.62, car: sisCareer.id },
    { code: 'STU010', first: 'Pedro', last: 'Flores', risk: RiskLevel.HIGH, score: 0.88, car: indCareer.id },
    { code: 'STU011', first: 'Isabel', last: 'Ruiz', risk: RiskLevel.LOW, score: 0.22, car: sisCareer.id },
    { code: 'STU012', first: 'Fernando', last: 'Alonso', risk: RiskLevel.MEDIUM, score: 0.48, car: indCareer.id },
    { code: 'STU013', first: 'Patricia', last: 'Castro', risk: RiskLevel.HIGH, score: 0.91, car: sisCareer.id },
    { code: 'STU014', first: 'Ricardo', last: 'Rojas', risk: RiskLevel.LOW, score: 0.15, car: indCareer.id },
    { code: 'STU015', first: 'Silvia', last: 'Mendoza', risk: RiskLevel.MEDIUM, score: 0.58, car: sisCareer.id }
  ];

  for (const st of mockStudents) {
    const student = await prisma.student.upsert({
      where: { studentCode: st.code },
      update: {},
      create: {
        studentCode: st.code,
        firstName: st.first,
        lastName: st.last,
        email: `${st.code.toLowerCase()}@uide.edu.ec`,
        careerId: st.car,
        status: StudentStatus.ACTIVE,
        currentSemester: 3,
        predictions: {
          create: {
            score: st.score,
            riskLevel: st.risk,
            modelVersion: 'v2.4.1',
            isActive: true,
            topRiskFactors: { "attendance": 0.4, "grades": 0.5, "lms": 0.1 }
          }
        },
        academicRecords: {
          create: {
            period: '2025-B',
            gpa: 10 - (st.score * 5),
            failedSubjects: st.risk === RiskLevel.HIGH ? 2 : 0,
            attendanceRate: 1 - (st.score * 0.4),
            lmsScore: 100 - (st.score * 50)
          }
        }
      }
    });

    // 6. Crear algunas Intervenciones para los de alto riesgo
    if (st.risk === RiskLevel.HIGH) {
      await prisma.intervention.create({
        data: {
          studentId: student.id,
          userId: tutorUser.id,
          status: InterventionStatus.PENDING,
          title: `Alerta temprana: Bajo rendimiento LMS - ${st.first} ${st.last}`,
          notes: 'Generado automáticamente por modelo predictivo.'
        }
      });
    }
  }

  // 7. Crear algunos trabajos de importación (para el panel admin)
  const existingJob = await prisma.importJob.findFirst();
  if (!existingJob) {
    await prisma.importJob.createMany({
      data: [
        { jobId: 'job_1001', fileName: 'estudiantes_2024A.csv', status: BatchJobStatus.COMPLETED, totalRecords: 4500, processed: 4500 },
        { jobId: 'job_1002', fileName: 'notas_parciales_24A.xlsx', status: BatchJobStatus.COMPLETED, totalRecords: 12000, processed: 12000 },
        { jobId: 'job_1003', fileName: 'asistencias_semana1.csv', status: BatchJobStatus.FAILED, totalRecords: 8500, processed: 4200, errorMessage: 'Formato inválido en línea 4201' },
      ]
    });
  }
  
  // 8. Crear logs de auditoría falsos
  const existingAudit = await prisma.auditLog.findFirst();
  if (!existingAudit) {
    await prisma.auditLog.createMany({
      data: [
        { userId: adminUser.id, action: 'LOGIN', entity: 'User', ipAddress: '192.168.1.45' },
        { userId: adminUser.id, action: 'IMPORT_START', entity: 'ImportJob', details: { file: 'oulad_procesado.zip' }, ipAddress: '192.168.1.45' }
      ]
    });
  }

  console.log('✅ Base de datos poblada con éxito.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
