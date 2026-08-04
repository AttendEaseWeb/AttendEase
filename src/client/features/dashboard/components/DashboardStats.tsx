import React from 'react';
import { StatCard } from '../../../components/common/StatCard';
import { AttendanceStats } from '../../../../shared/types/attendance';
import { CheckCircle2, Clock, AlertTriangle, Calendar, Award } from 'lucide-react';

interface DashboardStatsProps {
  stats: AttendanceStats | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        id="stat-attendance-rate"
        title="Attendance Rate"
        value={`${stats.attendanceRate}%`}
        subtitle="Overall verified attendance"
        icon={<Award className="w-5 h-5" />}
        color="emerald"
        trend={{ value: '+4.2%', isPositive: true }}
      />
      <StatCard
        id="stat-present-count"
        title="Sessions Attended"
        value={stats.totalPresent}
        subtitle="Verified present check-ins"
        icon={<CheckCircle2 className="w-5 h-5" />}
        color="indigo"
      />
      <StatCard
        id="stat-late-count"
        title="Late Arrivals"
        value={stats.totalLate}
        subtitle="Check-in after start time"
        icon={<Clock className="w-5 h-5" />}
        color="amber"
      />
      <StatCard
        id="stat-absent-count"
        title="Absences"
        value={stats.totalAbsent}
        subtitle="Missed or unexcused sessions"
        icon={<AlertTriangle className="w-5 h-5" />}
        color="rose"
      />
    </div>
  );
};
