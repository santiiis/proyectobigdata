"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
}

interface CreateInterventionModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const titleMap: Record<string, string> = {
  ACADEMIC: "Tutoría Académica de Refuerzo",
  PSYCHOLOGICAL: "Apoyo Psicopedagógico",
  FINANCIAL: "Orientación de Plan de Pagos",
  FOLLOW_UP: "Entrevista de Seguimiento",
};

export default function CreateInterventionModal({ student, isOpen, onClose }: CreateInterventionModalProps) {
  const [type, setType] = useState('ACADEMIC');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(student.id, 10),
          title: titleMap[type] || type,
          notes,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || result.error || 'Error al crear la intervención');
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNotes('');
        setType('ACADEMIC');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la intervención');
      console.error('Error al crear intervención:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Crear Intervención</h2>
            <p className="text-sm text-slate-500 mt-0.5">Estudiante: <span className="font-medium text-slate-700">{student.name}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Intervención</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            >
              <option value="ACADEMIC">Tutoría Académica de Refuerzo</option>
              <option value="PSYCHOLOGICAL">Apoyo Psicopedagógico</option>
              <option value="FINANCIAL">Orientación de Plan de Pagos</option>
              <option value="FOLLOW_UP">Entrevista de Seguimiento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observaciones / Compromisos</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe los acuerdos alcanzados con el estudiante..."
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          {errorMsg && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                success
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              } disabled:cursor-not-allowed`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              ) : success ? (
                '✓ Intervención Registrada'
              ) : (
                'Guardar Intervención'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
