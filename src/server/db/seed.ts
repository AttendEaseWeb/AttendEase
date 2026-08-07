import { User } from '../../shared/types/auth';
import { ClassSection, ClassSession } from '../../shared/types/class';
import { AttendanceRecord } from '../../shared/types/attendance';

export const SEED_USERS: User[] = [
  {
    id: 'u-test-student',
    name: 'Alex Morgan',
    email: 'test.student@attendease.edu',
    role: 'STUDENT',
    studentId: 'ST-2026-0001',
    department: 'Grade 11 STEM',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-student-jhs1',
    name: 'Maria Santos',
    email: 'maria.santos@attendease.edu',
    role: 'STUDENT',
    studentId: 'ST-2026-0007',
    department: 'Grade 7 Junior High',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-student-jhs2',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@attendease.edu',
    role: 'STUDENT',
    studentId: 'ST-2026-0009',
    department: 'Grade 9 Junior High',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-student-shs1',
    name: 'Sophia Reyes',
    email: 'sophia.reyes@attendease.edu',
    role: 'STUDENT',
    studentId: 'ST-2026-0012',
    department: 'Grade 12 ABM',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-student-shs2',
    name: 'Ethan Vance',
    email: 'ethan.vance@attendease.edu',
    role: 'STUDENT',
    studentId: 'ST-2026-0011',
    department: 'Grade 11 STEM',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-test-instructor',
    name: 'Prof. David Miller',
    email: 'test.instructor@attendease.edu',
    role: 'INSTRUCTOR',
    department: 'STEM & Science Faculty',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-instructor-2',
    name: 'Dr. Sarah Lin',
    email: 'sarah.lin@attendease.edu',
    role: 'INSTRUCTOR',
    department: 'Mathematics & Junior High Faculty',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-test-admin',
    name: 'Admin Coordinator',
    email: 'test.admin@attendease.edu',
    role: 'ADMIN',
    department: 'Academic Affairs & Registration',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_CLASSES: ClassSection[] = [];

export const SEED_SESSIONS: ClassSession[] = [];

export const SEED_ATTENDANCE: AttendanceRecord[] = [];
