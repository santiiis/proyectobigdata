"use client";

import React, { useState } from 'react';
import { Mail, Calendar, BookOpen, ChevronRight, Star, CheckCircle, Loader2 } from 'lucide-react';

export function TutorContactCard() {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    // Simular envío al backend
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRequesting(false);
    setRequested(true);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 p-6 rounded-2xl border border-blue-200 relative overflow-hidden h-full flex flex-col">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-2xl pointer-events-none"></div>
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 overflow-hidden shrink-0 text-blue-600 font-bold text-xl">
            ER
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Dra. Elena Ramírez</h3>
            <p className="text-sm text-blue-600 font-medium">Asesora Académica Principal</p>
          </div>
        </div>
        <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200 flex items-center gap-1 shrink-0">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-slate-700">4.9</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Especialista en Ciencias Exactas</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Disponible Lun - Jue, 14:00 - 18:00</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Mail className="w-4 h-4 text-blue-500 shrink-0" />
          <span>elena.ramirez@uide.edu.ec</span>
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
        <p className="text-xs text-center text-green-700 mt-2">Tu tutora recibirá la notificación y te contactará pronto.</p>
      )}
    </div>
  );
}
