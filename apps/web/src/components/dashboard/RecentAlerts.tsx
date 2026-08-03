"use client";

import { useRecentAlerts } from "@/hooks/useDashboard";
import { AlertCircle } from "lucide-react";

export function RecentAlerts() {
  const { data, loading, error } = useRecentAlerts();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
              <div className="flex-1 h-10 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-red-500">
        Error cargando alertas: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          Alertas Recientes
        </h3>
        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {data.length} Críticos
        </span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No hay estudiantes en alto riesgo recientemente.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium">Estudiante</th>
                <th className="pb-3 font-medium">Carrera</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((alert) => (
                <tr key={alert.predictionId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <p className="font-medium text-slate-800">{alert.studentName}</p>
                    <p className="text-xs text-slate-500">{alert.studentCode}</p>
                  </td>
                  <td className="py-3 text-slate-600">{alert.career}</td>
                  <td className="py-3">
                    <span className="text-rose-600 font-bold">
                      {(alert.score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-500">
                    {new Date(alert.date).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
