export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  name: string;
  email: string;
  parentEmail?: string;
  parentPhone?: string;
  role: UserRole;
  gender?: "MALE" | "FEMALE";
  avatarUrl?: string;
  studentId?: string;
  createdAt: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  role?: UserRole;
  lrn?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  gender?: "MALE" | "FEMALE";
  studentId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
