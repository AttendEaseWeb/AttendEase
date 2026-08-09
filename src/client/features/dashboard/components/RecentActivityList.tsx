import React from 'react';
import { motion } from 'motion/react';
import { AttendanceRecord } from '../../../../shared/types/attendance';
import { Badge } from '../../../components/common/Badge';
import { formatDateTime } from '../../../../shared/utils/date';
import { QrCode, UserCheck } from 'lucide-react';

interface RecentActivityListProps {
  records: AttendanceRecord[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ records }) => {
  return (
    <div className="space-y-3">
      {records.length === 0 ? (
        <div className="p-8 text-center text-m3-sys-light-on-surface-variant text-body-small">No recent attendance activity recorded yet.</div>
      ) : (
        records.map((record) => {
          const section = record.sectionName || record.courseTitle || 'Class';
          const code = record.classCode || record.courseCode || 'CLS';
          const isJHS = record.category === 'JUNIOR_HIGH' || record.gradeLevel <= 10;

          return (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 bg-m3-sys-light-surface-variant/20 dark:bg-m3-sys-dark-surface-variant/20 hover:bg-m3-sys-light-surface-variant/40 hover:scale-[1.008] transition-all duration-200 transform-gpu"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white shrink-0 shadow-sm ${isJHS ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                  {record.method === 'QR_SCAN' ? (
                    <QrCode className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-label-large text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                      {record.studentName}
                    </span>
                    <Badge variant={isJHS ? 'success' : 'primary'}>
                      {record.gradeLevel ? `Grade ${record.gradeLevel}` : code}
                    </Badge>
                  </div>
                  <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1">
                    {section} ({record.subject || code}) • {formatDateTime(record.checkInTime)}
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
          );
        })
      )}
    </div>
  );
};
