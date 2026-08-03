/**
 * Shared API Types
 *
 * Spec: Sección 12.1 — Formatos estándar de respuesta
 * TypeScript types for API request/response contracts.
 */

// ── Response Wrappers ──

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginatedMeta;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown;
  };
  timestamp: string;
}

// ── Auth DTOs ──

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "DIRECTOR" | "TUTOR";
  };
}

// ── Student DTOs ──

export interface StudentListItem {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  career: string;
  currentSemester: number;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED";
  activePrediction: {
    score: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    modelVersion: string;
  } | null;
}

export interface StudentDetailData {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  career: {
    id: number;
    name: string;
    faculty: string;
  };
  currentSemester: number;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED";
  academicSummary: {
    gpa: number;
    failedSubjectsCount: number;
    attendanceRate: number;
    lmsActivityScore: number; // D14: mapped from lmsScore in Prisma
  };
  activePrediction: {
    id: number;
    score: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    topRiskFactors: string[];
    modelVersion: string;
    createdAt: string;
  } | null;
}

// ── ML / Prediction DTOs ──

export interface MLFeatures {
  gpa: number;
  failedSubjectsCount: number;
  attendanceRate: number;
  paymentDelayDays: number; // Computed from Payment records
  lmsActivityScore: number; // D14: mapped from lmsScore
  creditsRatio: number; // Computed from enrollment data
}

export interface MLPredictRequest {
  studentId: number;
  features: MLFeatures;
}

export interface MLPredictResponse {
  studentId: number;
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  topRiskFactors: string[];
  modelVersion: string;
  executionTimeMs: number;
}

export interface BatchRunRequest {
  semesterCode: string;
  forceRetrain: boolean;
}

export interface BatchRunResponseData {
  jobId: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  message: string;
}

// ── Intervention DTOs ──

export interface CreateInterventionRequest {
  studentId: number;
  assignedUserId: number; // Maps to userId in Prisma
  title: string;
  notes: string;
}

export interface UpdateInterventionRequest {
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  notes: string;
}

// ── Report DTOs ──

export interface ReportExportQuery {
  format: "pdf" | "xlsx" | "csv";
  type: "FACULTY" | "CAREER" | "PERIOD" | "AUDIT";
  careerId?: number;
  semesterCode?: string;
}

// ── Settings DTOs ──

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "DIRECTOR" | "TUTOR";
}
