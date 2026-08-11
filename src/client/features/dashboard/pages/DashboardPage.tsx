import { offlineCapableFetch } from '../../../utils/sync';
import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { RecentActivityList } from '../components/RecentActivityList';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { AttendanceStats } from '../../../../shared/types/attendance';
import { ClassSession } from '../../../../shared/types/class';
import { useAuth } from '../../../context/AuthContext';
import { QrCode, ArrowRight, School, GraduationCap, CheckCircle2 } from 'lucide-react';

interface DashboardPageProps {
  onOpenQRScanner: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenQRScanner,
  onNavigateToTab,
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
      const studentIdParam = user?.role === 'STUDENT' ? `?studentId=${user.id}` : '';
      const [statsRes, sessionsRes] = await Promise.all([
        offlineCapableFetch(`/api/attendance/stats${studentIdParam}`),
        offlineCapableFetch('/api/sessions'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setActiveSessions(sessionsData.filter((s: ClassSession) => s.status === 'ACTIVE' || s.status === 'UPCOMING'));
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
            <h2 className="text-display-small font-medium tracking-tight leading-tight">Welcome back,<br/><span className="font-bold">{user?.name}</span></h2>
            <p className="text-body-large text-m3-sys-light-on-primary-container/80 dark:text-m3-sys-dark-on-primary-container/80 max-w-xl leading-relaxed">
              Manage Junior High (Grades 7–10) and Senior High (Grades 11–12) class sections, launch live QR check-ins, and monitor student attendance.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 mt-4 md:mt-0">
            <Button
              id="dashboard-quick-checkin-btn"
              onClick={onOpenQRScanner}
              icon={<QrCode className="w-5 h-5" />}
              className="bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary hover:bg-m3-sys-light-primary/90 font-medium rounded-full px-8 py-3 shadow-expressive-sm hover:scale-105 transition-transform"
            >
              {user?.role === 'STUDENT' ? 'Scan Class QR Code' : 'Display Live QR'}
            </Button>
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
              <h4 className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">Junior High School</h4>
              <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">Grades 7, 8, 9, 10 Sections</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab('events')}
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
              <h4 className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">Senior High School</h4>
              <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">Grades 11, 12 (STEM, ABM, HUMSS)</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab('events')}
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
        {/* Active & Scheduled Class Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Active & Scheduled Class Sessions"
            subtitle="Live class sessions available for attendance check-in"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab('events')}
                icon={<ArrowRight className="w-4 h-4" />}
                className="text-m3-sys-light-primary dark:text-m3-sys-dark-primary"
              >
                View Classes
              </Button>
            }
          >
            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <p className="p-6 text-center text-m3-sys-light-on-surface-variant text-body-medium">No active or scheduled sessions right now.</p>
              ) : (
                activeSessions.map((session) => {
                  const isJHS = session.category === 'JUNIOR_HIGH' || session.gradeLevel <= 10;
                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-3xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-m3-sys-light-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-2xl text-title-small font-bold text-white shrink-0 ${
                            isJHS ? 'bg-emerald-600' : 'bg-indigo-600'
                          }`}
                        >
                          {session.classCode}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-title-medium font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                              {session.title}
                            </h4>
                          </div>
                          <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-0.5">
                            Grade {session.gradeLevel} • {session.sectionName} • {session.room} ({session.startTime} - {session.endTime})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                            {session.attendedCount} / {session.totalExpectedCount}
                          </span>
                          <p className="text-label-small text-m3-sys-light-on-surface-variant">Attended</p>
                        </div>

                        <Button
                          size="sm"
                          variant={session.status === 'ACTIVE' ? 'primary' : 'outline'}
                          onClick={onOpenQRScanner}
                          className="rounded-full shadow-expressive-sm"
                        >
                          {session.status === 'ACTIVE' ? 'Active QR' : 'Schedule'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Live Attendance Activity Stream */}
        <div>
          <Card
            title="Recent Live Check-ins"
            subtitle="Real-time attendance logs stream"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab('attendance')}
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
    </div>
  );
};
