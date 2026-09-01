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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Show label when tab changes, then hide after a delay
    setIsCollapsed(false);
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  useEffect(() => {
    let ticking = false;
    const scrollContainer = document.getElementById('main-scroll-container');
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (scrollContainer && scrollContainer.scrollTop > 20) {
            setIsCollapsed(true);
          } else if (scrollContainer && scrollContainer.scrollTop <= 20) {
            setIsCollapsed(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Classes', icon: School },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    ...(user?.role === 'ADMIN' ? [{ id: 'users', label: 'Directory', icon: Users }] : []),
  ];

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-1.5rem)] pointer-events-none flex justify-center">
      <div
        className={`bg-white dark:bg-zinc-900 backdrop-blur-2xl border border-zinc-200/90 dark:border-zinc-700/90 ring-1 ring-black/10 dark:ring-white/15 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.22),0_10px_24px_-6px_rgba(0,0,0,0.12)] dark:shadow-[0_28px_70px_-10px_rgba(0,0,0,0.85),0_12px_28px_-6px_rgba(0,0,0,0.6)] rounded-full p-2.5 sm:p-3 flex items-center transition-all duration-300 transform-gpu pointer-events-auto max-w-full overflow-x-auto no-scrollbar ${
          isCollapsed ? 'gap-2.5 sm:gap-3.5' : 'gap-2 sm:gap-3'
        }`}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showLabel = !isCollapsed && isActive;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`relative flex items-center justify-center py-3 sm:py-3.5 rounded-full transition-all duration-200 ease-out transform-gpu hover:scale-[1.04] active:scale-[0.96] cursor-pointer shrink-0 ${
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
                  className="absolute inset-0 bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container ring-1 ring-m3-sys-light-primary/40 dark:ring-m3-sys-dark-primary/50 shadow-md rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              
              <div
                className={`relative z-10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5 relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
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
      </div>
    </div>
  );
};
