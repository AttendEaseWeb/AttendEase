import { User } from '../../shared/types/auth';
import { ClassSection, ClassSession } from '../../shared/types/class';
import { AttendanceRecord, AttendanceStats } from '../../shared/types/attendance';
import { SEED_USERS, SEED_CLASSES, SEED_SESSIONS, SEED_ATTENDANCE } from './seed';

class DataStore {
  private users: User[] = [...SEED_USERS];
  private classes: ClassSection[] = [...SEED_CLASSES];
  private sessions: ClassSession[] = [...SEED_SESSIONS];
  private attendanceRecords: AttendanceRecord[] = [...SEED_ATTENDANCE];

  // User Methods
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  deleteUser(id: string): boolean {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Class Methods
  getClasses(): ClassSection[] {
    return this.classes;
  }

  getClassById(id: string): ClassSection | undefined {
    return this.classes.find((c) => c.id === id);
  }

  addClass(cls: ClassSection): ClassSection {
    this.classes.push(cls);
    return cls;
  }

  updateClass(id: string, updates: Partial<ClassSection>): ClassSection | undefined {
    const idx = this.classes.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.classes[idx] = { ...this.classes[idx], ...updates };
    return this.classes[idx];
  }

  deleteClass(id: string): boolean {
    const initialLen = this.classes.length;
    this.classes = this.classes.filter((c) => c.id !== id);
    return this.classes.length < initialLen;
  }

  enrollStudentToClass(classId: string, studentId: string): ClassSection | undefined {
    const cls = this.getClassById(classId);
    if (!cls) return undefined;
    if (!cls.enrolledStudentIds.includes(studentId)) {
      cls.enrolledStudentIds.push(studentId);
      cls.totalStudents = cls.enrolledStudentIds.length;
    }
    return cls;
  }

  removeStudentFromClass(classId: string, studentId: string): ClassSection | undefined {
    const cls = this.getClassById(classId);
    if (!cls) return undefined;
    cls.enrolledStudentIds = cls.enrolledStudentIds.filter((id) => id !== studentId);
    cls.totalStudents = cls.enrolledStudentIds.length;
    return cls;
  }

  // Session Methods
  getSessions(): ClassSession[] {
    return this.sessions;
  }

  getSessionById(id: string): ClassSession | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  getSessionsByClassId(classId: string): ClassSession[] {
    return this.sessions.filter((s) => s.classId === classId);
  }

  addSession(session: ClassSession): ClassSession {
    this.sessions.push(session);
    return session;
  }

  updateSession(id: string, updates: Partial<ClassSession>): ClassSession | undefined {
    const idx = this.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.sessions[idx] = { ...this.sessions[idx], ...updates };
    return this.sessions[idx];
  }

  // Attendance Methods
  getAttendanceRecords(): AttendanceRecord[] {
    return this.attendanceRecords;
  }

  getAttendanceBySessionId(sessionId: string): AttendanceRecord[] {
    return this.attendanceRecords.filter((a) => a.sessionId === sessionId);
  }

  getAttendanceByStudentId(studentId: string): AttendanceRecord[] {
    return this.attendanceRecords.filter((a) => a.studentId === studentId);
  }

  addAttendanceRecord(record: AttendanceRecord): AttendanceRecord {
    const existingIdx = this.attendanceRecords.findIndex(
      (a) => a.sessionId === record.sessionId && a.studentId === record.studentId
    );

    if (existingIdx !== -1) {
      this.attendanceRecords[existingIdx] = record;
    } else {
      this.attendanceRecords.unshift(record);
      const session = this.getSessionById(record.sessionId);
      if (session) {
        session.attendedCount += 1;
      }
    }
    return record;
  }

  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const idx = this.attendanceRecords.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.attendanceRecords[idx] = { ...this.attendanceRecords[idx], ...updates };
    return this.attendanceRecords[idx];
  }

  getAttendanceStats(studentId?: string): AttendanceStats {
    const records = studentId
      ? this.getAttendanceByStudentId(studentId)
      : this.attendanceRecords;

    const totalSessions = studentId
      ? this.sessions.length
      : this.sessions.filter((s) => s.status === 'COMPLETED' || s.status === 'ACTIVE').length;

    const totalPresent = records.filter((r) => r.status === 'PRESENT').length;
    const totalLate = records.filter((r) => r.status === 'LATE').length;
    const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;
    const totalExcused = records.filter((r) => r.status === 'EXCUSED').length;

    const attendedCount = totalPresent + totalLate;
    const denominator = totalSessions > 0 ? totalSessions : 1;
    const attendanceRate = Math.min(100, Math.round((attendedCount / denominator) * 100));

    // Calculate rates per category
    const jhsRecords = records.filter((r) => r.category === 'JUNIOR_HIGH');
    const shsRecords = records.filter((r) => r.category === 'SENIOR_HIGH');

    const jhsPresent = jhsRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const shsPresent = shsRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;

    const juniorHighRate = jhsRecords.length > 0 ? Math.round((jhsPresent / jhsRecords.length) * 100) : 100;
    const seniorHighRate = shsRecords.length > 0 ? Math.round((shsPresent / shsRecords.length) * 100) : 100;

    return {
      totalClasses: this.classes.length,
      totalSessions,
      totalPresent,
      totalLate,
      totalAbsent,
      totalExcused,
      attendanceRate,
      juniorHighRate,
      seniorHighRate,
      recentActivity: records.slice(0, 15),
    };
  }
}

export const dbStore = new DataStore();
