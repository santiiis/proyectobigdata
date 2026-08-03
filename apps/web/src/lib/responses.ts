/**
 * API Response Helpers
 *
 * Spec: Sección 12.1 — Estructura estándar de respuestas
 * Wrappers estandarizados para todas las respuestas de la API REST.
 */

import type { ApiResponse, PaginatedMeta, PaginatedResponse } from "./types";

/**
 * Genera una respuesta exitosa con el formato estándar de la API.
 */
export function successResponse<T>(data: T, status: number = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return Response.json(body, { status });
}

/**
 * Genera una respuesta paginada con metadata de navegación.
 */
export function paginatedResponse<T>(
  data: T[],
  meta: PaginatedMeta,
  status: number = 200
): Response {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
  return Response.json(body, { status });
}

/**
 * Calcula la metadata de paginación.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
