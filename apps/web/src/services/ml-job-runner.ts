import { prisma } from "@/lib/prisma";
import { buildMLFeatures } from "@/lib/ml/features";
import { predictStudentRisk, triggerRetrain } from "./ml-client";
import { RiskLevel, BatchJobStatus } from "@prisma/client";

/**
 * ML Job Runner
 * Controlador en segundo plano para procesar predicciones masivas de estudiantes.
 */
export async function runBatchInference(jobId: string, forceRetrain: boolean) {
  try {
    // Verificar si el job existe y marcarlo como PROCESSING
    const job = await prisma.batchJob.findUnique({ where: { jobId } });
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== "PROCESSING") {
      // If it's already COMPLETED or FAILED, don't re-run
      return;
    }

    // 1. Obtener todos los estudiantes activos
    const students = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    let processedCount = 0;

    // 2. Iterar e inferir (secuencial para no sobrecargar DB/FastAPI en lote pequeño)
    for (const student of students) {
      try {
        const features = await buildMLFeatures(student.id);
        const predictionResponse = await predictStudentRisk({
          studentId: student.id,
          features,
        });

        const riskLevelEnum = predictionResponse.riskLevel as RiskLevel;

        // Iniciar transacción interactiva para actualización atómica
        await prisma.$transaction(async (tx) => {
          // Desactivar las predicciones anteriores
          await tx.prediction.updateMany({
            where: { studentId: student.id, isActive: true },
            data: { isActive: false },
          });

          // Insertar la nueva predicción como activa
          await tx.prediction.create({
            data: {
              studentId: student.id,
              score: predictionResponse.score,
              riskLevel: riskLevelEnum,
              topRiskFactors: predictionResponse.topRiskFactors,
              modelVersion: predictionResponse.modelVersion,
              isActive: true,
            },
          });

          // Guardar copia inmutable en el historial
          await tx.predictionHistory.create({
            data: {
              studentId: student.id,
              score: predictionResponse.score,
              riskLevel: riskLevelEnum,
              topRiskFactors: predictionResponse.topRiskFactors,
              modelVersion: predictionResponse.modelVersion,
              calculatedAt: new Date(),
            },
          });
        });

        processedCount++;
      } catch (err) {
        console.error(`Error procesando estudiante ${student.id}:`, err);
        // Continuamos con el siguiente estudiante a pesar de un error individual
      }
    }

    // 3. Disparar retrain si fue solicitado
    if (forceRetrain) {
      try {
        await triggerRetrain(job.semesterCode);
      } catch (retrainErr) {
        console.error(`Error solicitando re-entrenamiento para ${job.semesterCode}:`, retrainErr);
      }
    }

    // 4. Marcar Job como COMPLETADO
    await prisma.batchJob.update({
      where: { jobId },
      data: {
        status: "COMPLETED",
        totalStudents: processedCount,
        processedAt: new Date(),
      },
    });

  } catch (error) {
    console.error("Batch Job Fatal Error:", error);
    // Intentar marcar como FAILED si hubo un error global
    try {
      await prisma.batchJob.update({
        where: { jobId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Error desconocido",
          processedAt: new Date(),
        },
      });
    } catch (updateErr) {
      console.error("No se pudo actualizar estado a FAILED:", updateErr);
    }
  }
}
