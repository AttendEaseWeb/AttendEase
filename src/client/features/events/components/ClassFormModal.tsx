import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { useNotification } from '../../../context/NotificationContext';
import { ClassSection, GradeLevel, SeniorHighStrand } from '../../../../shared/types/class';
import { User } from '../../../../shared/types/auth';
import { Check, Search, Users, Shield, GraduationCap } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialClass?: ClassSection | null;
  defaultGradeLevel?: GradeLevel;
  currentUserRole?: string;
  currentUserId?: string;
  currentUserName?: string;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialClass,
  defaultGradeLevel = 7,
  currentUserRole,
  currentUserId,
  currentUserName,
}) => {
  const { showToast } = useNotification();

  const [code, setCode] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(defaultGradeLevel);
  const [strand, setStrand] = useState<SeniorHighStrand>('STEM');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('');
  const [room, setRoom] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [description, setDescription] = useState('');
  
  // Student Enrollment state
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available students & initial data
  useEffect(() => {
    if (isOpen) {
      fetch('/api/users')
        .then((res) => res.json())
        .then((users: User[]) => {
          const students = users.filter((u) => u.role === 'STUDENT');
          setAvailableStudents(students);
        })
        .catch((err) => console.error('Failed to load students', err));

      if (initialClass) {
        setCode(initialClass.code);
        setSectionName(initialClass.sectionName);
        setGradeLevel(initialClass.gradeLevel);
        setStrand(initialClass.strand || 'STEM');
        setSubject(initialClass.subject);
        setSchedule(initialClass.schedule);
        setRoom(initialClass.room);
        setInstructorName(initialClass.instructorName);
        setDescription(initialClass.description || '');
        setSelectedStudentIds(initialClass.enrolledStudentIds || []);
      } else {
        setCode('');
        setSectionName('');
        setGradeLevel(defaultGradeLevel);
        setStrand(defaultGradeLevel >= 11 ? 'STEM' : 'STEM');
        setSubject('');
        setSchedule('Mon/Wed/Fri 8:00 AM - 9:30 AM');
        setRoom('Building A - Room 101');
        setInstructorName(currentUserName || 'Prof. David Miller');
        setDescription('');
        setSelectedStudentIds([]);
      }
    }
  }, [isOpen, initialClass, defaultGradeLevel]);

  const category = gradeLevel <= 10 ? 'JUNIOR_HIGH' : 'SENIOR_HIGH';

  const handleToggleStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !sectionName || !subject) {
      showToast('Class code, section name, and subject are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code,
        sectionName,
        gradeLevel: Number(gradeLevel) as GradeLevel,
        category,
        strand: category === 'SENIOR_HIGH' ? strand : undefined,
        subject,
        schedule,
        room,
        instructorId: currentUserId || 'u-test-instructor',
        instructorName: instructorName || 'Prof. David Miller',
        description,
        enrolledStudentIds: selectedStudentIds,
      };

      const url = initialClass ? `/api/classes/${initialClass.id}` : '/api/classes';
      const method = initialClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save class section');
      }

      showToast(initialClass ? 'Class section updated successfully!' : 'New class section created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = availableStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase()))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialClass ? 'Edit Class Section' : 'Create New Class Section'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Grade Level & Category Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 p-4 rounded-2xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value) as GradeLevel)}
              className="w-full rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-3 text-body-medium font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            >
              <optgroup label="Junior High School (Grades 7-10)">
                <option value={7}>Grade 7 (Junior High)</option>
                <option value={8}>Grade 8 (Junior High)</option>
                <option value={9}>Grade 9 (Junior High)</option>
                <option value={10}>Grade 10 (Junior High)</option>
              </optgroup>
              <optgroup label="Senior High School (Grades 11-12)">
                <option value={11}>Grade 11 (Senior High)</option>
                <option value={12}>Grade 12 (Senior High)</option>
              </optgroup>
            </select>
          </div>

          {category === 'SENIOR_HIGH' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface font-semibold">
                Senior High Track / Strand
              </label>
              <select
                value={strand}
                onChange={(e) => setStrand(e.target.value as SeniorHighStrand)}
                className="w-full rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-3 text-body-medium font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
              >
                <option value="STEM">STEM (Science, Tech, Engineering, Math)</option>
                <option value="ABM">ABM (Accountancy, Business, Management)</option>
                <option value="HUMSS">HUMSS (Humanities & Social Sciences)</option>
                <option value="TVL">TVL (Technical-Vocational-Livelihood)</option>
                <option value="GAS">GAS (General Academic Strand)</option>
              </select>
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <div className="px-4 py-3 rounded-2xl bg-m3-sys-light-primary-container/40 dark:bg-m3-sys-dark-primary-container/40 border border-m3-sys-light-primary/20 text-label-medium font-medium text-m3-sys-light-primary dark:text-m3-sys-dark-primary">
                Category: <strong>Junior High School</strong>
              </div>
            </div>
          )}
        </div>

        {/* Section Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Section Name / Identifier"
            placeholder="e.g. 7-A St. Jude or 11-STEM Alpha"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
          />
          <Input
            label="Class Code"
            placeholder="e.g. JHS-7A or SHS-11STEM"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        {/* Subject & Instructor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Subject Title"
            placeholder="e.g. General Mathematics, Physics 1"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <Input
            label="Instructor / Adviser"
            placeholder="e.g. Prof. David Miller"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
          />
        </div>

        {/* Schedule & Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Schedule"
            placeholder="e.g. Mon/Wed/Fri 8:00 AM - 9:30 AM"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <Input
            label="Room / Lab Location"
            placeholder="e.g. Building A - Room 101"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>

        {/* Student Enrollment Section */}
        <div className="space-y-3 bg-m3-sys-light-surface-variant/20 dark:bg-m3-sys-dark-surface-variant/20 p-4 rounded-2xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-title-medium font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-2">
                <Users className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
                Enroll Students ({selectedStudentIds.length} Selected)
              </h4>
              <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                Select students to assign to this class section for QR attendance tracking.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllStudents}
              className="text-xs rounded-full"
            >
              {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
            <input
              type="text"
              placeholder="Search students to add..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-body-small bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {filteredStudents.length === 0 ? (
              <p className="text-body-small text-m3-sys-light-on-surface-variant text-center py-3">
                No students found.
              </p>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-m3-sys-light-primary-container/40 dark:bg-m3-sys-dark-primary-container/40 border-m3-sys-light-primary/40'
                        : 'bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border-m3-sys-light-outline-variant/20 hover:bg-m3-sys-light-surface-variant/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary border-m3-sys-light-primary'
                            : 'border-m3-sys-light-outline-variant'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-label-large font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface block">
                          {student.name}
                        </span>
                        <span className="text-label-small text-m3-sys-light-on-surface-variant">
                          {student.studentId || student.email} • {student.department || 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface ml-1">
            Class Description & Syllabus Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-4 text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            placeholder="Brief overview of course section syllabus or advisement..."
          />
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="primary">
            {initialClass ? 'Save Changes' : 'Create Class Section'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
