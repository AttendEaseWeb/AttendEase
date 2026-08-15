import React, { useState, useEffect } from 'react';
import { offlineCapableFetch } from '../../../utils/sync';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useNotification } from '../../../context/NotificationContext';
import { ClassSection } from '../../../../shared/types/class';
import { User } from '../../../../shared/types/auth';
import { AttendanceStatus } from '../../../../shared/types/attendance';
import { Users, CheckCircle2, XCircle, Clock, AlertTriangle, Save, Check } from 'lucide-react';

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cls: ClassSection | null;
}

export const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({ isOpen, onClose, onSuccess, cls }) => {
  const { showToast } = useNotification();
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [subject, setSubject] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cls) {
      setSubject(cls.subjects?.[0] || cls.subject || 'General Subject');
      setAttendanceState({});
      if (cls.enrolledStudentIds?.length) {
        setIsLoading(true);
        offlineCapableFetch('/api/users')
          .then((res) => res.json())
          .then((allUsers: User[]) => {
            const enrolled = allUsers.filter((u) => cls.enrolledStudentIds?.includes(u.id));
            setStudents(enrolled);
            const initial: Record<string, AttendanceStatus> = {};
            enrolled.forEach((s) => {
              initial[s.id] = 'PRESENT'; // Default shortcut
            });
            setAttendanceState(initial);
          })
          .catch((err) => {
            console.error('Failed to load students', err);
            showToast('Failed to load students', 'error');
          })
          .finally(() => setIsLoading(false));
      } else {
        setStudents([]);
      }
    }
  }, [isOpen, cls]);

  const handleMarkAll = (status: AttendanceStatus) => {
    const newState: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      newState[s.id] = status;
    });
    setAttendanceState(newState);
  };

  const handleSave = async () => {
    if (!cls) return;
    setIsSaving(true);
    try {
      // 1. Create Session
      const sessionRes = await offlineCapableFetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: cls.id,
          classCode: cls.sectionName,
          sectionName: cls.sectionName,
          gradeLevel: cls.gradeLevel,
          category: cls.category,
          subject: subject,
          title: `Class Attendance: ${cls.sectionName} (${subject})`,
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00 AM', // Ideally dynamic, but keeping fallback
          endTime: '09:30 AM',
          room: 'Main Room',
          status: 'ACTIVE',
          allowGeofence: false,
          attendedCount: Object.values(attendanceState).filter(s => s === 'PRESENT' || s === 'LATE').length,
          totalExpectedCount: students.length,
        }),
      });

      if (!sessionRes.ok) throw new Error('Failed to create session');
      const session = await sessionRes.json();

      // 2. Submit Attendance Records
      const promises = students.map((s) =>
        offlineCapableFetch('/api/attendance/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            studentId: s.id,
            status: attendanceState[s.id] || 'PRESENT',
            notes: '',
          }),
        })
      );

      await Promise.all(promises);
      showToast(`Attendance saved for ${students.length} students!`, 'success');
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast('Error saving attendance', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const StatusButton = ({ studentId, status, icon: Icon, label, colorClass }: { studentId: string; status: AttendanceStatus; icon: any; label: string; colorClass: string }) => {
    const isActive = attendanceState[studentId] === status;
    return (
      <button
        type="button"
        onClick={() => setAttendanceState((prev) => ({ ...prev, [studentId]: status }))}
        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
          isActive
            ? `${colorClass} shadow-sm transform scale-105 border-transparent font-bold`
            : 'bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50'
        }`}
      >
        <Icon className={`w-5 h-5 mb-1 ${isActive ? '' : 'opacity-70'}`} />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </button>
    );
  };

  if (!cls) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Take Attendance: ${cls.sectionName}`} size="2xl">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30">
          <div className="flex-1 space-y-1">
            <label className="text-label-small font-bold text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">Ongoing Subject</label>
            {cls.subjects && cls.subjects.length > 1 ? (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface border border-m3-sys-light-outline-variant/40 dark:border-m3-sys-dark-outline-variant/40 rounded-xl px-3 py-2 text-body-medium focus:ring-2 focus:ring-m3-sys-light-primary dark:focus:ring-m3-sys-dark-primary"
              >
                {cls.subjects.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{subject}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant whitespace-nowrap">Quick Select All:</span>
            <button onClick={() => handleMarkAll('PRESENT')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" title="All Present">
              <CheckCircle2 className="w-5 h-5" />
            </button>
            <button onClick={() => handleMarkAll('ABSENT')} className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20" title="All Absent">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-8 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">Loading roster...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
              No students enrolled in this section.
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border border-m3-sys-light-outline-variant/30 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-m3-sys-light-primary/10 dark:bg-m3-sys-dark-primary/20 flex items-center justify-center text-m3-sys-light-primary dark:text-m3-sys-dark-primary font-bold text-lg shrink-0">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{student.name}</div>
                    <div className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">{student.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:w-[240px] shrink-0">
                  <StatusButton
                    studentId={student.id}
                    status="PRESENT"
                    label="Present"
                    icon={CheckCircle2}
                    colorClass="bg-emerald-500 text-white"
                  />
                  <StatusButton
                    studentId={student.id}
                    status="LATE"
                    label="Late"
                    icon={Clock}
                    colorClass="bg-amber-500 text-white"
                  />
                  <StatusButton
                    studentId={student.id}
                    status="ABSENT"
                    label="Absent"
                    icon={XCircle}
                    colorClass="bg-red-500 text-white"
                  />
                  <StatusButton
                    studentId={student.id}
                    status="EXCUSED"
                    label="Excused"
                    icon={AlertTriangle}
                    colorClass="bg-blue-500 text-white"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || students.length === 0} icon={<Save className="w-4 h-4" />}>
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
