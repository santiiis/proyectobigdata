"use client";

import React, { useState } from "react";
import { Users, UserCheck, Cpu, Zap, Activity } from "lucide-react";

import MLPipelineMonitor from "@/components/dashboard/admin/MLPipelineMonitor";
import MassiveIngestionForm from "@/components/dashboard/admin/MassiveIngestionForm";
import AuditLogTable from "@/components/dashboard/admin/AuditLogTable";

import ImportJobsMonitor from "@/components/dashboard/admin/ImportJobsMonitor";
import ModelHealthPanel from "@/components/dashboard/admin/ModelHealthPanel";
import UserManagement from "@/components/dashboard/admin/UserManagement";
import AcademicStructure from "@/components/dashboard/admin/AcademicStructure";
import ReportExport from "@/components/dashboard/admin/ReportExport";

import useSWR from "swr";

type Tab = 'main' | 'users' | 'academic' | 'reports';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('main');
  
  const { data: kpis } = useSWR('/api/v1/admin/kpis', fetcher);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Panel de Administrador
          </h1>
          <p className="text-slate-500 mt-2 text-base">Gestión de pipelines de IA, estado del sistema e ingesta masiva de datos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-sm px-4 py-2 rounded-full font-medium border ${
            kpis && kpis.activeJobs > 0
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-blue-50 text-blue-700 border-blue-100"
          }`}>
            {kpis && kpis.activeJobs > 0 ? `Procesando (${kpis.activeJobs} trabajo${kpis.activeJobs > 1 ? 's' : ''} en ejecución)` : 'Estado: Óptimo'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('main')} 
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === 'main' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          Panel Principal
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('academic')} 
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === 'academic' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          Estructura Académica
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          Reportes
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'main' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <KpiCard 
                title="Alumnos Totales" 
                value={kpis ? kpis.totalStudents.toLocaleString() : "..."} 
                change="Registrados en base de datos" 
                icon={<Users className="w-6 h-6 text-blue-600" />} 
                iconBg="bg-blue-100"
                trend="neutral"
              />
              <KpiCard 
                title="Usuarios Activos" 
                value={kpis ? kpis.activeUsers.toLocaleString() : "..."} 
                change="Personal administrativo" 
                icon={<UserCheck className="w-6 h-6 text-emerald-600" />} 
                iconBg="bg-emerald-100"
                trend="neutral"
              />
              <KpiCard 
                title="Versión del Modelo IA" 
                value={kpis ? kpis.modelVersion : "..."} 
                change="Activo en producción" 
                icon={<Cpu className="w-6 h-6 text-purple-600" />} 
                iconBg="bg-purple-100"
                trend="neutral"
              />
              <KpiCard 
                title="Trabajos en Ejecución" 
                value={kpis ? kpis.activeJobs.toString() : "..."} 
                change="Procesos en segundo plano" 
                icon={<Zap className="w-6 h-6 text-amber-600" />} 
                iconBg="bg-amber-100"
                trend={kpis?.activeJobs > 0 ? "up" : "neutral"}
              />
            </div>

            {/* New Components */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ImportJobsMonitor />
              <ModelHealthPanel />
            </div>

            {/* Main Grid: Pipeline & Ingestion */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <MLPipelineMonitor />
              </div>
              <div className="xl:col-span-1">
                <MassiveIngestionForm />
              </div>
            </div>

            {/* Audit Logs */}
            <div className="pt-2">
              <AuditLogTable />
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'academic' && <AcademicStructure />}
        {activeTab === 'reports' && <ReportExport />}
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon, iconBg, trend }: { title: string, value: string, change: string, icon: React.ReactNode, iconBg: string, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconBg} transition-colors`}>
          {icon}
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          trend === 'up' ? 'bg-green-100 text-green-600' : 
          trend === 'down' ? 'bg-red-100 text-red-600' : 
          'bg-slate-100 text-slate-500'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
        <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
        <div className="text-sm font-medium text-slate-500">
          {change}
        </div>
      </div>
    </div>
  );
}
