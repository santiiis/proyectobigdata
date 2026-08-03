import { Metadata } from "next";
import { StudentProfileCard } from "@/components/students/StudentProfileCard";
import { AcademicHistoryTable } from "@/components/students/AcademicHistoryTable";
import { PredictionHistoryChart } from "@/components/students/PredictionHistoryChart";
import { StudentInterventions } from "@/components/students/StudentInterventions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Ficha del Estudiante | Plataforma de Deserción",
  description: "Perfil extendido del estudiante, historial académico y predicción de riesgo",
};

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header simulado para contexto del sistema */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-bold text-lg text-slate-800">
              Ficha del Estudiante
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Sección 1: Perfil General */}
        <section>
          <StudentProfileCard studentId={params.id} />
        </section>

        {/* Sección 2: Evolución del Riesgo ML */}
        <section>
          <PredictionHistoryChart studentId={params.id} />
        </section>

        {/* Sección 3: Historial Académico */}
        <section>
          <AcademicHistoryTable studentId={params.id} />
        </section>

        {/* Sección 4: Intervenciones */}
        <section>
          <StudentInterventions studentId={params.id} />
        </section>

      </main>
    </div>
  );
}
