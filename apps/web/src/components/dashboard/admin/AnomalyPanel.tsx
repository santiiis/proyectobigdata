"use client";

import React from "react";
import { AlertTriangle, CheckCircle, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

export default function AnomalyPanel() {
  const { data, error, isLoading } = useSWR(
    "/api/v1/admin/anomalies/summary",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando anomalías...
        </div>
      </div>
    );
  }

  const nAnomalies = data?.n_anomalies || 0;
  const nNormal = data?.n_normal || 0;
  const anomalyRate = data?.anomaly_rate || 0;
  const anomalyChars = data?.anomaly_characteristics || {};
  const normalChars = data?.normal_characteristics || {};

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          Detección de Anomalías
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Identificación de casos atípicos con Isolation Forest
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-600 text-sm font-medium">Anomalías</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{nAnomalies}</div>
          <div className="text-xs text-red-500">{anomalyRate}% del total</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600 text-sm font-medium">Normales</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{nNormal}</div>
          <div className="text-xs text-green-500">{(100 - anomalyRate).toFixed(1)}% del total</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-slate-600" />
            <span className="text-slate-600 text-sm font-medium">Contaminación</span>
          </div>
          <div className="text-2xl font-bold text-slate-700">5%</div>
          <div className="text-xs text-slate-500">Tasa esperada</div>
        </div>
      </div>

      {/* Characteristics Comparison */}
      <div className="mb-6">
        <h3 className="text-md font-bold text-slate-900 mb-4">
          Comparación de Características
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Métrica</th>
                <th className="pb-3 font-medium">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    Anomalías
                  </span>
                </th>
                <th className="pb-3 font-medium">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Normales
                  </span>
                </th>
                <th className="pb-3 font-medium">Diferencia</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              <tr className="border-b border-slate-100">
                <td className="py-3 font-medium">GPA Promedio</td>
                <td className="py-3 text-red-600 font-semibold">
                  {anomalyChars.mean_gpa?.toFixed(2) || "—"}
                </td>
                <td className="py-3 text-green-600 font-semibold">
                  {normalChars.mean_gpa?.toFixed(2) || "—"}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    (anomalyChars.mean_gpa || 0) < (normalChars.mean_gpa || 0)
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {((anomalyChars.mean_gpa || 0) - (normalChars.mean_gpa || 0)) > 0 ? "+" : ""}
                    {((anomalyChars.mean_gpa || 0) - (normalChars.mean_gpa || 0)).toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 font-medium">Materias Reprobadas</td>
                <td className="py-3 text-red-600 font-semibold">
                  {anomalyChars.mean_failed?.toFixed(2) || "—"}
                </td>
                <td className="py-3 text-green-600 font-semibold">
                  {normalChars.mean_failed?.toFixed(2) || "—"}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    (anomalyChars.mean_failed || 0) > (normalChars.mean_failed || 0)
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {((anomalyChars.mean_failed || 0) - (normalChars.mean_failed || 0)) > 0 ? "+" : ""}
                    {((anomalyChars.mean_failed || 0) - (normalChars.mean_failed || 0)).toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 font-medium">Asistencia</td>
                <td className="py-3 text-red-600 font-semibold">
                  {((anomalyChars.mean_attendance || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3 text-green-600 font-semibold">
                  {((normalChars.mean_attendance || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    (anomalyChars.mean_attendance || 0) < (normalChars.mean_attendance || 0)
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {(((anomalyChars.mean_attendance || 0) - (normalChars.mean_attendance || 0)) * 100) > 0 ? "+" : ""}
                    {(((anomalyChars.mean_attendance || 0) - (normalChars.mean_attendance || 0)) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Actividad LMS</td>
                <td className="py-3 text-red-600 font-semibold">
                  {anomalyChars.mean_lms?.toFixed(2) || "—"}
                </td>
                <td className="py-3 text-green-600 font-semibold">
                  {normalChars.mean_lms?.toFixed(2) || "—"}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    (anomalyChars.mean_lms || 0) < (normalChars.mean_lms || 0)
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {((anomalyChars.mean_lms || 0) - (normalChars.mean_lms || 0)) > 0 ? "+" : ""}
                    {((anomalyChars.mean_lms || 0) - (normalChars.mean_lms || 0)).toFixed(2)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          <strong>Isolation Forest</strong> detecta anomalías aislando observaciones
          que son fáciles de separar del resto. Los estudiantes con patrones inusuales
          (GPA extremadamente bajo, asistencia anómala, etc.) son marcados como
          potenciales casos de riesgo que requieren atención especial.
        </p>
      </div>
    </div>
  );
}
