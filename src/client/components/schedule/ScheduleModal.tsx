import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchedule, ScheduleEntry } from '../../context/ScheduleContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { ClassSection } from '../../../shared/types/class';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
  const { schedule, addEntry, removeEntry, updateEntry } = useSchedule();
  const { user } = useAuth();
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(new Date().getDay() === 0 ? 1 : (new Date().getDay() > 5 ? 1 : new Date().getDay())); // Default to current day, skip weekends mostly

  useEffect(() => {
    if (isOpen && user) {
      // Fetch sections assigned to the instructor
      const fetchSections = async () => {
        setIsLoading(true);
        try {
          // Just fetching all sections from our mock backend API
          const response = await fetch('/api/classes');
          const data = await response.json();
          const mySections = data.filter((s: ClassSection) => s.instructorId === user.id);
          setSections(mySections);
        } catch (error) {
          console.error("Failed to load sections", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSections();
    }
  }, [isOpen, user]);

  const handleAddEntry = () => {
    if (sections.length === 0) return;
    
    addEntry({
      dayOfWeek: activeTab,
      startTime: '08:00',
      endTime: '09:00',
      sectionId: sections[0].id,
      subject: sections[0].subjects[0] || 'General',
    });
  };

  const currentDayEntries = schedule.filter(e => e.dayOfWeek === activeTab).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
          <span>My Class Schedule</span>
        </div>
      }
      size="lg"
    >
      <div className="flex flex-col space-y-6">
        <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
          Configure your weekly schedule here. Classes matching the current time will be automatically highlighted on your Dashboard and Classes tabs.
        </p>

        {/* Days of Week Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {[1, 2, 3, 4, 5].map((day) => (
            <button
              key={day}
              onClick={() => setActiveTab(day)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-label-large transition-colors shrink-0 ${
                activeTab === day
                  ? 'bg-m3-sys-light-primary text-m3-sys-light-on-primary dark:bg-m3-sys-dark-primary dark:text-m3-sys-dark-on-primary'
                  : 'bg-m3-sys-light-surface-variant/50 text-m3-sys-light-on-surface-variant hover:bg-m3-sys-light-surface-variant dark:bg-m3-sys-dark-surface-variant/50 dark:text-m3-sys-dark-on-surface-variant dark:hover:bg-m3-sys-dark-surface-variant'
              }`}
            >
              {DAYS_OF_WEEK[day]}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-title-small font-semibold">
              {DAYS_OF_WEEK[activeTab]}'s Schedule
            </h4>
            <Button
              variant="tonal"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddEntry}
              disabled={sections.length === 0}
            >
              Add Slot
            </Button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-m3-sys-light-on-surface-variant animate-pulse">
              Loading your sections...
            </div>
          ) : sections.length === 0 ? (
            <div className="py-8 text-center bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 rounded-2xl text-m3-sys-light-on-surface-variant">
              You don't have any sections assigned to you yet.
            </div>
          ) : currentDayEntries.length === 0 ? (
            <div className="py-8 text-center bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 rounded-2xl text-m3-sys-light-on-surface-variant">
              No classes scheduled for {DAYS_OF_WEEK[activeTab]}.
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {currentDayEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row gap-3 p-4 bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 rounded-2xl items-start sm:items-center"
                  >
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateEntry(entry.id, { ...entry, startTime: e.target.value })}
                        className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-body-medium focus:ring-2 focus:ring-m3-sys-light-primary focus:outline-none"
                        required
                      />
                      <span className="text-zinc-500">-</span>
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateEntry(entry.id, { ...entry, endTime: e.target.value })}
                        className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-body-medium focus:ring-2 focus:ring-m3-sys-light-primary focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={entry.sectionId}
                        onChange={(e) => {
                          const newSection = sections.find(s => s.id === e.target.value);
                          updateEntry(entry.id, { 
                            ...entry, 
                            sectionId: e.target.value,
                            subject: newSection?.subjects[0] || entry.subject
                          });
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-body-medium focus:ring-2 focus:ring-m3-sys-light-primary focus:outline-none"
                      >
                        {sections.map(s => (
                          <option key={s.id} value={s.id}>{s.sectionName}</option>
                        ))}
                      </select>
                      
                      <select
                        value={entry.subject}
                        onChange={(e) => updateEntry(entry.id, { ...entry, subject: e.target.value })}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-body-medium focus:ring-2 focus:ring-m3-sys-light-primary focus:outline-none"
                      >
                        {sections.find(s => s.id === entry.sectionId)?.subjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        )) || <option value={entry.subject}>{entry.subject}</option>}
                      </select>
                    </div>

                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors ml-auto shrink-0"
                      title="Remove slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 mt-6">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
};
