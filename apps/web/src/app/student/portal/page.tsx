"use client";

import React from 'react';
import { SubjectPerformanceChart } from '../../../components/student/SubjectPerformanceChart';
import { TutorContactCard } from '../../../components/student/TutorContactCard';
import { CommitmentHistory } from '../../../components/student/CommitmentHistory';
import { GraduationCap, Clock, BookOpenCheck, CreditCard, Lightbulb, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function StudentPortalPage() {
  // El portal usa el estudiante vinculado a la sesión; por ahora se carga el
  // primer estudiante activo como perfil de demostración.
  const { data: student, error } = useSWR('/api/v1/student/me', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  if (error) return <div className="p-8 text-center text-red-500">Error cargando perfil del estudiante</div>;
  if (!student) return <div className="p-8 flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const academic = student.academicRecords?.[0];
  const gpa = academic?.gpa || 0;
  const attendance = academic?.attendanceRate || 0;
  const attendancePct = Math.min(100, Math.round(attendance * 100));
  const prediction = student.predictions?.[0];

  const approvedCredits = (student.enrollments || []).reduce(
    (sum: number, e: any) => sum + ((e.finalGrade != null && e.finalGrade >= 6.0) ? (e.course?.credits || 0) : 0),
    0
  );
  const totalCredits = (student.enrollments || []).reduce(
    (sum: number, e: any) => sum + (e.course?.credits || 0),
    0
  );

  const payments = student.payments || [];
  const pendingPayment = payments.find((p: any) => p.status === "PENDING" || p.status === "OVERDUE") || payments[0];
  const tuitionStatus = !pendingPayment
    ? null
    : pendingPayment.status === "PAID"
      ? { label: "Al día", paid: true }
      : { label: pendingPayment.status === "OVERDUE" ? "Vencido" : "Pendiente", paid: false };

  const subjectData = (student.enrollments || [])
    .filter((e: any) => e.course)
    .map((e: any) => ({
      subject: e.course.name,
      actual: e.finalGrade ?? 0,
      required: 6.0,
    }));

  const suggestions: string[] = [];
  if (academic && attendance < 0.7) {
    suggestions.push(`Tu asistencia está al ${attendancePct}%. Asistir regularmente a clases te ayudará a mantener el ritmo del semestre.`);
  }
  if (gpa > 0 && gpa < 6.0) {
    suggestions.push(`Tu promedio actual es de ${gpa.toFixed(1)}/10. Considera solicitar una tutoría académica de refuerzo.`);
  }
  if (prediction?.riskLevel === 'HIGH') {
    suggestions.push('Tu riesgo de deserción actual es alto. Programa una reunión con tu tutor para diseñar un plan de acción.');
  }
  if (suggestions.length === 0) {
    suggestions.push('¡Sigue así! Tu rendimiento es estable y no hay alertas de riesgo activas este semestre.');
  }

  const tutor = student.user
    ? { name: student.user.name, email: student.user.email }
    : null;

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
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
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
              {prediction ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                    prediction.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' :
                    prediction.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {prediction.riskLevel === 'HIGH' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    Riesgo {prediction.riskLevel}
                  </span>
                  <span className="text-slate-500">({Math.round(prediction.score * 100)}%)</span>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin predicción activa</p>
              )}
            </div>
          </div>

          {/* KPI 2 - Asistencia */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Asistencia Global</p>
                  <h3 className="text-3xl font-bold text-slate-900">{attendancePct}<span className="text-lg text-slate-400 font-normal">%</span></h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${attendancePct}%` }}></div>
              </div>
            </div>
          </div>

          {/* KPI 3 - Créditos Aprobados */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-0 group-hover:bg-green-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Créditos Aprobados</p>
                  <h3 className="text-3xl font-bold text-slate-900">{approvedCredits}<span className="text-lg text-slate-400 font-normal">/{totalCredits}</span></h3>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-slate-500">Créditos aprobados con nota ≥ 6.0</p>
            </div>
          </div>

          {/* KPI 4 - Colegiatura */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-0 group-hover:bg-sky-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Estado Colegiatura</p>
                  <h3 className={`text-xl font-bold mt-1 ${tuitionStatus?.paid ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tuitionStatus ? tuitionStatus.label : 'Sin registros'}
                  </h3>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              {pendingPayment?.dueDate ? (
                <p className="text-sm text-slate-500">
                  {pendingPayment.status === 'PAID'
                    ? `Pagado el ${new Date(pendingPayment.paymentDate).toLocaleDateString('es-ES')}`
                    : `Vence: ${new Date(pendingPayment.dueDate).toLocaleDateString('es-ES')}`}
                </p>
              ) : (
                <p className="text-sm text-slate-500">No hay pagos registrados</p>
              )}
            </div>
          </div>
        </section>

        {/* Charts & Tutors Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex">
            <SubjectPerformanceChart data={subjectData} />
          </div>
          <div className="flex">
            <TutorContactCard tutor={tutor} studentId={student.id} />
          </div>
        </section>

        {/* Commitment History */}
        <CommitmentHistory studentId={student.id} />

      </main>
    </div>
  );
}
