"use client";

import { usePredictionHistory } from "@/hooks/useStudent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function PredictionHistoryChart({ studentId }: { studentId: string }) {
  const { data, loading, error } = usePredictionHistory(studentId);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-96 animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 rounded mb-4"></div>
        <div className="flex-1 bg-slate-100 rounded mt-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-96 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  // Formatear datos para el gráfico
  // Invertimos el array para que el gráfico vaya de más antiguo a más reciente (izquierda a derecha)
  const chartData = [...data].reverse().map(item => ({
    ...item,
    formattedDate: new Date(item.calculatedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    scorePercentage: parseFloat((item.score * 100).toFixed(1))
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-96 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Evolución del Riesgo (ML)</h3>
        <p className="text-sm text-slate-500">Probabilidad de deserción en el tiempo</p>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          No hay predicciones históricas
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                formatter={(value: number) => [`${value}%`, "Score"]}
              />
              <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Umbral HIGH', fill: '#f43f5e', fontSize: 12 }} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Umbral MEDIUM', fill: '#f59e0b', fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="scorePercentage" 
                name="Score"
                stroke="#4f46e5" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
