"use client";

import React from "react";
import { Activity, Target, Crosshair, BarChart2, History } from "lucide-react";

const retrainingHistory = [
  { id: 1, date: "2024-03-10", version: "v2.4.1", size: "45,200", recall: "87.3%", notes: "Inclusión de datos 2023-B" },
  { id: 2, date: "2023-11-05", version: "v2.4.0", size: "41,500", recall: "86.1%", notes: "Ajuste de hiperparámetros" },
  { id: 3, date: "2023-08-20", version: "v2.3.5", size: "38,900", recall: "84.5%", notes: "Modelo base reentrenado" },
];

export default function ModelHealthPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Salud del Modelo IA
        </h2>
        <p className="text-sm text-slate-500 mt-1">Métricas de rendimiento y versión activa</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Recall" value="87.3%" icon={<Target className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="Precisión" value="82.1%" icon={<Crosshair className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="F1-Score" value="84.6%" icon={<BarChart2 className="w-5 h-5 text-blue-600" />} />
        <MetricCard title="Modelo Activo" value="v2.4.1 RF" icon={<Activity className="w-5 h-5 text-blue-600" />} />
      </div>

      <div>
        <h3 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          Historial de Reentrenamiento
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Versión</th>
                <th className="pb-3 font-medium">Dataset (Reg.)</th>
                <th className="pb-3 font-medium">Recall</th>
                <th className="pb-3 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {retrainingHistory.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-500">{row.date}</td>
                  <td className="py-3 font-medium">{row.version}</td>
                  <td className="py-3 text-slate-500">{row.size}</td>
                  <td className="py-3 text-slate-500">{row.recall}</td>
                  <td className="py-3 text-slate-500">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <span className="text-slate-500 text-sm font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
