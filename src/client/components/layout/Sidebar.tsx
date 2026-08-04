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
          bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50
          /* Mobile Drawer Positioning */
          fixed inset-y-0 left-0 lg:static h-full min-h-screen
          ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          /* Desktop Width Control */
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-wide leading-none truncate">
                  AttendEase
                </h1>
                <p className="text-[10px] text-indigo-400 font-medium mt-0.5 truncate">
                  Attendance Management
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          {!isMobileOpen && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 pb-2">
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
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer System Info */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div
            className={`flex items-center text-[11px] text-slate-500 ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'
            }`}
          >
            {(!isCollapsed || isMobileOpen) && <span>v1.0.0</span>}
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              {(!isCollapsed || isMobileOpen) && 'Live API'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

