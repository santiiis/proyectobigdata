import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/api/v1/metrics`);
    if (!res.ok) {
      return NextResponse.json({ success: true, data: { recall: 0, precision: 0, f1: 0, samples: 0, version: "N/A" } });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: { recall: 0, precision: 0, f1: 0, samples: 0, version: "N/A" } });
  }
}
