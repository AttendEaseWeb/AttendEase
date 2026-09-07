import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Server, Activity, WifiOff, CheckCircle2 } from "lucide-react";

interface AppLoadingProps {
  isServerAwake: boolean;
  isOffline: boolean;
  minDisplayTimeMs?: number;
}

export const AppLoading: React.FC<AppLoadingProps> = ({
  isServerAwake,
  isOffline,
  minDisplayTimeMs = 1500,
}) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isTakingLong, setIsTakingLong] = useState(false);

  useEffect(() => {
    let minTimePassed = false;
    const minTimer = setTimeout(() => {
      minTimePassed = true;
      if (isServerAwake || isOffline) {
        setShowSplash(false);
      }
    }, minDisplayTimeMs);

    const longTimer = setTimeout(() => {
      setIsTakingLong(true);
    }, 4000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(longTimer);
    };
  }, []);

  useEffect(() => {
    if (isServerAwake || isOffline) {
      setTimeout(() => {
        setShowSplash(false);
      }, minDisplayTimeMs);
    }
  }, [isServerAwake, isOffline, minDisplayTimeMs]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface flex flex-col items-center justify-center p-6"
        >
          <div className="relative flex flex-col items-center max-w-sm w-full text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-24 h-24 mb-8 flex items-center justify-center rounded-3xl bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container"
            >
              {isOffline ? (
                <WifiOff className="w-12 h-12" />
              ) : (
                <Server className="w-12 h-12" />
              )}

              {!isOffline && !isServerAwake && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[3px] border-transparent border-t-m3-sys-light-primary dark:border-t-m3-sys-dark-primary rounded-3xl"
                />
              )}
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-3"
            >
              <h1 className="text-2xl font-bold tracking-tight text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
                AttendEase
              </h1>

              <div className="h-6 flex items-center justify-center text-sm font-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                <AnimatePresence mode="wait">
                  {isOffline ? (
                    <motion.div
                      key="offline"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2"
                    >
                      <WifiOff className="w-4 h-4" />
                      <span>Offline Mode Enabled</span>
                    </motion.div>
                  ) : isServerAwake ? (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Connected Securely</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>
                        {isTakingLong
                          ? "Waking up cloud server..."
                          : "Connecting..."}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
