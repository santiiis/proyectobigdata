"use client";

import { useStudentProfile } from "@/hooks/useStudent";
import { User, Mail, GraduationCap, Building, Hash } from "lucide-react";

export function StudentProfileCard({ studentId }: { studentId: string }) {
  const { data, loading, error } = useStudentProfile(studentId);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="flex gap-4 items-center mb-6">
          <div className="h-16 w-16 bg-slate-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 w-1/3 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-red-500">
        Error cargando perfil: {error}
      </div>
    );
  }

  if (!data) return null;

  const riskColors = {
    LOW: "bg-emerald-100 text-emerald-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-rose-100 text-rose-700",
  };

  const currentPrediction = data.predictions?.[0];
  const currentRisk = currentPrediction?.riskLevel || "LOW";
  const riskBadgeClass = riskColors[currentRisk];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
      {/* Decorative background shape */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-10 ${currentRisk === 'HIGH' ? 'bg-rose-500' : currentRisk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.firstName} {data.lastName}</h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
              <Hash className="w-4 h-4" />
              <span>{data.studentCode}</span>
              <span className="mx-2">•</span>
              <Mail className="w-4 h-4" />
              <span>{data.email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {data.status}
          </span>
          {currentPrediction && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${riskBadgeClass}`}>
              Riesgo {currentPrediction.riskLevel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Carrera</p>
            <p className="text-sm font-semibold text-slate-800">{data.career.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-fuchsia-50 flex items-center justify-center">
            <Building className="w-5 h-5 text-fuchsia-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Facultad</p>
            <p className="text-sm font-semibold text-slate-800">{data.career.faculty?.name || "Sin facultad"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
