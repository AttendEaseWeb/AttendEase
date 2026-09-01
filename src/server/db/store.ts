import { User } from '../../shared/types/auth';
import { ClassSection, ClassSession } from '../../shared/types/class';
import { AttendanceRecord, AttendanceStats } from '../../shared/types/attendance';
import { SEED_USERS, SEED_CLASSES, SEED_SESSIONS, SEED_ATTENDANCE } from './seed';


import { supabase } from './supabase';

class DataStore {
  private users: User[] = [...SEED_USERS];
  private classes: ClassSection[] = [...SEED_CLASSES];
  private sessions: ClassSession[] = [...SEED_SESSIONS];
  private attendanceRecords: AttendanceRecord[] = [...SEED_ATTENDANCE];

  // User Methods
  async getUsers(): Promise<User[]> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data as User[];
    }
    return this.users;
  }
  
  async getUserById(id: string): Promise<User | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) return data as User;
      return undefined;
    }
    return this.users.find((u) => u.id === id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
      if (!error && data) return data as User;
      return undefined;
    }
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  
  async addUser(user: User): Promise<User> {
    if (supabase) {
      const { data, error } = await supabase.from('users').insert(user).select().single();
      if (error) console.error('Error adding user:', error);
      if (data) return data as User;
    }
    this.users.push(user);
    return user;
  }
  
  async deleteUser(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      return !error;
    }
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Class Methods
  async getClasses(): Promise<ClassSection[]> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sections').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data.map(d => ({...d, subjects: typeof d.subjects === 'string' ? JSON.parse(d.subjects) : d.subjects, enrolledStudentIds: typeof d.enrolledStudentIds === 'string' ? JSON.parse(d.enrolledStudentIds) : d.enrolledStudentIds })) as ClassSection[];
    }
    return this.classes;
  }
  
  async getClassById(id: string): Promise<ClassSection | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sections').select('*').eq('id', id).single();
      if (!error && data) return {...data, subjects: typeof data.subjects === 'string' ? JSON.parse(data.subjects) : data.subjects, enrolledStudentIds: typeof data.enrolledStudentIds === 'string' ? JSON.parse(data.enrolledStudentIds) : data.enrolledStudentIds } as ClassSection;
      return undefined;
    }
    return this.classes.find((c) => c.id === id);
  }
  
  async addClass(cls: ClassSection): Promise<ClassSection> {
    if (supabase) {
      const insertData = {...cls, subjects: JSON.stringify(cls.subjects || []), enrolledStudentIds: JSON.stringify(cls.enrolledStudentIds || [])};
      const { data, error } = await supabase.from('class_sections').insert(insertData).select().single();
      if (error) console.error('Error adding class:', error);
      if (data) return {...data, subjects: typeof data.subjects === 'string' ? JSON.parse(data.subjects) : data.subjects, enrolledStudentIds: typeof data.enrolledStudentIds === 'string' ? JSON.parse(data.enrolledStudentIds) : data.enrolledStudentIds } as ClassSection;
    }
    this.classes.push(cls);
    return cls;
  }
  
  async updateClass(id: string, updates: Partial<ClassSection>): Promise<ClassSection | undefined> {
    if (supabase) {
      const updateData = {...updates};
      if (updateData.subjects) updateData.subjects = JSON.stringify(updateData.subjects) as any;
      if (updateData.enrolledStudentIds) updateData.enrolledStudentIds = JSON.stringify(updateData.enrolledStudentIds) as any;
      const { data, error } = await supabase.from('class_sections').update(updateData).eq('id', id).select().single();
      if (error) console.error('Error updating class:', error);
      if (data) return {...data, subjects: typeof data.subjects === 'string' ? JSON.parse(data.subjects) : data.subjects, enrolledStudentIds: typeof data.enrolledStudentIds === 'string' ? JSON.parse(data.enrolledStudentIds) : data.enrolledStudentIds } as ClassSection;
      return undefined;
    }
    const idx = this.classes.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.classes[idx] = { ...this.classes[idx], ...updates };
    return this.classes[idx];
  }
  
  async deleteClass(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('class_sections').delete().eq('id', id);
      return !error;
    }
    const initialLen = this.classes.length;
    this.classes = this.classes.filter((c) => c.id !== id);
    return this.classes.length < initialLen;
  }
  
  async enrollStudentToClass(classId: string, studentId: string): Promise<ClassSection | undefined> {
    const cls = await this.getClassById(classId);
    if (!cls) return undefined;
    if (!cls.enrolledStudentIds.includes(studentId)) {
      cls.enrolledStudentIds.push(studentId);
      cls.totalStudents = cls.enrolledStudentIds.length;
      return this.updateClass(classId, { enrolledStudentIds: cls.enrolledStudentIds, totalStudents: cls.totalStudents });
    }
    return cls;
  }
  
  async removeStudentFromClass(classId: string, studentId: string): Promise<ClassSection | undefined> {
    const cls = await this.getClassById(classId);
    if (!cls) return undefined;
    cls.enrolledStudentIds = cls.enrolledStudentIds.filter((id) => id !== studentId);
    cls.totalStudents = cls.enrolledStudentIds.length;
    return this.updateClass(classId, { enrolledStudentIds: cls.enrolledStudentIds, totalStudents: cls.totalStudents });
  }

  // Session Methods
  async getSessions(): Promise<ClassSession[]> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sessions').select('*').order('date', { ascending: false });
      if (!error && data) return data as ClassSession[];
    }
    return this.sessions;
  }
  
  async getSessionById(id: string): Promise<ClassSession | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sessions').select('*').eq('id', id).single();
      if (!error && data) return data as ClassSession;
      return undefined;
    }
    return this.sessions.find((s) => s.id === id);
  }
  
  async getSessionsByClassId(classId: string): Promise<ClassSession[]> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sessions').select('*').eq('classId', classId);
      if (!error && data) return data as ClassSession[];
    }
    return this.sessions.filter((s) => s.classId === classId);
  }
  
  async addSession(session: ClassSession): Promise<ClassSession> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sessions').insert(session).select().single();
      if (error) console.error('Error adding session:', error);
      if (data) return data as ClassSession;
    }
    this.sessions.push(session);
    return session;
  }
  
  async updateSession(id: string, updates: Partial<ClassSession>): Promise<ClassSession | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('class_sessions').update(updates).eq('id', id).select().single();
      if (error) console.error('Error updating session:', error);
      if (data) return data as ClassSession;
      return undefined;
    }
    const idx = this.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.sessions[idx] = { ...this.sessions[idx], ...updates };
    return this.sessions[idx];
  }

  // Attendance Methods
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (supabase) {
      const { data, error } = await supabase.from('attendance_records').select('*').order('checkInTime', { ascending: false });
      if (!error && data) return data.map(d => ({...d, verifiedLocation: typeof d.verifiedLocation === 'string' ? JSON.parse(d.verifiedLocation) : d.verifiedLocation})) as AttendanceRecord[];
    }
    return this.attendanceRecords;
  }
  
  async getAttendanceBySessionId(sessionId: string): Promise<AttendanceRecord[]> {
    if (supabase) {
      const { data, error } = await supabase.from('attendance_records').select('*').eq('sessionId', sessionId);
      if (!error && data) return data.map(d => ({...d, verifiedLocation: typeof d.verifiedLocation === 'string' ? JSON.parse(d.verifiedLocation) : d.verifiedLocation})) as AttendanceRecord[];
    }
    return this.attendanceRecords.filter((a) => a.sessionId === sessionId);
  }
  
  async getAttendanceByStudentId(studentId: string): Promise<AttendanceRecord[]> {
    if (supabase) {
      const { data, error } = await supabase.from('attendance_records').select('*').eq('studentId', studentId);
      if (!error && data) return data.map(d => ({...d, verifiedLocation: typeof d.verifiedLocation === 'string' ? JSON.parse(d.verifiedLocation) : d.verifiedLocation})) as AttendanceRecord[];
    }
    return this.attendanceRecords.filter((a) => a.studentId === studentId);
  }
  
  async addAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    if (supabase) {
      const insertData = {...record, verifiedLocation: JSON.stringify(record.verifiedLocation || {})};
      // Check if exists
      const { data: existing } = await supabase.from('attendance_records').select('id').eq('sessionId', record.sessionId).eq('studentId', record.studentId).maybeSingle();
      if (existing) {
         const { data, error } = await supabase.from('attendance_records').update(insertData).eq('id', existing.id).select().single();
         if (data) return {...data, verifiedLocation: typeof data.verifiedLocation === 'string' ? JSON.parse(data.verifiedLocation) : data.verifiedLocation} as AttendanceRecord;
      } else {
         const { data, error } = await supabase.from('attendance_records').insert(insertData).select().single();
         if (!error) {
           // Increment count
           const session = await this.getSessionById(record.sessionId);
           if (session) await this.updateSession(session.id, { attendedCount: (session.attendedCount || 0) + 1 });
         }
         if (data) return {...data, verifiedLocation: typeof data.verifiedLocation === 'string' ? JSON.parse(data.verifiedLocation) : data.verifiedLocation} as AttendanceRecord;
      }
    }
    const existingIdx = this.attendanceRecords.findIndex(
      (a) => a.sessionId === record.sessionId && a.studentId === record.studentId
    );
    if (existingIdx !== -1) {
      this.attendanceRecords[existingIdx] = record;
    } else {
      this.attendanceRecords.unshift(record);
      const session = this.sessions.find(s => s.id === record.sessionId);
      if (session) {
        session.attendedCount += 1;
      }
    }
    return record;
  }
  
  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    if (supabase) {
      const updateData = {...updates};
      if (updateData.verifiedLocation) updateData.verifiedLocation = JSON.stringify(updateData.verifiedLocation) as any;
      const { data, error } = await supabase.from('attendance_records').update(updateData).eq('id', id).select().single();
      if (!error && data) return {...data, verifiedLocation: typeof data.verifiedLocation === 'string' ? JSON.parse(data.verifiedLocation) : data.verifiedLocation} as AttendanceRecord;
      return undefined;
    }
    const idx = this.attendanceRecords.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.attendanceRecords[idx] = { ...this.attendanceRecords[idx], ...updates };
    return this.attendanceRecords[idx];
  }
  
  async getAttendanceStats(studentId?: string): Promise<AttendanceStats> {
    const records = studentId
      ? await this.getAttendanceByStudentId(studentId)
      : await this.getAttendanceRecords();
      
    const allSessions = await this.getSessions();
    const totalSessions = studentId
      ? allSessions.length
      : allSessions.filter((s) => s.status === 'COMPLETED' || s.status === 'ACTIVE').length;

    const allClasses = await this.getClasses();

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
      totalClasses: allClasses.length,
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
