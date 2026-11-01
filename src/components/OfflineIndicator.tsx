import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#141414] border border-[#383838] px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-zinc-300 shadow-lg">
      <WifiOff className="w-3.5 h-3.5 text-purple-400" />
      <span>Offline Mode — Full PDF export works locally</span>
    </div>
  );
};
