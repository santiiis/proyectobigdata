"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle, Clock, MoreVertical, Plus, Eye, History, Search, ArrowUp, ArrowDown } from 'lucide-react';
import CreateInterventionModal from './CreateInterventionModal';
import StudentProfileModal from './StudentProfileModal';
import useSWR from 'swr';

export type RiskLevel = 'High' | 'Medium' | 'Low' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Student {
  id: string;
  name: string;
  career: string;
  lastAttendance: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => res.data);

const riskStyles: Record<RiskLevel, { badge: string; icon: React.ReactNode }> = {
  High: { badge: 'bg-red-100 text-red-600 border-red-200', icon: <AlertCircle className="w-4 h-4 mr-1 text-red-600" /> },
  Medium: { badge: 'bg-amber-100 text-amber-600 border-amber-200', icon: <Clock className="w-4 h-4 mr-1 text-amber-600" /> },
  Low: { badge: 'bg-green-100 text-green-600 border-green-200', icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" /> },
  HIGH: { badge: 'bg-red-100 text-red-600 border-red-200', icon: <AlertCircle className="w-4 h-4 mr-1 text-red-600" /> },
  MEDIUM: { badge: 'bg-amber-100 text-amber-600 border-amber-200', icon: <Clock className="w-4 h-4 mr-1 text-amber-600" /> },
  LOW: { badge: 'bg-green-100 text-green-600 border-green-200', icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" /> },
};

function DropdownMenu({ studentId, onClose, onOpenProfile }: { studentId: string; onClose: () => void; onOpenProfile: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-8 z-20 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
      <button
        onClick={() => { onOpenProfile(); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
      >
        <Eye className="w-4 h-4 text-slate-400" /> Ver Perfil Completo
      </button>
      <a
        href={`/students/${studentId}`}
        onClick={onClose}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
      >
        <History className="w-4 h-4 text-slate-400" /> Historial de Predicciones
      </a>
    </div>
  );
}

export default function StudentsRiskTable() {
  const { data: responseData, error } = useSWR('/api/v1/students?limit=50', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });
  
  const rawStudents = responseData || [];
  const dbStudents: Student[] = rawStudents.map((s: any) => {
    const activePrediction = s.predictions?.[0];
    let factors = ['Sin modelo activo'];
    
    if (activePrediction?.topRiskFactors) {
      try {
        const parsed = typeof activePrediction.topRiskFactors === 'string' 
          ? JSON.parse(activePrediction.topRiskFactors) 
          : activePrediction.topRiskFactors;
        factors = Array.isArray(parsed)
          ? parsed.slice(0, 2)
          : Object.keys(parsed).slice(0, 2);
      } catch (e) {
        factors = ['Datos ML'];
      }
    }

    const latestRecord = s.academicRecords?.[0];

    return {
      id: s.id.toString(),
      name: `${s.firstName} ${s.lastName}`,
      career: s.career?.name || 'Sin Carrera',
      lastAttendance: latestRecord?.attendanceRate !== undefined
        ? `${Math.round(latestRecord.attendanceRate * 100)}% asistencia`
        : "Ver historial",
      riskScore: activePrediction?.score ? Math.round(activePrediction.score * 100) : 0,
      riskLevel: activePrediction?.riskLevel || 'LOW',
      riskFactors: factors,
    };
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [careerFilter, setCareerFilter] = useState('Todas');
  const [riskFilter, setRiskFilter] = useState('Todos');
  const [sortColumn, setSortColumn] = useState<keyof Student | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleOpenInterventionModal = (student: Student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleOpenProfileModal = (student: Student) => {
    setSelectedStudent(student);
    setProfileModalOpen(true);
  };

  const handleSort = (column: keyof Student) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let result = dbStudents.filter((student: Student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCareer = careerFilter === 'Todas' || student.career === careerFilter;
      
      let matchesRisk = true;
      if (riskFilter === 'Alto') matchesRisk = student.riskLevel === 'High' || student.riskLevel === 'HIGH';
      else if (riskFilter === 'Medio') matchesRisk = student.riskLevel === 'Medium' || student.riskLevel === 'MEDIUM';
      else if (riskFilter === 'Bajo') matchesRisk = student.riskLevel === 'Low' || student.riskLevel === 'LOW';

      return matchesSearch && matchesCareer && matchesRisk;
    });

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, careerFilter, riskFilter, sortColumn, sortDirection, dbStudents]);

  const uniqueCareers = ['Todas', ...Array.from(new Set(dbStudents.map((s: Student) => s.career)))];

  const renderSortIcon = (column: keyof Student) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 inline-block ml-1" /> : <ArrowDown className="w-3 h-3 inline-block ml-1" />;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Estudiantes Asignados</h3>
              <p className="text-sm text-slate-500">Monitoreo de riesgo de deserción — haz clic en <strong>+ Intervención</strong> para registrar una acción preventiva</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
            >
              {uniqueCareers.map(career => (
                <option key={career} value={career}>{career}</option>
              ))}
            </select>
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="Todos">Todos los niveles</option>
              <option value="Alto">Riesgo Alto</option>
              <option value="Medio">Riesgo Medio</option>
              <option value="Bajo">Riesgo Bajo</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th onClick={() => handleSort('name')} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-200 cursor-pointer transition-colors">
                  <div className="flex items-center">Estudiante {renderSortIcon('name')}</div>
                </th>
                <th onClick={() => handleSort('career')} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-200 cursor-pointer transition-colors">
                  <div className="flex items-center">Carrera {renderSortIcon('career')}</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Asistencia
                </th>
                <th onClick={() => handleSort('riskScore')} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-200 cursor-pointer transition-colors">
                  <div className="flex items-center">Riesgo {renderSortIcon('riskScore')}</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {student.career}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {student.lastAttendance}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${riskStyles[student.riskLevel].badge}`}>
                        {riskStyles[student.riskLevel].icon}
                        {student.riskScore}%
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1.5 leading-tight">
                        {student.riskFactors.join(' · ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenInterventionModal(student)}
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Intervención
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === student.id && (
                          <DropdownMenu 
                            studentId={student.id}
                            onClose={() => setOpenMenuId(null)} 
                            onOpenProfile={() => handleOpenProfileModal(student)}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSortedStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No se encontraron estudiantes con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <CreateInterventionModal
          student={selectedStudent}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        />
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          isOpen={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
          }}
        />
      )}
    </>
  );
}
