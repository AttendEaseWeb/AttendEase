import { offlineCapableFetch } from '../../../utils/sync';
import React, { useEffect, useState } from 'react';
import { AttendanceRecord } from '../../../../shared/types/attendance';
import { AttendanceTable } from '../components/AttendanceTable';
import { ManualCheckInModal } from '../components/ManualCheckInModal';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Download, Plus, RefreshCw, QrCode } from 'lucide-react';

interface AttendancePageProps {
  onOpenQRScanner: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ onOpenQRScanner }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const studentParam = user?.role === 'STUDENT' ? `?studentId=${user.id}` : '';
      const res = await offlineCapableFetch(`/api/attendance${studentParam}`);
      if (res.ok) {
        setRecords(await res.json());
      }
    } catch {
      showToast('Error loading attendance logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      showToast('No attendance records available to export', 'error');
      return;
    }

    const headers = ['Student Name', 'Email', 'Course', 'Check-In Time', 'Status', 'Method'];
    const csvRows = [
      headers.join(','),
      ...records.map((r) =>
        [
          `"${r.studentName}"`,
          `"${r.studentEmail}"`,
          `"${r.courseCode}"`,
          `"${r.checkInTime}"`,
          `"${r.status}"`,
          `"${r.method}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendEase_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported CSV Attendance Report!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-small text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
            Attendance Log Records
          </h2>
          <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1">
            Real-time verified student presence, location logs, and session activity audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecords}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
            <Button
              id="manual-override-btn"
              size="sm"
              onClick={() => setIsManualModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Manual Override
            </Button>
          )}

          {user?.role === 'STUDENT' && (
            <Button
              size="sm"
              onClick={onOpenQRScanner}
              icon={<QrCode className="w-3.5 h-3.5" />}
            >
              Scan Check-in
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-m3-sys-light-on-surface-variant">Total Logs</div>
          <div className="text-title-large font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-1">{records.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-emerald-700 dark:text-emerald-400">Present On-Time</div>
          <div className="text-title-large font-bold text-emerald-800 dark:text-emerald-300 mt-1">
            {records.filter((r) => r.status === 'PRESENT').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-amber-700 dark:text-amber-400">Late Arrivals</div>
          <div className="text-title-large font-bold text-amber-800 dark:text-amber-300 mt-1">
            {records.filter((r) => r.status === 'LATE').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-purple-700 dark:text-purple-400">Excused / Other</div>
          <div className="text-title-large font-bold text-purple-800 dark:text-purple-300 mt-1">
            {records.filter((r) => r.status === 'EXCUSED' || r.status === 'ABSENT').length}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card title="Detailed Check-in Ledger" subtitle="Search and filter verified student logs">
        <AttendanceTable records={records} />
      </Card>

      {/* Manual Entry Modal */}
      <ManualCheckInModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchRecords}
      />
    </div>
  );
};
