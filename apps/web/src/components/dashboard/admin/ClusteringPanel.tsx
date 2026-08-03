"use client";

import React from "react";
import { Users, BarChart3, Loader2, PieChart } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

interface ClusterProfile {
  cluster_id: number;
  size: number;
  percentage: number;
  mean_gpa: number;
  mean_failed: number;
  mean_attendance: number;
  mean_lms: number;
  label: string;
}

export default function ClusteringPanel() {
  const { data, error, isLoading } = useSWR(
    "/api/v1/admin/clustering/summary",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando clustering...
        </div>
      </div>
    );
  }

  const profiles: ClusterProfile[] = data?.profiles || [];
  const nClusters = data?.n_clusters || 0;
  const silhouette = data?.silhouette_score || 0;

  const getClusterColor = (label: string) => {
    if (label.includes("Alto")) return "bg-red-100 border-red-300 text-red-800";
    if (label.includes("Medio")) return "bg-amber-100 border-amber-300 text-amber-800";
    return "bg-green-100 border-green-300 text-green-800";
  };

  const getBarColor = (label: string) => {
    if (label.includes("Alto")) return "bg-red-500";
    if (label.includes("Medio")) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Clustering de Perfiles
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Segmentación automática de estudiantes por comportamiento académico
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            <span className="text-slate-500 text-sm font-medium">Clusters</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{nClusters}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-slate-500 text-sm font-medium">Silhouette</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(silhouette * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Cluster Cards */}
      {profiles.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No hay datos de clustering disponibles. Ejecute el entrenamiento primero.
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.cluster_id}
              className={`border rounded-xl p-4 ${getClusterColor(profile.label)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">
                    Cluster {profile.cluster_id}: {profile.label}
                  </h3>
                  <p className="text-sm opacity-75">
                    {profile.size} estudiantes ({profile.percentage}%)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">GPA Promedio</div>
                  <div className="text-xl font-bold">{profile.mean_gpa}</div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Asistencia</span>
                    <span>{(profile.mean_attendance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getBarColor(profile.label)}`}
                      style={{ width: `${profile.mean_attendance * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Actividad LMS</span>
                    <span>{profile.mean_lms.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getBarColor(profile.label)}`}
                      style={{
                        width: `${Math.min((profile.mean_lms / 100) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span>Materias Reprobadas: {profile.mean_failed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
