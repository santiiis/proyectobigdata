"use client";

import { useRiskDistribution } from "@/hooks/useDashboard";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  LOW: "#10b981", // Emerald 500
  MEDIUM: "#f59e0b", // Amber 500
  HIGH: "#f43f5e", // Rose 500
};

export function RiskDistributionChart() {
  const { data, loading, error } = useRiskDistribution();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-80 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
        <div className="flex-1 bg-slate-100 rounded-full mx-auto w-48 h-48 mt-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-80 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: "Bajo Riesgo", value: data.LOW, color: COLORS.LOW },
    { name: "Riesgo Medio", value: data.MEDIUM, color: COLORS.MEDIUM },
    { name: "Alto Riesgo", value: data.HIGH, color: COLORS.HIGH },
  ].filter(item => item.value > 0); // Omitir 0 para que no ensucie la gráfica

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución Global de Riesgo</h3>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          No hay predicciones activas
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} estudiantes`, "Cantidad"]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
