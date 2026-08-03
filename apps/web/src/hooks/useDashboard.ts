import { useState, useEffect } from "react";
import type { 
  DashboardKpis, 
  RiskDistributionData, 
  HistoricalTrendData, 
  RecentAlert, 
  ApiResponse 
} from "../lib/dashboard-types";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
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

export function useDashboardKpis() {
  return useFetch<DashboardKpis>("/api/v1/dashboard/kpis");
}

export function useRiskDistribution() {
  return useFetch<RiskDistributionData>("/api/v1/dashboard/charts/risk-distribution");
}

export function useHistoricalTrend() {
  return useFetch<HistoricalTrendData[]>("/api/v1/dashboard/charts/historical-trend");
}

export function useRecentAlerts() {
  return useFetch<RecentAlert[]>("/api/v1/dashboard/alerts/recent");
}

export function useImportJobs() {
  return useFetch<any[]>("/api/v1/admin/import/jobs");
}

export function useAuditLogs() {
  return useFetch<any[]>("/api/v1/admin/audit-logs");
}

export function useFaculties() {
  return useFetch<any[]>("/api/v1/admin/faculties");
}

export function useCareers() {
  return useFetch<any[]>("/api/v1/admin/careers");
}

export function useSemesters() {
  return useFetch<any[]>("/api/v1/admin/semesters");
}

export function useCourses() {
  return useFetch<any[]>("/api/v1/admin/courses");
}
