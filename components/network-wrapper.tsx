"use client";

import { AlertCircle, WifiOff, Wifi, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NetworkWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(
    // typeof window !== "undefined" ? navigator.onLine : true
    true
  );
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Hide the "Back Online" banner after 3 seconds
      const timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 w-full max-w-sm px-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 blur-md opacity-20 animate-pulse" />
                <div className="relative size-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg">
                  <WifiOff className="size-5 text-white animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white leading-tight">
                  Connection Lost
                </h3>
                <p className="text-xs text-red-100/60">
                  Playing in offline mode
                </p>
              </div>
              <AlertCircle className="size-5 text-red-400 animate-pulse" />
            </div>
          </motion.div>
        )}

        {showBackOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 w-full max-w-sm px-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 backdrop-blur-xl border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <div className="size-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                <Wifi className="size-5 text-white animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white leading-tight">
                  Back Online
                </h3>
                <p className="text-xs text-green-100/60">
                  Connection restored successfully
                </p>
              </div>
              <CheckCircle2 className="size-5 text-green-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

export default NetworkWrapper;
