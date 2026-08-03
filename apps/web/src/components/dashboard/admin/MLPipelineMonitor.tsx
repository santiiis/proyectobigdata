"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Activity, Loader2, StopCircle } from "lucide-react";
import useSWR from "swr";
import ConfirmModal from "@/components/ui/ConfirmModal";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function MLPipelineMonitor() {
  const [triggering, setTriggering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  const [semesterCode, setSemesterCode] = useState<string>("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll for the latest job every 3 seconds
  const { data: latestJob, mutate: mutateLatestJob } = useSWR("/api/v1/admin/batch-jobs/latest", fetcher, { refreshInterval: 3000 });

  const { data: semesters } = useSWR("/api/v1/admin/semesters", fetcher);
  const availableSemesters = semesters || [];

  const isRunning = latestJob?.status === "PROCESSING" || triggering;

  const handleCancel = async () => {
    if (!latestJob?.jobId) return;
    
    setCancelling(true);
    try {
      const res = await fetch("/api/v1/admin/import/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: latestJob.jobId }),
      });
      
      if (res.ok) {
        mutateLatestJob();
        setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Proceso cancelado por el usuario.`]);
      } else {
        setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error al cancelar el proceso.`]);
      }
    } catch (err) {
      setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error de conexión al cancelar.`]);
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleTrigger = async () => {
    if (isRunning) return;
    if (!semesterCode) {
      setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: selecciona un semestre para la corrida`]);
      return;
    }
    setTriggering(true);
    setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Iniciando corrida batch para ${semesterCode}...`]);
    
    try {
      const res = await fetch("/api/v1/predictions/batch-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesterCode, forceRetrain: false })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Error desconocido");
      setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Job creado: ${json.data.jobId}`]);
    } catch (err: any) {
      setLocalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${err.message}`]);
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localLogs, latestJob]);

  const displayLogs = [
    ...localLogs,
  ];

  if (latestJob) {
    displayLogs.push(`[ESTADO] Último Job: ${latestJob.jobId} - ${latestJob.status}`);
    if (latestJob.status === 'COMPLETED') {
       displayLogs.push(`[ÉXITO] Modelo ha terminado el procesamiento y guardado de resultados.`);
    } else if (latestJob.status === 'FAILED') {
       displayLogs.push(`[ERROR] El proceso falló: ${latestJob.errorMessage || 'Desconocido'}`);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
            <Activity className="w-5 h-5 text-blue-600" />
            Monitor del Pipeline de IA
          </h3>
          <p className="text-sm text-slate-500 mt-1">Ejecuta y monitorea trabajos de predicción batch manualmente</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={semesterCode}
            onChange={e => setSemesterCode(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Seleccionar semestre</option>
            {availableSemesters.map((s: any) => (
              <option key={s.id} value={s.code}>
                {s.code} {s.isCurrent ? '(Actual)' : ''}
              </option>
            ))}
          </select>
          <button 
            onClick={handleTrigger}
            disabled={isRunning}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${
              isRunning 
                ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Ejecutar Corrida Batch
              </>
            )}
          </button>
          {isRunning && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm disabled:opacity-50"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <StopCircle className="w-4 h-4" />
              )}
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow p-6 bg-slate-900 font-mono text-xs sm:text-sm text-slate-300 overflow-y-auto max-h-[300px]">
        {displayLogs.map((log, i) => (
          <div key={i} className={`py-1 ${log.includes("ÉXITO") ? "text-green-400" : log.includes("Error") || log.includes("ERROR") ? "text-red-400" : ""}`}>
            <span className="opacity-50 select-none mr-2">{">"}</span>
            {log}
          </div>
        ))}
        {isRunning && (
          <div className="py-1 animate-pulse flex items-center gap-2 text-blue-300">
            <span className="opacity-50">{">"}</span>
            [Procesando] El backend de Python está computando predicciones...
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
      
      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          Estado: {isRunning ? 'Procesando' : 'Inactivo'}
        </div>
        <div>Último ID: {latestJob?.jobId || "Ninguno"}</div>
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancelar Proceso"
        message="¿Estás seguro de que deseas cancelar este proceso de predicción? El job se marcará como fallido y no se podrán recuperar los resultados parciales."
        confirmText="Sí, cancelar"
        cancelText="No, continuar"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
        loading={cancelling}
      />
    </div>
  );
}
