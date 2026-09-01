import { ClassSection, ClassSession } from '../../shared/types/class';
import { dbStore } from '../db/store';
import { generateDynamicQRToken } from '../../shared/utils/qr';

export class ClassService {
  static async getAllClasses(): Promise<ClassSection[]> {
    return await dbStore.getClasses();
  }

  static async getClassById(id: string): Promise<ClassSection | undefined> {
    return await dbStore.getClassById(id);
  }

  static async createClass(data: Omit<ClassSection, 'id' | 'createdAt' | 'category' | 'totalStudents'> & { category?: 'JUNIOR_HIGH' | 'SENIOR_HIGH'; subject?: string }): Promise<ClassSection> {
    const gradeLevel = Number(data.gradeLevel) as 7 | 8 | 9 | 10 | 11 | 12;
    const category = gradeLevel <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH';
    const enrolledStudentIds = data.enrolledStudentIds || [];
    
    // Ensure subjects is an array
    let subjects = data.subjects || [];
    if (subjects.length === 0 && data.subject) {
      subjects = [data.subject];
    }

    const newClass: ClassSection = {
      ...data,
      subjects,
      gradeLevel,
      category,
      id: (data as any).id || `cls-${Date.now()}`,
      enrolledStudentIds,
      totalStudents: enrolledStudentIds.length,
      createdAt: new Date().toISOString(),
    };

    return await dbStore.addClass(newClass);
  }

  static async updateClass(id: string, updates: Partial<ClassSection>): Promise<ClassSection> {
    if (updates.gradeLevel) {
      const g = Number(updates.gradeLevel) as 7 | 8 | 9 | 10 | 11 | 12;
      updates.gradeLevel = g;
      updates.category = g <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH';
    }
    if (updates.enrolledStudentIds) {
      updates.totalStudents = updates.enrolledStudentIds.length;
    }

    const updated = await dbStore.updateClass(id, updates);
    if (!updated) throw new Error('Class Section not found');
    return updated;
  }

  static async deleteClass(id: string): Promise<boolean> {
    return await dbStore.deleteClass(id);
  }

  static async enrollStudent(classId: string, studentId: string): Promise<ClassSection> {
    const res = await dbStore.enrollStudentToClass(classId, studentId);
    if (!res) throw new Error('Class not found');
    return res;
  }

  static async removeStudent(classId: string, studentId: string): Promise<ClassSection> {
    const res = await dbStore.removeStudentFromClass(classId, studentId);
    if (!res) throw new Error('Class not found');
    return res;
  }

  static async updateClassStudents(classId: string, studentIds: string[]): Promise<ClassSection> {
    const cls = await dbStore.getClassById(classId);
    if (!cls) throw new Error('Class not found');
    cls.enrolledStudentIds = studentIds;
    cls.totalStudents = studentIds.length;
    return cls;
  }

  // Sessions
  static async getAllSessions(): Promise<ClassSession[]> {
    return await dbStore.getSessions();
  }

  static async getSessionById(id: string): Promise<ClassSession | undefined> {
    return await dbStore.getSessionById(id);
  }

  static async createSession(data: Omit<ClassSession, 'id' | 'attendedCount'>): Promise<ClassSession> {
    const cls = await dbStore.getClassById(data.classId);
    const primarySubject = cls?.subjects?.[0] || cls?.subject || data.subject || 'General Class';
    const classCode = cls?.code || data.classCode || cls?.sectionName || 'SEC';
    const session: ClassSession = {
      ...data,
      id: (data as any).id || `sess-${Date.now()}`,
      sectionName: cls ? cls.sectionName : data.sectionName,
      classCode,
      gradeLevel: cls ? cls.gradeLevel : data.gradeLevel,
      category: cls ? cls.category : (data.gradeLevel <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH'),
      subject: data.subject || primarySubject,
      attendedCount: 0,
      totalExpectedCount: cls ? cls.enrolledStudentIds.length : (data.totalExpectedCount || 25),
    };

    if (session.status === 'ACTIVE') {
      const qrData = generateDynamicQRToken(session.id, session.classCode || session.sectionName);
      session.qrToken = qrData.token;
      session.qrExpiresAt = qrData.expiresAt;
    }

    return await dbStore.addSession(session);
  }

  static async generateSessionQR(sessionId: string): Promise<{ qrToken: string; expiresAt: string }> {
    const session = await dbStore.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const qrData = generateDynamicQRToken(session.id, session.classCode || session.sectionName);
    await dbStore.updateSession(sessionId, {
      qrToken: qrData.token,
      qrExpiresAt: qrData.expiresAt,
      status: 'ACTIVE',
    });

    return { qrToken: qrData.token, expiresAt: qrData.expiresAt };
  }
}
