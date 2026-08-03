"use client";

import React from 'react';
import { SubjectPerformanceChart } from '../../../components/student/SubjectPerformanceChart';
import { TutorContactCard } from '../../../components/student/TutorContactCard';
import { CommitmentHistory } from '../../../components/student/CommitmentHistory';
import { GraduationCap, Clock, BookOpenCheck, CreditCard, Lightbulb, Loader2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function StudentPortalPage() {
  // Using student ID 1 as an example since we don't have auth context fully mocked
  const { data: student, error } = useSWR('/api/v1/students/1', fetcher);

  if (error) return <div className="p-8 text-center text-red-500">Error cargando perfil del estudiante</div>;
  if (!student) return <div className="p-8 flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const academic = student.academicRecords?.[0];
  const gpa = academic?.gpa || 0;
  const attendance = academic?.attendanceRate || 0;
  
  // Fake credits logic just for UI completion, normally this comes from enrollments
  const credits = 120;
  
  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hola de nuevo, {student.firstName} 👋</h1>
          <p className="text-slate-500 mt-1 text-lg">Aquí tienes un resumen de tu progreso en {student.career?.name}.</p>
        </section>

        {/* Recomendaciones Constructivas */}
        <section className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-blue-900">Sugerencias para mejorar tu rendimiento este semestre</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-2 pl-5 list-disc">
            <li>Tu asistencia en <strong>Cálculo Integral</strong> está en 68%. Asistir a las dos próximas clases recuperará tu margen óptimo.</li>
            <li>Tienes disponible la <strong>tutoría académica de refuerzo</strong> para preparar el examen del segundo parcial.</li>
            <li>Tu rendimiento en <strong>Programación</strong> es excelente (92/100). ¡Sigue así!</li>
          </ul>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1 - Promedio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Promedio General</p>
                  <h3 className="text-3xl font-bold text-slate-900">{gpa.toFixed(1)}<span className="text-lg text-slate-400 font-normal">/10</span></h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">+0.3</span>
                <span className="text-slate-500">vs semestre anterior</span>
              </div>
            </div>
          </div>

          {/* KPI 2 - Asistencia */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Asistencia Global</p>
                  <h3 className="text-3xl font-bold text-slate-900">{Math.round(attendance)}<span className="text-lg text-slate-400 font-normal">%</span></h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${attendance}%` }}></div>
              </div>
            </div>
          </div>

          {/* KPI 3 - Créditos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-0 group-hover:bg-green-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Avance de Créditos</p>
                  <h3 className="text-3xl font-bold text-slate-900">120<span className="text-lg text-slate-400 font-normal">/240</span></h3>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          {/* KPI 4 - Colegiatura */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-0 group-hover:bg-sky-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Estado Colegiatura</p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Al día</h3>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">Próximo pago: 15 de Nov</p>
            </div>
          </div>
        </section>

        {/* Charts & Tutors Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex">
            <SubjectPerformanceChart />
          </div>
          <div className="flex">
            <TutorContactCard />
          </div>
        </section>

        {/* Commitment History */}
        <CommitmentHistory />

      </main>
    </div>
  );
}
