import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Matemáticas', actual: 85, required: 70 },
  { subject: 'Física', actual: 78, required: 70 },
  { subject: 'Programación', actual: 92, required: 70 },
  { subject: 'Historia', actual: 88, required: 70 },
];

export function SubjectPerformanceChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Desempeño por Materia</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="actual" name="Nota Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="required" name="Nota Requerida" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
