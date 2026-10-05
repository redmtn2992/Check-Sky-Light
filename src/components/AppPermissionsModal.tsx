import React from 'react';
import { 
  ShieldCheck, Camera, Mic, MapPin, Eye, Compass, 
  Lock, CheckCircle2, ChevronRight, X, AlertTriangle, FileText
} from 'lucide-react';

export type PermissionTarget = 'all' | 'camera' | 'microphone' | 'location';

interface AppPermissionsModalProps {
  isOpen: boolean;
  target?: PermissionTarget;
  onGrant: (target: PermissionTarget) => void;
  onCancel: () => void;
  onViewEula: () => void;
}

export const AppPermissionsModal: React.FC<AppPermissionsModalProps> = ({
  isOpen,
  target = 'camera',
  onGrant,
  onCancel,
  onViewEula
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
              {target === 'camera' ? (
                <Camera className="w-5 h-5 animate-pulse" />
              ) : target === 'microphone' ? (
                <Mic className="w-5 h-5 animate-pulse" />
              ) : target === 'location' ? (
                <MapPin className="w-5 h-5 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                {target === 'camera' && 'CAMERA SENSOR AUTHORIZATION'}
                {target === 'microphone' && 'ACOUSTIC MICROPHONE ACCESS'}
                {target === 'location' && 'AIRSPACE GPS AUTHORIZATION'}
                {target === 'all' && 'FIELD SENSOR AUTHORIZATION'}
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/90">
                Apple App Store & EULA Privacy Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Explanations */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {target === 'camera' && (
                <>To superimpose the optical target reticle, zoom, and live sky tracking over real-world space, <strong className="text-white">Check Sky Light</strong> requires access to your device camera.</>
              )}
              {target === 'microphone' && (
                <>To capture environmental audio during encounter video recording (verifying sonic booms or aerodynamic silence), <strong className="text-white">Check Sky Light</strong> requests microphone access.</>
              )}
              {target === 'location' && (
                <>To deconflict local ADS-B civilian flights, NOAA weather balloons, and satellite orbits in your sector, <strong className="text-white">Check Sky Light</strong> requests your geographic coordinates.</>
              )}
              {target === 'all' && (
                <>To enable optical reticle tracking, airspace radar, and acoustic anomaly detection, <strong className="text-white">Check Sky Light</strong> requests device sensor access.</>
              )}
              <span className="block mt-1 text-cyan-300 font-semibold">All data is processed strictly on-device and never sold or monetized.</span>
            </p>
          </div>

          {/* Conditional Sensor Detail Cards */}
          {(target === 'camera' || target === 'all') && (
            <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-xs">Camera (NSCameraUsageDescription)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Visual Reticle</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Superimposes the tactical HUD, optical zoom, and Gemini AI target acquisition reticle over the live sky.
                </p>
              </div>
            </div>
          )}

          {(target === 'microphone' || target === 'all') && (
            <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-xs">Microphone (NSMicrophoneUsageDescription)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Acoustic Audit</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Records ambient environmental sound during encounter video captures to detect atmospheric shockwaves or aerodynamic silence.
                </p>
              </div>
            </div>
          )}

          {(target === 'location' || target === 'all') && (
            <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-xs">Location (NSLocationWhenInUseUsageDescription)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">Airspace Radar</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Correlates local ADS-B transponders, weather balloons, and satellite orbits in your observation sector.
                </p>
              </div>
            </div>
          )}

          {/* EULA & Consent Agreement Note */}
          <div className="pt-2 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Governed by the</span>
              <button 
                onClick={onViewEula}
                className="text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
              >
                Apple Standard EULA & Privacy Charter
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              You can grant, deny, or revoke sensor access at any time in device system settings.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 space-y-2.5">
          <button
            onClick={() => onGrant(target)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>
              {target === 'camera' && 'Authorize Camera & Continue'}
              {target === 'microphone' && 'Authorize Microphone & Record'}
              {target === 'location' && 'Authorize GPS & Query Radar'}
              {target === 'all' && 'Authorize Sensors'}
            </span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            Not Now (Operate in Sensor Simulation Mode)
          </button>
        </div>
      </div>
    </div>
  );
};
