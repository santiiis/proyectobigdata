/**
 * ML Service HTTP Client
 *
 * Spec: Sección 12.4 — Comunicación Next.js ↔ FastAPI
 * Decision D8: API Key via X-Internal-API-Key header
 * Decision D15: FastAPI endpoints under /api/v1
 *
 * Handles communication between the Next.js backend and the
 * Python/FastAPI ML Service for prediction inference and retraining.
 *
 * TODO: Implement actual HTTP calls when ML service is ready
 */

import type { MLPredictRequest, MLPredictResponse } from "./types";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "";

/**
 * Base fetch wrapper for ML Service requests.
 * Adds API Key authentication and JSON content headers.
 */
async function mlFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ML_SERVICE_URL}/api/v1${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-API-Key": ML_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `ML Service error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Sends student features to the ML service for risk prediction.
 * Spec: POST /api/v1/predict
 */
export async function predictStudentRisk(
  request: MLPredictRequest
): Promise<MLPredictResponse> {
  return mlFetch<MLPredictResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Triggers model retraining in the ML service.
 * Spec: POST /api/v1/retrain
 */
export async function triggerRetrain(
  semesterCode: string
): Promise<{ status: string; message: string }> {
  return mlFetch("/retrain", {
    method: "POST",
    body: JSON.stringify({ semesterCode }),
  });
}

/**
 * Checks ML service health.
 */
export async function checkMLHealth(): Promise<{
  status: string;
  version: string;
}> {
  const url = `${ML_SERVICE_URL}/health`;
  const response = await fetch(url);
  return response.json();
}
