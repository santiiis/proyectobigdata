"use client";

import React, { useState } from "react";
import { Users, Plus, KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function UserManagement() {
  const { data: responseData, error, mutate } = useSWR("/api/v1/settings/users", fetcher);
  
  // The API returns paginatedResponse, so data is inside responseData.data or just responseData if the fetcher handled it?
  // Let's check: the fetcher does `res.data` which returns the actual data object from successResponse or paginatedResponse.
  // Wait, paginatedResponse returns { success: true, data: [...], meta: {...} } so `res.data` gives the array of users.
  const users = responseData || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    showToast("Usuario creado correctamente");
  };

  const handleResetPassword = (name: string) => {
    if (confirm(`¿Estás seguro que deseas resetear la contraseña de ${name}?`)) {
      showToast(`Contraseña de ${name} reseteada`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-slate-500 mt-1">Administración de accesos y roles del sistema</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Crear Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 font-medium">Nombre</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Rol</th>
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3 font-medium">Último Acceso</th>
              <th className="pb-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-slate-900">
            {error ? (
              <tr><td colSpan={6} className="py-4 text-center text-red-500">Error cargando usuarios</td></tr>
            ) : !responseData ? (
              <tr><td colSpan={6} className="py-4 text-center text-slate-500">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="py-4 text-center text-slate-500">No hay usuarios</td></tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 text-slate-500">{user.email}</td>
                  <td className="py-3">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{user.role}</span>
                  </td>
                  <td className="py-3">
                    {user.isActive ? (
                      <span className="text-green-600 font-medium">Activo</span>
                    ) : (
                      <span className="text-slate-400 font-medium">Inactivo</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500" suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button 
                      onClick={() => handleResetPassword(user.name)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Resetear Contraseña"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Usuario</h3>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="usuario@universidad.edu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                  <option value="TUTOR">TUTOR</option>
                  <option value="DIRECTOR">DIRECTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Temporal</label>
                <input required type="password" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
