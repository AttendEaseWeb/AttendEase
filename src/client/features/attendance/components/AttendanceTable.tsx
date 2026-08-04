import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../../../shared/types/attendance';
import { Badge } from '../../../components/common/Badge';
import { formatDateTime } from '../../../../shared/utils/date';
import { QrCode, UserCheck, Search, Filter, Shield } from 'lucide-react';

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

  const filtered = records.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Table Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <th className="p-3.5">Student Details</th>
              <th className="p-3.5">Course / Session</th>
              <th className="p-3.5">Check-in Time</th>
              <th className="p-3.5">Method</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {record.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{record.studentEmail}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {record.courseCode}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{record.courseTitle}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">
                    {formatDateTime(record.checkInTime)}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      {record.method === 'QR_SCAN' ? (
                        <>
                          <QrCode className="w-3 h-3 text-indigo-500" /> Dynamic QR
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-500" /> Manual Override
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3.5">
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
