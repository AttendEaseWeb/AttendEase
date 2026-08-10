import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { ClassSection, ClassSession } from '../../../../shared/types/class';
import { AttendanceRecord } from '../../../../shared/types/attendance';
import { User } from '../../../../shared/types/auth';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import {
  BookOpen,
  GraduationCap,
  Users,
  QrCode,
  Plus,
  X,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Calendar,
  Edit,
  RefreshCw,
  UserCheck,
  Play,
  Square,
  Sparkles,
  Award,
  ChevronRight,
  FileSpreadsheet,
  UserPlus,
} from 'lucide-react';
import { AddUserModal } from '../../users/components/AddUserModal';

interface SectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cls: ClassSection | null;
  onOpenEditSection: (cls: ClassSection) => void;
  onLaunchQRModal: (session: ClassSession) => void;
  onOpenManualCheckIn?: (session: ClassSession) => void;
  onSectionUpdated?: () => void;
}

const COMMON_JHS_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Filipino',
  'Araling Panlipunan',
  'MAPEH',
  'ESP',
  'Computer / TLE',
];

const COMMON_SHS_SUBJECTS = [
  'General Mathematics',
  'Oral Communication',
  'Earth & Life Science',
  'General Biology 1',
  'Statistics & Probability',
  'Empowerment Technologies',
  'Physical Education',
  'General Chemistry 1',
  'Practical Research 1',
];

export const SectionDetailModal: React.FC<SectionDetailModalProps> = ({
  isOpen,
  onClose,
  cls,
  onOpenEditSection,
  onLaunchQRModal,
  onOpenManualCheckIn,
  onSectionUpdated,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const canManage = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  // Section subjects list
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Adding subject inline
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Enrolled students details
  const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Sessions for this class section
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Attendance records for this class section
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Active view tab within selected subject
  const [activeTab, setActiveTab] = useState<'sessions' | 'roster' | 'analytics'>('sessions');

  // Search filter for student roster
  const [studentSearch, setStudentSearch] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Initial load
  useEffect(() => {
    if (isOpen && cls) {
      const initialSubjects =
        cls.subjects && cls.subjects.length > 0
          ? cls.subjects
          : cls.subject
          ? [cls.subject]
          : [];
      setSubjects(initialSubjects);
      setSelectedSubject(initialSubjects.length > 0 ? initialSubjects[0] : 'ALL');

      fetchData(cls.id, cls.enrolledStudentIds || []);
    }
  }, [isOpen, cls]);

  const fetchData = async (classId: string, studentIds: string[]) => {
    setIsLoadingStudents(true);
    setIsLoadingSessions(true);
    setIsLoadingAttendance(true);

    try {
      // Fetch users to map enrolled students
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const allUsers: User[] = await usersRes.json();
        const matched = allUsers.filter((u) => studentIds.includes(u.id));
        setEnrolledStudents(matched);
      }

      // Fetch sessions for this section
      const sessionsRes = await fetch('/api/sessions');
      if (sessionsRes.ok) {
        const allSessions: ClassSession[] = await sessionsRes.json();
        const sectionSessions = allSessions.filter((s) => s.classId === classId);
        setSessions(sectionSessions);
      }

      // Fetch attendance records
      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const allRecords: AttendanceRecord[] = await attRes.json();
        const sectionRecords = allRecords.filter((r) => r.classId === classId);
        setAttendanceRecords(sectionRecords);
      }
    } catch (err) {
      console.error('Failed to load section data:', err);
      showToast('Failed to load section data', 'error');
    } finally {
      setIsLoadingStudents(false);
      setIsLoadingSessions(false);
      setIsLoadingAttendance(false);
    }
  };

  if (!cls) return null;

  const isJuniorHigh = cls.category === 'JUNIOR_HIGH';

  // Handle adding a new subject to this class section
  const handleAddSubjectToSection = async (subjectToAdd?: string) => {
    const targetSubject = (subjectToAdd || newSubjectName).trim();
    if (!targetSubject) {
      showToast('Please enter a valid subject name', 'error');
      return;
    }

    if (subjects.some((s) => s.toLowerCase() === targetSubject.toLowerCase())) {
      showToast(`Subject "${targetSubject}" is already added to this section`, 'info');
      setNewSubjectName('');
      setIsAddingSubject(false);
      return;
    }

    const updatedSubjects = [...subjects, targetSubject];
    setIsSavingSubject(true);

    try {
      const res = await fetch(`/api/classes/${cls.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: updatedSubjects,
        }),
      });

      if (!res.ok) throw new Error('Failed to update class subjects');

      setSubjects(updatedSubjects);
      setSelectedSubject(targetSubject);
      setNewSubjectName('');
      setIsAddingSubject(false);
      showToast(`Added "${targetSubject}" to ${cls.sectionName}`, 'success');
      if (onSectionUpdated) onSectionUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error adding subject', 'error');
    } finally {
      setIsSavingSubject(false);
    }
  };

  // Launch new attendance session for the current subject
  const handleCreateSubjectSession = async (subjectName: string) => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const payload = {
        classId: cls.id,
        classCode: cls.sectionName,
        sectionName: cls.sectionName,
        gradeLevel: cls.gradeLevel,
        category: cls.category,
        subject: subjectName,
        title: `Class Session: ${cls.sectionName} — ${subjectName}`,
        date: now.toISOString().split('T')[0],
        startTime: timeString,
        endTime: 'In Session',
        room: 'Classroom',
        status: 'ACTIVE' as const,
        allowGeofence: true,
        totalExpectedCount: enrolledStudents.length || cls.enrolledStudentIds?.length || 25,
      };

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to launch session');

      const createdSession: ClassSession = await res.json();
      setSessions((prev) => [createdSession, ...prev]);
      showToast(`Live QR Session launched for ${subjectName}!`, 'success');
      onLaunchQRModal(createdSession);
    } catch (err: any) {
      showToast(err.message || 'Error launching session', 'error');
    }
  };

  // Filter sessions by selected subject
  const filteredSessions = selectedSubject === 'ALL'
    ? sessions
    : sessions.filter((s) => s.subject?.toLowerCase() === selectedSubject.toLowerCase());

  // Active session for current subject
  const activeSessionForSubject = filteredSessions.find((s) => s.status === 'ACTIVE');

  // Filter attendance records by selected subject
  const filteredAttendance = selectedSubject === 'ALL'
    ? attendanceRecords
    : attendanceRecords.filter((r) => r.subject?.toLowerCase() === selectedSubject.toLowerCase());

  // Export CSV for this specific subject/section
  const handleExportSubjectCSV = () => {
    const subjectTitle = selectedSubject === 'ALL' ? 'All_Subjects' : selectedSubject.replace(/\s+/g, '_');
    const recordsToExport = filteredAttendance;

    if (recordsToExport.length === 0) {
      showToast(`No attendance logs recorded for ${selectedSubject === 'ALL' ? 'this section' : selectedSubject} yet`, 'info');
      return;
    }

    const headers = ['Student Name', 'Email', 'Section', 'Subject', 'Date/Time', 'Status', 'Method'];
    const csvRows = [
      headers.join(','),
      ...recordsToExport.map((r) =>
        [
          `"${r.studentName}"`,
          `"${r.studentEmail}"`,
          `"${r.sectionName}"`,
          `"${r.subject}"`,
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
    a.download = `Attendance_${cls.sectionName}_${subjectTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast(`Exported CSV report for ${selectedSubject === 'ALL' ? cls.sectionName : selectedSubject}!`, 'success');
  };

  // Quick Manual Check-in for a student in selected subject
  const handleQuickManualCheckIn = async (student: User, status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    let targetSessionId = activeSessionForSubject?.id;

    if (!targetSessionId) {
      // Create quick completed/active session
      try {
        const subjName = selectedSubject === 'ALL' ? (subjects[0] || 'General Subject') : selectedSubject;
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: cls.id,
            classCode: cls.sectionName,
            sectionName: cls.sectionName,
            gradeLevel: cls.gradeLevel,
            category: cls.category,
            subject: subjName,
            title: `Session: ${cls.sectionName} — ${subjName}`,
            date: new Date().toISOString().split('T')[0],
            startTime: '08:00 AM',
            endTime: '09:00 AM',
            status: 'ACTIVE',
          }),
        });
        if (res.ok) {
          const newSess = await res.json();
          targetSessionId = newSess.id;
          setSessions((prev) => [newSess, ...prev]);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!targetSessionId) {
      showToast('Please launch or select a session first', 'error');
      return;
    }

    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSessionId,
          studentId: student.id,
          status,
          notes: `Quick check-in via Section View (${selectedSubject})`,
        }),
      });

      if (!res.ok) throw new Error('Failed to record attendance');

      const record: AttendanceRecord = await res.json();
      setAttendanceRecords((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);
      showToast(`Marked ${student.name} as ${status}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error recording check-in', 'error');
    }
  };

  // Filtered student roster
  const filteredStudents = enrolledStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Suggested subjects not yet added
  const suggestedAddList = (cls.gradeLevel <= 10 ? COMMON_JHS_SUBJECTS : COMMON_SHS_SUBJECTS)
    .filter((subj) => !subjects.some((s) => s.toLowerCase() === subj.toLowerCase()));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="5xl"
    >
      <div className="space-y-6 pr-1 -mt-2">
        {/* Section Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-m3-sys-light-surface-variant/80 to-m3-sys-light-surface-variant/30 dark:from-m3-sys-dark-surface-variant/80 dark:to-m3-sys-dark-surface-variant/30 border border-m3-sys-light-outline-variant/40 dark:border-m3-sys-dark-outline-variant/40 p-6 shadow-expressive-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isJuniorHigh ? 'success' : 'primary'}>
                  {isJuniorHigh ? `Grade ${cls.gradeLevel} • Junior High` : `Grade ${cls.gradeLevel} • Senior High`}
                </Badge>
                {cls.strand && (
                  <span className="text-label-small font-bold px-2.5 py-0.5 rounded-full bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container">
                    {cls.strand} Strand
                  </span>
                )}
                <span className="text-label-small font-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {cls.enrolledStudentIds?.length || 0} Students Enrolled
                </span>
              </div>

              <h2 className="text-headline-small font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-2">
                {cls.sectionName}
              </h2>

              <div className="flex items-center gap-4 text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-m3-sys-light-primary" />
                  Adviser: <strong>{cls.instructorName}</strong>
                </span>
                {cls.description && (
                  <span className="hidden sm:inline text-body-small opacity-80 border-l border-m3-sys-light-outline-variant/40 pl-4">
                    {cls.description}
                  </span>
                )}
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenEditSection(cls);
                  }}
                  icon={<Edit className="w-3.5 h-3.5" />}
                  className="rounded-full text-xs"
                >
                  Edit Section / Roster
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Subject Selector Bar ("Select Subject to Manage Within") */}
        <div className="space-y-3 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-4 rounded-3xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
                Select Subject to Manage Within ({subjects.length})
              </h3>
              <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                Choose a subject to launch QR attendance, review roster presence, and generate reports.
              </p>
            </div>

            {canManage && !isAddingSubject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingSubject(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="rounded-full text-xs shrink-0"
              >
                Add Subject to Section
              </Button>
            )}
          </div>

          {/* Inline Add Subject Form */}
          {isAddingSubject && (
            <div className="p-3 bg-m3-sys-light-primary-container/30 dark:bg-m3-sys-dark-primary-container/30 rounded-2xl border border-m3-sys-light-primary/30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-label-medium font-semibold text-m3-sys-light-primary dark:text-m3-sys-dark-primary">
                  Add New Subject to {cls.sectionName}:
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="p-1 rounded-full hover:bg-black/10 text-m3-sys-light-on-surface-variant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type subject name..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubjectToSection();
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-m3-sys-light-outline-variant/60 dark:border-m3-sys-dark-outline-variant/60 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary dark:focus:ring-m3-sys-dark-primary"
                />
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isSavingSubject}
                  onClick={() => handleAddSubjectToSection()}
                  className="rounded-xl"
                >
                  Save Subject
                </Button>
              </div>

              {/* Quick suggestions */}
              {suggestedAddList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-label-small font-medium text-m3-sys-light-on-surface-variant">Quick Add:</span>
                  {suggestedAddList.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSubjectToSection(s)}
                      className="px-2 py-0.5 rounded-full text-label-small bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/40 hover:bg-m3-sys-light-primary-container hover:text-m3-sys-light-primary cursor-pointer transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subjects Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSubject('ALL')}
              className={`px-4 py-2 rounded-2xl text-label-medium font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === 'ALL'
                  ? 'bg-m3-sys-light-primary text-m3-sys-light-on-primary shadow-expressive-sm'
                  : 'bg-m3-sys-light-surface-variant/50 text-m3-sys-light-on-surface-variant hover:bg-m3-sys-light-surface-variant'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              All Subjects
            </button>

            {subjects.map((subj) => {
              const isSelected = selectedSubject.toLowerCase() === subj.toLowerCase();
              const subjectSessions = sessions.filter((s) => s.subject?.toLowerCase() === subj.toLowerCase());
              const hasActive = subjectSessions.some((s) => s.status === 'ACTIVE');

              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-4 py-2 rounded-2xl text-label-medium font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? 'bg-m3-sys-light-primary-container text-m3-sys-light-on-primary-container border-m3-sys-light-primary/40 shadow-xs'
                      : 'bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border-m3-sys-light-outline-variant/40 text-m3-sys-light-on-surface hover:border-m3-sys-light-primary/50'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-m3-sys-light-primary' : 'text-m3-sys-light-on-surface-variant'}`} />
                  <span>{subj}</span>
                  {hasActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Active QR Session Live!" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Subject Context Dashboard */}
        <div className="space-y-4">
          {/* Active Subject Bar & Quick Action Banner */}
          <div className="p-5 rounded-3xl bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-label-small font-bold uppercase tracking-wider text-m3-sys-light-primary dark:text-m3-sys-dark-primary">
                    Managing Subject:
                  </span>
                  {activeSessionForSubject && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-small font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live QR Session Active
                    </span>
                  )}
                </div>
                <h3 className="text-title-large font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-0.5">
                  {selectedSubject === 'ALL' ? 'All Subjects Summary' : selectedSubject}
                </h3>
              </div>

              {/* Action Buttons for Selected Subject */}
              {canManage && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const targetSubj = selectedSubject === 'ALL' ? (subjects[0] || 'General Subject') : selectedSubject;
                      handleCreateSubjectSession(targetSubj);
                    }}
                    icon={<QrCode className="w-4 h-4" />}
                    className="rounded-full shadow-expressive-sm"
                  >
                    Launch {selectedSubject === 'ALL' ? 'Attendance' : selectedSubject} Session
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSubjectCSV}
                    icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                    className="rounded-full"
                  >
                    Export CSV
                  </Button>
                </div>
              )}
            </div>

            {/* Quick KPIs for Subject */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 border border-m3-sys-light-outline-variant/20">
                <div className="text-label-small font-medium text-m3-sys-light-on-surface-variant">Sessions Conducted</div>
                <div className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-0.5">
                  {filteredSessions.length}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 border border-m3-sys-light-outline-variant/20">
                <div className="text-label-small font-medium text-m3-sys-light-on-surface-variant">Total Check-in Logs</div>
                <div className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-0.5">
                  {filteredAttendance.length}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-label-small font-medium text-emerald-700 dark:text-emerald-400">Present Rate</div>
                <div className="text-title-medium font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {filteredAttendance.length > 0
                    ? `${Math.round(
                        (filteredAttendance.filter((r) => r.status === 'PRESENT').length / filteredAttendance.length) * 100
                      )}%`
                    : '100%'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-label-small font-medium text-amber-700 dark:text-amber-400">Late / Absent Logs</div>
                <div className="text-title-medium font-bold text-amber-800 dark:text-amber-300 mt-0.5">
                  {filteredAttendance.filter((r) => r.status === 'LATE' || r.status === 'ABSENT').length}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Sessions / Roster / Analytics */}
          <div className="flex border-b border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`pb-3 text-title-small font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'sessions'
                  ? 'border-m3-sys-light-primary text-m3-sys-light-primary'
                  : 'border-transparent text-m3-sys-light-on-surface-variant hover:text-m3-sys-light-on-surface'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Attendance Sessions ({filteredSessions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`pb-3 text-title-small font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'border-m3-sys-light-primary text-m3-sys-light-primary'
                  : 'border-transparent text-m3-sys-light-on-surface-variant hover:text-m3-sys-light-on-surface'
              }`}
            >
              <Users className="w-4 h-4" />
              Student Roster & Presence ({enrolledStudents.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 text-title-small font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-m3-sys-light-primary text-m3-sys-light-primary'
                  : 'border-transparent text-m3-sys-light-on-surface-variant hover:text-m3-sys-light-on-surface'
              }`}
            >
              <Award className="w-4 h-4" />
              Subject Logs & Audit
            </button>
          </div>

          {/* TAB 1: Attendance Sessions for Subject */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-10 bg-m3-sys-light-surface-variant/20 rounded-3xl border border-dashed border-m3-sys-light-outline-variant/40 space-y-3">
                  <QrCode className="w-10 h-10 mx-auto text-m3-sys-light-on-surface-variant/50" />
                  <div>
                    <p className="text-title-medium font-semibold text-m3-sys-light-on-surface">
                      No Attendance Sessions Yet for {selectedSubject === 'ALL' ? cls.sectionName : selectedSubject}
                    </p>
                    <p className="text-body-small text-m3-sys-light-on-surface-variant max-w-sm mx-auto mt-1">
                      Launch a live QR attendance session for students in this section to scan their dynamic check-in code.
                    </p>
                  </div>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const targetSubj = selectedSubject === 'ALL' ? (subjects[0] || 'General Subject') : selectedSubject;
                        handleCreateSubjectSession(targetSubj);
                      }}
                      icon={<Play className="w-3.5 h-3.5" />}
                      className="rounded-full"
                    >
                      Launch Session Now
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSessions.map((sess) => {
                    const isActive = sess.status === 'ACTIVE';
                    const sessRecords = attendanceRecords.filter((r) => r.sessionId === sess.id);

                    return (
                      <div
                        key={sess.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isActive
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                            : 'bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border-m3-sys-light-outline-variant/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-label-small font-bold ${
                                  isActive
                                    ? 'bg-emerald-500 text-white animate-pulse'
                                    : 'bg-m3-sys-light-surface-variant text-m3-sys-light-on-surface-variant'
                                }`}
                              >
                                {isActive ? 'LIVE SESSION ACTIVE' : 'COMPLETED'}
                              </span>
                              <span className="text-label-small font-semibold text-m3-sys-light-primary">
                                {sess.subject}
                              </span>
                            </div>
                            <h4 className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-1">
                              {sess.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-body-small text-m3-sys-light-on-surface-variant">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {sess.date} ({sess.startTime})
                          </span>
                          <span className="font-semibold text-m3-sys-light-on-surface">
                            Attended: {sessRecords.length} / {sess.totalExpectedCount || enrolledStudents.length || 25}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-m3-sys-light-outline-variant/20 flex items-center justify-between">
                          {isActive && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onLaunchQRModal(sess)}
                              icon={<QrCode className="w-3.5 h-3.5" />}
                              className="rounded-full text-xs"
                            >
                              Display Live QR Code
                            </Button>
                          )}

                          {onOpenManualCheckIn && (
                            <button
                              type="button"
                              onClick={() => onOpenManualCheckIn(sess)}
                              className="text-label-small font-medium text-m3-sys-light-primary hover:underline cursor-pointer"
                            >
                              Manual Log Entry →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Student Roster & Quick Attendance Status for Subject */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-sys-light-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Search enrolled students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary dark:focus:ring-m3-sys-dark-primary"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-body-small text-m3-sys-light-on-surface-variant">
                    Total Students: <strong>{filteredStudents.length}</strong>
                  </span>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <p className="text-center py-8 text-body-small text-m3-sys-light-on-surface-variant italic">
                  No students found enrolled in this section. Click "Edit Section / Roster" to add students.
                </p>
              ) : (
                <div className="border border-m3-sys-light-outline-variant/30 rounded-2xl overflow-hidden bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface">
                  <div className="divide-y divide-m3-sys-light-outline-variant/20">
                    {filteredStudents.map((student) => {
                      // Student logs in this subject
                      const studentSubjLogs = filteredAttendance.filter((r) => r.studentId === student.id);
                      const latestLog = studentSubjLogs[0];

                      return (
                        <div
                          key={student.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-m3-sys-light-surface-variant/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-m3-sys-light-primary-container text-m3-sys-light-on-primary-container font-bold flex items-center justify-center text-label-large">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-body-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                                {student.name}
                              </div>
                              <div className="text-body-small text-m3-sys-light-on-surface-variant">
                                {student.email} {student.studentId && `• ID: ${student.studentId}`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {/* Latest Log Status Badge */}
                            {latestLog ? (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-label-small font-bold ${
                                  latestLog.status === 'PRESENT'
                                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                    : latestLog.status === 'LATE'
                                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                    : 'bg-red-500/20 text-red-800 dark:text-red-300'
                                }`}
                              >
                                {latestLog.status}
                              </span>
                            ) : (
                              <span className="text-label-small text-m3-sys-light-on-surface-variant/60 italic">
                                No check-in yet
                              </span>
                            )}

                            {/* Quick Attendance Override Buttons */}
                            {canManage && (
                              <div className="flex items-center gap-1 bg-m3-sys-light-surface-variant/40 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => handleQuickManualCheckIn(student, 'PRESENT')}
                                  className="px-2 py-0.5 rounded-lg text-label-small font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                                  title="Mark Present"
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickManualCheckIn(student, 'LATE')}
                                  className="px-2 py-0.5 rounded-lg text-label-small font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
                                  title="Mark Late"
                                >
                                  Late
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickManualCheckIn(student, 'ABSENT')}
                                  className="px-2 py-0.5 rounded-lg text-label-small font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                                  title="Mark Absent"
                                >
                                  Absent
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Analytics & Subject Audit */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 space-y-3">
                <h4 className="text-title-medium font-bold text-m3-sys-light-on-surface">
                  Recent Check-in Audit Logs ({filteredAttendance.length})
                </h4>

                {filteredAttendance.length === 0 ? (
                  <p className="text-body-small text-m3-sys-light-on-surface-variant italic py-4 text-center">
                    No verified check-in records logged for {selectedSubject === 'ALL' ? cls.sectionName : selectedSubject}.
                  </p>
                ) : (
                  <div className="divide-y divide-m3-sys-light-outline-variant/20 max-h-60 overflow-y-auto">
                    {filteredAttendance.map((rec) => (
                      <div key={rec.id} className="py-2.5 flex items-center justify-between text-body-small">
                        <div>
                          <span className="font-bold text-m3-sys-light-on-surface">{rec.studentName}</span>
                          <span className="text-m3-sys-light-on-surface-variant ml-2">({rec.subject})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-m3-sys-light-on-surface-variant text-xs">{rec.checkInTime}</span>
                          <span className="font-semibold text-emerald-600">{rec.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-m3-sys-light-outline-variant/20">
          <Button variant="outline" onClick={onClose}>
            Close Section View
          </Button>
        </div>
      </div>
    </Modal>
  );
};
