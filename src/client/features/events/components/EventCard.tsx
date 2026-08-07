import React from 'react';
import { Course } from '../../../../shared/types/event';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { BookOpen, Users, Clock, MapPin, Plus, Play } from 'lucide-react';

interface EventCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
  onCreateSession: (course: Course) => void;
  userRole?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  course,
  onSelectCourse,
  onCreateSession,
  userRole,
}) => {
  return (
    <div className="bg-expressive-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-[28px] p-6 shadow-expressive-sm hover:shadow-expressive transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="px-3 py-1.5 bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container rounded-full text-label-small font-bold">
            {course.code}
          </div>
          <span className="text-label-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant bg-m3-sys-light-surface-variant/50 dark:bg-m3-sys-dark-surface-variant/50 px-2 py-1 rounded-md">
            {course.department}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-title-large text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface line-clamp-1 group-hover:text-m3-sys-light-primary dark:group-hover:text-m3-sys-dark-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Meta Info */}
        <div className="mt-5 pt-4 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20 space-y-2.5 text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary shrink-0" />
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary shrink-0" />
            <span>{course.room}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary shrink-0" />
            <span>{course.totalStudents} Enrolled Students</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 flex items-center justify-between gap-3 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectCourse(course)}
          className="w-full"
        >
          View Sessions
        </Button>
        {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onCreateSession(course)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Session
          </Button>
        )}
      </div>
    </div>
  );
};
