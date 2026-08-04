export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  department: string;
  schedule: string;
  room: string;
  totalStudents: number;
  color: string;
  createdAt: string;
}

export type SessionStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Session {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
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
  courseCode: string;
  timestamp: number;
  expiresAt: number;
  secret: string;
}
