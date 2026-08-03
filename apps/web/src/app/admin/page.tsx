"use client";

import { useState } from "react";
import { FacultyManagement } from "@/components/admin/FacultyManagement";
import { CareerManagement } from "@/components/admin/CareerManagement";
import { SemesterManagement } from "@/components/admin/SemesterManagement";
import { CourseManagement } from "@/components/admin/CourseManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { Building2, GraduationCap, CalendarDays, BookOpen, Users, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

type TabType = "faculties" | "careers" | "semesters" | "courses" | "users";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("faculties");

  const tabs = [
    { id: "faculties", label: "Facultades", icon: Building2 },
    { id: "careers", label: "Carreras", icon: GraduationCap },
    { id: "semesters", label: "Semestres", icon: CalendarDays },
    { id: "courses", label: "Asignaturas", icon: BookOpen },
    { id: "users", label: "Usuarios y Roles", icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "faculties": return <FacultyManagement />;
      case "careers": return <CareerManagement />;
      case "semesters": return <SemesterManagement />;
      case "courses": return <CourseManagement />;
      case "users": return <UserManagement />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-lg text-slate-800">
              Panel Administrativo
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navegación por pestañas */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-200" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenedor Dinámico */}
        <section className="transition-opacity duration-300">
          {renderContent()}
        </section>

      </main>
    </div>
  );
}
