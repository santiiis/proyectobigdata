"use client";

import { useState } from "react";
import { useSemesters } from "@/hooks/useAdmin";
import { Plus, Edit2, Trash2, CalendarDays, CheckCircle2 } from "lucide-react";

export function SemesterManagement() {
  const { data, loading, error, createSemester, updateSemester, deleteSemester } = useSemesters();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", startDate: "", endDate: "", isCurrent: false });
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createSemester({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });
      setFormData({ code: "", name: "", startDate: "", endDate: "", isCurrent: false });
      setIsCreating(false);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleSetCurrent = async (id: number) => {
    try {
      await updateSemester(id, { isCurrent: true });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el semestre ${name}?`)) {
      try {
        await deleteSemester(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando semestres...</div>;
  if (error) return <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          Gestión de Semestres
        </h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Semestre
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 border-b border-slate-100 bg-indigo-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
              <input type="text" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" placeholder="2026-A" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input type="text" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" placeholder="Primer Semestre 2026" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
              <input type="date" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
              <input type="date" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input type="checkbox" id="isCurrent" className="rounded text-indigo-600 border-slate-300" checked={formData.isCurrent} onChange={e => setFormData({...formData, isCurrent: e.target.checked})} />
            <label htmlFor="isCurrent" className="ml-2 text-sm text-slate-700">Marcar como semestre actual activo</label>
          </div>
          {actionError && <p className="mt-2 text-sm text-rose-600">{actionError}</p>}
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreating(false)} className="text-sm font-medium text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-md">Cancelar</button>
            <button type="submit" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Guardar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white">
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="font-medium px-6 py-4">Código / Nombre</th>
              <th className="font-medium px-6 py-4">Fechas</th>
              <th className="font-medium px-6 py-4 text-center">Estado</th>
              <th className="font-medium px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!data || data.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay semestres registrados</td></tr>
            ) : (
              data.map((sem) => (
                <tr key={sem.id} className={`hover:bg-slate-50 ${sem.isCurrent ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{sem.code}</p>
                    <p className="text-slate-500 text-xs">{sem.name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {sem.isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Actual
                      </span>
                    ) : (
                      <button onClick={() => handleSetCurrent(sem.id)} className="text-xs text-slate-400 hover:text-indigo-600 underline">
                        Hacer actual
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(sem.id, sem.name)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
