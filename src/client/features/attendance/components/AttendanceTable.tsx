import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../../../shared/types/attendance';
import { Badge } from '../../../components/common/Badge';
import { formatDateTime } from '../../../../shared/utils/date';
import { QrCode, UserCheck, Search, Filter } from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onStatusChange?: (id: string, newStatus: AttendanceStatus) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gradeCategoryFilter, setGradeCategoryFilter] = useState<string>('ALL');

  const filtered = records.filter((record) => {
    const code = record.classCode || record.courseCode || '';
    const section = record.sectionName || record.courseTitle || '';
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    const isJHS = record.category === 'JUNIOR_HIGH' || (record.gradeLevel && record.gradeLevel <= 10);
    const matchesCategory =
      gradeCategoryFilter === 'ALL' ||
      (gradeCategoryFilter === 'JUNIOR_HIGH' && isJHS) ||
      (gradeCategoryFilter === 'SENIOR_HIGH' && !isJHS);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Table Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
          <input
            type="text"
            placeholder="Search student name, class section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-body-medium bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-expressive-sm transition-shadow"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={gradeCategoryFilter}
            onChange={(e) => setGradeCategoryFilter(e.target.value)}
            className="text-body-medium bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full px-4 py-2 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-expressive-sm"
          >
            <option value="ALL">All Grade Categories</option>
            <option value="JUNIOR_HIGH">Junior High (7-10)</option>
            <option value="SENIOR_HIGH">Senior High (11-12)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-body-medium bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full px-4 py-2 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-expressive-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="EXCUSED">Excused</option>
          </select>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto rounded-3xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface shadow-expressive-sm">
        <table className="w-full text-left text-body-medium border-collapse">
          <thead>
            <tr className="bg-m3-sys-light-surface-variant/40 dark:bg-m3-sys-dark-surface-variant/40 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant border-b border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 font-semibold">
              <th className="p-4">Student Details</th>
              <th className="p-4">Class Section / Level</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Check-in Time</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-m3-sys-light-outline-variant/20 dark:divide-m3-sys-dark-outline-variant/20 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant text-body-medium">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((record) => {
                const isJHS = record.category === 'JUNIOR_HIGH' || (record.gradeLevel && record.gradeLevel <= 10);
                const section = record.sectionName || record.courseTitle || 'Class Section';
                const code = record.classCode || record.courseCode || 'CLS';

                return (
                  <tr key={record.id} className="hover:bg-m3-sys-light-surface-variant/20 dark:hover:bg-m3-sys-dark-surface-variant/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface block text-label-large">
                          {record.studentName}
                        </span>
                        <span className="text-label-small text-m3-sys-light-on-surface-variant font-mono">{record.studentEmail}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface text-label-large">
                            {section}
                          </span>
                        </div>
                        <Badge variant={isJHS ? 'success' : 'primary'}>
                          {record.gradeLevel ? `Grade ${record.gradeLevel}` : code}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-m3-sys-light-on-surface-variant font-medium">
                      {record.subject || code}
                    </td>
                    <td className="p-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant whitespace-nowrap">
                      {formatDateTime(record.checkInTime)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-m3-sys-light-surface-variant/50 dark:bg-m3-sys-dark-surface-variant/50 text-label-small font-medium text-m3-sys-light-on-surface-variant border border-m3-sys-light-outline-variant/30">
                        {record.method === 'QR_SCAN' ? (
                          <>
                            <QrCode className="w-3.5 h-3.5 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" /> Dynamic QR
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-m3-sys-light-tertiary dark:text-m3-sys-dark-tertiary" /> Manual Override
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          record.status === 'PRESENT'
                            ? 'emerald'
                            : record.status === 'LATE'
                            ? 'amber'
                            : record.status === 'EXCUSED'
                            ? 'purple'
                            : 'rose'
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
