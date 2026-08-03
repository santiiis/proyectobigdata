"use client";

import { useUsers } from "@/hooks/useAdmin";
import { Users, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export function UserManagement() {
  const { data, loading, error, updateUserRole, disableUser } = useUsers();

  const handleRoleChange = async (id: string, newRole: string) => {
    if (window.confirm(`¿Cambiar el rol de este usuario a ${newRole}?`)) {
      try {
        await updateUserRole(id, newRole);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, role: string) => {
    if (role === 'ADMIN' && currentStatus) {
      if (!window.confirm("¡ADVERTENCIA! Estás a punto de desactivar a un administrador. ¿Estás seguro?")) {
        return;
      }
    }
    
    try {
      await disableUser(id, !currentStatus);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando usuarios...</div>;
  if (error) return <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">Error: {error}</div>;

  const getRoleIcon = (role: string) => {
    if (role === 'ADMIN') return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    if (role === 'DIRECTOR') return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
    return <Shield className="w-4 h-4 text-slate-400" />;
  };

  const roles = ["ADMIN", "DIRECTOR", "TUTOR"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Gestión de Usuarios (RBAC)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white">
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="font-medium px-6 py-4">Usuario</th>
              <th className="font-medium px-6 py-4 text-center">Rol Actual</th>
              <th className="font-medium px-6 py-4 text-center">Estado</th>
              <th className="font-medium px-6 py-4 text-right">Acciones (Cambiar Rol)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!data || data.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay usuarios registrados</td></tr>
            ) : (
              data.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-slate-500 text-xs">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5 bg-slate-100 w-fit mx-auto px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleToggleActive(user.id, user.isActive, user.role)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                        user.isActive 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      }`}
                    >
                      {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <select 
                      className="rounded-md border-slate-300 text-sm py-1 pl-3 pr-8 border bg-white focus:ring-indigo-500 focus:border-indigo-500"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
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
