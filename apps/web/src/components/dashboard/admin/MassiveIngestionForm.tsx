"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileSpreadsheet, X, CheckCircle, Database } from "lucide-react";

export default function MassiveIngestionForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.parquet') || droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
        setSuccess(false);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/admin/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Upload failed with status", response.status, errText);
        throw new Error(`Upload failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      setJobId(data.jobId);
      setSuccess(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setJobId(null);
      }, 5000);
    }
  };

  return (
    <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
          <Database className="w-5 h-5 text-blue-600" />
          Ingesta de Datos
        </h3>
        <p className="text-sm text-slate-500 mt-1">Sube registros de estudiantes o datasets históricos</p>
      </div>
      
      <div className="flex-grow flex flex-col justify-center">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragging 
                ? "border-blue-500 bg-blue-50 scale-[1.02]" 
                : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <UploadCloud className="w-7 h-7" />
              </div>
            </div>
            <p className="font-medium text-slate-900 mb-1">Arrastra y suelta tu archivo</p>
            <p className="text-xs text-slate-500 mb-5">Soporta .CSV, .PARQUET y .ZIP hasta 50MB</p>
            
            <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors shadow-sm">
              Explorar Archivos
              <input type="file" className="hidden" accept=".csv,.parquet,.zip" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!uploading && !success && (
                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200">
                  <X className="w-5 h-5" />
                </button>
              )}
              {success && <CheckCircle className="w-6 h-6 text-green-500" />}
            </div>
            
            {uploading && (
              <div className="mb-5">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-2/3 animate-pulse"></div>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-2 text-center animate-pulse">Subiendo y validando...</p>
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={uploading || success}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                success
                  ? "bg-green-500 text-white shadow-green-200"
                  : uploading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              }`}
            >
              {success ? "Carga Completada" : uploading ? "Procesando..." : "Iniciar Ingesta"}
            </button>
            {success && jobId && (
               <p className="text-xs text-center text-slate-500 mt-3">Job ID: {jobId.slice(0, 8)}...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
