import React, { useState } from 'react';
import { ClassSection } from '../../../../shared/types/class';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import {
  GraduationCap,
  Users,
  MapPin,
  Clock,
  QrCode,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface ClassCardProps {
  cls: ClassSection;
  onSelectClass: (cls: ClassSection) => void;
  onCreateSession: (cls: ClassSection) => void;
  onEditClass?: (cls: ClassSection) => void;
  onDeleteClass?: (cls: ClassSection) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  cls,
  onSelectClass,
  onCreateSession,
  onEditClass,
  onDeleteClass,
}) => {
  const { user } = useAuth();
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [enrolledStudentNames, setEnrolledStudentNames] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  const isJuniorHigh = cls.category === 'JUNIOR_HIGH';
  const canManage = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const loadRoster = async () => {
    if (!isRosterOpen && enrolledStudentNames.length === 0 && cls.enrolledStudentIds?.length > 0) {
      setIsLoadingRoster(true);
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const allUsers = await res.json();
          const students = allUsers.filter((u: any) => cls.enrolledStudentIds.includes(u.id));
          setEnrolledStudentNames(students);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingRoster(false);
      }
    }
    setIsRosterOpen(!isRosterOpen);
  };

  return (
    <Card variant="filled" hoverable className="relative group overflow-hidden flex flex-col justify-between border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 shadow-expressive-sm">
      {/* Top Banner Accent */}
      <div className={`h-2.5 w-full ${isJuniorHigh ? 'bg-emerald-500' : 'bg-indigo-600'}`} />

      <div className="p-5 space-y-4 flex-1">
        {/* Header Badges & Code */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isJuniorHigh ? 'success' : 'primary'}>
                {isJuniorHigh ? `Grade ${cls.gradeLevel} • Junior High` : `Grade ${cls.gradeLevel} • Senior High`}
              </Badge>
              {cls.strand && (
                <span className="text-label-small font-bold px-2 py-0.5 rounded-md bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container">
                  {cls.strand} Strand
                </span>
              )}
            </div>
            <h3 className="text-title-large font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-1">
              {cls.sectionName}
            </h3>
            <p className="text-body-medium font-medium text-m3-sys-light-primary dark:text-m3-sys-dark-primary">
              {cls.subject} ({cls.code})
            </p>
          </div>

          {canManage && onEditClass && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEditClass(cls)}
                className="p-1.5 rounded-lg hover:bg-m3-sys-light-surface-variant text-m3-sys-light-on-surface-variant"
                title="Edit Class Section & Students"
              >
                <Edit className="w-4 h-4" />
              </button>
              {onDeleteClass && (
                <button
                  onClick={() => onDeleteClass(cls)}
                  className="p-1.5 rounded-lg hover:bg-m3-sys-light-error-container text-m3-sys-light-error"
                  title="Delete Class Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Schedule & Room Details */}
        <div className="space-y-2 text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant pt-1 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-m3-sys-light-primary shrink-0" />
            <span className="truncate">Adviser/Instructor: <strong>{cls.instructorName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-m3-sys-light-primary shrink-0" />
            <span>{cls.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-m3-sys-light-primary shrink-0" />
            <span>{cls.room}</span>
          </div>
        </div>

        {/* Description if present */}
        {cls.description && (
          <p className="text-body-small text-m3-sys-light-on-surface-variant/80 dark:text-m3-sys-dark-on-surface-variant/80 line-clamp-2">
            {cls.description}
          </p>
        )}

        {/* Student Enrolled Roster Accordion */}
        <div className="pt-2 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
          <button
            type="button"
            onClick={loadRoster}
            className="w-full flex items-center justify-between text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface hover:text-m3-sys-light-primary py-1 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Users className="w-4 h-4 text-m3-sys-light-primary" />
              Enrolled Students ({cls.enrolledStudentIds?.length || 0})
            </span>
            {isRosterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isRosterOpen && (
            <div className="mt-2 p-3 bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 rounded-xl space-y-1.5 text-label-small">
              {isLoadingRoster ? (
                <p className="text-m3-sys-light-on-surface-variant text-center py-1">Loading roster...</p>
              ) : enrolledStudentNames.length > 0 ? (
                enrolledStudentNames.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{s.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-m3-sys-light-on-surface-variant italic">No students enrolled yet. Edit class to add students.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-m3-sys-light-surface-variant/20 dark:bg-m3-sys-dark-surface-variant/20 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => onSelectClass(cls)}
        >
          View Details
        </Button>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            className="rounded-full shadow-expressive-sm text-xs"
            onClick={() => onCreateSession(cls)}
            icon={<QrCode className="w-3.5 h-3.5" />}
          >
            Launch QR Attendance
          </Button>
        )}
      </div>
    </Card>
  );
};
