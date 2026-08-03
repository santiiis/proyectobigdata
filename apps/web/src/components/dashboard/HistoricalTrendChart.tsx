"use client";

import { useHistoricalTrend } from "@/hooks/useDashboard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function HistoricalTrendChart() {
  const { data, loading, error } = useHistoricalTrend();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-96 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
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

  // Formatear fecha para el eje X
  const chartData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-96 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Evolución de Procesamientos</h3>
        <p className="text-sm text-slate-500">Estudiantes procesados por lote en el tiempo</p>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          No hay datos históricos disponibles
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
              />
              <Area 
                type="monotone" 
                dataKey="studentsProcessed" 
                name="Estudiantes"
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorStudents)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
