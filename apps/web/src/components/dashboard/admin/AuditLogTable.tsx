"use client";

import { useState } from "react";
import { Clock, ShieldAlert, User, TerminalSquare, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function AuditLogTable() {
  const [showAll, setShowAll] = useState(false);
  const { data: logs, error } = useSWR("/api/v1/admin/audit-logs", fetcher);

  const allLogs = logs || [];
  const visibleLogs = showAll ? allLogs : allLogs.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
            <ShieldAlert className="w-5 h-5 text-slate-500" />
            Logs de Auditoría del Sistema
          </h3>
          <p className="text-sm text-slate-500 mt-1">Acciones recientes administrativas y del sistema</p>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          {showAll ? (
            <>Ver Menos <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Ver Todos ({allLogs.length}) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Log ID</th>
              <th className="px-6 py-4 font-semibold">Usuario / Servicio</th>
              <th className="px-6 py-4 font-semibold">Acción</th>
              <th className="px-6 py-4 font-semibold">Tiempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {error ? (
              <tr><td colSpan={4} className="py-4 text-center text-red-500">Error cargando logs de auditoría</td></tr>
            ) : !logs ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">Cargando...</td></tr>
            ) : visibleLogs.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">No hay logs registrados</td></tr>
            ) : (
              visibleLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    AL-{log.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${
                        log.entity === 'BatchJob' ? 'bg-purple-100 text-purple-600' :
                        log.entity === 'ImportJob' ? 'bg-blue-100 text-blue-600' :
                        log.entity === 'User' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.entity === 'BatchJob' ? <TerminalSquare className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 truncate max-w-[180px]">{log.user?.email || "system"}</div>
                        <div className="text-xs text-slate-500">{log.ipAddress || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {log.action}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-500 text-xs whitespace-nowrap flex items-center gap-1.5" suppressHydrationWarning>
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.createdAt).toLocaleString("es-ES")}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
