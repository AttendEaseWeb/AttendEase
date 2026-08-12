import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  UserCheck,
  GraduationCap,
  QrCode,
  CheckCircle2,
  Search,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenQRScanner?: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQRScanner,
  activeTab,
}) => {
  const { user, logout } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-40 w-full pointer-events-none">
      <header className="pointer-events-auto w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-zinc-200/90 dark:border-zinc-700/90 shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] rounded-b-[2rem] px-4 sm:px-6 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto w-full min-w-0">
        {/* Left Section: Brand / Search */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Desktop & Mobile Brand Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 sm:mr-4 shrink-0">
            <div className="p-1.5 bg-m3-sys-light-primary rounded-xl text-m3-sys-light-on-primary shadow-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-title-medium sm:text-title-large tracking-tight text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
              AttendEase
            </span>
          </div>

          {/* Responsive Search Bar */}
          <div className="relative hidden md:block w-36 lg:w-48 xl:w-64 transition-all">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-8 py-1.5 text-body-medium bg-m3-sys-light-surface-variant/40 dark:bg-m3-sys-dark-surface-variant/30 border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary focus:bg-m3-sys-light-surface dark:focus:bg-m3-sys-dark-surface shadow-expressive-sm transition-all"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-m3-sys-light-surface-variant dark:bg-m3-sys-dark-surface-variant text-m3-sys-light-on-surface-variant font-semibold">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Section: Term Chip / Scan / Notifications / Role Badge / Profile & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          {/* Active Academic Term Badge - Only on ultra wide screens */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-m3-sys-light-surface-variant/50 dark:bg-m3-sys-dark-surface-variant/50 text-label-small font-semibold text-m3-sys-light-on-surface-variant border border-m3-sys-light-outline-variant/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AY 2026-2027 • Term 1</span>
          </div>

          {/* Quick Check-in Launch QR Button */}
          {onOpenQRScanner && (
            <button
              id="navbar-qr-scanner-btn"
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-m3-sys-light-primary hover:bg-m3-sys-light-primary/90 text-m3-sys-light-on-primary dark:bg-m3-sys-dark-primary dark:text-m3-sys-dark-on-primary rounded-full text-label-large font-semibold shadow-sm transition-all duration-150 ease-out hover:scale-[1.04] active:scale-[0.96] transform-gpu cursor-pointer shrink-0"
              title={user?.role === 'STUDENT' ? 'Scan & Check In' : 'Display Session QR'}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline text-label-medium">
                {user?.role === 'STUDENT' ? 'Scan QR' : 'Launch QR'}
              </span>
            </button>
          )}

          {/* Notifications Trigger */}
          <button
            onClick={() => setHasNotifications(false)}
            className="relative p-2 rounded-full text-m3-sys-light-on-surface-variant hover:text-m3-sys-light-on-surface hover:bg-m3-sys-light-surface-variant/60 dark:hover:bg-m3-sys-dark-surface-variant/60 transition-all duration-150 ease-out hover:scale-110 active:scale-90 transform-gpu shrink-0 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 shrink-0" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-m3-sys-light-error dark:bg-m3-sys-dark-error animate-pulse" />
            )}
          </button>

          {/* Role Badge Indicator */}
          {user && (
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-label-medium font-semibold border shrink-0 ${
                user.role === 'STUDENT'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : user.role === 'INSTRUCTOR'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}
              title={`Logged in as ${user.role.toLowerCase()}`}
            >
              {user.role === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5 shrink-0" />}
              {user.role === 'INSTRUCTOR' && <UserCheck className="w-3.5 h-3.5 shrink-0" />}
              {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 shrink-0" />}
              <span className="capitalize hidden sm:inline">{user.role.toLowerCase()}</span>
            </div>
          )}

          {/* User Profile Avatar */}
          <div className="relative shrink-0" ref={menuRef}>
            <div className="flex items-center pl-1.5 sm:pl-2 border-l border-m3-sys-light-outline-variant/40 dark:border-m3-sys-dark-outline-variant/40 shrink-0">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full focus:outline-none cursor-pointer p-0.5 transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-[0.95] transform-gpu shrink-0"
                title="Account Info"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-m3-sys-light-primary/30 shrink-0"
                />
                <div className="hidden 2xl:flex flex-col text-left max-w-[110px]">
                  <span className="text-label-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface leading-tight truncate">
                    {user?.name}
                  </span>
                  <span className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant truncate">
                    {user?.department}
                  </span>
                </div>
              </button>
            </div>

            {/* Solid Non-Transparent Account Popover Menu with Backdrop */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop overlay for darkened & blurred background */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-2xl z-50 transform-gpu"
                  >
                    {/* Account Info Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <img
                      src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={user?.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-m3-sys-light-primary/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-title-small text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface truncate">
                        {user?.name}
                      </div>
                      <div className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant truncate">
                        {user?.email}
                      </div>
                      <div className="text-label-small text-m3-sys-light-primary dark:text-m3-sys-dark-primary font-semibold mt-0.5 capitalize truncate">
                        Role: {user?.role.toLowerCase()}
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="py-3 border-b border-zinc-100 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-body-small">
                      <span className="text-m3-sys-light-on-surface-variant">Department:</span>
                      <span className="font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{user?.department || 'Academic'}</span>
                    </div>
                    {user?.studentId && (
                      <div className="flex items-center justify-between text-body-small">
                        <span className="text-m3-sys-light-on-surface-variant">Student ID:</span>
                        <span className="font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">{user.studentId}</span>
                      </div>
                    )}
                  </div>

                  {/* Logout Button in Menu */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-label-large hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
      </header>
    </div>
  );
};


