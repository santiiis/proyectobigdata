import { Metadata } from "next";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { HistoricalTrendChart } from "@/components/dashboard/HistoricalTrendChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "Dashboard | Plataforma de Deserción Estudiantil",
  description: "Panel principal de indicadores y predicciones",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar simulado (para la vista independiente, luego se abstraerá en el layout) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Predicción de Deserción
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              Panel Administrativo
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Resumen General</h1>
          <p className="text-slate-500 mt-1">Indicadores clave y alertas recientes del sistema.</p>
        </div>

        {/* 1. Tarjetas KPI superiores */}
        <KpiCards />

        {/* 2. Gráficos Intermedios (Distribución + Tendencia) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RiskDistributionChart />
          <HistoricalTrendChart />
        </div>

        {/* 3. Panel Inferior (Alertas) */}
        <div className="mb-8">
          <RecentAlerts />
        </div>
      </main>
    </div>
  );
}
