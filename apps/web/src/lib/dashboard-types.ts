export interface DashboardKpis {
  totalActiveStudents: number;
  highRiskStudents: number;
  activeInterventions: number;
  resolvedInterventions: number;
}

export interface RiskDistributionData {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface HistoricalTrendData {
  semester: string;
  date: string;
  studentsProcessed: number;
}

export interface RecentAlert {
  predictionId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  career: string;
  score: number;
  topRiskFactors: any; // Ideally string[] or Record, depending on Prisma JSON output
  date: string;
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
