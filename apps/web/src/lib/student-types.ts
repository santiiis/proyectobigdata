export interface StudentProfile {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  currentSemester: number;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED";
  career: {
    id: number;
    name: string;
    faculty: string;
  };
  academicSummary: {
    gpa: number;
    failedSubjectsCount: number;
    attendanceRate: number;
    lmsActivityScore: number;
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

export interface AcademicHistoryItem {
  id: number;
  period: string;
  gpa: number;
  failedSubjects: number;
  attendanceRate: number;
  lmsScore: number;
  createdAt: string;
}

export interface PredictionHistoryItem {
  id: number;
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  topRiskFactors: any; // Prisma JSON type
  modelVersion: string;
  calculatedAt: string;
}

export interface StudentIntervention {
  id: number;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo: string;
  notes: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details: any;
  };
  timestamp: string;
}
