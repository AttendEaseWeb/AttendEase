import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Courses & Sessions', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Records', icon: ClipboardCheck },
    { id: 'users', label: 'User Directory', icon: Users },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Slide-over Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          bg-m3-sys-light-surface-variant/40 dark:bg-m3-sys-dark-surface border-r border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50
          /* Mobile Drawer Positioning */
          fixed inset-y-0 left-0 lg:static h-full min-h-screen
          ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          /* Desktop Width Control */
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary rounded-xl text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <h1 className="font-bold text-title-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface tracking-wide leading-none truncate">
                  AttendEase
                </h1>
                <p className="text-label-small text-m3-sys-light-primary dark:text-m3-sys-dark-primary font-medium mt-0.5 truncate">
                  Attendance Management
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-full text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 focus:outline-none"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          {!isMobileOpen && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-full text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 sm:p-4 flex-1 space-y-1.5 overflow-y-auto">
          {(!isCollapsed || isMobileOpen) && (
            <div className="text-label-small uppercase tracking-wider text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant px-3 pb-2">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-full font-medium text-label-large transition-all cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
                } ${
                  isActive
                    ? 'bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container font-semibold'
                    : 'text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/50 dark:hover:bg-m3-sys-dark-surface-variant/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container' : 'text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant'}`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer System Info */}
        <div className="p-3 sm:p-4 border-t border-m3-sys-light-outline-variant dark:border-m3-sys-dark-outline-variant bg-m3-sys-light-surface-variant/20 dark:bg-m3-sys-dark-surface-variant/20">
          <div
            className={`flex items-center text-label-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'
            }`}
          >
            {(!isCollapsed || isMobileOpen) && <span>v1.0.0</span>}
            <span className="flex items-center gap-1.5 text-m3-sys-light-primary dark:text-m3-sys-dark-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary animate-pulse shrink-0" />
              {(!isCollapsed || isMobileOpen) && 'Live API'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

