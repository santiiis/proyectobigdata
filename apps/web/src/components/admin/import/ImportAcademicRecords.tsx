"use client";

import { useState, useEffect } from "react";
import { useImport } from "@/hooks/useImport";
import { UploadCloud, FileType, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import type { ImportJob } from "@/lib/import-types";

export function ImportAcademicRecords() {
  const { uploadAcademicRecords, getImportStatus, loading, error } = useImport();
  
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<ImportJob | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const newJobId = await uploadAcademicRecords(file);
      setJobId(newJobId);
      setFile(null); // Reset file input after successful upload trigger
    } catch (err: any) {
      // Error handled by hook, just prevent further execution
      console.error(err);
    }
  };

  // Poll for status when we have a jobId
  useEffect(() => {
    if (!jobId) return;

    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const status = await getImportStatus(jobId);
        setJobStatus(status);

        if (status.isFinished) {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(intervalId);
      }
    };

    // Initial poll
    pollStatus();
    
    // Poll every 3 seconds
    intervalId = setInterval(pollStatus, 3000);

    return () => clearInterval(intervalId);
  }, [jobId, getImportStatus]);

  const progressPercentage = jobStatus?.totalRecords && jobStatus.totalRecords > 0
    ? Math.round((jobStatus.processed / jobStatus.totalRecords) * 100)
    : (jobStatus?.processed ? 100 : 0); // fallback if totalRecords is null but processed > 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-500" />
          Ingesta Masiva de Datos (OULAD)
        </h2>
      </div>

      <div className="p-6">
        {/* Upload Zone */}
        {!jobId && (
          <div className="max-w-xl mx-auto">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <FileType className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Selecciona el Dataset</h3>
              <p className="text-xs text-slate-500 mb-4">Soporta formatos .zip y .parquet estructurados según OULAD</p>
              
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".zip,.parquet,.csv,.xlsx"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Explorar archivos
              </label>

              {file && (
                <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 text-sm rounded-lg flex items-center justify-between border border-indigo-100">
                  <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                  <span className="font-semibold text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {loading ? "Iniciando..." : "Comenzar Ingesta"}
              </button>
            </div>
          </div>
        )}

        {/* Status & Progress Zone */}
        {jobId && (
          <div className="max-w-2xl mx-auto mt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Estado del Procesamiento</h3>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Archivo</p>
                  <p className="text-sm font-medium text-slate-800">{jobStatus?.fileName || "..."}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estado</p>
                  {jobStatus?.status === "PROCESSING" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      <Loader2 className="w-3 h-3 animate-spin" /> Procesando
                    </span>
                  )}
                  {jobStatus?.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Completado
                    </span>
                  )}
                  {jobStatus?.status === "FAILED" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-3 h-3" /> Fallido
                    </span>
                  )}
                  {!jobStatus && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                      Conectando...
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Progreso de Ingesta</span>
                  <span className="font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      jobStatus?.status === "FAILED" ? "bg-rose-500" :
                      jobStatus?.status === "COMPLETED" ? "bg-emerald-500" :
                      "bg-indigo-600"
                    }`} 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    <strong className="text-slate-800">{jobStatus?.processed || 0}</strong> registros insertados
                  </span>
                  {jobStatus?.totalRecords && (
                    <span className="text-xs text-slate-500">
                      de <strong className="text-slate-800">{jobStatus.totalRecords}</strong> en total
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {jobStatus?.status === "FAILED" && jobStatus.errorMessage && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  <strong>Detalle del error:</strong>
                  <p className="mt-1 font-mono text-xs">{jobStatus.errorMessage}</p>
                </div>
              )}
            </div>

            {jobStatus?.isFinished && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setJobId(null);
                    setJobStatus(null);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline transition-colors"
                >
                  Importar otro archivo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
