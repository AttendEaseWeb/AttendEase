import { offlineCapableFetch } from "../../../utils/sync";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { DashboardStats } from "../components/DashboardStats";
import { RecentActivityList } from "../components/RecentActivityList";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { AttendanceStats } from "../../../../shared/types/attendance";
import { ClassSession } from "../../../../shared/types/class";
import { useAuth } from "../../../context/AuthContext";
import {
  
  ArrowRight,
  School,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

interface DashboardPageProps {  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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

      {/* Grade Level Breakdown Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                Junior High School
              </h4>
              <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                Grades 7, 8, 9, 10 Sections
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab("events")}
            className="text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            Manage JHS →
          </Button>
        </div>

        <div className="p-5 rounded-3xl bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-sm">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                Senior High School
              </h4>
              <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                Grades 11, 12 (STEM, ABM, HUMSS)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab("events")}
            className="text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            Manage SHS →
          </Button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Activity Stream */}
        <div>
          <Card
            title="Recent Live Check-ins"
            subtitle="Real-time attendance logs stream"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab("attendance")}
                icon={<ArrowRight className="w-4 h-4" />}
                className="text-m3-sys-light-primary dark:text-m3-sys-dark-primary"
              >
                Full Logs
              </Button>
            }
          >
            <RecentActivityList records={stats?.recentActivity || []} />
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
