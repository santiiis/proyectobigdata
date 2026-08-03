"use client";

import React, { useState } from 'react';
import { Calendar, CheckCircle2, MessageSquare, ArrowRight, ChevronRight } from 'lucide-react';
import useSWR from 'swr';

type KanbanStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface Task {
  id: string;
  title: string;
  studentName: string;
  status: KanbanStatus;
  date: string;
  type: 'Meeting' | 'Message' | 'Review';
}

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

const getIcon = (type: string) => {
  switch (type) {
    case 'Meeting': return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
    case 'Message': return <MessageSquare className="w-3.5 h-3.5 text-green-500" />;
    case 'Review': return <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />;
    default: return <Calendar className="w-3.5 h-3.5" />;
  }
};

const typeLabels: Record<string, string> = {
  Meeting: 'Reunión',
  Message: 'Mensaje',
  Review: 'Revisión',
};

const nextStatus: Record<string, KanbanStatus | null> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
  RESOLVED: 'CLOSED',
  CLOSED: null,
};

const nextStatusLabel: Record<string, string> = {
  PENDING: 'Iniciar',
  IN_PROGRESS: 'Resolver',
  RESOLVED: 'Cerrar',
  CLOSED: '',
};

export default function InterventionKanban() {
  const { data: rawInterventions, error, mutate } = useSWR('/api/v1/interventions', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const moveTask = async (taskId: string, currentStatus: string) => {
    const next = nextStatus[currentStatus];
    if (next) {
      setActionError(null);
      try {
        const res = await fetch(`/api/v1/interventions/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || 'No se pudo actualizar el estado');
        }
        mutate();
      } catch (err: any) {
        setActionError(err.message || 'No se pudo actualizar el estado');
      }
    }
  };

  const tasks: Task[] = (rawInterventions || []).map((inv: any) => {
    let type: 'Meeting' | 'Message' | 'Review' = 'Review';
    if (inv.title.toLowerCase().includes('reunión') || inv.title.toLowerCase().includes('tutoría')) type = 'Meeting';
    if (inv.title.toLowerCase().includes('mensaje') || inv.title.toLowerCase().includes('contacto')) type = 'Message';
    
    return {
      id: inv.id.toString(),
      title: inv.title,
      studentName: inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : 'Estudiante Desconocido',
      status: inv.status as KanbanStatus,
      date: new Date(inv.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      type
    };
  });

  const pending = tasks.filter(t => t.status === 'PENDING');
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS');
  const resolved = tasks.filter(t => t.status === 'RESOLVED');

  const renderCard = (task: Task) => (
    <div key={task.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
          {getIcon(task.type)}
          <span className="ml-1.5">{typeLabels[task.type]}</span>
        </span>
      </div>
      <h5 className="font-medium text-sm text-slate-900 mb-1">{task.title}</h5>
      <p className="text-xs text-slate-500 mb-3">Para: <span className="font-medium text-slate-700">{task.studentName}</span></p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-slate-400" suppressHydrationWarning>
          <Calendar className="w-3 h-3 mr-1.5" />
          {task.date}
        </div>
        {nextStatus[task.status] && (
          <button
            onClick={() => moveTask(task.id, task.status)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
          >
            {nextStatusLabel[task.status]}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );

  const renderColumn = (title: string, columnTasks: Task[], color: string) => (
    <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <h4 className="font-semibold text-slate-700 text-sm">{title}</h4>
        </div>
        <span className="bg-slate-200 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {columnTasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {columnTasks.map(renderCard)}
        {columnTasks.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Intervenciones</h3>
        <p className="text-sm text-slate-500">Gestión de acciones preventivas y correctivas. Usa los botones para avanzar el estado de cada intervención.</p>
        {actionError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {actionError}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('Pendientes', pending, 'bg-amber-400')}
        {renderColumn('En Progreso', inProgress, 'bg-blue-400')}
        {renderColumn('Resueltas', resolved, 'bg-green-400')}
      </div>
    </div>
  );
}
