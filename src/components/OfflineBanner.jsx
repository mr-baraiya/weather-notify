'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div
      style={{
        background: isOffline
          ? 'rgba(225, 29, 72, 0.85)'
          : 'rgba(16, 185, 129, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
      className="fixed top-0 left-0 right-0 z-[10000] text-white py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-300 animate-slide-down border-b border-white/20"
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-rose-200" />
          <span>You are currently offline. Please check your internet connection.</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-3 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reload
          </button>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>Internet connection restored!</span>
        </>
      )}
    </div>
  );
}
