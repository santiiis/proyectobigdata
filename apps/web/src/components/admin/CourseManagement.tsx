"use client";

import { useState } from "react";
import { useCourses, useSemesters } from "@/hooks/useAdmin";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";

export function CourseManagement() {
  const { data: courses, loading, error, createCourse, deleteCourse } = useCourses();
  const { data: semesters } = useSemesters();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", credits: "3", semesterId: "" });
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createCourse({
        code: formData.code,
        name: formData.name,
        credits: parseInt(formData.credits, 10),
        semesterId: parseInt(formData.semesterId, 10)
      });
      setFormData({ code: "", name: "", credits: "3", semesterId: "" });
      setIsCreating(false);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el curso ${name}?`)) {
      try {
        await deleteCourse(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando asignaturas...</div>;
  if (error) return <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Gestión de Asignaturas
        </h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Asignatura
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 border-b border-slate-100 bg-indigo-50/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semestre</label>
              <select required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm bg-white" value={formData.semesterId} onChange={e => setFormData({...formData, semesterId: e.target.value})}>
                <option value="">Seleccione...</option>
                {semesters?.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
              <input type="text" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" placeholder="MAT-101" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input type="text" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" placeholder="Cálculo I" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Créditos</label>
              <input type="number" min="1" max="10" required className="w-full rounded-md border-slate-300 px-3 py-2 border text-sm" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} />
            </div>
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
              <th className="font-medium px-6 py-4">Semestre</th>
              <th className="font-medium px-6 py-4">Código</th>
              <th className="font-medium px-6 py-4">Asignatura</th>
              <th className="font-medium px-6 py-4 text-center">Créditos</th>
              <th className="font-medium px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!courses || courses.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay asignaturas registradas</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-indigo-700">{c.semester?.code}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{c.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{c.credits}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
