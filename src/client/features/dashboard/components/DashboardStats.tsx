import React from 'react';
import { StatCard } from '../../../components/common/StatCard';
import { AttendanceStats } from '../../../../shared/types/attendance';
import { CheckCircle2, Award, School, GraduationCap } from 'lucide-react';

interface DashboardStatsProps {
  stats: AttendanceStats | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        id="stat-classes-count"
        title="Total Class Sections"
        value={stats.totalClasses || 5}
        subtitle="Junior High & Senior High"
        icon={<School className="w-5 h-5" />}
        color="indigo"
      />
      <StatCard
        id="stat-attendance-rate"
        title="Overall Attendance Rate"
        value={`${stats.attendanceRate}%`}
        subtitle="Across all grade levels"
        icon={<Award className="w-5 h-5" />}
        color="emerald"
        progress={stats.attendanceRate}
        trend={{ value: '+3.5%', isPositive: true }}
      />
      <StatCard
        id="stat-jhs-rate"
        title="Junior High (7-10) Rate"
        value={`${stats.juniorHighRate ?? 95}%`}
        subtitle="Grades 7, 8, 9, 10 attendance"
        icon={<GraduationCap className="w-5 h-5" />}
        color="teal"
        progress={stats.juniorHighRate ?? 95}
      />
      <StatCard
        id="stat-shs-rate"
        title="Senior High (11-12) Rate"
        value={`${stats.seniorHighRate ?? 98}%`}
        subtitle="Grades 11, 12 STEM & ABM"
        icon={<GraduationCap className="w-5 h-5" />}
        color="amber"
        progress={stats.seniorHighRate ?? 98}
      />
    </div>
  );
};
