import React from 'react';
import { AttendanceRecord } from '../../../../shared/types/attendance';
import { Badge } from '../../../components/common/Badge';
import { formatDateTime } from '../../../../shared/utils/date';
import { QrCode, CheckCircle2, Clock, UserCheck } from 'lucide-react';

interface RecentActivityListProps {
  records: AttendanceRecord[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ records }) => {
  return (
    <div className="space-y-3">
      {records.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">No recent attendance activity recorded yet.</div>
      ) : (
        records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                {record.method === 'QR_SCAN' ? (
                  <QrCode className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {record.studentName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({record.courseCode})</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {record.courseTitle} • {formatDateTime(record.checkInTime)}
                </p>
              </div>
            </div>

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
          </div>
        ))
      )}
    </div>
  );
};
