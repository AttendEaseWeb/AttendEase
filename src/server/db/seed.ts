import { User } from '../../shared/types/auth';
import { Course, Session } from '../../shared/types/event';
import { AttendanceRecord } from '../../shared/types/attendance';

export const SEED_USERS: User[] = [
  {
    id: 'u-test-student',
    name: 'Test Student',
    email: 'test.student@attendease.edu',
    role: 'STUDENT',
    studentId: 'ST-2026-0001',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-test-instructor',
    name: 'Test Instructor',
    email: 'test.instructor@attendease.edu',
    role: 'INSTRUCTOR',
    department: 'Information Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-test-admin',
    name: 'Test Admin',
    email: 'test.admin@attendease.edu',
    role: 'ADMIN',
    department: 'Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_COURSES: Course[] = [];

export const SEED_SESSIONS: Session[] = [];

export const SEED_ATTENDANCE: AttendanceRecord[] = [];

