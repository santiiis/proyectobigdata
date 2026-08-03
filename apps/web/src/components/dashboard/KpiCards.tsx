"use client";

import { useDashboardKpis } from "@/hooks/useDashboard";
import { Users, AlertTriangle, Activity, CheckCircle } from "lucide-react";

export function KpiCards() {
  const { data, loading, error } = useDashboardKpis();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
        No se pudieron cargar los indicadores: {error}
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      title: "Estudiantes Activos",
      value: data.totalActiveStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Riesgo Alto",
      value: data.highRiskStudents,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      title: "Intervenciones Activas",
      value: data.activeInterventions,
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Intervenciones Resueltas",
      value: data.resolvedInterventions,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold text-slate-800">{kpi.value.toLocaleString("es-ES")}</h3>
            </div>
            <div className={`p-3 rounded-lg ${kpi.bg}`}>
              <Icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
