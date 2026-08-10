import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useNotification } from '../../../context/NotificationContext';
import { ClassSection, GradeLevel, SeniorHighStrand } from '../../../../shared/types/class';
import { User } from '../../../../shared/types/auth';
import { Check, Search, Users, GraduationCap, Trash2, Plus, X, BookOpen, UserPlus } from 'lucide-react';
import { AddUserModal } from '../../users/components/AddUserModal';

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

  const [sectionName, setSectionName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(defaultGradeLevel);
  const [strand, setStrand] = useState<SeniorHighStrand>('STEM');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [description, setDescription] = useState('');

  // Student Enrollment state
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Auto-detection logic for Grade Level & Strand based on class/section name
  const [autoDetectedMessage, setAutoDetectedMessage] = useState<string | null>(null);

  const detectGradeLevelAndStrand = (text: string) => {
    if (!text || !text.trim()) return null;

    let detectedGrade: GradeLevel | undefined = undefined;
    let detectedStrand: SeniorHighStrand | undefined = undefined;

    // Pattern A: "Grade 11", "Gr 10", "G-7", "Grade7", "G12", "Gr. 8"
    const gradeMatch = text.match(/(?:grade|gr\.?|g)[\s\-]*?(1[0-2]|[7-9])\b/i);
    if (gradeMatch) {
      const level = parseInt(gradeMatch[1], 10);
      if (level >= 7 && level <= 12) {
        detectedGrade = level as GradeLevel;
      }
    }

    // Pattern B: Dash/Ordinal/Space notation like "11-STEM", "7-A", "10-Einstein", "12-ABM", "7A"
    if (!detectedGrade) {
      const dashMatch = text.match(/\b(1[0-2]|[7-9])(?:[\-\s]*([a-zA-Z]+|\b))/i);
      if (dashMatch) {
        const level = parseInt(dashMatch[1], 10);
        if (level >= 7 && level <= 12) {
          detectedGrade = level as GradeLevel;
        }
      }
    }

    // Strand detection
    const upperText = text.toUpperCase();
    if (upperText.includes('STEM')) detectedStrand = 'STEM';
    else if (upperText.includes('ABM')) detectedStrand = 'ABM';
    else if (upperText.includes('HUMSS')) detectedStrand = 'HUMSS';
    else if (upperText.includes('TVL')) detectedStrand = 'TVL';
    else if (upperText.includes('GAS')) detectedStrand = 'GAS';

    if (detectedGrade || detectedStrand) {
      return { gradeLevel: detectedGrade, strand: detectedStrand };
    }

    return null;
  };

  const handleAutoDetectGrade = (sName: string) => {
    const result = detectGradeLevelAndStrand(sName);
    if (result) {
      if (result.gradeLevel) {
        setGradeLevel(result.gradeLevel);
      }
      if (result.strand) {
        setStrand(result.strand);
      }
      if (result.gradeLevel && result.strand && result.gradeLevel >= 11) {
        setAutoDetectedMessage(`Auto-detected Grade ${result.gradeLevel} (${result.strand})`);
      } else if (result.gradeLevel) {
        setAutoDetectedMessage(`Auto-detected Grade ${result.gradeLevel}`);
      }
    }
  };

  const handleSectionNameChange = (val: string) => {
    setSectionName(val);
    handleAutoDetectGrade(val);
  };

  const handleAddSubject = (subjectName?: string) => {
    const target = (subjectName !== undefined ? subjectName : newSubjectInput).trim();
    if (!target) return;
    if (subjects.some((s) => s.toLowerCase() === target.toLowerCase())) {
      showToast(`Subject "${target}" is already added to this section`, 'info');
      setNewSubjectInput('');
      return;
    }
    setSubjects((prev) => [...prev, target]);
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (indexToRemove: number) => {
    setSubjects((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const loadStudents = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((users: User[]) => {
        const students = users.filter((u) => u.role === 'STUDENT');
        setAvailableStudents(students);
      })
      .catch((err) => console.error('Failed to load students', err));
  };

  // Fetch available students & initial data
  useEffect(() => {
    if (isOpen) {
      setAutoDetectedMessage(null);
      loadStudents();

      if (initialClass) {
        setSectionName(initialClass.sectionName);
        setGradeLevel(initialClass.gradeLevel);
        setStrand(initialClass.strand || 'STEM');
        const initialSubjects = initialClass.subjects && initialClass.subjects.length > 0
          ? initialClass.subjects
          : (initialClass.subject ? [initialClass.subject] : []);
        setSubjects(initialSubjects);
        setInstructorName(initialClass.instructorName);
        setDescription(initialClass.description || '');
        setSelectedStudentIds(initialClass.enrolledStudentIds || []);
      } else {
        setSectionName('');
        setGradeLevel(defaultGradeLevel);
        setStrand('STEM');
        setSubjects([]);
        setInstructorName('');
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
    if (!sectionName.trim()) {
      showToast('Section name is required', 'error');
      return;
    }

    if (subjects.length === 0) {
      showToast('Please add at least one subject to this section', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sectionName: sectionName.trim(),
        gradeLevel: Number(gradeLevel) as GradeLevel,
        category,
        strand: category === 'SENIOR_HIGH' ? strand : undefined,
        subjects,
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

  const handleDelete = async () => {
    if (!initialClass) return;
    if (!window.confirm(`Are you sure you want to delete class section "${initialClass.sectionName}"?`)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/classes/${initialClass.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete class section');
      }
      showToast(`Class section "${initialClass.sectionName}" deleted successfully`, 'info');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error deleting class section', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = availableStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase()))
  );

  const suggestedSubjectsList = (gradeLevel <= 10 ? COMMON_JHS_SUBJECTS : COMMON_SHS_SUBJECTS)
    .filter((subj) => !subjects.some((s) => s.toLowerCase() === subj.toLowerCase()));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialClass ? 'Edit Class Section' : 'Create New Class Section'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pr-1">
        {/* Grade Level & Category Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 p-4 rounded-2xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
                Grade Level
              </label>
              {autoDetectedMessage && (
                <span className="text-[11px] font-medium text-m3-sys-light-primary dark:text-m3-sys-dark-primary bg-m3-sys-light-primary-container/60 dark:bg-m3-sys-dark-primary-container/60 px-2 py-0.5 rounded-full animate-fade-in">
                  ✨ {autoDetectedMessage}
                </span>
              )}
            </div>
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

        {/* Section Name & Instructor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Section Name / Identifier"
            placeholder="Section Name"
            value={sectionName}
            onChange={(e) => handleSectionNameChange(e.target.value)}
            required
          />
          <Input
            label="Instructor / Adviser"
            placeholder="Instructor Name"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
          />
        </div>

        {/* Section Subjects Management (Individually added subjects under section) */}
        <div className="space-y-3 bg-m3-sys-light-surface-variant/20 dark:bg-m3-sys-dark-surface-variant/20 p-4 rounded-2xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30">
          <div className="flex items-center justify-between">
            <h4 className="text-title-medium font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
              Subjects under this Section ({subjects.length})
            </h4>
            <span className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
              Add individual subjects taught to {sectionName || 'this section'}
            </span>
          </div>

          {/* Add Subject Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type subject name..."
              value={newSubjectInput}
              onChange={(e) => setNewSubjectInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubject();
                }
              }}
              className="flex-1 rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface px-4 py-2.5 text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            />
            <button
              type="button"
              onClick={() => handleAddSubject()}
              className="px-4 py-2.5 rounded-2xl bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary text-label-medium font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Quick Suggestions */}
          {suggestedSubjectsList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-label-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mr-1 font-medium">
                Quick Add:
              </span>
              {suggestedSubjectsList.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSubject(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-small bg-m3-sys-light-surface/80 dark:bg-m3-sys-dark-surface/80 border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface hover:bg-m3-sys-light-primary-container dark:hover:bg-m3-sys-dark-primary-container transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-m3-sys-light-primary" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Current Subjects List */}
          <div className="pt-2">
            {subjects.length === 0 ? (
              <p className="text-body-small text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                ⚠️ No subjects added yet. Add at least one subject for this class section.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((subj, index) => (
                  <span
                    key={`${subj}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-medium font-medium bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container border border-m3-sys-light-primary/20 dark:border-m3-sys-dark-primary/20 shadow-xs animate-fade-in"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
                    {subj}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(index)}
                      className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-m3-sys-light-on-primary-container/80 dark:text-m3-sys-dark-on-primary-container/80 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      title={`Remove ${subj}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(true)}
                className="px-2.5 py-1 rounded-full bg-m3-sys-light-primary/10 hover:bg-m3-sys-light-primary/20 text-m3-sys-light-primary text-label-small font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + New Student
              </button>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-label-small font-medium text-m3-sys-light-primary dark:text-m3-sys-dark-primary hover:underline cursor-pointer"
              >
                {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
            <input
              type="text"
              placeholder="Search students by name, email, or ID..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-2xl p-2 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface">
            {filteredStudents.length === 0 ? (
              <p className="text-center py-4 text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                No students found matching search.
              </p>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-m3-sys-light-primary-container/50 dark:bg-m3-sys-dark-primary-container/50 border border-m3-sys-light-primary/30'
                        : 'hover:bg-m3-sys-light-surface-variant/40 dark:hover:bg-m3-sys-dark-surface-variant/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container flex items-center justify-center font-medium text-label-medium text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-body-medium font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                          {student.name}
                        </div>
                        <div className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                          {student.email} {student.studentId && `• ${student.studentId}`}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary border-m3-sys-light-primary text-white'
                          : 'border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface font-semibold">
            Class Description & Syllabus Notes
          </label>
          <textarea
            placeholder="Optional section details or curriculum notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-3 text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex items-center justify-between gap-3 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
          <div>
            {initialClass && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                isLoading={isSubmitting}
                icon={<Trash2 className="w-4 h-4" />}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium px-4 py-2 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Delete Section
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary">
              {initialClass ? 'Save Changes' : 'Create Class Section'}
            </Button>
          </div>
        </div>
      </form>

      <AddUserModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onUserAdded={loadStudents}
        defaultRole="STUDENT"
      />
    </Modal>
  );
};
