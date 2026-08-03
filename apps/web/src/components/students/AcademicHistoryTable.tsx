"use client";

import { useAcademicHistory } from "@/hooks/useStudent";

export function AcademicHistoryTable({ studentId }: { studentId: string }) {
  const { data, loading, error } = useAcademicHistory(studentId);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-red-500">
        Error cargando historial académico: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Historial Académico</h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No hay registros académicos disponibles.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium px-4">Periodo</th>
                <th className="pb-3 font-medium px-4">GPA</th>
                <th className="pb-3 font-medium px-4">Materias Reprobadas</th>
                <th className="pb-3 font-medium px-4">Asistencia (%)</th>
                <th className="pb-3 font-medium px-4">LMS Score</th>
                <th className="pb-3 font-medium px-4 text-right">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-slate-800">{record.period}</td>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${record.gpa < 3.0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {record.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <span className={record.failedSubjects > 0 ? 'text-rose-600 font-medium' : ''}>
                      {record.failedSubjects}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{record.attendanceRate}%</td>
                  <td className="py-4 px-4 text-slate-600">{record.lmsScore} pts</td>
                  <td className="py-4 px-4 text-right text-slate-500">
                    {new Date(record.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
