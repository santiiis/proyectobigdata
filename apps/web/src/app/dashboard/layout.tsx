"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, User, Bell, Settings, Users, FileBarChart } from "lucide-react";

const navItems = [
  { label: 'Admin', href: '/dashboard/admin', icon: <Settings className="w-4 h-4" /> },
  { label: 'Tutor', href: '/dashboard/tutor', icon: <Users className="w-4 h-4" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">Plataforma Analytics</span>
            </div>
            
            {/* Navegación entre paneles */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="w-4 h-4" />
              <span>{pathname?.includes('tutor') ? 'Tutor' : 'Administrador'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
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
