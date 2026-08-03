import { NextRequest } from "next/server";
import { runBatchInference } from "@/services/ml-job-runner";

const WORKER_SECRET = process.env.WORKER_SECRET || "internal-dev-secret-123";

/**
 * POST /api/v1/predictions/worker
 * Endpoint interno para ejecutar el job runner.
 * No es expuesto directamente a los clientes SPA.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar seguridad interna
    const secret = request.headers.get("x-worker-secret");
    if (secret !== WORKER_SECRET) {
      return Response.json({ error: "Unauthorized worker access" }, { status: 403 });
    }

    const { jobId, forceRetrain } = await request.json();
    if (!jobId) {
      return Response.json({ error: "Missing jobId" }, { status: 400 });
    }

    // 2. Ejecutar de forma segura. 
    // En Node.js, si este request es matado por timeout, el proceso puede interrumpirse.
    // Sin embargo, si la ejecución local es lo suficientemente rápida o si se usa Edge/Serverless adecuado,
    // este patrón aisla el hilo del request del cliente original.
    // Nosotros HAREMOS el await para que Vercel mantenga vivo este lambda el mayor tiempo posible
    // (configuraremos un maxDuration más alto si fuera necesario en Vercel, aquí en local/docker funciona indefinidamente).
    await runBatchInference(jobId, forceRetrain);

    return Response.json({ success: true, jobId });
  } catch (error) {
    console.error("Worker Execution Error:", error);
    return Response.json({ error: "Worker failed" }, { status: 500 });
  }
}
