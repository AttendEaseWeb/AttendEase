import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarClock, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ScheduleNotice: React.FC = () => {
  const { isConfigured, hideNotice, setHideNotice, setIsScheduleModalOpen } = useSchedule();
  const { user } = useAuth();

  if (user?.role !== 'INSTRUCTOR' || isConfigured || hideNotice) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="mb-6 overflow-hidden"
      >
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative">
          <button
            onClick={() => setHideNotice(true)}
            className="absolute top-3 right-3 p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-full transition-colors"
            title="Hide for now"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3 pr-8">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full text-amber-700 dark:text-amber-400 shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-title-small font-bold text-amber-900 dark:text-amber-200">
                Set up your class schedule
              </h3>
              <p className="text-body-small text-amber-700 dark:text-amber-300/80 mt-1">
                Configure your schedule to automatically highlight your ongoing classes and subjects.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950 text-label-large font-bold rounded-full transition-colors shrink-0 w-full sm:w-auto justify-center"
          >
            <Settings className="w-4 h-4" />
            Configure Schedule
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
