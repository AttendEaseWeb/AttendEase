export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentNumber?: string;
  checkInTime: string;
  status: AttendanceStatus;
  method: 'QR_SCAN' | 'MANUAL_ENTRY' | 'GEO_CHECKIN';
  verifiedLocation?: {
    latitude: number;
    longitude: number;
    distanceMeters?: number;
  };
  notes?: string;
}

export interface CheckInRequest {
  sessionId: string;
  studentId: string;
  qrToken?: string;
  latitude?: number;
  longitude?: number;
}

export interface AttendanceStats {
  totalSessions: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  attendanceRate: number;
  recentActivity: AttendanceRecord[];
}
