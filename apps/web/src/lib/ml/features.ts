import { prisma } from "@/lib/prisma";
import type { MLFeatures } from "@/lib/types";

/**
 * Módulo de Feature Engineering
 * Extrae y computa las métricas necesarias desde Prisma para enviarlas al modelo ML.
 */

/**
 * Computa la proporción de créditos aprobados vs inscritos.
 * TODO: En una implementación real, iteraría sobre Course y Enrollment para
 * deducir aprobaciones reales según las notas (finalGrade).
 * Por ahora retornaremos un proxy basado en semestres actuales vs esperados.
 */
async function computeCreditsRatio(studentId: number): Promise<number> {
  // As a proxy for MVP: ratio could be 0.0 to 1.0
  // Here we'll simulate calculating the ratio.
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: true },
  });

  if (enrollments.length === 0) return 1.0; // New student, no failure history yet

  const totalCredits = enrollments.reduce((acc, curr) => acc + curr.course.credits, 0);
  // Assuming a passing grade is > 6.0 out of 10.0
  const passedCredits = enrollments
    .filter(e => e.finalGrade !== null && e.finalGrade >= 6.0)
    .reduce((acc, curr) => acc + curr.course.credits, 0);

  return totalCredits > 0 ? passedCredits / totalCredits : 1.0;
}

/**
 * Computa el atraso de pagos en días.
 * Toma el máximo retraso de pagos pendientes.
 */
async function computePaymentDelay(studentId: number): Promise<number> {
  const pendingPayments = await prisma.payment.findMany({
    where: { studentId, status: { in: ["PENDING", "OVERDUE"] } },
  });

  if (pendingPayments.length === 0) return 0;

  const now = new Date();
  let maxDelay = 0;

  for (const p of pendingPayments) {
    if (p.dueDate < now) {
      const diffTime = Math.abs(now.getTime() - p.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > maxDelay) {
        maxDelay = diffDays;
      }
    }
  }

  return maxDelay;
}

/**
 * Construye el payload completo de features para un estudiante determinado.
 * Extrae información base del AcademicRecord y calcula las dependencias de pago/créditos.
 */
export async function buildMLFeatures(studentId: number): Promise<MLFeatures> {
  // Extract latest academic record
  const latestRecord = await prisma.academicRecord.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  const gpa = latestRecord?.gpa ?? 0;
  const failedSubjectsCount = latestRecord?.failedSubjects ?? 0;
  const attendanceRate = latestRecord?.attendanceRate ?? 1.0;
  const lmsActivityScore = latestRecord?.lmsScore ?? 0;

  const [paymentDelayDays, creditsRatio] = await Promise.all([
    computePaymentDelay(studentId),
    computeCreditsRatio(studentId),
  ]);

  return {
    gpa,
    failedSubjectsCount,
    attendanceRate,
    paymentDelayDays,
    lmsActivityScore,
    creditsRatio,
  };
}
