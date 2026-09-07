import { GradeLevel, GradeCategory } from "./class";

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  classId: string;
  classCode: string;
  sectionName: string;
  subject: string;
  gradeLevel: GradeLevel;
  category: GradeCategory;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentNumber?: string;
  checkInTime: string;
  status: AttendanceStatus;
  method: "MANUAL_ENTRY" | "GEO_CHECKIN";
  verifiedLocation?: {
    latitude: number;
    longitude: number;
    distanceMeters?: number;
  };
  notes?: string;
  justification?: string;
  justificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  // Backward compatibility aliases if needed
  courseId?: string;
  courseTitle?: string;
  courseCode?: string;
}

export interface CheckInRequest {
  sessionId: string;
  studentId: string;
  latitude?: number;
  longitude?: number;
}

export interface JustificationRequest {
  recordId: string;
  justification: string;
}

export interface ResolveJustificationRequest {
  recordId: string;
  status: "APPROVED" | "REJECTED";
}

export interface AttendanceStats {
  totalClasses: number;
  totalSessions: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  attendanceRate: number;
  juniorHighRate?: number;
  seniorHighRate?: number;
  recentActivity: AttendanceRecord[];
}
