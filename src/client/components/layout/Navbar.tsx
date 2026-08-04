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
    <header className="sticky top-0 z-30 bg-m3-sys-light-surface/90 dark:bg-m3-sys-dark-surface/90 backdrop-blur-md border-b border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant px-3.5 sm:px-6 py-2.5 sm:py-3.5">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu / Collapse Toggle / Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-full text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 focus:outline-none transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-full text-m3-sys-light-on-surface-variant hover:text-m3-sys-light-on-surface dark:hover:text-m3-sys-dark-on-surface hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 transition-colors"
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
            <div className="p-1.5 bg-m3-sys-light-primary rounded-xl text-m3-sys-light-on-primary">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-title-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface tracking-tight">
              AttendEase
            </span>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
            <input
              type="text"
              placeholder="Search courses, sessions..."
              className="w-full pl-9 pr-3 py-2 text-body-medium bg-m3-sys-light-surface-variant/50 dark:bg-m3-sys-dark-surface-variant/30 border border-transparent dark:border-transparent rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary focus:bg-m3-sys-light-surface dark:focus:bg-m3-sys-dark-surface"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-m3-sys-light-primary hover:bg-m3-sys-light-primary/90 text-m3-sys-light-on-primary rounded-full text-label-large font-medium shadow-sm transition-all cursor-pointer shrink-0"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-medium border shrink-0 ${
                user.role === 'STUDENT'
                  ? 'bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container'
                  : user.role === 'INSTRUCTOR'
                  ? 'bg-m3-sys-light-tertiary-container dark:bg-m3-sys-dark-tertiary-container border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant text-m3-sys-light-on-tertiary-container dark:text-m3-sys-dark-on-tertiary-container'
                  : 'bg-m3-sys-light-error-container dark:bg-m3-sys-dark-error-container border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant text-m3-sys-light-on-error-container dark:text-m3-sys-dark-on-error-container'
              }`}
              title={`Logged in as ${user.role.toLowerCase()}`}
            >
              {user.role === 'STUDENT' && <GraduationCap className="w-4 h-4 shrink-0" />}
              {user.role === 'INSTRUCTOR' && <UserCheck className="w-4 h-4 shrink-0" />}
              {user.role === 'ADMIN' && <Shield className="w-4 h-4 shrink-0" />}
              <span className="capitalize">{user.role.toLowerCase()}</span>
            </div>
          )}

          {/* User Profile Avatar & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant shrink-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-m3-sys-light-primary/30 shrink-0"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-label-large text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface leading-tight">
                {user?.name}
              </span>
              <span className="text-body-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">{user?.department}</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 ml-1 rounded-full text-m3-sys-light-on-surface-variant hover:text-m3-sys-light-error hover:bg-m3-sys-light-error-container dark:hover:bg-m3-sys-dark-error-container transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

