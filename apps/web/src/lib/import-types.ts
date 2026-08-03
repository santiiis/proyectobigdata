export type ImportJobStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface ImportJob {
  jobId: string;
  fileName: string;
  status: ImportJobStatus;
  totalRecords: number | null;
  processed: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  isFinished?: boolean;
}

export interface ImportStatusResponse {
  success: boolean;
  data?: ImportJob;
  error?: {
    code: string;
    message: string;
    details: any;
  };
  timestamp: string;
}

export interface ImportStartResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: ImportJobStatus;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}
