"use client";

import React from "react";
import { Activity, Target, Crosshair, BarChart2, History, Loader2, TrendingUp } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

const statusLabel: Record<string, string> = {
  PROCESSING: "Procesando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
};

export default function ModelHealthPanel() {
  const { data: kpis } = useSWR('/api/v1/admin/kpis', fetcher);
  const { data: latestJob } = useSWR('/api/v1/admin/batch-jobs/latest', fetcher);
  const { data: importJobs } = useSWR('/api/v1/admin/import/jobs?limit=5', fetcher);
  const { data: mlMetrics } = useSWR('/api/v1/admin/ml-metrics', fetcher);

  const history = (importJobs || []).map((job: any) => ({
    id: job.id,
    date: new Date(job.createdAt).toISOString().slice(0, 10),
    version: job.jobId,
    size: job.totalRecords ?? 0,
    status: statusLabel[job.status] || job.status,
    notes: job.errorMessage || (job.processed > 0 ? `${job.processed} registros procesados` : "Importación masiva"),
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Salud del Modelo IA
        </h2>
        <p className="text-sm text-slate-500 mt-1">Estado del pipeline y actividad reciente</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Modelo Activo" value={kpis?.modelVersion || "v1.0.0"} icon={<Activity className="w-5 h-5 text-blue-600" />} />
        <MetricCard
          title="Predicciones Activas"
          value={latestJob ? `${latestJob.totalStudents ?? 0}` : "—"}
          icon={<Target className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Último Lote"
          value={latestJob ? (statusLabel[latestJob.status] || latestJob.status) : "Sin datos"}
          icon={<Crosshair className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Estudiantes"
          value={kpis?.totalStudents?.toLocaleString() ?? "…"}
          icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* ML Metrics Section */}
      <div className="mb-8">
        <h3 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-500" />
          Métricas del Modelo (entrenamiento)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            title="Recall"
            value={mlMetrics?.recall != null ? `${(mlMetrics.recall * 100).toFixed(1)}%` : "—"}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          />
          <MetricCard
            title="Precision"
            value={mlMetrics?.precision != null ? `${(mlMetrics.precision * 100).toFixed(1)}%` : "—"}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          />
          <MetricCard
            title="F1-Score"
            value={mlMetrics?.f1 != null ? `${(mlMetrics.f1 * 100).toFixed(1)}%` : "—"}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          />
        </div>
        {mlMetrics?.samples != null && mlMetrics.samples > 0 && (
          <p className="text-xs text-slate-400 mt-2 text-right">Muestra: {mlMetrics.samples} registros de entrenamiento</p>
        )}
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          Actividad Reciente de Importación
        </h3>
        {!importJobs ? (
          <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No hay importaciones registradas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Job</th>
                  <th className="pb-3 font-medium">Registros</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody className="text-slate-900">
                {history.map((row: any) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-500">{row.date}</td>
                    <td className="py-3 font-mono text-xs">{row.version}</td>
                    <td className="py-3 text-slate-500">{row.size}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.status === 'Completado' ? 'bg-green-100 text-green-700' :
                        row.status === 'Fallido' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <span className="text-slate-500 text-sm font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
