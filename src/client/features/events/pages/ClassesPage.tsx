import React, { useEffect, useState } from 'react';
import { ClassSection, ClassSession, GradeCategory, GradeLevel } from '../../../../shared/types/class';
import { ClassCard } from '../components/ClassCard';
import { ClassFormModal } from '../components/ClassFormModal';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Plus, GraduationCap, QrCode, Search, School, BookOpen, ChevronDown, ChevronUp, ChevronsUpDown, Layers } from 'lucide-react';

interface ClassesPageProps {
  onOpenQRScanner: () => void;
}

interface GradeGroup {
  level: GradeLevel;
  title: string;
  category: GradeCategory;
  description: string;
  badgeColor: string;
}

const GRADE_GROUPS: GradeGroup[] = [
  {
    level: 7,
    title: 'Grade 7',
    category: 'JUNIOR_HIGH',
    description: 'Junior High School - Introductory Subjects & Foundations',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    level: 8,
    title: 'Grade 8',
    category: 'JUNIOR_HIGH',
    description: 'Junior High School - Intermediate Core Curriculum',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    level: 9,
    title: 'Grade 9',
    category: 'JUNIOR_HIGH',
    description: 'Junior High School - Advanced Core & Science Track',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    level: 10,
    title: 'Grade 10',
    category: 'JUNIOR_HIGH',
    description: 'Junior High School - Moving Up & Senior High Prep',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    level: 11,
    title: 'Grade 11',
    category: 'SENIOR_HIGH',
    description: 'Senior High School - STEM, ABM, HUMSS, TVL, GAS Track',
    badgeColor: 'bg-indigo-600 text-white',
  },
  {
    level: 12,
    title: 'Grade 12',
    category: 'SENIOR_HIGH',
    description: 'Senior High School - Capstone Research & Graduation Track',
    badgeColor: 'bg-indigo-600 text-white',
  },
];

export const ClassesPage: React.FC<ClassesPageProps> = ({ onOpenQRScanner }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedClassToEdit, setSelectedClassToEdit] = useState<ClassSection | null>(null);
  const [defaultCreateGrade, setDefaultCreateGrade] = useState<GradeLevel>(7);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  
  // Collapsible Grade Cards State
  const [expandedGrades, setExpandedGrades] = useState<Record<number, boolean>>({
    7: true,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | GradeCategory>('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number>(0); // 0 = all grades
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [classesRes, sessionsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/sessions'),
      ]);
      if (classesRes.ok) {
        const loadedClasses: ClassSection[] = await classesRes.json();
        setClasses(loadedClasses);
        
        // Auto-expand grade levels that have sections if desired, or keep current state
        const initialExpanded: Record<number, boolean> = { 7: true, 8: true, 9: true, 10: true, 11: true, 12: true };
        GRADE_GROUPS.forEach((g) => {
          const hasSections = loadedClasses.some((c) => Number(c.gradeLevel) === g.level);
          // Expand grade 7 or grades with existing sections
          initialExpanded[g.level] = g.level === 7 || hasSections;
        });
        setExpandedGrades(initialExpanded);
      }
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
    } catch {
      showToast('Error loading class sections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGradeExpand = (gradeLevel: number) => {
    setExpandedGrades((prev) => ({
      ...prev,
      [gradeLevel]: !prev[gradeLevel],
    }));
  };

  const expandAllGrades = () => {
    const allExpanded: Record<number, boolean> = {};
    GRADE_GROUPS.forEach((g) => { allExpanded[g.level] = true; });
    setExpandedGrades(allExpanded);
  };

  const collapseAllGrades = () => {
    const allCollapsed: Record<number, boolean> = {};
    GRADE_GROUPS.forEach((g) => { allCollapsed[g.level] = false; });
    setExpandedGrades(allCollapsed);
  };

  const handleCreateQuickSession = async (cls: ClassSection) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: cls.id,
          classCode: cls.code,
          sectionName: cls.sectionName,
          gradeLevel: cls.gradeLevel,
          category: cls.category,
          subject: cls.subject,
          title: `Class Attendance: ${cls.sectionName} (${cls.subject})`,
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00 AM',
          endTime: '09:30 AM',
          room: cls.room,
          status: 'ACTIVE',
          allowGeofence: true,
          attendedCount: 0,
          totalExpectedCount: cls.enrolledStudentIds?.length || 25,
        }),
      });

      if (res.ok) {
        showToast(`Live QR session created for ${cls.sectionName}!`, 'success');
        fetchData();
        onOpenQRScanner();
      }
    } catch {
      showToast('Error launching live session', 'error');
    }
  };

  const handleDeleteClass = async (cls: ClassSection) => {
    if (!window.confirm(`Are you sure you want to delete class section ${cls.sectionName}?`)) return;

    try {
      const res = await fetch(`/api/classes/${cls.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Deleted class section ${cls.sectionName}`, 'info');
        fetchData();
      }
    } catch {
      showToast('Error deleting class', 'error');
    }
  };

  const handleOpenEdit = (cls: ClassSection) => {
    setSelectedClassToEdit(cls);
    setDefaultCreateGrade(cls.gradeLevel);
    setIsClassModalOpen(true);
  };

  const handleOpenCreateForGrade = (grade: GradeLevel) => {
    setSelectedClassToEdit(null);
    setDefaultCreateGrade(grade);
    // Auto-expand the target grade level card when creating a section for it
    setExpandedGrades((prev) => ({ ...prev, [grade]: true }));
    setIsClassModalOpen(true);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const canManage = isInstructor || isAdmin;

  // Determine active grade groups to render based on filters and user role
  const activeGradeGroups = GRADE_GROUPS.filter((g) => {
    if (categoryFilter !== 'ALL' && g.category !== categoryFilter) return false;
    if (selectedGradeFilter > 0 && g.level !== selectedGradeFilter) return false;

    // Administrators see ALL 6 grade level cards for complete system overview
    if (isAdmin) return true;

    // Instructors & Students: Collapsible grade level cards are HIDDEN until a class is created for that grade level
    const totalClassesInGrade = classes.filter((cls) => Number(cls.gradeLevel) === Number(g.level)).length;
    return totalClassesInGrade > 0;
  });

  // Helper to filter classes for a specific grade level
  const getClassesForGrade = (gradeLevel: GradeLevel) => {
    return classes.filter((cls) => {
      if (Number(cls.gradeLevel) !== Number(gradeLevel)) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        cls.sectionName.toLowerCase().includes(query) ||
        cls.code.toLowerCase().includes(query) ||
        cls.subject.toLowerCase().includes(query) ||
        cls.instructorName.toLowerCase().includes(query) ||
        (cls.strand && cls.strand.toLowerCase().includes(query)) ||
        cls.room.toLowerCase().includes(query)
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-headline-small font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-2.5">
              <School className="w-7 h-7 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
              Class Sections by Grade Level
            </h2>
            <Badge variant={isAdmin ? 'purple' : isInstructor ? 'indigo' : 'emerald'}>
              {isAdmin ? 'Administrator Mode (All Grades)' : isInstructor ? 'Instructor Mode' : 'Student Mode'}
            </Badge>
          </div>
          <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1 max-w-2xl">
            {isAdmin
              ? 'Administrator access: Showing all 6 grade level cards (Grades 7–12) for complete system oversight.'
              : 'Instructor view: Grade level collapsible cards appear automatically as sections are created for Grades 7 through 12.'}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => handleOpenCreateForGrade(defaultCreateGrade)}
              icon={<Plus className="w-4 h-4" />}
              variant="primary"
              className="shadow-expressive-sm shrink-0 self-start lg:self-auto"
            >
              Add Class Section
            </Button>
          </div>
        )}
      </div>

      {/* Top Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{classes.length}</div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Total Sections</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
              {classes.filter((c) => c.category === 'JUNIOR_HIGH').length}
            </div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Junior High (7-10)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
              {classes.filter((c) => c.category === 'SENIOR_HIGH').length}
            </div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Senior High (11-12)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
              {classes.reduce((acc, c) => acc + (c.enrolledStudentIds?.length || 0), 0)}
            </div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Enrolled Students</div>
          </div>
        </div>
      </div>

      {/* Grade Category & Level Filtering Navigation */}
      <div className="bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-5 rounded-3xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 shadow-expressive-sm space-y-4">
        {/* Top Category Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => { setCategoryFilter('ALL'); setSelectedGradeFilter(0); }}
              className={`px-4 py-2 rounded-full text-label-large font-medium transition-all shrink-0 ${
                categoryFilter === 'ALL' && selectedGradeFilter === 0
                  ? 'bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary shadow-sm'
                  : 'bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 text-m3-sys-light-on-surface-variant hover:bg-m3-sys-light-surface-variant/60'
              }`}
            >
              All Grades ({classes.length} Sections)
            </button>

            <button
              onClick={() => { setCategoryFilter('JUNIOR_HIGH'); setSelectedGradeFilter(0); }}
              className={`px-4 py-2 rounded-full text-label-large font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                categoryFilter === 'JUNIOR_HIGH' && selectedGradeFilter === 0
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 text-m3-sys-light-on-surface-variant hover:bg-m3-sys-light-surface-variant/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Junior High (7–10)
            </button>

            <button
              onClick={() => { setCategoryFilter('SENIOR_HIGH'); setSelectedGradeFilter(0); }}
              className={`px-4 py-2 rounded-full text-label-large font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                categoryFilter === 'SENIOR_HIGH' && selectedGradeFilter === 0
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 text-m3-sys-light-on-surface-variant hover:bg-m3-sys-light-surface-variant/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Senior High (11–12)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant" />
            <input
              type="text"
              placeholder="Search section, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-body-medium bg-m3-sys-light-surface-variant/20 dark:bg-m3-sys-dark-surface-variant/20 border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary"
            />
          </div>
        </div>

        {/* Grade Level Quick Chip Selector Row & Global Collapse/Expand Controls */}
        <div className="pt-3 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-label-small uppercase tracking-wider text-m3-sys-light-on-surface-variant font-semibold mr-1 shrink-0">
              Grade Chips:
            </span>
            {GRADE_GROUPS.map((g) => {
              const count = classes.filter((c) => Number(c.gradeLevel) === g.level).length;
              const isSelected = selectedGradeFilter === g.level;
              return (
                <button
                  key={g.level}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedGradeFilter(0);
                    } else {
                      setSelectedGradeFilter(g.level);
                      setCategoryFilter('ALL');
                      setExpandedGrades((prev) => ({ ...prev, [g.level]: true }));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-label-medium font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary border-transparent shadow-sm'
                      : 'bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border-m3-sys-light-outline-variant/40 hover:bg-m3-sys-light-surface-variant/40 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface'
                  }`}
                >
                  <span>{g.title}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white/30 text-white' : 'bg-m3-sys-light-surface-variant text-m3-sys-light-on-surface-variant'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
            <button
              onClick={expandAllGrades}
              className="text-label-small font-semibold text-m3-sys-light-primary hover:underline px-2 py-1"
            >
              Expand All
            </button>
            <span className="text-m3-sys-light-outline-variant">•</span>
            <button
              onClick={collapseAllGrades}
              className="text-label-small font-semibold text-m3-sys-light-on-surface-variant hover:underline px-2 py-1"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Main Grouped Grade Level Collapsible Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-m3-sys-light-on-surface-variant">
          Loading grade level class sections...
        </div>
      ) : activeGradeGroups.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-m3-sys-light-outline-variant/40 dark:border-m3-sys-dark-outline-variant/40 bg-m3-sys-light-surface/60 dark:bg-m3-sys-dark-surface/60 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container text-m3-sys-light-primary dark:text-m3-sys-dark-primary flex items-center justify-center mx-auto shadow-sm">
            <School className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-title-large font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
              No Grade Level Cards Displayed
            </h3>
            <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
              {canManage
                ? 'Grade level cards appear automatically as class sections are added. Select a grade level below to create a section now.'
                : 'There are currently no active class sections for the selected view.'}
            </p>
          </div>

          {canManage && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
              <span className="text-label-medium font-semibold text-m3-sys-light-on-surface-variant w-full mb-1">
                Select Grade Level to Create Class Section:
              </span>
              {GRADE_GROUPS.map((g) => (
                <Button
                  key={g.level}
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCreateForGrade(g.level)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="rounded-full text-xs"
                >
                  Add {g.title} Section
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeGradeGroups.map((group) => {
            const gradeClasses = getClassesForGrade(group.level);
            const isExpanded = searchQuery ? true : !!expandedGrades[group.level];
            const hasClasses = gradeClasses.length > 0;

            return (
              <div
                key={group.level}
                className="rounded-3xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface shadow-expressive-sm overflow-hidden transition-all duration-200"
              >
                {/* Collapsible Card Header Header */}
                <div
                  onClick={() => toggleGradeExpand(group.level)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-m3-sys-light-surface-variant/20 dark:hover:bg-m3-sys-dark-surface-variant/20 transition-colors select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-title-medium ${group.badgeColor} shrink-0 shadow-sm`}>
                      G{group.level}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-title-large font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                          {group.title}
                        </h3>

                        <Badge variant={group.category === 'JUNIOR_HIGH' ? 'success' : 'primary'}>
                          {group.category === 'JUNIOR_HIGH' ? 'Junior High' : 'Senior High'}
                        </Badge>

                        <span className={`text-label-small font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                          hasClasses
                            ? 'bg-m3-sys-light-secondary-container text-m3-sys-light-on-secondary-container border-m3-sys-light-outline-variant/30'
                            : 'bg-m3-sys-light-surface-variant/40 text-m3-sys-light-on-surface-variant border-transparent'
                        }`}>
                          {gradeClasses.length} {gradeClasses.length === 1 ? 'Section' : 'Sections'}
                        </span>
                      </div>

                      {/* Collapsed Subtitle Preview */}
                      <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-0.5 line-clamp-1">
                        {!isExpanded && hasClasses
                          ? `Sections: ${gradeClasses.map((c) => c.sectionName).join(', ')}`
                          : group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {canManage && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateForGrade(group.level);
                        }}
                        icon={<Plus className="w-3.5 h-3.5" />}
                        className="rounded-full text-xs py-1.5 px-3"
                      >
                        Add Section
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGradeExpand(group.level);
                      }}
                      className="p-2 rounded-full hover:bg-m3-sys-light-surface-variant/50 text-m3-sys-light-on-surface-variant transition-colors"
                      title={isExpanded ? 'Collapse section' : 'Expand section'}
                      aria-label={isExpanded ? `Collapse ${group.title}` : `Expand ${group.title}`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-m3-sys-light-primary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-m3-sys-light-on-surface-variant" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Card Content Area */}
                {isExpanded && (
                  <div className="p-5 pt-2 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20 bg-m3-sys-light-surface-variant/10 dark:bg-m3-sys-dark-surface-variant/10">
                    {gradeClasses.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-m3-sys-light-outline-variant/40 dark:border-m3-sys-dark-outline-variant/40 bg-m3-sys-light-surface/60 dark:bg-m3-sys-dark-surface/60 text-center space-y-2.5">
                        <BookOpen className="w-7 h-7 text-m3-sys-light-on-surface-variant/40 mx-auto" />
                        <div>
                          <p className="text-title-small font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                            No Sections Created in {group.title}
                          </p>
                          <p className="text-body-small text-m3-sys-light-on-surface-variant max-w-sm mx-auto mt-0.5">
                            Click below to create the first section for {group.title}.
                          </p>
                        </div>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenCreateForGrade(group.level)}
                            icon={<Plus className="w-3.5 h-3.5" />}
                            className="rounded-full shadow-expressive-sm text-xs mt-1"
                          >
                            Create {group.title} Section
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                        {gradeClasses.map((cls) => (
                          <ClassCard
                            key={cls.id}
                            cls={cls}
                            onSelectClass={() => {}}
                            onCreateSession={handleCreateQuickSession}
                            onEditClass={canManage ? handleOpenEdit : undefined}
                            onDeleteClass={canManage ? handleDeleteClass : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scheduled Class Sessions History List */}
      <Card
        title="Active & Scheduled Class Sessions"
        subtitle="Live dynamic QR attendance check-in checkpoints for registered class sections"
      >
        <div className="divide-y divide-m3-sys-light-outline-variant/30 dark:divide-m3-sys-dark-outline-variant/30">
          {sessions.length === 0 ? (
            <p className="text-body-medium text-m3-sys-light-on-surface-variant text-center py-6">
              No sessions active currently. Click "Launch QR Attendance" on any class section above.
            </p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl font-bold text-title-small shrink-0 text-white ${s.gradeLevel <= 10 ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                    {s.classCode}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-title-medium font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                        {s.title}
                      </h4>
                      <Badge variant={s.gradeLevel <= 10 ? 'success' : 'primary'}>
                        Grade {s.gradeLevel}
                      </Badge>
                      <Badge
                        variant={
                          s.status === 'ACTIVE'
                            ? 'emerald'
                            : s.status === 'UPCOMING'
                            ? 'indigo'
                            : 'slate'
                        }
                      >
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-0.5">
                      Section: <strong>{s.sectionName}</strong> • {s.room} • {s.date} ({s.startTime} - {s.endTime})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-end">
                  <span className="text-label-large text-m3-sys-light-on-surface-variant font-medium">
                    {s.attendedCount} / {s.totalExpectedCount} Checked-In
                  </span>
                  <Button
                    size="sm"
                    variant={s.status === 'ACTIVE' ? 'primary' : 'outline'}
                    onClick={onOpenQRScanner}
                    icon={<QrCode className="w-4 h-4" />}
                    className="rounded-full shadow-expressive-sm"
                  >
                    {s.status === 'ACTIVE' ? 'Show Live QR Code' : 'View Token'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Class Section Create/Edit Modal */}
      <ClassFormModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setSelectedClassToEdit(null);
        }}
        onSuccess={fetchData}
        initialClass={selectedClassToEdit}
        defaultGradeLevel={defaultCreateGrade}
        currentUserRole={user?.role}
        currentUserId={user?.id}
        currentUserName={user?.name}
      />
    </div>
  );
};

