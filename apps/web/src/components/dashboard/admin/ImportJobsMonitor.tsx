"use client";

import React, { useState } from "react";
import { RefreshCw, FileText } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function ImportJobsMonitor() {
  const { data: jobs, error, mutate, isValidating } = useSWR("/api/v1/admin/import/jobs", fetcher, {
    refreshInterval: 3000,
  });

  const isRefreshing = isValidating;

  const handleRefresh = () => {
    mutate();
  };

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") return <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">Completado</span>;
    if (status === "PROCESSING") return <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-full text-xs font-medium">Procesando</span>;
    if (status === "FAILED") return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">Fallido</span>;
    return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Historial de Cargas
          </h2>
          <p className="text-sm text-slate-500 mt-1">Monitoreo de trabajos de importación de datos</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 font-medium">Archivo</th>
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 font-medium">Registros</th>
              <th className="pb-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="text-slate-900">
            {error ? (
              <tr><td colSpan={4} className="py-4 text-center text-red-500">Error cargando trabajos</td></tr>
            ) : !jobs ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">Cargando...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">No hay trabajos registrados</td></tr>
            ) : (
              jobs.map((job: any) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium">{job.fileName}</td>
                  <td className="py-3 text-slate-500" suppressHydrationWarning>{new Date(job.createdAt).toLocaleString("es-ES")}</td>
                  <td className="py-3 text-slate-500">{job.totalRecords ? job.totalRecords.toLocaleString("es-ES") : "N/A"}</td>
                  <td className="py-3">{getStatusBadge(job.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
