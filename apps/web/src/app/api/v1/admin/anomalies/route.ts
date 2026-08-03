import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "ml-api-key-cambiar-en-produccion";

export async function GET() {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/api/v1/anomalies/summary`, {
      headers: { "X-Internal-API-Key": ML_API_KEY },
    });
    if (!res.ok) {
      return NextResponse.json({ success: true, data: { n_anomalies: 0, n_normal: 0, anomaly_rate: 0 } });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: { n_anomalies: 0, n_normal: 0, anomaly_rate: 0 } });
  }
}
