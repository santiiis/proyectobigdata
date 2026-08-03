"use client";

import React, { useState } from "react";
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import useSWR from "swr";

type Tab = "Facultades" | "Carreras" | "Semestres" | "Asignaturas";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState<Tab>("Facultades");
  
  const { data: faculties } = useSWR("/api/v1/admin/faculties", fetcher);
  const { data: careers } = useSWR("/api/v1/admin/careers", fetcher);
  const { data: semesters } = useSWR("/api/v1/admin/semesters", fetcher);
  const { data: courses } = useSWR("/api/v1/admin/courses", fetcher);

  const dataMap = {
    Facultades: faculties || [],
    Carreras: careers || [],
    Semestres: semesters || [],
    Asignaturas: courses || [],
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    showToast(`Elemento creado en ${activeTab}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-in fade-in shadow-sm z-10">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
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
              {activeTab !== "Facultades" && activeTab !== "Semestres" && (
                <th className="pb-3 font-medium">Dependencia</th>
              )}
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-slate-900">
            {dataMap[activeTab].length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">No hay datos o cargando...</td></tr>
            ) : dataMap[activeTab].map((item: any) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="py-3 font-medium">{item.name || item.code}</td>
                {activeTab !== "Facultades" && activeTab !== "Semestres" && (
                  <td className="py-3 text-slate-500">{item.faculty?.name || item.semester?.name || item.career?.name || "-"}</td>
                )}
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.isActive !== false ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Desactivar">
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
              <h3 className="text-lg font-bold text-slate-900">Crear {activeTab.slice(0, -1)}</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder={`Nombre de ${activeTab.toLowerCase()}`} />
              </div>
              {activeTab !== "Facultades" && activeTab !== "Semestres" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dependencia</label>
                  <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                    <option>Seleccionar...</option>
                    <option>Opción 1</option>
                    <option>Opción 2</option>
                  </select>
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
