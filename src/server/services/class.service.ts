import { ClassSection, ClassSession } from '../../shared/types/class';
import { dbStore } from '../db/store';
import { generateDynamicQRToken } from '../../shared/utils/qr';

export class ClassService {
  static getAllClasses(): ClassSection[] {
    return dbStore.getClasses();
  }

  static getClassById(id: string): ClassSection | undefined {
    return dbStore.getClassById(id);
  }

  static createClass(data: Omit<ClassSection, 'id' | 'createdAt' | 'category' | 'totalStudents'> & { category?: 'JUNIOR_HIGH' | 'SENIOR_HIGH' }): ClassSection {
    const gradeLevel = Number(data.gradeLevel) as 7 | 8 | 9 | 10 | 11 | 12;
    const category = gradeLevel <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH';
    const enrolledStudentIds = data.enrolledStudentIds || [];

    const newClass: ClassSection = {
      ...data,
      gradeLevel,
      category,
      id: `cls-${Date.now()}`,
      enrolledStudentIds,
      totalStudents: enrolledStudentIds.length,
      createdAt: new Date().toISOString(),
    };

    return dbStore.addClass(newClass);
  }

  static updateClass(id: string, updates: Partial<ClassSection>): ClassSection {
    if (updates.gradeLevel) {
      const g = Number(updates.gradeLevel) as 7 | 8 | 9 | 10 | 11 | 12;
      updates.gradeLevel = g;
      updates.category = g <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH';
    }
    if (updates.enrolledStudentIds) {
      updates.totalStudents = updates.enrolledStudentIds.length;
    }

    const updated = dbStore.updateClass(id, updates);
    if (!updated) throw new Error('Class Section not found');
    return updated;
  }

  static deleteClass(id: string): boolean {
    return dbStore.deleteClass(id);
  }

  static enrollStudent(classId: string, studentId: string): ClassSection {
    const res = dbStore.enrollStudentToClass(classId, studentId);
    if (!res) throw new Error('Class not found');
    return res;
  }

  static removeStudent(classId: string, studentId: string): ClassSection {
    const res = dbStore.removeStudentFromClass(classId, studentId);
    if (!res) throw new Error('Class not found');
    return res;
  }

  static updateClassStudents(classId: string, studentIds: string[]): ClassSection {
    const cls = dbStore.getClassById(classId);
    if (!cls) throw new Error('Class not found');
    cls.enrolledStudentIds = studentIds;
    cls.totalStudents = studentIds.length;
    return cls;
  }

  // Sessions
  static getAllSessions(): ClassSession[] {
    return dbStore.getSessions();
  }

  static getSessionById(id: string): ClassSession | undefined {
    return dbStore.getSessionById(id);
  }

  static createSession(data: Omit<ClassSession, 'id' | 'attendedCount'>): ClassSession {
    const cls = dbStore.getClassById(data.classId);
    const session: ClassSession = {
      ...data,
      id: `sess-${Date.now()}`,
      sectionName: cls ? cls.sectionName : data.sectionName,
      classCode: cls ? cls.code : data.classCode,
      gradeLevel: cls ? cls.gradeLevel : data.gradeLevel,
      category: cls ? cls.category : (data.gradeLevel <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH'),
      subject: cls ? cls.subject : data.subject,
      attendedCount: 0,
      totalExpectedCount: cls ? cls.enrolledStudentIds.length : (data.totalExpectedCount || 25),
    };

    if (session.status === 'ACTIVE') {
      const qrData = generateDynamicQRToken(session.id, session.classCode);
      session.qrToken = qrData.token;
      session.qrExpiresAt = qrData.expiresAt;
    }

    return dbStore.addSession(session);
  }

  static generateSessionQR(sessionId: string): { qrToken: string; expiresAt: string } {
    const session = dbStore.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const qrData = generateDynamicQRToken(session.id, session.classCode);
    dbStore.updateSession(sessionId, {
      qrToken: qrData.token,
      qrExpiresAt: qrData.expiresAt,
      status: 'ACTIVE',
    });

    return { qrToken: qrData.token, expiresAt: qrData.expiresAt };
  }
}
