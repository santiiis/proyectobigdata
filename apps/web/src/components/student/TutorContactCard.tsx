"use client";

import React, { useState } from 'react';
import { Mail, Calendar, BookOpen, ChevronRight, Star, CheckCircle, Loader2 } from 'lucide-react';

interface TutorInfo {
  name: string;
  email: string;
}

export function TutorContactCard({ tutor, studentId }: { tutor: TutorInfo | null; studentId: number }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequest = async () => {
    setRequesting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          title: 'Solicitud de Tutoría',
          notes: 'Solicitud enviada desde el portal del estudiante.',
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || result.error || 'Error al enviar la solicitud');
      }
      setRequested(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar la solicitud');
    } finally {
      setRequesting(false);
    }
  };

  const displayName = tutor?.name || 'Tutor asignado';
  const displayEmail = tutor?.email || 'pendiente de asignación';
  const initials = displayName
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'T';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 p-6 rounded-2xl border border-blue-200 relative overflow-hidden h-full flex flex-col">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-2xl pointer-events-none"></div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 overflow-hidden shrink-0 text-blue-600 font-bold text-xl">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{displayName}</h3>
            <p className="text-sm text-blue-600 font-medium">Asesor Académico</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Acompañamiento académico y seguimiento</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Mail className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{displayEmail}</span>
        </div>
      </div>

      <button
        onClick={handleRequest}
        disabled={requesting || requested}
        className={`mt-auto w-full group font-medium py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
          requested
            ? 'bg-green-500 text-white cursor-default'
            : requesting
            ? 'bg-blue-400 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
        }`}
      >
        {requesting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando solicitud...</>
        ) : requested ? (
          <><CheckCircle className="w-4 h-4" /> Solicitud Enviada ✓</>
        ) : (
          <>Solicitar Tutoría <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
        )}
      </button>

      {requested && (
        <p className="text-xs text-center text-green-700 mt-2">Tu tutor recibirá la notificación y te contactará pronto.</p>
      )}
      {errorMsg && (
        <p className="text-xs text-center text-red-600 mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
