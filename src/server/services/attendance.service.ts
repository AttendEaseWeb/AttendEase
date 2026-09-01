import { AttendanceRecord, CheckInRequest, AttendanceStats, AttendanceStatus } from '../../shared/types/attendance';
import { dbStore } from '../db/store';
import { parseQRToken } from '../../shared/utils/qr';

export class AttendanceService {
  static async getAllAttendance(): Promise<AttendanceRecord[]> {
    return await dbStore.getAttendanceRecords();
  }

  static async getAttendanceBySession(sessionId: string): Promise<AttendanceRecord[]> {
    return await dbStore.getAttendanceBySessionId(sessionId);
  }

  static async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return await dbStore.getAttendanceByStudentId(studentId);
  }

  static async checkIn(req: CheckInRequest): Promise<AttendanceRecord> {
    const session = await dbStore.getSessionById(req.sessionId);
    if (!session) {
      throw new Error('Active session not found');
    }

    const student = await dbStore.getUserById(req.studentId);
    if (!student) {
      throw new Error('Student user record not found');
    }

    // Verify QR token if provided
    if (req.qrToken) {
      const decoded = parseQRToken(req.qrToken);
      if (!decoded) {
        throw new Error('Invalid QR Code format');
      }
      if (decoded.sessionId !== req.sessionId) {
        throw new Error('QR code is for a different active session');
      }
      if (decoded.expiresAt < Date.now()) {
        throw new Error('QR code has expired. Please scan the refreshed code.');
      }
    }

    let status: AttendanceStatus = 'PRESENT';
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      sessionId: session.id,
      classId: session.classId,
      classCode: session.classCode,
      sectionName: session.sectionName,
      subject: session.subject,
      gradeLevel: session.gradeLevel,
      category: session.category,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentNumber: student.studentId || 'ST-2026-99',
      checkInTime: new Date().toISOString(),
      status,
      method: req.qrToken ? 'QR_SCAN' : 'GEO_CHECKIN',
      verifiedLocation: req.latitude && req.longitude ? {
        latitude: req.latitude,
        longitude: req.longitude,
        distanceMeters: 12,
      } : undefined,
      notes: 'Verified live class check-in',
      // Backward compatibility aliases
      courseId: session.classId,
      courseCode: session.classCode,
      courseTitle: session.sectionName,
    };

    return await dbStore.addAttendanceRecord(record);
  }

  static async manualCheckIn(data: {
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }): AttendanceRecord {
    const session = await dbStore.getSessionById(data.sessionId);
    if (!session) throw new Error('Session not found');

    const student = await dbStore.getUserById(data.studentId);
    if (!student) throw new Error('Student not found');

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      sessionId: session.id,
      classId: session.classId,
      classCode: session.classCode,
      sectionName: session.sectionName,
      subject: session.subject,
      gradeLevel: session.gradeLevel,
      category: session.category,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentNumber: student.studentId || 'ST-2026-99',
      checkInTime: new Date().toISOString(),
      status: data.status,
      method: 'MANUAL_ENTRY',
      notes: data.notes || 'Manual override by Instructor/Admin',
      // Backward compatibility aliases
      courseId: session.classId,
      courseCode: session.classCode,
      courseTitle: session.sectionName,
    };

    return await dbStore.addAttendanceRecord(record);
  }

  static async getStats(studentId?: string): Promise<AttendanceStats> {
    return await dbStore.getAttendanceStats(studentId);
  }
}
