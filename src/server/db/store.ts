import { User } from '../../shared/types/auth';
import { Course, Session } from '../../shared/types/event';
import { AttendanceRecord, AttendanceStats } from '../../shared/types/attendance';
import { SEED_USERS, SEED_COURSES, SEED_SESSIONS, SEED_ATTENDANCE } from './seed';

class DataStore {
  private users: User[] = [...SEED_USERS];
  private courses: Course[] = [...SEED_COURSES];
  private sessions: Session[] = [...SEED_SESSIONS];
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

  // Course Methods
  getCourses(): Course[] {
    return this.courses;
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id);
  }

  addCourse(course: Course): Course {
    this.courses.push(course);
    return course;
  }

  updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.courses[idx] = { ...this.courses[idx], ...updates };
    return this.courses[idx];
  }

  deleteCourse(id: string): boolean {
    const initialLen = this.courses.length;
    this.courses = this.courses.filter((c) => c.id !== id);
    return this.courses.length < initialLen;
  }

  // Session Methods
  getSessions(): Session[] {
    return this.sessions;
  }

  getSessionById(id: string): Session | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  getSessionsByCourseId(courseId: string): Session[] {
    return this.sessions.filter((s) => s.courseId === courseId);
  }

  addSession(session: Session): Session {
    this.sessions.push(session);
    return session;
  }

  updateSession(id: string, updates: Partial<Session>): Session | undefined {
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
    // Check if record already exists for this student and session
    const existingIdx = this.attendanceRecords.findIndex(
      (a) => a.sessionId === record.sessionId && a.studentId === record.studentId
    );

    if (existingIdx !== -1) {
      this.attendanceRecords[existingIdx] = record;
    } else {
      this.attendanceRecords.unshift(record);
      // Increment attended count on session
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

    return {
      totalSessions,
      totalPresent,
      totalLate,
      totalAbsent,
      totalExcused,
      attendanceRate,
      recentActivity: records.slice(0, 10),
    };
  }
}

export const dbStore = new DataStore();
