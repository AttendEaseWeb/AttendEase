import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { RecentActivityList } from '../components/RecentActivityList';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { AttendanceStats, AttendanceRecord } from '../../../../shared/types/attendance';
import { Session } from '../../../../shared/types/event';
import { useAuth } from '../../../context/AuthContext';
import { QrCode, Calendar, ArrowRight, Play, CheckCircle } from 'lucide-react';

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
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const studentIdParam = user?.role === 'STUDENT' ? `?studentId=${user.id}` : '';
      const [statsRes, sessionsRes] = await Promise.all([
        fetch(`/api/attendance/stats${studentIdParam}`),
        fetch('/api/sessions'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setActiveSessions(sessionsData.filter((s: Session) => s.status === 'ACTIVE' || s.status === 'UPCOMING'));
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-medium text-indigo-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{user?.role} Portal</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Track course attendance, launch live dynamic QR check-ins, monitor student presence, and verify session logs seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              id="dashboard-quick-checkin-btn"
              onClick={onOpenQRScanner}
              icon={<QrCode className="w-4 h-4" />}
              className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold"
            >
              {user?.role === 'STUDENT' ? 'Scan QR Code' : 'Display QR Display'}
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active & Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Active & Scheduled Course Sessions"
            subtitle="Live class sessions available for attendance check-in"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab('events')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            }
          >
            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-xs">No active or scheduled sessions right now.</p>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl text-xs font-bold ${
                          session.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                            : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400'
                        }`}
                      >
                        {session.courseCode}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {session.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {session.room} • {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {session.attendedCount} / {session.totalExpectedCount}
                        </span>
                        <p className="text-[10px] text-slate-400">Attended</p>
                      </div>

                      <Button
                        size="sm"
                        variant={session.status === 'ACTIVE' ? 'primary' : 'outline'}
                        onClick={onOpenQRScanner}
                      >
                        {session.status === 'ACTIVE' ? 'Active QR' : 'Schedule'}
                      </Button>
                    </div>
                  </div>
                ))
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
                icon={<ArrowRight className="w-3.5 h-3.5" />}
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
