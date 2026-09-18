import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 z-[9998] flex items-center gap-2 rounded-xl bg-amber-950/90 border border-amber-500/50 backdrop-blur-md px-3.5 py-2 text-xs font-mono text-amber-200 shadow-2xl animate-in slide-in-from-bottom-2 duration-300"
    >
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <div>
        <span className="font-semibold text-white">FIELD OFFLINE MODE</span>
        <span className="hidden sm:inline text-amber-300/80 ml-1.5">— Operating from cached telemetry & local sensor math.</span>
      </div>
    </div>
  );
};
