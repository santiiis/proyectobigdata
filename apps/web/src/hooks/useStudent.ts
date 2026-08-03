import { useState, useEffect } from "react";
import type { 
  StudentProfile, 
  AcademicHistoryItem, 
  PredictionHistoryItem, 
  StudentIntervention, 
  ApiResponse 
} from "../lib/student-types";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useFetch<T>(url: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!url) return;

    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          signal: abortController.signal,
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        const result = (await response.json()) as ApiResponse<T>;
        
        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || "Error obteniendo datos");
        }
        
        setState({ data: result.data as T, loading: false, error: null });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState({ data: null, loading: false, error: err.message || "Error de red" });
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url]);

  return state;
}

export function useStudentProfile(id: string) {
  return useFetch<StudentProfile>(`/api/v1/students/${id}`);
}

export function useAcademicHistory(id: string) {
  return useFetch<AcademicHistoryItem[]>(`/api/v1/students/${id}/academic-history`);
}

export function usePredictionHistory(id: string) {
  return useFetch<PredictionHistoryItem[]>(`/api/v1/students/${id}/prediction-history`);
}

export function useStudentInterventions(id: string) {
  return useFetch<StudentIntervention[]>(`/api/v1/students/${id}/interventions`);
}
