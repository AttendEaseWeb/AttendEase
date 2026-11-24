import { ExcuseRequest } from "../../shared/types/attendance";
import { User } from "../../shared/types/auth";
import { ClassSection, ClassSession } from "../../shared/types/class";
import {
  AttendanceRecord,
  AttendanceStats,
} from "../../shared/types/attendance";
import { supabase } from "./supabase";

class DataStore {
  private users: User[] = [];
  private classes: ClassSection[] = [];
  private sessions: ClassSession[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  public excuseRequests: ExcuseRequest[] = [];
  private supabaseDisabledUntil = 0;
  private loggedOfflineWarning = false;

  private canUseSupabase(): boolean {
    return Boolean(supabase) && Date.now() >= this.supabaseDisabledUntil;
  }

  private isNetworkError(error: any): boolean {
    if (!error) return false;
    const text = `${error.message || ""} ${error.details || ""} ${error.code || ""}`;
    return (
      text.includes("fetch failed") ||
      text.includes("ENOTFOUND") ||
      text.includes("ECONNREFUSED") ||
      text.includes("ETIMEDOUT") ||
      text.includes("EAI_AGAIN") ||
      text.includes("UND_ERR_CONNECT_TIMEOUT")
    );
  }

  private handleSupabaseError(context: string, error: any): boolean {
    if (this.isNetworkError(error)) {
      this.supabaseDisabledUntil = Date.now() + 5 * 60 * 1000;
      if (!this.loggedOfflineWarning) {
        this.loggedOfflineWarning = true;
        console.warn(
          `[DataStore] Supabase unreachable (${error?.message || "network error"}). Falling back to in-memory storage.`,
        );
      }
      return true;
    }
    console.warn(`[DataStore] ${context}:`, error?.message || error);
    return false;
  }

  private normalizeClass(d: any): ClassSection {
    return {
      ...d,
      subjects:
        typeof d.subjects === "string" ? JSON.parse(d.subjects) : d.subjects,
      enrolledStudentIds:
        typeof d.enrolledStudentIds === "string"
          ? JSON.parse(d.enrolledStudentIds)
          : d.enrolledStudentIds || [],
    } as ClassSection;
  }

  private normalizeAttendance(d: any): AttendanceRecord {
    return {
      ...d,
      verifiedLocation:
        typeof d.verifiedLocation === "string"
          ? JSON.parse(d.verifiedLocation)
          : d.verifiedLocation,
    } as AttendanceRecord;
  }

  // User Methods
  async getUsers(): Promise<User[]> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("users")
          .select("*")
          .order("createdAt", { ascending: false });
        if (!error && data) return data as User[];
        if (error) this.handleSupabaseError("getUsers", error);
      } catch (err) {
        this.handleSupabaseError("getUsers", err);
      }
    }
    return this.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("users")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return data as User;
        if (!error && !data) return undefined;
        if (error) this.handleSupabaseError("getUserById", error);
      } catch (err) {
        this.handleSupabaseError("getUserById", err);
      }
    }
    return this.users.find((u) => u.id === id);
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("users")
          .select("*")
          .eq("studentId", studentId)
          .maybeSingle();
        if (!error && data) return data as User;
        if (!error && !data) return undefined;
        if (error) this.handleSupabaseError("getUserByStudentId", error);
      } catch (err) {
        this.handleSupabaseError("getUserByStudentId", err);
      }
    }
    return this.users.find((u) => u.studentId === studentId);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("users")
          .select("*")
          .ilike("email", email)
          .maybeSingle();
        if (!error && data) return data as User;
        if (!error && !data) return undefined;
        if (error) this.handleSupabaseError("getUserByEmail", error);
      } catch (err) {
        this.handleSupabaseError("getUserByEmail", err);
      }
    }
    return this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async addUser(user: User): Promise<User> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("users")
          .insert(user)
          .select()
          .single();
        if (error) {
          if (error.code === "42703" && error.message.includes("gender")) {
            console.warn(
              "⚠️ SUPABASE SCHEMA WARNING: Add a 'gender' column (text) to your 'users' table in Supabase to persist gender information.",
            );
            const { gender: _gender, ...userWithoutGender } = user;
            const retry = await supabase!
              .from("users")
              .insert(userWithoutGender)
              .select()
              .single();
            if (retry.data) return retry.data as User;
          } else {
            this.handleSupabaseError("addUser", error);
          }
        }
        if (data) return data as User;
      } catch (err) {
        this.handleSupabaseError("addUser", err);
      }
    }
    this.users.push(user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.canUseSupabase()) {
      try {
        const { error } = await supabase!.from("users").delete().eq("id", id);
        if (!error) return true;
        this.handleSupabaseError("deleteUser", error);
      } catch (err) {
        this.handleSupabaseError("deleteUser", err);
      }
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
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sections")
          .select("*")
          .order("createdAt", { ascending: false });
        if (!error && data) return data.map((d) => this.normalizeClass(d));
        if (error) this.handleSupabaseError("getClasses", error);
      } catch (err) {
        this.handleSupabaseError("getClasses", err);
      }
    }
    return this.classes;
  }

  async getClassById(id: string): Promise<ClassSection | undefined> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sections")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return this.normalizeClass(data);
        if (!error && !data) return undefined;
        if (error) this.handleSupabaseError("getClassById", error);
      } catch (err) {
        this.handleSupabaseError("getClassById", err);
      }
    }
    return this.classes.find((c) => c.id === id);
  }

  async addClass(cls: ClassSection): Promise<ClassSection> {
    if (this.canUseSupabase()) {
      try {
        const insertData = {
          ...cls,
          subjects: JSON.stringify(cls.subjects || []),
          enrolledStudentIds: JSON.stringify(cls.enrolledStudentIds || []),
        };
        const { data, error } = await supabase!
          .from("class_sections")
          .insert(insertData)
          .select()
          .single();
        if (error) this.handleSupabaseError("addClass", error);
        if (data) return this.normalizeClass(data);
      } catch (err) {
        this.handleSupabaseError("addClass", err);
      }
    }
    this.classes.push(cls);
    return cls;
  }

  async updateClass(
    id: string,
    updates: Partial<ClassSection>,
  ): Promise<ClassSection | undefined> {
    if (this.canUseSupabase()) {
      try {
        const updateData = { ...updates };
        if (updateData.subjects)
          updateData.subjects = JSON.stringify(updateData.subjects) as any;
        if (updateData.enrolledStudentIds)
          updateData.enrolledStudentIds = JSON.stringify(
            updateData.enrolledStudentIds,
          ) as any;
        const { data, error } = await supabase!
          .from("class_sections")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return this.normalizeClass(data);
        if (error) this.handleSupabaseError("updateClass", error);
      } catch (err) {
        this.handleSupabaseError("updateClass", err);
      }
    }
    const idx = this.classes.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.classes[idx] = { ...this.classes[idx], ...updates };
    return this.classes[idx];
  }

  async deleteClass(id: string): Promise<boolean> {
    if (this.canUseSupabase()) {
      try {
        const { error } = await supabase!
          .from("class_sections")
          .delete()
          .eq("id", id);
        if (!error) return true;
        this.handleSupabaseError("deleteClass", error);
      } catch (err) {
        this.handleSupabaseError("deleteClass", err);
      }
    }
    const initialLen = this.classes.length;
    this.classes = this.classes.filter((c) => c.id !== id);
    return this.classes.length < initialLen;
  }

  async enrollStudentToClass(
    classId: string,
    studentId: string,
  ): Promise<ClassSection | undefined> {
    const cls = await this.getClassById(classId);
    if (!cls) return undefined;
    if (!cls.enrolledStudentIds.includes(studentId)) {
      cls.enrolledStudentIds.push(studentId);
      cls.totalStudents = cls.enrolledStudentIds.length;
      return this.updateClass(classId, {
        enrolledStudentIds: cls.enrolledStudentIds,
        totalStudents: cls.totalStudents,
      });
    }
    return cls;
  }

  async removeStudentFromClass(
    classId: string,
    studentId: string,
  ): Promise<ClassSection | undefined> {
    const cls = await this.getClassById(classId);
    if (!cls) return undefined;
    cls.enrolledStudentIds = cls.enrolledStudentIds.filter(
      (id) => id !== studentId,
    );
    cls.totalStudents = cls.enrolledStudentIds.length;
    return this.updateClass(classId, {
      enrolledStudentIds: cls.enrolledStudentIds,
      totalStudents: cls.totalStudents,
    });
  }

  // Session Methods
  async getSessions(): Promise<ClassSession[]> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sessions")
          .select("*")
          .order("date", { ascending: false });
        if (!error && data) return data as ClassSession[];
        if (error) this.handleSupabaseError("getSessions", error);
      } catch (err) {
        this.handleSupabaseError("getSessions", err);
      }
    }
    return this.sessions;
  }

  async getSessionById(id: string): Promise<ClassSession | undefined> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sessions")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return data as ClassSession;
        if (!error && !data) return undefined;
        if (error) this.handleSupabaseError("getSessionById", error);
      } catch (err) {
        this.handleSupabaseError("getSessionById", err);
      }
    }
    return this.sessions.find((s) => s.id === id);
  }

  async getSessionsByClassId(classId: string): Promise<ClassSession[]> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sessions")
          .select("*")
          .eq("classId", classId);
        if (!error && data) return data as ClassSession[];
        if (error) this.handleSupabaseError("getSessionsByClassId", error);
      } catch (err) {
        this.handleSupabaseError("getSessionsByClassId", err);
      }
    }
    return this.sessions.filter((s) => s.classId === classId);
  }

  async addSession(session: ClassSession): Promise<ClassSession> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sessions")
          .insert(session)
          .select()
          .single();
        if (error) this.handleSupabaseError("addSession", error);
        if (data) return data as ClassSession;
      } catch (err) {
        this.handleSupabaseError("addSession", err);
      }
    }
    this.sessions.push(session);
    return session;
  }

  async updateSession(
    id: string,
    updates: Partial<ClassSession>,
  ): Promise<ClassSession | undefined> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("class_sessions")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data as ClassSession;
        if (error) this.handleSupabaseError("updateSession", error);
      } catch (err) {
        this.handleSupabaseError("updateSession", err);
      }
    }
    const idx = this.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.sessions[idx] = { ...this.sessions[idx], ...updates };
    return this.sessions[idx];
  }

  // Attendance Methods
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("attendance_records")
          .select("*")
          .order("checkInTime", { ascending: false });
        if (!error && data) return data.map((d) => this.normalizeAttendance(d));
        if (error) this.handleSupabaseError("getAttendanceRecords", error);
      } catch (err) {
        this.handleSupabaseError("getAttendanceRecords", err);
      }
    }
    return this.attendanceRecords;
  }

  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("attendance_records")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return this.normalizeAttendance(data);
        if (!error && !data) return null;
        if (error) this.handleSupabaseError("getAttendanceRecordById", error);
      } catch (err) {
        this.handleSupabaseError("getAttendanceRecordById", err);
      }
    }
    return this.attendanceRecords.find((a) => a.id === id) || null;
  }

  async getAttendanceBySessionId(
    sessionId: string,
  ): Promise<AttendanceRecord[]> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("attendance_records")
          .select("*")
          .eq("sessionId", sessionId);
        if (!error && data) return data.map((d) => this.normalizeAttendance(d));
        if (error) this.handleSupabaseError("getAttendanceBySessionId", error);
      } catch (err) {
        this.handleSupabaseError("getAttendanceBySessionId", err);
      }
    }
    return this.attendanceRecords.filter((a) => a.sessionId === sessionId);
  }

  async getAttendanceByStudentId(
    studentId: string,
  ): Promise<AttendanceRecord[]> {
    if (this.canUseSupabase()) {
      try {
        const { data, error } = await supabase!
          .from("attendance_records")
          .select("*")
          .eq("studentId", studentId);
        if (!error && data) return data.map((d) => this.normalizeAttendance(d));
        if (error) this.handleSupabaseError("getAttendanceByStudentId", error);
      } catch (err) {
        this.handleSupabaseError("getAttendanceByStudentId", err);
      }
    }
    return this.attendanceRecords.filter((a) => a.studentId === studentId);
  }

  async addAttendanceRecord(
    record: AttendanceRecord,
  ): Promise<AttendanceRecord> {
    if (this.canUseSupabase()) {
      try {
        const insertData = {
          ...record,
          verifiedLocation: JSON.stringify(record.verifiedLocation || {}),
        };
        const { data: existing, error: existingErr } = await supabase!
          .from("attendance_records")
          .select("id")
          .eq("sessionId", record.sessionId)
          .eq("studentId", record.studentId)
          .maybeSingle();

        if (existingErr) {
          this.handleSupabaseError("addAttendanceRecord:lookup", existingErr);
        } else if (existing) {
          const { data, error } = await supabase!
            .from("attendance_records")
            .update(insertData)
            .eq("id", existing.id)
            .select()
            .single();
          if (error) this.handleSupabaseError("addAttendanceRecord:update", error);
          if (data) return this.normalizeAttendance(data);
        } else {
          const { data, error } = await supabase!
            .from("attendance_records")
            .insert(insertData)
            .select()
            .single();
          if (error) {
            this.handleSupabaseError("addAttendanceRecord:insert", error);
          } else {
            const session = await this.getSessionById(record.sessionId);
            if (session)
              await this.updateSession(session.id, {
                attendedCount: (session.attendedCount || 0) + 1,
              });
          }
          if (data) return this.normalizeAttendance(data);
        }
      } catch (err) {
        this.handleSupabaseError("addAttendanceRecord", err);
      }
    }
    const existingIdx = this.attendanceRecords.findIndex(
      (a) =>
        a.sessionId === record.sessionId && a.studentId === record.studentId,
    );
    if (existingIdx !== -1) {
      this.attendanceRecords[existingIdx] = record;
    } else {
      this.attendanceRecords.unshift(record);
      const session = this.sessions.find((s) => s.id === record.sessionId);
      if (session) {
        session.attendedCount += 1;
      }
    }
    return record;
  }

  async updateAttendanceRecord(
    id: string,
    updates: Partial<AttendanceRecord>,
  ): Promise<AttendanceRecord | undefined> {
    if (this.canUseSupabase()) {
      try {
        const updateData = { ...updates };
        if (updateData.verifiedLocation)
          updateData.verifiedLocation = JSON.stringify(
            updateData.verifiedLocation,
          ) as any;
        const { data, error } = await supabase!
          .from("attendance_records")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return this.normalizeAttendance(data);
        if (error) this.handleSupabaseError("updateAttendanceRecord", error);
      } catch (err) {
        this.handleSupabaseError("updateAttendanceRecord", err);
      }
    }
    const idx = this.attendanceRecords.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.attendanceRecords[idx] = {
      ...this.attendanceRecords[idx],
      ...updates,
    };
    return this.attendanceRecords[idx];
  }

  async getAttendanceStats(studentId?: string): Promise<AttendanceStats> {
    const records = studentId
      ? await this.getAttendanceByStudentId(studentId)
      : await this.getAttendanceRecords();

    const allSessions = await this.getSessions();
    const totalSessions = studentId
      ? allSessions.length
      : allSessions.filter(
          (s) => s.status === "COMPLETED" || s.status === "ACTIVE",
        ).length;

    const allClasses = await this.getClasses();

    const totalPresent = records.filter((r) => r.status === "PRESENT").length;
    const totalLate = records.filter((r) => r.status === "LATE").length;
    const totalAbsent = records.filter((r) => r.status === "ABSENT").length;
    const totalExcused = records.filter((r) => r.status === "EXCUSED").length;

    const attendedCount = totalPresent + totalLate;
    const denominator = totalSessions > 0 ? totalSessions : 1;
    const attendanceRate = Math.min(
      100,
      Math.round((attendedCount / denominator) * 100),
    );

    const jhsRecords = records.filter((r) => r.category === "JUNIOR_HIGH");
    const shsRecords = records.filter((r) => r.category === "SENIOR_HIGH");

    const jhsPresent = jhsRecords.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE",
    ).length;
    const shsPresent = shsRecords.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE",
    ).length;

    const juniorHighRate =
      jhsRecords.length > 0
        ? Math.round((jhsPresent / jhsRecords.length) * 100)
        : 100;
    const seniorHighRate =
      shsRecords.length > 0
        ? Math.round((shsPresent / shsRecords.length) * 100)
        : 100;

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

  // Excuse Request Methods
  async getExcuseRequestsByClass(classId: string): Promise<ExcuseRequest[]> {
    return this.excuseRequests.filter((e) => e.classId === classId);
  }

  async getExcuseRequestsByInstructor(
    instructorId: string,
  ): Promise<ExcuseRequest[]> {
    return this.excuseRequests.filter((e) => e.instructorId === instructorId);
  }

  async getExcuseRequestsByStudent(
    studentId: string,
  ): Promise<ExcuseRequest[]> {
    return this.excuseRequests.filter((e) => e.studentId === studentId);
  }

  async addExcuseRequest(req: ExcuseRequest): Promise<ExcuseRequest> {
    this.excuseRequests.push(req);
    return req;
  }

  async cleanupOldExcusePhotos(): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    this.excuseRequests.forEach((e) => {
      if (e.createdAt.split("T")[0] !== today) {
        e.evidenceDataUrl = undefined;
      }
    });
  }
}

export const dbStore = new DataStore();
