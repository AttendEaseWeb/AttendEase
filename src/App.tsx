import React, { useState } from 'react';
import { AuthProvider, useAuth } from './client/context/AuthContext';
import { NotificationProvider } from './client/context/NotificationContext';
import { Sidebar } from './client/components/layout/Sidebar';
import { Navbar } from './client/components/layout/Navbar';
import { DashboardPage } from './client/features/dashboard/pages/DashboardPage';
import { EventsPage } from './client/features/events/pages/EventsPage';
import { AttendancePage } from './client/features/attendance/pages/AttendancePage';
import { UsersPage } from './client/features/users/pages/UsersPage';
import { QRCheckInModal } from './client/features/attendance/components/QRCheckInModal';
import { AuthPage } from './client/features/auth/pages/AuthPage';

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen font-sans text-m3-sys-light-on-background dark:text-m3-sys-dark-on-background antialiased selection:bg-m3-sys-light-primary selection:text-m3-sys-light-on-primary relative overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onOpenQRScanner={() => setIsQRModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isCollapsed={isCollapsed}
        />

        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto space-y-6 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onOpenQRScanner={() => setIsQRModalOpen(true)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'events' && (
            <EventsPage onOpenQRScanner={() => setIsQRModalOpen(true)} />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage onOpenQRScanner={() => setIsQRModalOpen(true)} />
          )}

          {activeTab === 'users' && <UsersPage />}
        </main>
      </div>

      {/* Global Live QR Code Check-In Modal */}
      <QRCheckInModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}

