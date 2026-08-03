"use client";

import React, { useState } from "react";
import { Users, Plus, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

export default function UserManagement() {
  const { data: responseData, error, mutate } = useSWR("/api/v1/settings/users", fetcher);
  const users = responseData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "TUTOR", password: "" });
  const [saving, setSaving] = useState(false);

  const showToast = (type: 'ok' | 'err', message: string) => {
    setToastMessage({ type, text: message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: formData.role.toUpperCase() }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || result.error || 'Error al crear el usuario');
      }
      setIsModalOpen(false);
      setFormData({ name: "", email: "", role: "TUTOR", password: "" });
      mutate();
      showToast('ok', 'Usuario creado correctamente');
    } catch (err: any) {
      showToast('err', err.message || 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro que deseas resetear la contraseña de ${name}?`)) return;
    const tempPassword = Math.random().toString(36).slice(2, 10) + 'A1';
    try {
      const res = await fetch(`/api/v1/settings/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: tempPassword }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || result.error || 'Error al resetear la contraseña');
      }
      showToast('ok', `Contraseña temporal de ${name}: ${tempPassword}`);
    } catch (err: any) {
      showToast('err', err.message || 'Error al resetear la contraseña');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      {toastMessage && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-in fade-in shadow-sm z-10 ${
          toastMessage.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {toastMessage.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toastMessage.text}
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
              <th className="pb-3 font-medium">Creado</th>
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
                      onClick={() => handleResetPassword(user.id, user.name)}
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
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Ej. Juan Pérez"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="usuario@universidad.edu"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="TUTOR">TUTOR</option>
                  <option value="DIRECTOR">DIRECTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Temporal</label>
                <input required type="password" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
