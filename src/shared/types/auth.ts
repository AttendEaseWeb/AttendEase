export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  parentPhone?: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  studentId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
