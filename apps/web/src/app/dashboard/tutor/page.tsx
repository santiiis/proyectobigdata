"use client";

import React from 'react';
import { Users, AlertTriangle, CheckSquare, CheckCircle } from 'lucide-react';
import StudentsRiskTable from '@/components/dashboard/tutor/StudentsRiskTable';
import InterventionKanban from '@/components/dashboard/tutor/InterventionKanban';
import { useDashboardKpis } from '@/hooks/useDashboard';

export default function TutorDashboardPage() {
  const { data: kpis } = useDashboardKpis();

  const kpiCards = [
    {
      title: 'Estudiantes Activos',
      value: kpis ? kpis.totalActiveStudents.toLocaleString() : '...',
      change: 'Registrados en el sistema',
      changeType: 'neutral',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Riesgo Alto',
      value: kpis ? kpis.highRiskStudents.toLocaleString() : '...',
      change: 'Predicción activa de deserción',
      changeType: (kpis?.highRiskStudents ?? 0) > 0 ? 'negative' : 'positive',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bgColor: 'bg-red-100',
    },
    {
      title: 'Intervenciones Activas',
      value: kpis ? kpis.activeInterventions.toLocaleString() : '...',
      change: 'Pendientes o en progreso',
      changeType: 'neutral',
      icon: <CheckSquare className="w-5 h-5 text-amber-600" />,
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Intervenciones Resueltas',
      value: kpis ? kpis.resolvedInterventions.toLocaleString() : '...',
      change: 'Completadas',
      changeType: 'positive',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-100',
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard del Tutor</h1>
          <p className="text-slate-500 mt-1">Supervisa y gestiona el rendimiento de tus estudiantes asignados.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.bgColor}`}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <h4 className="text-slate-500 text-sm font-medium">{kpi.title}</h4>
              <div className="text-3xl font-bold text-slate-900 mt-1 mb-2">{kpi.value}</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center ${
                kpi.changeType === 'positive' ? 'bg-green-100 text-green-600' :
                kpi.changeType === 'negative' ? 'bg-red-100 text-red-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <StudentsRiskTable />
        <InterventionKanban />
      </div>
    </div>
  );
}
