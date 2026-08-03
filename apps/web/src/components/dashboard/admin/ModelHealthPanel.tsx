"use client";

import React, { useState } from "react";
import { Activity, Target, Crosshair, BarChart2, History, Loader2, TrendingUp, RefreshCw, StopCircle } from "lucide-react";
import useSWR from "swr";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

const statusLabel: Record<string, string> = {
  PROCESSING: "Procesando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
};

export default function ModelHealthPanel() {
  const { data: kpis, mutate: mutateKpis } = useSWR('/api/v1/admin/kpis', fetcher, { refreshInterval: 5000 });
  const { data: latestJob } = useSWR('/api/v1/admin/batch-jobs/latest', fetcher, { refreshInterval: 5000 });
  const { data: importJobs, mutate: mutateImportJobs } = useSWR('/api/v1/admin/import/jobs?limit=5', fetcher, { refreshInterval: 5000 });
  const { data: mlMetrics } = useSWR('/api/v1/admin/ml-metrics', fetcher, { refreshInterval: 10000 });
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);

  const handleCancelClick = (jobId: string) => {
    setCancelJobId(jobId);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelJobId) return;
    
    setCancelling(cancelJobId);
    try {
      const res = await fetch("/api/v1/admin/import/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: cancelJobId }),
      });
      
      if (res.ok) {
        mutateImportJobs();
        mutateKpis();
      }
    } catch (err) {
      // silent
    } finally {
      setCancelling(null);
      setShowCancelModal(false);
      setCancelJobId(null);
    }
  };

  const history = (importJobs || []).map((job: any) => ({
    id: job.id,
    jobId: job.jobId,
    date: new Date(job.createdAt).toISOString().slice(0, 10),
    version: job.jobId,
    size: job.totalRecords ?? 0,
    status: statusLabel[job.status] || job.status,
    rawStatus: job.status,
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
          value={kpis?.activePredictions?.toLocaleString() ?? "…"}
          icon={<Target className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Trabajos en Ejecución"
          value={kpis?.activeJobs?.toString() ?? "0"}
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
          Métricas del Modelo (Random Forest + Grid Search)
        </h3>
        <div className="grid grid-cols-4 gap-4">
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
          <MetricCard
            title="AUC-ROC"
            value={mlMetrics?.auc_roc != null ? `${(mlMetrics.auc_roc * 100).toFixed(1)}%` : "—"}
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          />
        </div>
        {mlMetrics?.samples != null && mlMetrics.samples > 0 && (
          <p className="text-xs text-slate-400 mt-2 text-right">
            Muestra: {mlMetrics.samples} registros | 
            Algoritmo: {mlMetrics.hyperparameters?.algorithm || "RandomForest"} |
            Trees: {mlMetrics.hyperparameters?.n_estimators || "—"} |
            Depth: {mlMetrics.hyperparameters?.max_depth || "—"}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            Actividad Reciente de Importación
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refrescar
          </button>
        </div>
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
                  <th className="pb-3 font-medium">Acciones</th>
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
                    <td className="py-3">
                      {row.rawStatus === 'PROCESSING' && (
                        <button
                          onClick={() => handleCancelClick(row.jobId)}
                          disabled={cancelling === row.jobId}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancelling === row.jobId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <StopCircle className="w-3 h-3" />
                          )}
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancelar Importación"
        message="¿Estás seguro de que deseas cancelar este proceso de importación? El job se marcará como fallido."
        confirmText="Sí, cancelar"
        cancelText="No, continuar"
        onConfirm={handleCancel}
        onCancel={() => { setShowCancelModal(false); setCancelJobId(null); }}
        loading={cancelling !== null}
      />
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
