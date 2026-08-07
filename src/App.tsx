import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './client/context/AuthContext';
import { NotificationProvider } from './client/context/NotificationContext';
import { Navbar } from './client/components/layout/Navbar';
import { FloatingDock } from './client/components/layout/FloatingDock';
import { DashboardPage } from './client/features/dashboard/pages/DashboardPage';
import { EventsPage } from './client/features/events/pages/EventsPage';
import { AttendancePage } from './client/features/attendance/pages/AttendancePage';
import { UsersPage } from './client/features/users/pages/UsersPage';
import { QRCheckInModal } from './client/features/attendance/components/QRCheckInModal';
import { AuthPage } from './client/features/auth/pages/AuthPage';

function MainLayout() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const effectiveTab = activeTab === 'users' && user?.role !== 'ADMIN' ? 'dashboard' : activeTab;

  return (
    <div className="flex min-h-screen font-sans text-m3-sys-light-on-background dark:text-m3-sys-dark-on-background antialiased selection:bg-m3-sys-light-primary selection:text-m3-sys-light-on-primary relative overflow-x-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-32">
        <Navbar
          activeTab={effectiveTab}
          onOpenQRScanner={() => setIsQRModalOpen(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {effectiveTab === 'dashboard' && (
                <DashboardPage
                  onOpenQRScanner={() => setIsQRModalOpen(true)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}

              {effectiveTab === 'events' && (
                <EventsPage onOpenQRScanner={() => setIsQRModalOpen(true)} />
              )}

              {effectiveTab === 'attendance' && (
                <AttendancePage onOpenQRScanner={() => setIsQRModalOpen(true)} />
              )}

              {effectiveTab === 'users' && user?.role === 'ADMIN' && <UsersPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Live QR Code Check-In Modal */}
      <QRCheckInModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <FloatingDock activeTab={effectiveTab} setActiveTab={setActiveTab} />
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

