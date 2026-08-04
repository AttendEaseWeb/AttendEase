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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="indigo" size="md">
            {course.code}
          </Badge>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {course.department}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Meta Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{course.room}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{course.totalStudents} Enrolled Students</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
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
