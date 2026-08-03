"use client";

import React from 'react';
import { X, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Student } from './StudentsRiskTable';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const riskStyles: Record<string, any> = {
  High: { badge: 'bg-red-100 text-red-600 border-red-200', icon: <AlertCircle className="w-4 h-4 mr-1 text-red-600" />, label: 'Alto' },
  Medium: { badge: 'bg-amber-100 text-amber-600 border-amber-200', icon: <Clock className="w-4 h-4 mr-1 text-amber-600" />, label: 'Medio' },
  Low: { badge: 'bg-green-100 text-green-600 border-green-200', icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />, label: 'Bajo' },
  HIGH: { badge: 'bg-red-100 text-red-600 border-red-200', icon: <AlertCircle className="w-4 h-4 mr-1 text-red-600" />, label: 'Alto' },
  MEDIUM: { badge: 'bg-amber-100 text-amber-600 border-amber-200', icon: <Clock className="w-4 h-4 mr-1 text-amber-600" />, label: 'Medio' },
  LOW: { badge: 'bg-green-100 text-green-600 border-green-200', icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />, label: 'Bajo' },
};

export default function StudentProfileModal({ student, isOpen, onClose }: StudentProfileModalProps) {
  const { data: detailData, isLoading } = useSWR(
    isOpen && student ? `/api/v1/students/${student.id}` : null,
    fetcher
  );

  if (!isOpen || !student) return null;

  const style = riskStyles[student.riskLevel] || riskStyles['Low'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-sm text-slate-500">{student.career} · ID: {student.id}</p>
              <div className="mt-2 flex gap-2">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.badge}`}>
                  {style.icon}
                  Riesgo {style.label}: {student.riskScore}%
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
          {isLoading || !detailData ? (
            <div className="col-span-1 md:col-span-2 flex items-center justify-center p-12 text-slate-500 text-sm">
              <span className="animate-pulse">Cargando datos en tiempo real de la base de datos...</span>
            </div>
          ) : (
            <>
              {/* Datos Académicos */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-md font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Rendimiento Académico</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Promedio de Notas</span>
                    <span className="font-medium text-slate-900">{detailData.academicRecords?.[0]?.gpa || 0} / 10.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Semestre Actual</span>
                    <span className="font-medium text-slate-900">{detailData.academicRecords?.[0]?.period || 'No definido'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Materias Reprobadas</span>
                    <span className="font-medium text-red-600">{detailData.academicRecords?.[0]?.failedSubjects || 0} acumuladas</span>
                  </div>
                </div>
              </div>

              {/* Asistencia */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-md font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Registro de Asistencia</h3>
                <div className="flex items-center justify-center h-32 mt-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">
                      {detailData.academicRecords?.[0]?.attendanceRate !== undefined 
                        ? (detailData.academicRecords[0].attendanceRate * 100).toFixed(1) 
                        : 100}%
                    </span>
                    <span className="text-sm text-slate-500 mt-2">Porcentaje de clases asistidas</span>
                  </div>
                </div>
              </div>

              {/* Historial de Calificaciones */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:col-span-2">
                <h3 className="text-md font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Historial de Calificaciones</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500">
                        <th className="px-4 py-2 font-medium rounded-tl-lg">Materia</th>
                        <th className="px-4 py-2 font-medium">Nota Final</th>
                        <th className="px-4 py-2 font-medium rounded-tr-lg">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-900">
                      {detailData.enrollments && detailData.enrollments.length > 0 ? (
                        detailData.enrollments.map((enrollment: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">{enrollment.course?.name || 'Materia Desconocida'}</td>
                            <td className="px-4 py-3">{enrollment.finalGrade !== null ? enrollment.finalGrade : 'N/A'}</td>
                            <td className="px-4 py-3">
                              {enrollment.finalGrade !== null && enrollment.finalGrade >= 6.0 ? (
                                <span className="text-green-600 font-medium">Aprobado</span>
                              ) : enrollment.finalGrade !== null && enrollment.finalGrade < 6.0 ? (
                                <span className="text-red-600 font-medium">Reprobado</span>
                              ) : (
                                <span className="text-slate-400 font-medium">En Curso</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                            No hay materias registradas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Intervenciones Previas */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:col-span-2 mb-6">
                <h3 className="text-md font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Intervenciones Previas</h3>
                <div className="space-y-4">
                  {detailData.interventions && detailData.interventions.length > 0 ? (
                    detailData.interventions.map((intervention: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
                        <div className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-1 rounded-md shrink-0">
                          {new Date(intervention.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">
                            {intervention.type === 'CALL' ? 'Llamada Telefónica' : 
                             intervention.type === 'EMAIL' ? 'Correo Electrónico' :
                             intervention.type === 'MEETING' ? 'Reunión Presencial' : intervention.type}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">{intervention.notes || 'Sin notas.'}</p>
                          <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded border ${
                            intervention.status === 'RESOLVED' ? 'text-green-600 bg-green-50 border-green-100' :
                            intervention.status === 'IN_PROGRESS' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                            'text-slate-600 bg-slate-100 border-slate-200'
                          }`}>
                            {intervention.status === 'RESOLVED' ? 'Completada' :
                             intervention.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 py-2">
                      El estudiante no tiene intervenciones registradas.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
