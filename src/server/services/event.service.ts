import { Course, Session } from '../../shared/types/event';
import { dbStore } from '../db/store';
import { generateDynamicQRToken } from '../../shared/utils/qr';

export class EventService {
  static getAllCourses(): Course[] {
    return dbStore.getCourses();
  }

  static getCourseById(id: string): Course | undefined {
    return dbStore.getCourseById(id);
  }

  static createCourse(data: Omit<Course, 'id' | 'createdAt'>): Course {
    const course: Course = {
      ...data,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return dbStore.addCourse(course);
  }

  static updateCourse(id: string, updates: Partial<Course>): Course {
    const updated = dbStore.updateCourse(id, updates);
    if (!updated) throw new Error('Course not found');
    return updated;
  }

  static deleteCourse(id: string): boolean {
    return dbStore.deleteCourse(id);
  }

  static getAllSessions(): Session[] {
    return dbStore.getSessions();
  }

  static getSessionById(id: string): Session | undefined {
    return dbStore.getSessionById(id);
  }

  static createSession(data: Omit<Session, 'id' | 'attendedCount'>): Session {
    const course = dbStore.getCourseById(data.courseId);
    const session: Session = {
      ...data,
      id: `s-${Date.now()}`,
      courseTitle: course ? course.title : data.courseTitle,
      courseCode: course ? course.code : data.courseCode,
      attendedCount: 0,
      totalExpectedCount: course ? course.totalStudents : 30,
    };

    if (session.status === 'ACTIVE') {
      const qrData = generateDynamicQRToken(session.id, session.courseCode);
      session.qrToken = qrData.token;
      session.qrExpiresAt = qrData.expiresAt;
    }

    return dbStore.addSession(session);
  }

  static generateSessionQR(sessionId: string): { qrToken: string; expiresAt: string } {
    const session = dbStore.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const qrData = generateDynamicQRToken(session.id, session.courseCode);
    dbStore.updateSession(sessionId, {
      qrToken: qrData.token,
      qrExpiresAt: qrData.expiresAt,
      status: 'ACTIVE',
    });

    return { qrToken: qrData.token, expiresAt: qrData.expiresAt };
  }
}
