import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../../shared/types/auth';
import {
  Shield,
  UserCheck,
  GraduationCap,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  CheckCircle2,
  Search,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  onOpenQRScanner?: () => void;
  activeTab: string;
  onToggleMobileMenu: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQRScanner,
  activeTab,
  onToggleMobileMenu,
  onToggleCollapse,
  isCollapsed,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-6 py-2.5 sm:py-3.5">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu / Collapse Toggle / Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Brand Title */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
              AttendEase
            </span>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, sessions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Section: Scan Button / Role Switcher / User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Check-in Scan Button */}
          {onOpenQRScanner && (
            <button
              id="navbar-qr-scanner-btn"
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
              title={user?.role === 'STUDENT' ? 'Scan & Check In' : 'Display Session QR'}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">
                {user?.role === 'STUDENT' ? 'Scan' : 'QR Code'}
              </span>
            </button>
          )}

          {/* Current Logged-In Account Role Badge */}
          {user && (
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold border shrink-0 ${
                user.role === 'STUDENT'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                  : user.role === 'INSTRUCTOR'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
              title={`Logged in as ${user.role.toLowerCase()}`}
            >
              {user.role === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              {user.role === 'INSTRUCTOR' && <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              <span className="capitalize text-[11px] sm:text-xs">{user.role.toLowerCase()}</span>
            </div>
          )}

          {/* User Profile Avatar & Logout */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{user?.department}</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

