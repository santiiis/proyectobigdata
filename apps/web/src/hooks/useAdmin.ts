import { useState, useEffect, useCallback } from "react";
import type { 
  Faculty, Career, Semester, Course, AdminUser, ApiResponse, PaginatedResponse 
} from "../lib/admin-types";

// --- Base Hook para GET y Refetch ---
function useFetch<T>(url: string) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Error obteniendo datos");
      }
      
      setState({ data: result.data as T, loading: false, error: null });
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message || "Error de red" });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// --- Helper genérico para mutaciones ---
async function apiMutation(url: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: any) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "Error en la operación");
  }
  return result.data;
}

// --- FACULTIES ---
export function useFaculties() {
  const { data, loading, error, refetch } = useFetch<Faculty[]>("/api/v1/admin/faculties");
  
  const createFaculty = async (payload: { code: string; name: string }) => apiMutation("/api/v1/admin/faculties", "POST", payload).then(refetch);
  const updateFaculty = async (id: number, payload: { code: string; name: string }) => apiMutation(`/api/v1/admin/faculties/${id}`, "PUT", payload).then(refetch);
  const deleteFaculty = async (id: number) => apiMutation(`/api/v1/admin/faculties/${id}`, "DELETE").then(refetch);

  return { data, loading, error, refetch, createFaculty, updateFaculty, deleteFaculty };
}

// --- CAREERS ---
export function useCareers() {
  const { data, loading, error, refetch } = useFetch<Career[]>("/api/v1/admin/careers");
  
  const createCareer = async (payload: { code: string; name: string; facultyId: number }) => apiMutation("/api/v1/admin/careers", "POST", payload).then(refetch);
  const updateCareer = async (id: number, payload: { code: string; name: string; facultyId: number }) => apiMutation(`/api/v1/admin/careers/${id}`, "PUT", payload).then(refetch);
  const deleteCareer = async (id: number) => apiMutation(`/api/v1/admin/careers/${id}`, "DELETE").then(refetch);

  return { data, loading, error, refetch, createCareer, updateCareer, deleteCareer };
}

// --- SEMESTERS ---
export function useSemesters() {
  const { data, loading, error, refetch } = useFetch<Semester[]>("/api/v1/admin/semesters");
  
  const createSemester = async (payload: any) => apiMutation("/api/v1/admin/semesters", "POST", payload).then(refetch);
  const updateSemester = async (id: number, payload: any) => apiMutation(`/api/v1/admin/semesters/${id}`, "PUT", payload).then(refetch);
  const deleteSemester = async (id: number) => apiMutation(`/api/v1/admin/semesters/${id}`, "DELETE").then(refetch);

  return { data, loading, error, refetch, createSemester, updateSemester, deleteSemester };
}

// --- COURSES ---
export function useCourses() {
  const { data, loading, error, refetch } = useFetch<Course[]>("/api/v1/admin/courses");
  
  const createCourse = async (payload: any) => apiMutation("/api/v1/admin/courses", "POST", payload).then(refetch);
  const updateCourse = async (id: number, payload: any) => apiMutation(`/api/v1/admin/courses/${id}`, "PUT", payload).then(refetch);
  const deleteCourse = async (id: number) => apiMutation(`/api/v1/admin/courses/${id}`, "DELETE").then(refetch);

  return { data, loading, error, refetch, createCourse, updateCourse, deleteCourse };
}

// --- USERS ---
export function useUsers(page: number = 1) {
  // Manejamos paginación usando la tupla de respuesta que ya devuelve settings/users
  const { data: responseData, loading, error, refetch } = useFetch<any>(`/api/v1/settings/users?page=${page}&limit=50`);
  
  // El backend en /api/v1/settings/users devuelve paginado o lista, asumiremos lista directa de data
  const users = responseData?.data || responseData;

  const updateUserRole = async (id: string, role: string) => apiMutation(`/api/v1/settings/users/${id}`, "PATCH", { role }).then(refetch);
  const disableUser = async (id: string, isActive: boolean) => apiMutation(`/api/v1/settings/users/${id}`, "PATCH", { isActive }).then(refetch);

  return { data: users as AdminUser[], loading, error, refetch, updateUserRole, disableUser };
}
