"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap, User, Bell, Calendar, BookOpen, AlertTriangle } from "lucide-react";

const mockNotifications = [
  { id: 1, text: "Tu tutora Dra. Ramírez confirmó la cita para el jueves 14:00", time: "hace 10 min", read: false, icon: <Calendar className="w-4 h-4 text-blue-500" /> },
  { id: 2, text: "Sugerencia: Refuerza tu asistencia en Cálculo Integral", time: "hace 2 hrs", read: false, icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
  { id: 3, text: "Notas del primer parcial publicadas", time: "hace 1 día", read: true, icon: <BookOpen className="w-4 h-4 text-green-500" /> },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white text-slate-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
            <GraduationCap className="w-6 h-6" />
            <span>Portal del Estudiante</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notificaciones */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-slate-900">Notificaciones</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                        <div className="shrink-0 mt-0.5">{n.icon}</div>
                        <div>
                          <p className={`text-sm ${!n.read ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{n.text}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="w-4 h-4" />
              <span>Alejandro Gómez</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
