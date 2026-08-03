"use client";

import React, { useState } from "react";
import { Layers, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import useSWR from "swr";

type Tab = "Facultades" | "Carreras" | "Semestres" | "Asignaturas";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

const endpointMap: Record<Tab, string> = {
  Facultades: "/api/v1/admin/faculties",
  Carreras: "/api/v1/admin/careers",
  Semestres: "/api/v1/admin/semesters",
  Asignaturas: "/api/v1/admin/courses",
};

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState<Tab>("Facultades");
  
  const { data: faculties, mutate: mutateFaculties } = useSWR("/api/v1/admin/faculties", fetcher);
  const { data: careers, mutate: mutateCareers } = useSWR("/api/v1/admin/careers", fetcher);
  const { data: semesters, mutate: mutateSemesters } = useSWR("/api/v1/admin/semesters", fetcher);
  const { data: courses, mutate: mutateCourses } = useSWR("/api/v1/admin/courses", fetcher);

  const dataMap: Record<Tab, { data: any[]; mutate: () => void }> = {
    Facultades: { data: faculties || [], mutate: mutateFaculties },
    Carreras: { data: careers || [], mutate: mutateCareers },
    Semestres: { data: semesters || [], mutate: mutateSemesters },
    Asignaturas: { data: courses || [], mutate: mutateCourses },
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});

  const showToast = (type: 'ok' | 'err', message: string) => {
    setToastMessage({ type, text: message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (activeTab === 'Semestres') {
        payload.startDate = new Date(String(payload.startDate)).toISOString();
        payload.endDate = new Date(String(payload.endDate)).toISOString();
        payload.isCurrent = payload.isCurrent === 'true' || payload.isCurrent === true;
      }
      if (activeTab === 'Carreras' || activeTab === 'Asignaturas') {
        payload.facultyId = Number(payload.facultyId);
        payload.semesterId = Number(payload.semesterId);
        if (activeTab === 'Asignaturas') payload.credits = Number(payload.credits);
      }

      const res = await fetch(endpointMap[activeTab], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || 'Error al crear el elemento');
      }
      setIsModalOpen(false);
      setFormData({});
      dataMap[activeTab].mutate();
      showToast('ok', `Elemento creado en ${activeTab}`);
    } catch (err: any) {
      showToast('err', err.message || 'Error al crear el elemento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${item.name || item.code}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${endpointMap[activeTab]}/${item.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || 'Error al eliminar');
      }
      dataMap[activeTab].mutate();
      showToast('ok', 'Elemento eliminado correctamente');
    } catch (err: any) {
      showToast('err', err.message || 'Error al eliminar');
    }
  };

  const set = (key: string, value: string | boolean) => setFormData(prev => ({ ...prev, [key]: value }));

  const renderFormFields = () => {
    switch (activeTab) {
      case 'Facultades':
        return (
          <>
            <InputField label="Código" placeholder="Ej. FAC-ING" value={String(formData.code || '')} onChange={v => set('code', v)} required />
            <InputField label="Nombre" placeholder="Ej. Facultad de Ingeniería" value={String(formData.name || '')} onChange={v => set('name', v)} required />
          </>
        );
      case 'Carreras':
        return (
          <>
            <InputField label="Código" placeholder="Ej. ISW" value={String(formData.code || '')} onChange={v => set('code', v)} required />
            <InputField label="Nombre" placeholder="Ej. Ingeniería de Software" value={String(formData.name || '')} onChange={v => set('name', v)} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facultad</label>
              <select required className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                value={String(formData.facultyId || '')} onChange={e => set('facultyId', e.target.value)}>
                <option value="">Seleccionar...</option>
                {(faculties || []).map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </>
        );
      case 'Semestres':
        return (
          <>
            <InputField label="Código" placeholder="Ej. 2026-A" value={String(formData.code || '')} onChange={v => set('code', v)} required />
            <InputField label="Nombre" placeholder="Ej. Primer Semestre 2026" value={String(formData.name || '')} onChange={v => set('name', v)} required />
            <InputField label="Fecha de Inicio" type="date" value={String(formData.startDate || '')} onChange={v => set('startDate', v)} required />
            <InputField label="Fecha de Fin" type="date" value={String(formData.endDate || '')} onChange={v => set('endDate', v)} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semestre Actual</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                value={String(formData.isCurrent || 'false')} onChange={e => set('isCurrent', e.target.value)}>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
          </>
        );
      case 'Asignaturas':
        return (
          <>
            <InputField label="Código" placeholder="Ej. MAT-101" value={String(formData.code || '')} onChange={v => set('code', v)} required />
            <InputField label="Nombre" placeholder="Ej. Matemáticas I" value={String(formData.name || '')} onChange={v => set('name', v)} required />
            <InputField label="Créditos" type="number" placeholder="Ej. 4" value={String(formData.credits || '')} onChange={v => set('credits', v)} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semestre</label>
              <select required className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                value={String(formData.semesterId || '')} onChange={e => set('semesterId', e.target.value)}>
                <option value="">Seleccionar...</option>
                {(semesters || []).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.code} {s.isCurrent ? '(Actual)' : ''}</option>
                ))}
              </select>
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
      {toastMessage && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-in fade-in shadow-sm z-10 ${
          toastMessage.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {toastMessage.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toastMessage.text}
        </div>
      )}

      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Estructura Académica
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configuración de entidades educativas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Crear Nuevo
        </button>
      </div>

      <div className="flex border-b border-slate-100 overflow-x-auto">
        {(Object.keys(dataMap) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 font-medium">Nombre</th>
              {activeTab === "Carreras" && <th className="pb-3 font-medium">Facultad</th>}
              {activeTab === "Asignaturas" && <th className="pb-3 font-medium">Semestre</th>}
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-slate-900">
            {dataMap[activeTab].data.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">No hay datos o cargando...</td></tr>
            ) : dataMap[activeTab].data.map((item: any) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="py-3 font-medium">
                  {item.name}
                  <span className="block text-xs text-slate-400 font-mono">{item.code}</span>
                </td>
                {activeTab === "Carreras" && <td className="py-3 text-slate-500">{item.faculty?.name || "-"}</td>}
                {activeTab === "Asignaturas" && <td className="py-3 text-slate-500">{item.semester?.code || "-"}</td>}
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.isActive !== false ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button onClick={() => handleDelete(item)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Crear {activeTab === 'Facultades' ? 'Facultad' : activeTab === 'Carreras' ? 'Carrera' : activeTab === 'Semestres' ? 'Semestre' : 'Asignatura'}</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {renderFormFields()}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text", required }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input required={required} type={type} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
