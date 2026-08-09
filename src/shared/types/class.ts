export type GradeLevel = 7 | 8 | 9 | 10 | 11 | 12;

export type GradeCategory = 'JUNIOR_HIGH' | 'SENIOR_HIGH';

export type SeniorHighStrand = 'STEM' | 'ABM' | 'HUMSS' | 'TVL' | 'GAS';

export interface ClassSection {
  id: string;
  sectionName: string; // e.g. "7-A St. Jude", "11-STEM Alpha"
  gradeLevel: GradeLevel; // 7, 8, 9, 10, 11, 12
  category: GradeCategory; // 'JUNIOR_HIGH' or 'SENIOR_HIGH'
  subjects: string[]; // List of subjects under this specific section
  strand?: SeniorHighStrand; // for SHS (11 & 12)
  instructorId: string;
  instructorName: string;
  description: string;
  enrolledStudentIds: string[];
  totalStudents: number;
  color?: string;
  createdAt: string;
  // Optional backward compatibility
  code?: string;
  subject?: string;
  schedule?: string;
  room?: string;
}

type SessionStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ClassSession {
  id: string;
  classId: string;
  classCode?: string;
  sectionName: string;
  gradeLevel: GradeLevel;
  category: GradeCategory;
  subject: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  status: SessionStatus;
  qrToken?: string;
  qrExpiresAt?: string;
  allowGeofence?: boolean;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  attendedCount: number;
  totalExpectedCount: number;
}

export interface QRTokenData {
  sessionId: string;
  classCode: string;
  timestamp: number;
  expiresAt: number;
  secret: string;
}
