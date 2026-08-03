"use client";

import { ImportAcademicRecords } from "@/components/admin/import/ImportAcademicRecords";
import { Shield, ArrowLeft, Database } from "lucide-react";
import Link from "next/link";

export default function ImportAdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Database className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-lg text-slate-800">
              Integración de Datos
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Ingesta de Datasets Masivos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Módulo especializado para la lectura y carga de datos históricos (OULAD) en la plataforma.
          </p>
        </div>

        <section className="transition-opacity duration-300">
          <ImportAcademicRecords />
        </section>
      </main>
    </div>
  );
}
