import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Server, Activity, WifiOff, CheckCircle2, Hexagon } from "lucide-react";

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
          key="splash"
          initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ 
            opacity: 0, 
            scale: 1.05, 
            filter: "blur(8px)", 
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-m3-sys-light-surface/95 dark:bg-m3-sys-dark-surface/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
        >
          {/* Ambient Glowing Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"
          />

          <div className="relative flex flex-col items-center max-w-sm w-full text-center z-10">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-28 h-28 mb-10 flex items-center justify-center rounded-[32px] bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-2xl shadow-indigo-500/30"
            >
              <div className="absolute inset-[2px] rounded-[30px] bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface flex items-center justify-center">
                {isOffline ? (
                  <WifiOff className="w-12 h-12 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface" />
                ) : (
                  <Hexagon className="w-14 h-14 text-indigo-500 dark:text-indigo-400" />
                )}
              </div>
              
              {!isOffline && !isServerAwake && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[3px] border-transparent border-t-white/80 rounded-[32px]"
                />
              )}
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-display-small font-bold tracking-tight text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400">
                AttendEase
              </h1>
              
              <div className="h-6 flex items-center justify-center text-label-large font-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                <AnimatePresence mode="wait">
                  {isOffline ? (
                    <motion.div
                      key="offline"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-2"
                    >
                      <WifiOff className="w-4 h-4" />
                      <span>Offline Mode Enabled</span>
                    </motion.div>
                  ) : isServerAwake ? (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Connected Securely</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }} 
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                      />
                      <span>
                        {isTakingLong
                          ? "Waking up cloud server..."
                          : "Initializing workspace..."}
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
