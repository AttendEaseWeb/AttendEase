import React, { useEffect, useState } from 'react';
import { Course, Session } from '../../../../shared/types/event';
import { EventCard } from '../components/EventCard';
import { EventFormModal } from '../components/EventFormModal';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Plus, BookOpen, QrCode, Play, Calendar, Search } from 'lucide-react';

interface EventsPageProps {
  onOpenQRScanner: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onOpenQRScanner }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, sessionsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/sessions'),
      ]);
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
    } catch {
      showToast('Error loading courses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuickSession = async (course: Course) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          title: `Session: ${course.title} Check-in`,
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          room: course.room,
          status: 'ACTIVE',
          allowGeofence: true,
          attendedCount: 0,
          totalExpectedCount: course.totalStudents,
        }),
      });

      if (res.ok) {
        showToast(`Created new session for ${course.code}!`, 'success');
        fetchData();
        onOpenQRScanner();
      }
    } catch {
      showToast('Error launching session', 'error');
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-small text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
            Course & Session Directory
          </h2>
          <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1">
            Manage academic courses, schedule live sessions, and trigger QR attendance checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-body-medium bg-m3-sys-light-surface-variant/50 dark:bg-m3-sys-dark-surface-variant/30 border border-transparent dark:border-transparent rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary focus:bg-m3-sys-light-surface dark:focus:bg-m3-sys-dark-surface"
            />
          </div>

          {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
            <Button
              id="add-course-btn"
              onClick={() => setIsCourseModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Course
            </Button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <EventCard
            key={course.id}
            course={course}
            onSelectCourse={(c) => setSelectedCourse(c)}
            onCreateSession={handleCreateQuickSession}
            userRole={user?.role}
          />
        ))}
      </div>

      {/* All Scheduled Sessions List */}
      <Card title="Scheduled Session History & Live Controls" subtitle="All active and past class check-in sessions">
        <div className="divide-y divide-m3-sys-light-outline-variant dark:divide-m3-sys-dark-outline-variant">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-m3-sys-light-surface-variant dark:bg-m3-sys-dark-surface-variant rounded-2xl text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant font-bold text-title-small shrink-0">
                  {s.courseCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-title-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{s.title}</h4>
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
                    {s.room} • {s.date} ({s.startTime} - {s.endTime})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-end">
                <span className="text-label-large text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                  {s.attendedCount} / {s.totalExpectedCount} Attended
                </span>
                <Button
                  size="sm"
                  variant={s.status === 'ACTIVE' ? 'primary' : 'outline'}
                  onClick={onOpenQRScanner}
                  icon={<QrCode className="w-4 h-4" />}
                >
                  {s.status === 'ACTIVE' ? 'Show QR Code' : 'View Code'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Course Modal */}
      <EventFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
