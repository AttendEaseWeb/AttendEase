import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ScheduleEntry {
  id: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sectionId: string;
  subject: string;
}

interface ScheduleContextType {
  schedule: ScheduleEntry[];
  addEntry: (entry: Omit<ScheduleEntry, 'id'>) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, entry: Omit<ScheduleEntry, 'id'>) => void;
  isConfigured: boolean;
  hideNotice: boolean;
  setHideNotice: (hide: boolean) => void;
  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: (isOpen: boolean) => void;
  currentActiveEntry: ScheduleEntry | null;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [hideNotice, setHideNotice] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentActiveEntry, setCurrentActiveEntry] = useState<ScheduleEntry | null>(null);

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`schedule_${user.id}`);
      if (stored) {
        setSchedule(JSON.parse(stored));
      } else {
        setSchedule([]);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`schedule_${user.id}`, JSON.stringify(schedule));
    }
  }, [schedule, user?.id]);

  useEffect(() => {
    // Check current time against schedule every minute
    const checkSchedule = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      const active = schedule.find(entry => {
        if (entry.dayOfWeek !== currentDay) return false;
        return currentTimeStr >= entry.startTime && currentTimeStr <= entry.endTime;
      });

      setCurrentActiveEntry(active || null);
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const addEntry = (entry: Omit<ScheduleEntry, 'id'>) => {
    setSchedule(prev => [...prev, { ...entry, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeEntry = (id: string) => {
    setSchedule(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, entry: Omit<ScheduleEntry, 'id'>) => {
    setSchedule(prev => prev.map(e => e.id === id ? { ...entry, id } : e));
  };

  const isConfigured = schedule.length > 0;

  return (
    <ScheduleContext.Provider value={{
      schedule,
      addEntry,
      removeEntry,
      updateEntry,
      isConfigured,
      hideNotice,
      setHideNotice,
      isScheduleModalOpen,
      setIsScheduleModalOpen,
      currentActiveEntry
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
