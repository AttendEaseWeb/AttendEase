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
      <div className="relative overflow-hidden rounded-[32px] bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container p-6 sm:p-8 text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-sys-light-primary/10 dark:bg-m3-sys-dark-primary/20 border border-m3-sys-light-primary/20 dark:border-m3-sys-dark-primary/30 text-label-small font-medium text-m3-sys-light-primary dark:text-m3-sys-dark-primary mb-3">
              <span className="w-2 h-2 rounded-full bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary animate-ping" />
              <span>{user?.role} Portal</span>
            </div>
            <h2 className="text-headline-large font-normal tracking-tight">Welcome back, {user?.name}!</h2>
            <p className="text-body-medium text-m3-sys-light-on-primary-container/80 dark:text-m3-sys-dark-on-primary-container/80 mt-2 max-w-xl">
              Track course attendance, launch live dynamic QR check-ins, monitor student presence, and verify session logs seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              id="dashboard-quick-checkin-btn"
              onClick={onOpenQRScanner}
              icon={<QrCode className="w-5 h-5" />}
              className="bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary hover:bg-m3-sys-light-primary/90 font-medium rounded-full px-6 py-2.5"
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
                icon={<ArrowRight className="w-4 h-4" />}
                className="text-m3-sys-light-primary dark:text-m3-sys-dark-primary"
              >
                View All
              </Button>
            }
          >
            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <p className="p-6 text-center text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant text-body-medium">No active or scheduled sessions right now.</p>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-3xl border border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-m3-sys-light-primary/50 dark:hover:border-m3-sys-dark-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl text-title-small font-bold ${
                          session.status === 'ACTIVE'
                            ? 'bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container'
                            : 'bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container'
                        }`}
                      >
                        {session.courseCode}
                      </div>
                      <div>
                        <h4 className="text-title-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                          {session.title}
                        </h4>
                        <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-0.5">
                          {session.room} • {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                          {session.attendedCount} / {session.totalExpectedCount}
                        </span>
                        <p className="text-label-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">Attended</p>
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
