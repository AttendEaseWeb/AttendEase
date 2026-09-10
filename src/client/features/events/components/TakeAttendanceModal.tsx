import React, { useState, useEffect } from "react";
import { offlineCapableFetch } from "../../../utils/sync";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { useNotification } from "../../../context/NotificationContext";
import { ClassSection } from "../../../../shared/types/class";
import { User } from "../../../../shared/types/auth";
import { AttendanceStatus } from "../../../../shared/types/attendance";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Save,
  Check,
  Undo2,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  List
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "motion/react";
import { triggerHaptic } from "../../../utils/haptics";

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cls: ClassSection | null;
}

const StudentSwipeCard: React.FC<{ student: User; onSwipe: (status: AttendanceStatus) => void; isTop: boolean; }> = ({ 
  student, 
  onSwipe,
  isTop
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  const presentOpacity = useTransform(x, [20, 100], [0, 1]);
  const absentOpacity = useTransform(x, [-20, -100], [0, 1]);
  const excusedOpacity = useTransform(y, [-20, -100], [0, 1]);
  const lateOpacity = useTransform(y, [20, 100], [0, 1]);

  const handleDragEnd = (e: any, info: PanInfo) => {
    const threshold = 70; // pixels to trigger swipe
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);

    if (absX > absY && absX > threshold) {
      if (info.offset.x > 0) onSwipe("PRESENT");
      else onSwipe("ABSENT");
    } else if (absY > absX && absY > threshold) {
      if (info.offset.y < 0) onSwipe("EXCUSED");
      else onSwipe("LATE");
    }
  };

  return (
    <motion.div
      key={student.id}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      drag={isTop ? true : false}
      dragDirectionLock={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate, touchAction: "none" }}
      className={`absolute inset-0 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing`}
    >
      {/* Overlays for visual feedback */}
      <motion.div style={{ opacity: presentOpacity }} className="absolute inset-0 bg-emerald-500/20 rounded-3xl pointer-events-none flex items-center justify-end p-6 border-4 border-emerald-500">
        <div className="flex flex-col items-center opacity-70 text-emerald-600 dark:text-emerald-400">
           <CheckCircle2 className="w-16 h-16" />
           <span className="font-bold text-xl uppercase tracking-wider mt-2">Present</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: absentOpacity }} className="absolute inset-0 bg-red-500/20 rounded-3xl pointer-events-none flex items-center justify-start p-6 border-4 border-red-500">
        <div className="flex flex-col items-center opacity-70 text-red-600 dark:text-red-400">
           <XCircle className="w-16 h-16" />
           <span className="font-bold text-xl uppercase tracking-wider mt-2">Absent</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: excusedOpacity }} className="absolute inset-0 bg-blue-500/20 rounded-3xl pointer-events-none flex items-start justify-center p-6 border-4 border-blue-500">
         <div className="flex flex-col items-center opacity-70 text-blue-600 dark:text-blue-400">
           <AlertTriangle className="w-16 h-16" />
           <span className="font-bold text-xl uppercase tracking-wider mt-2">Excused</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: lateOpacity }} className="absolute inset-0 bg-amber-500/20 rounded-3xl pointer-events-none flex items-end justify-center p-6 border-4 border-amber-500">
         <div className="flex flex-col items-center opacity-70 text-amber-600 dark:text-amber-400">
           <Clock className="w-16 h-16" />
           <span className="font-bold text-xl uppercase tracking-wider mt-2">Late</span>
        </div>
      </motion.div>

      {/* Student Content */}
      <div className="w-32 h-32 rounded-full bg-m3-sys-light-primary/10 dark:bg-m3-sys-dark-primary/20 flex items-center justify-center text-m3-sys-light-primary dark:text-m3-sys-dark-primary font-bold text-5xl mb-6 shadow-sm">
        {student.name.charAt(0).toUpperCase()}
      </div>
      <h3 className="text-3xl font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface text-center mb-24">
        {student.name}
      </h3>

      {/* Swipe Hints */}
      <div className="absolute bottom-8 inset-x-6 opacity-60 pointer-events-none flex items-center justify-between">
         <div className="flex items-center text-red-500 gap-1.5">
            <ArrowLeft className="w-4 h-4"/>
            <span className="text-sm font-bold">Absent</span>
         </div>
         <div className="flex flex-col items-start gap-2">
            <div className="flex items-center text-blue-400 gap-1.5">
               <ArrowUp className="w-4 h-4"/>
               <span className="text-sm font-bold">Excused</span>
            </div>
            <div className="flex items-center text-amber-500 gap-1.5">
               <ArrowDown className="w-4 h-4"/>
               <span className="text-sm font-bold">Late</span>
            </div>
         </div>
         <div className="flex items-center text-emerald-500 gap-1.5">
            <span className="text-sm font-bold">Present</span>
            <ArrowRight className="w-4 h-4"/>
         </div>
      </div>
    </motion.div>
  );
};


export const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cls,
}) => {
  const { showToast } = useNotification();
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Swipe UI State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [isSummaryView, setIsSummaryView] = useState(false);

  const [subject, setSubject] = useState<string>("");

  useEffect(() => {
    if (isOpen && cls) {
      setSubject(cls.subjects && cls.subjects.length > 0 ? cls.subjects[0] : "General");
      fetchStudents();
      setCurrentIndex(0);
      setAttendanceState({});
      setIsSummaryView(false);
    }
  }, [isOpen, cls]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await offlineCapableFetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch students");
      const allUsers: User[] = await res.json();
      
      const enrolled = allUsers.filter(
        (u) =>
          u.role === "STUDENT" &&
          (u.department === cls?.gradeLevel ||
            u.department === "General Education")
      );
      setStudents(enrolled);
      
      // Initialize state for quick select all fallback
      const initial: Record<string, AttendanceStatus> = {};
      enrolled.forEach(s => initial[s.id] = "PRESENT");
      setAttendanceState(initial);
      
    } catch (error) {
      console.error(error);
      showToast("Error loading students", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (status: AttendanceStatus) => {
    triggerHaptic(40);
    const student = students[currentIndex];
    setAttendanceState(prev => ({ ...prev, [student.id]: status }));
    
    if (currentIndex + 1 >= students.length) {
      setTimeout(() => setIsSummaryView(true), 200);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      triggerHaptic(30);
      setIsSummaryView(false);
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const handleJumpToSummary = () => {
      triggerHaptic(30);
      setIsSummaryView(true);
  };

  const handleSave = async () => {
    if (!cls) return;
    try {
      setIsSaving(true);
      // 1. Create Session
      const sessionRes = await offlineCapableFetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          subject: subject,
          date: new Date().toISOString().split("T")[0],
          // Ideally dynamic, but keeping fallback
          startTime: "08:00 AM",
          endTime: "09:30 AM",
          room: "Main Room",
          status: "ACTIVE",
          allowGeofence: false,
          attendedCount: Object.values(attendanceState).filter(
            (s) => s === "PRESENT" || s === "LATE",
          ).length,
          totalExpectedCount: students.length,
        }),
      });
      if (!sessionRes.ok) throw new Error("Failed to create session");
      const session = await sessionRes.json();

      // 2. Submit Attendance Records
      const promises = students.map((s) =>
        offlineCapableFetch("/api/attendance/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            studentId: s.id,
            status: attendanceState[s.id] || "PRESENT",
            notes: "",
          }),
        }),
      );

      await Promise.all(promises);
      showToast(`Attendance saved for ${students.length} students!`, "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast("Error saving attendance", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const StatusButton = ({
    studentId,
    status,
    icon: Icon,
    label,
    colorClass,
  }: {
    studentId: string;
    status: AttendanceStatus;
    icon: any;
    label: string;
    colorClass: string;
  }) => {
    const isActive = attendanceState[studentId] === status;
    return (
      <button
        type="button"
        onClick={() => {
            triggerHaptic(30);
            setAttendanceState((prev) => ({ ...prev, [studentId]: status }))
        }}
        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
          isActive
            ? `${colorClass} shadow-sm transform scale-105 border-transparent font-bold`
            : "bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50"
        }`}
      >
        <Icon className={`w-5 h-5 mb-1 ${isActive ? "" : "opacity-70"}`} />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </button>
    );
  };

  if (!cls) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Take Attendance: ${cls.sectionName}`}
      size="2xl"
    >
      <div className="flex flex-col h-[70vh] max-h-[600px] gap-4">
        {/* Top Controls */}
        <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30">
          <div className="flex-1 space-y-1">
            <label className="text-label-small font-bold text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
              Subject Filter
            </label>
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
              <div className="font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                {subject}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isSummaryView && (
                <Button variant="outline" size="sm" onClick={handleJumpToSummary} icon={<List className="w-4 h-4"/>}>
                    Skip to Summary
                </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative w-full">
          {isLoading ? (
            <div className="text-center py-8 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
              Loading roster...
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
              No students enrolled in this section.
            </div>
          ) : !isSummaryView ? (
            // Swipe View
            <div className="w-full h-full max-w-sm mx-auto relative perspective-1000">
               <AnimatePresence mode="popLayout">
                  {students[currentIndex] && (
                     <StudentSwipeCard 
                        key={students[currentIndex].id}
                        student={students[currentIndex]}
                        onSwipe={handleSwipe}
                        isTop={true}
                     />
                  )}
               </AnimatePresence>
            </div>
          ) : (
            // Summary View
            <div className="w-full h-full absolute inset-0 flex flex-col fade-in overflow-hidden pb-1">
                <div className="shrink-0 py-3 border-b border-m3-sys-light-outline-variant/30 mb-4">
                    <h3 className="font-bold text-xl text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface text-center">
                        Attendance Summary
                    </h3>
                </div>
                <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-3">
                    {/* Present */}
                    <div className="rounded-3xl border-2 flex flex-col overflow-hidden p-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold text-sm sm:text-base uppercase tracking-wider">Present</span>
                            <span className="ml-auto text-2xl font-black">{Object.values(attendanceState).filter(s => s === 'PRESENT').length}</span>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-wrap content-start gap-1.5 overflow-hidden">
                            {students.filter(s => attendanceState[s.id] === 'PRESENT').map(s => (
                                <div key={s.id} className="text-xs font-semibold px-2 py-1 rounded-md bg-white/60 dark:bg-black/20 truncate max-w-full">
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Absent */}
                    <div className="rounded-3xl border-2 flex flex-col overflow-hidden p-4 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                            <XCircle className="w-5 h-5" />
                            <span className="font-bold text-sm sm:text-base uppercase tracking-wider">Absent</span>
                            <span className="ml-auto text-2xl font-black">{Object.values(attendanceState).filter(s => s === 'ABSENT').length}</span>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-wrap content-start gap-1.5 overflow-hidden">
                            {students.filter(s => attendanceState[s.id] === 'ABSENT').map(s => (
                                <div key={s.id} className="text-xs font-semibold px-2 py-1 rounded-md bg-white/60 dark:bg-black/20 truncate max-w-full">
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Excused */}
                    <div className="rounded-3xl border-2 flex flex-col overflow-hidden p-4 bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold text-sm sm:text-base uppercase tracking-wider">Excused</span>
                            <span className="ml-auto text-2xl font-black">{Object.values(attendanceState).filter(s => s === 'EXCUSED').length}</span>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-wrap content-start gap-1.5 overflow-hidden">
                            {students.filter(s => attendanceState[s.id] === 'EXCUSED').map(s => (
                                <div key={s.id} className="text-xs font-semibold px-2 py-1 rounded-md bg-white/60 dark:bg-black/20 truncate max-w-full">
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Late */}
                    <div className="rounded-3xl border-2 flex flex-col overflow-hidden p-4 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-sm sm:text-base uppercase tracking-wider">Late</span>
                            <span className="ml-auto text-2xl font-black">{Object.values(attendanceState).filter(s => s === 'LATE').length}</span>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-wrap content-start gap-1.5 overflow-hidden">
                            {students.filter(s => attendanceState[s.id] === 'LATE').map(s => (
                                <div key={s.id} className="text-xs font-semibold px-2 py-1 rounded-md bg-white/60 dark:bg-black/20 truncate max-w-full">
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-3 border-t border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 flex justify-between items-center gap-3">
          <div className="flex gap-2">
            {!isSummaryView && currentIndex > 0 && (
                <Button variant="ghost" onClick={handleUndo} icon={<Undo2 className="w-5 h-5" />} title="Undo Last Swipe" />
            )}
            {isSummaryView && students.length > 0 && (
                 <Button variant="ghost" onClick={handleUndo} icon={<Undo2 className="w-5 h-5" />}>
                     Back to Swiping
                 </Button>
            )}
          </div>
          
          <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || students.length === 0 || (!isSummaryView && currentIndex < students.length)}
                icon={<Save className="w-4 h-4" />}
              >
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
