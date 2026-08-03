"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, Loader2 } from "lucide-react";

export default function ReportExport() {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setLoadingType(type);
    setTimeout(() => {
      setLoadingType(null);
      setToastMessage(`Reporte ${type} exportado con éxito`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Exportación de Reportes
        </h2>
        <p className="text-sm text-slate-500 mt-1">Genera reportes consolidados del sistema en múltiples formatos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Reporte</label>
          <select className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50">
            <option>Deserción General</option>
            <option>Por Facultad</option>
            <option>Por Carrera</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Período Académico</label>
          <select className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50">
            <option>2024-A</option>
            <option>2024-B</option>
            <option>2025-A</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => handleExport('PDF')}
          disabled={loadingType !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
        >
          {loadingType === 'PDF' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Exportar a PDF
        </button>
        <button 
          onClick={() => handleExport('Excel')}
          disabled={loadingType !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
        >
          {loadingType === 'Excel' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Exportar a Excel
        </button>
        <button 
          onClick={() => handleExport('CSV')}
          disabled={loadingType !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
        >
          {loadingType === 'CSV' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Exportar a CSV
        </button>
      </div>
    </div>
  );
}
