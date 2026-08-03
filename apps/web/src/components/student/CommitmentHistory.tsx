"use client";

import React from 'react';
import { CheckCircle, Clock, BookOpen, Calendar, User } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

const statusMap: Record<string, { label: string; done: boolean }> = {
  RESOLVED: { label: 'Completado', done: true },
  CLOSED: { label: 'Completado', done: true },
  IN_PROGRESS: { label: 'En Progreso', done: false },
  PENDING: { label: 'Pendiente', done: false },
};

export function CommitmentHistory({ studentId }: { studentId: number }) {
  const { data, error } = useSWR(`/api/v1/students/${studentId}/interventions`, fetcher);

  const commitments = (data || []).map((inv: any) => ({
    date: inv.createdAt,
    type: inv.title,
    tutor: inv.assignedTo,
    status: inv.status,
    notes: inv.notes,
  }));

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Historial de Compromisos y Tutorías</h2>
        <p className="text-slate-500 mt-1">Registro de acuerdos alcanzados durante tus sesiones de acompañamiento</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {error ? (
          <div className="text-center py-8 text-red-500">Error cargando tus intervenciones.</div>
        ) : !data ? (
          <div className="text-center py-8 text-slate-400">Cargando...</div>
        ) : commitments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aún no tienes tutorías registradas. Solicita una desde el panel del tutor.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
            {commitments.map((commitment: any, index: number) => {
              const st = statusMap[commitment.status] || { label: commitment.status, done: false };
              return (
                <div key={index} className="relative pl-8">
                  <div className="absolute -left-[17px] bg-white p-1 rounded-full border border-slate-200">
                    <div className="bg-slate-50 text-slate-600 rounded-full p-1.5">
                      <BookOpen size={16} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                          <Calendar size={14} />
                          {new Date(commitment.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-semibold text-slate-900">{commitment.type}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          st.done
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {st.done ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {st.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User size={14} />
                      <span><span className="font-medium text-slate-700">Tutor:</span> {commitment.tutor || 'Sin asignar'}</span>
                    </div>

                    <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {commitment.notes || 'Sin observaciones.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
