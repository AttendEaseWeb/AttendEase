import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  School,
  ClipboardCheck,
  Users,
} from 'lucide-react';

interface FloatingDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initially
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Classes', icon: School },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    ...(user?.role === 'ADMIN' ? [{ id: 'users', label: 'Directory', icon: Users }] : []),
  ];

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100vw-1.5rem)] pointer-events-none flex justify-center">
      <motion.div
        layout
        className={`bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-700/80 ring-1 ring-black/10 dark:ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_6px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.8),0_6px_20px_rgba(0,0,0,0.5)] rounded-full p-2.5 sm:p-3 flex items-center transition-all duration-300 pointer-events-auto max-w-full overflow-x-auto no-scrollbar ${
          isScrolled ? 'gap-2.5 sm:gap-3.5' : 'gap-2 sm:gap-3'
        }`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showLabel = !isScrolled && isActive;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex items-center justify-center py-3 sm:py-3.5 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                showLabel 
                  ? 'px-5 sm:px-6.5' 
                  : 'px-3.5 sm:px-4.5'
              } ${
                isActive 
                  ? 'text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container font-bold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'
              }`}
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="dock-active-bg"
                  className="absolute inset-0 bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container ring-1 ring-m3-sys-light-primary/30 dark:ring-m3-sys-dark-primary/40 shadow-sm rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5 relative z-10 shrink-0 transition-transform duration-300" strokeWidth={isActive ? 2.5 : 2} />
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out relative z-10 flex items-center ${
                  showLabel ? 'max-w-[180px] opacity-100 ml-2.5 sm:ml-3' : 'max-w-0 opacity-0 ml-0'
                }`}
              >
                <span className="font-bold text-sm sm:text-base whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
