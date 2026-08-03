"use client";

import React from 'react';
import { CheckCircle, Clock, BookOpen, Calendar, User } from 'lucide-react';

export function CommitmentHistory() {
  const commitments = [
    { 
      date: '15 Oct 2024', 
      type: 'Tutoría Académica', 
      tutor: 'Dra. Elena Ramírez', 
      status: 'Completado', 
      notes: 'Refuerzo en Cálculo Integral. Compromiso: resolver ejercicios del cap. 5 antes del viernes.'
    },
    { 
      date: '8 Oct 2024', 
      type: 'Entrevista de Seguimiento', 
      tutor: 'Dra. Elena Ramírez', 
      status: 'Completado', 
      notes: 'Revisión del plan de estudios. Se ajustó la carga horaria para el próximo ciclo.'
    },
    { 
      date: '25 Sep 2024', 
      type: 'Apoyo Psicopedagógico', 
      tutor: 'Lic. Marco Vega', 
      status: 'Completado', 
      notes: 'Sesión de orientación vocacional. Se confirmó motivación por la carrera.'
    },
    { 
      date: '10 Sep 2024', 
      type: 'Tutoría Académica', 
      tutor: 'Dra. Elena Ramírez', 
      status: 'En Progreso', 
      notes: 'Plan de recuperación de Física II. Pendiente: entregar trabajo práctico.'
    }
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Historial de Compromisos y Tutorías</h2>
        <p className="text-slate-500 mt-1">Registro de acuerdos alcanzados durante tus sesiones de acompañamiento</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
          {commitments.map((commitment, index) => {
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
                        {commitment.date}
                      </span>
                      <span className="font-semibold text-slate-900">{commitment.type}</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        commitment.status === 'Completado' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {commitment.status === 'Completado' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {commitment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User size={14} />
                    <span><span className="font-medium text-slate-700">Tutor:</span> {commitment.tutor}</span>
                  </div>
                  
                  <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {commitment.notes}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
