import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './client/context/AuthContext';
import { NotificationProvider } from './client/context/NotificationContext';
import { Navbar } from './client/components/layout/Navbar';
import { FloatingDock } from './client/components/layout/FloatingDock';
import { DashboardPage } from './client/features/dashboard/pages/DashboardPage';
import { ClassesPage } from './client/features/events/pages/ClassesPage';
import { AttendancePage } from './client/features/attendance/pages/AttendancePage';
import { UsersPage } from './client/features/users/pages/UsersPage';
import { QRCheckInModal } from './client/features/attendance/components/QRCheckInModal';
import { AuthPage } from './client/features/auth/pages/AuthPage';

function MainLayout() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const effectiveTab = activeTab === 'users' && user?.role !== 'ADMIN' ? 'dashboard' : activeTab;

  useEffect(() => {
    const el = document.getElementById('main-scroll-container');
    if (el) el.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }, [effectiveTab]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-[100dvh] font-sans text-m3-sys-light-on-background dark:text-m3-sys-dark-on-background antialiased selection:bg-m3-sys-light-primary selection:text-m3-sys-light-on-primary relative overflow-hidden">
      <Navbar
        activeTab={effectiveTab}
        onOpenQRScanner={() => setIsQRModalOpen(true)}
      />
      {/* Main Content Area */}
      <div 
        id="main-scroll-container"
        className="flex-1 overflow-y-auto min-w-0 flex flex-col"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0px, black 80px, black calc(100% - 120px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 80px, black calc(100% - 120px), transparent 100%)"
        }}
      >

        <main className="flex-1 p-3.5 sm:p-6 pt-24 sm:pt-28 pb-32 sm:pb-40 max-w-7xl w-full mx-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="space-y-6"
            >
              {effectiveTab === 'dashboard' && (
                <DashboardPage
                  onOpenQRScanner={() => setIsQRModalOpen(true)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}

              {effectiveTab === 'events' && (
                <ClassesPage onOpenQRScanner={() => setIsQRModalOpen(true)} />
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

