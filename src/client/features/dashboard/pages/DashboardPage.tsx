import { offlineCapableFetch } from "../../../utils/sync";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { DashboardStats } from "../components/DashboardStats";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { AttendanceStats } from "../../../../shared/types/attendance";
import { ExcuseRequest } from "../../../../shared/types/attendance";
import { ClassSession } from "../../../../shared/types/class";
import { useAuth } from "../../../context/AuthContext";
import {
  
  ArrowRight,
  School,
  GraduationCap,
  CheckCircle2, FileText, XCircle,
} from "lucide-react";

interface DashboardPageProps {  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<ClassSession[]>([]);
  const [inboxExcuses, setInboxExcuses] = useState<ExcuseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  
  const handleStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await offlineCapableFetch(`/api/excuses/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setInboxExcuses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      }
    } catch(e) {
      console.error(e);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const studentIdParam =
        user?.role === "STUDENT" ? `?studentId=${user.id}` : "";
      const [statsRes, sessionsRes] = await Promise.all([
        offlineCapableFetch(`/api/attendance/stats${studentIdParam}`),
        offlineCapableFetch("/api/sessions"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setActiveSessions(
          sessionsData.filter(
            (s: ClassSession) =>
              s.status === "ACTIVE" || s.status === "UPCOMING",
          ),
        );
      }
      if (user?.role === "INSTRUCTOR" || user?.role === "ADMIN") {
        const inboxRes = await offlineCapableFetch(`/api/excuses/instructor/${user.id}`);
        if (inboxRes.ok) {
           setInboxExcuses(await inboxRes.json());
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[36px] bg-expressive-gradient-primary p-6 sm:p-10 text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container shadow-expressive">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 dark:bg-black/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary/30 rounded-full blur-[100px] pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 text-label-medium font-medium text-m3-sys-light-primary dark:text-m3-sys-dark-primary-container shadow-sm">
              <span className="w-2 h-2 rounded-full bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary animate-ping" />
              <span>{user?.role} Portal • Class Attendance Management</span>
            </div>
            <h2 className="text-display-small font-medium tracking-tight leading-tight">
              Welcome back,
              <br />
              <span className="font-bold">{user?.name}</span>
            </h2>
            <p className="text-body-large text-m3-sys-light-on-primary-container/80 dark:text-m3-sys-dark-on-primary-container/80 max-w-xl leading-relaxed">
              Manage Junior High (Grades 7–10) and Senior High (Grades 11–12)
              class sections, launch live sessions, and monitor student
              attendance.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 mt-4 md:mt-0">
            </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <DashboardStats stats={stats} />
      {/* Inbox Section for Instructors */}
      {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && inboxExcuses.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold">Inbox: Pending Excuse Requests</h3>
          </div>
          <div className="space-y-3">
            {inboxExcuses.filter(e => e.status === "PENDING").map(excuse => (
              <div key={excuse.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold">{excuse.studentName}</h4>
                  <p className="text-sm text-zinc-500">Class: {excuse.className} • Date: {excuse.dateOfAbsence}</p>
                  <p className="text-sm mt-1">Reason: {excuse.reason}</p>
                  {excuse.evidenceDataUrl && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md mt-2 inline-block">Evidence Attached</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-medium text-sm flex items-center gap-1 hover:bg-emerald-200" onClick={() => handleStatus(excuse.id, "APPROVED")}><CheckCircle2 className="w-4 h-4"/> Approve</button>
                  <button className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-medium text-sm flex items-center gap-1 hover:bg-rose-200" onClick={() => handleStatus(excuse.id, "REJECTED")}><XCircle className="w-4 h-4"/> Reject</button>
                </div>
              </div>
            ))}
            {inboxExcuses.filter(e => e.status === "PENDING").length === 0 && (
              <p className="text-sm text-zinc-500 italic">No pending requests.</p>
            )}
          </div>
        </div>
      )}


    </motion.div>
  );
};
