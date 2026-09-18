import React from 'react';
import { ExternalLink, ShieldAlert, Crosshair, MapPin, Compass, X, Info, Globe, Smartphone } from 'lucide-react';
import { LocationCoords } from '../types';

interface GpsPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (loc: LocationCoords) => void;
  onIpLocationFallback?: () => void;
  onRetryGps?: () => void;
  onOpenManualSelector?: () => void;
  errorMessage?: string | null;
}

export const GpsPermissionModal: React.FC<GpsPermissionModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onIpLocationFallback,
  onRetryGps,
  onOpenManualSelector,
  errorMessage
}) => {
  if (!isOpen) return null;

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isFirefox = /Firefox|FxiOS/i.test(userAgent);

  const handleOpenNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-300">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base font-mono">
                {isFirefox ? 'FIREFOX iOS GPS PERMISSION GUIDE' : 'LOCATION PERMISSION BLOCKED'}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {errorMessage || 'Browser security blocked automatic device GPS access.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold font-mono">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Why is GPS blocked on iPhone / Firefox?</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Firefox and Safari on iOS strictly enforce security policies that prevent embedded web preview frames from reading device hardware GPS sensors without direct top-level browser tab consent.
          </p>
        </div>

        <div className="space-y-3 font-mono">
          <button
            onClick={handleOpenNewTab}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs transition flex items-center justify-between shadow-lg shadow-cyan-950/50 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>1. OPEN IN DIRECT BROWSER TAB</span>
            </div>
            <span className="text-[10px] bg-slate-950/30 px-2 py-0.5 rounded text-slate-950 font-bold uppercase">
              Bypasses Frame Limit
            </span>
          </button>

          <button
            onClick={() => {
              if (onIpLocationFallback) {
                onIpLocationFallback();
              }
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-teal-500/60 text-teal-300 font-bold text-xs transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>2. AUTO-DETECT LOCATION VIA IP ADDRESS</span>
            </div>
            <span className="text-[10px] bg-teal-950 border border-teal-800 px-2 py-0.5 rounded text-teal-300">
              Instant
            </span>
          </button>

          {onOpenManualSelector && (
            <button
              onClick={() => {
                onOpenManualSelector();
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/60 text-cyan-300 font-bold text-xs transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>3. CHOOSE ALBUQUERQUE, NM OR OTHER SECTOR</span>
              </div>
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded text-cyan-300">
                Hotspots
              </span>
            </button>
          )}
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
          <span className="text-slate-400 font-bold font-mono block">iOS PERMISSION STEPS:</span>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 font-mono">
            <li>Open iPhone <strong className="text-slate-200">Settings</strong> app, scroll down to <strong className="text-slate-200">Safari</strong> or <strong className="text-slate-200">Firefox</strong>.</li>
            <li>Tap <strong className="text-slate-200">Location</strong> and select <strong className="text-teal-300">"While Using the App"</strong>.</li>
            <li>In browser address bar, tap the lock or shield icon to set <strong className="text-teal-300">Location: Allow</strong>.</li>
          </ol>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
