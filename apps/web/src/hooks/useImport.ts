import { useState, useCallback } from "react";
import type { ImportStartResponse, ImportStatusResponse, ImportJob } from "../lib/import-types";

export function useImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAcademicRecords = async (file: File): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/admin/import/academic-records", {
        method: "POST",
        body: formData,
        // No Content-Type header here; fetch sets it automatically with the boundary for FormData
      });

      const result = (await response.json()) as ImportStartResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message || "Error al subir el archivo.");
      }

      return result.data.jobId;
    } catch (err: any) {
      setError(err.message || "Error de red al subir el archivo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getImportStatus = useCallback(async (jobId: string): Promise<ImportJob> => {
    try {
      const response = await fetch(`/api/v1/admin/import/status/${jobId}`);
      const result = (await response.json()) as ImportStatusResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message || "Error al obtener estado del import.");
      }

      return result.data;
    } catch (err: any) {
      throw new Error(err.message || "Error de red al consultar el estado.");
    }
  }, []);

  return { uploadAcademicRecords, getImportStatus, loading, error };
}
