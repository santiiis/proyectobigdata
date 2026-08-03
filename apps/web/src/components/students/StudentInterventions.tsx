"use client";

import { useStudentInterventions } from "@/hooks/useStudent";
import { MessageSquare, Clock, CheckCircle, PlayCircle, XCircle } from "lucide-react";

export function StudentInterventions({ studentId }: { studentId: string }) {
  const { data, loading, error } = useStudentInterventions(studentId);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-red-500">
        Error cargando intervenciones: {error}
      </div>
    );
  }

  if (!data) return null;

  const statusConfig = {
    PENDING: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Pendiente" },
    IN_PROGRESS: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: PlayCircle, label: "En Progreso" },
    RESOLVED: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Resuelto" },
    CLOSED: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: XCircle, label: "Cerrado" },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        Intervenciones Realizadas
      </h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          Este estudiante no tiene intervenciones registradas.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((intervention) => {
            const config = statusConfig[intervention.status];
            const StatusIcon = config.icon;

            return (
              <div key={intervention.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <h4 className="font-semibold text-slate-800">{intervention.title}</h4>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{intervention.notes}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>Asignado a: <span className="font-medium text-slate-700">{intervention.assignedTo}</span></span>
                  <span>{new Date(intervention.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
