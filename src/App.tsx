import { AppLoading } from "./client/components/common/AppLoading";
/**
 * ------------------------------------------------------------------
 * ATTENDEASE MAIN USER INTERFACE (APP COMPONENT)
 * ------------------------------------------------------------------
 * This file represents the main visual structure of the app. It acts
 * as the master layout that decides which screen (Dashboard, Classes,
 * Attendance) to show the user based on what they click in the menu.
 *
 * It also wraps the whole app in important 'Providers' - invisible
 * wrappers that share things like the user's login status and popup
 * notifications across all screens.
 * ------------------------------------------------------------------
 */
import React, { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
// import OneSignal from 'react-onesignal';
import { AuthProvider, useAuth } from "./client/context/AuthContext";
import { NotificationProvider } from "./client/context/NotificationContext";
import {
  ScheduleProvider,
  useSchedule,
} from "./client/context/ScheduleContext";
import { Navbar } from "./client/components/layout/Navbar";
import { FloatingDock } from "./client/components/layout/FloatingDock";
const DashboardPage = lazy(() => import("./client/features/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const ClassesPage = lazy(() => import("./client/features/events/pages/ClassesPage").then(m => ({ default: m.ClassesPage })));
const AttendancePage = lazy(() => import("./client/features/attendance/pages/AttendancePage").then(m => ({ default: m.AttendancePage })));
const UsersPage = lazy(() => import("./client/features/users/pages/UsersPage").then(m => ({ default: m.UsersPage })));
const AuthPage = lazy(() => import("./client/features/auth/pages/AuthPage").then(m => ({ default: m.AuthPage })));
import { ScheduleNotice } from "./client/components/schedule/ScheduleNotice";
import { ScheduleModal } from "./client/components/schedule/ScheduleModal";

const PageLoader = () => (
  <div className="flex justify-center items-center h-64 w-full">
    <div className="w-8 h-8 rounded-full border-4 border-m3-sys-light-surface-variant dark:border-m3-sys-dark-surface-variant border-t-m3-sys-light-primary dark:border-t-m3-sys-dark-primary animate-spin" />
  </div>
);

function MainLayout() {
  const { isAuthenticated, user } = useAuth();
  const { isScheduleModalOpen, setIsScheduleModalOpen } = useSchedule();
  const [activeTab, setActiveTab] = useState("dashboard");
    const effectiveTab =
    activeTab === "users" && user?.role !== "ADMIN" ? "dashboard" : activeTab;
  useEffect(() => {
    const el = document.getElementById("main-scroll-container");
    if (el) el.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }, [effectiveTab]);
  useEffect(() => {
    // @ts-ignore
    const oneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    // OneSignal initialization temporarily disabled in preview to prevent persistent console errors.
    // Uncomment this block in your production environment if you need push notifications.
    /*
    const setupOneSignal = async () => {
      if (!oneSignalAppId) return;
      
      const hostname = window.location.hostname;
      const isRenderProd = hostname === 'attendease-nusg.onrender.com';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (!isRenderProd && !isLocalhost) {
        console.log('OneSignal bypassed.');
        return;
      }
      
      try {
        // @ts-ignore
        if (!window.OneSignalInitialized && !OneSignal.initialized) {
          // @ts-ignore
          window.OneSignalInitialized = true;
          await OneSignal.init({
            appId: oneSignalAppId,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: '/' },
            serviceWorkerPath: 'sw.js'
          });
        }
        OneSignal.Slidedown.promptPush();
        if (user?.email) {
          OneSignal.User.addAlias('external_id', user.email);
        }
      } catch (err: any) {
        // Ignore
      }
    };
    setupOneSignal();
    */
  }, [user?.email]);
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthPage />
      </Suspense>
    );
  }
  return (
    <div className="flex h-[100dvh] font-sans text-m3-sys-light-on-background dark:text-m3-sys-dark-on-background antialiased selection:bg-m3-sys-light-primary selection:text-m3-sys-light-on-primary relative overflow-hidden">
      <Navbar
        activeTab={effectiveTab}
      />
      {/* Main Content Area */}
      <div
        id="main-scroll-container"
        className="flex-1 overflow-y-auto min-w-0 flex flex-col"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0px, black 80px, black calc(100% - 120px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0px, black 80px, black calc(100% - 120px), transparent 100%)",
        }}
      >
        <main className="flex-1 p-3.5 sm:p-6 pt-24 sm:pt-28 pb-32 sm:pb-40 max-w-7xl w-full mx-auto min-w-0">
          <ScheduleNotice />
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.08, ease: "easeOut" }}
              className="space-y-6"
            >
              <Suspense fallback={<PageLoader />}>
              {effectiveTab === "dashboard" && (
                <DashboardPage
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}
              {effectiveTab === "events" && (
                <ClassesPage />
              )}
              {effectiveTab === "attendance" && (
                <AttendancePage
                />
              )}
              {effectiveTab === "users" && user?.role === "ADMIN" && (
                <UsersPage />
              )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
            <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
      <FloatingDock activeTab={effectiveTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  const [isServerAwake, setIsServerAwake] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      return;
    }

    let isMounted = true;

    const checkServer = async () => {
      try {
        const res = await fetch(`/api/health?t=${Date.now()}`);
        if (res.ok && isMounted) {
          setIsServerAwake(true);
        } else if (isMounted) {
          setTimeout(checkServer, 3000);
        }
      } catch (err) {
        if (isMounted) {
          if (!navigator.onLine) {
            setIsOffline(true);
          } else {
            setTimeout(checkServer, 3000);
          }
        }
      }
    };

    checkServer();

    return () => {
      isMounted = false;
    };
  }, [isOffline]);

  return (
    <>
      <AppLoading isServerAwake={isServerAwake} isOffline={isOffline} />
      <AuthProvider>
        <NotificationProvider>
          <ScheduleProvider>
            <MainLayout />
          </ScheduleProvider>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}
