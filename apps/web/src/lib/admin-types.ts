export interface Faculty {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Career {
  id: number;
  code: string;
  name: string;
  facultyId: number;
  faculty: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  semesterId: number;
  semester: {
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DIRECTOR" | "TUTOR";
  isActive: boolean;
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

// Para respuestas paginadas del User Management
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}
