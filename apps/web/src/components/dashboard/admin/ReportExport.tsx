"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ReportType = "FACULTY" | "CAREER" | "PERIOD" | "AUDIT";

const typeOptions: { value: ReportType; label: string }[] = [
  { value: "FACULTY", label: "Deserción por Facultad" },
  { value: "CAREER", label: "Deserción por Carrera" },
  { value: "PERIOD", label: "Procesamiento por Período" },
  { value: "AUDIT", label: "Auditoría de Intervenciones" },
];

export default function ReportExport() {
  const [type, setType] = useState<ReportType>("FACULTY");
  const [semesterCode, setSemesterCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleExportCsv = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ format: "csv", type });
      if (type === "PERIOD" && semesterCode.trim()) {
        params.set("semesterCode", semesterCode.trim());
      }
      const res = await fetch(`/api/v1/reports/export?${params.toString()}`, {
        headers: { Accept: "text/csv" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || err?.error || "Error generando el reporte");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : `reporte_${type.toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage({ type: "ok", text: "Reporte CSV descargado correctamente" });
    } catch (err: any) {
      setMessage({ type: "err", text: err.message || "Error al exportar el reporte" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsupported = (fmt: string) => {
    setMessage({ type: "err", text: `El formato ${fmt} no está disponible en esta versión. Usa la exportación a CSV.` });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      {message && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-in fade-in shadow-sm z-10 ${
          message.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'ok' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Exportación de Reportes
        </h2>
        <p className="text-sm text-slate-500 mt-1">Genera reportes consolidados del sistema con datos reales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Reporte</label>
          <select
            className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50"
            value={type}
            onChange={(e) => setType(e.target.value as ReportType)}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Período Académico (opcional)</label>
          <input
            className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50"
            placeholder="Ej. 2026-A"
            value={semesterCode}
            onChange={(e) => setSemesterCode(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleUnsupported('PDF')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          PDF (próximamente)
        </button>
        <button
          onClick={() => handleUnsupported('Excel')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          Excel (próximamente)
        </button>
        <button
          onClick={handleExportCsv}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Exportar a CSV
        </button>
      </div>
    </div>
  );
}
