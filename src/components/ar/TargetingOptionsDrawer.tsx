import React from 'react';
import { 
  X, Crosshair, Compass, Camera, Sparkles, RotateCcw, 
  Type, Check
} from 'lucide-react';
import { 
  TargetingOptions, 
  DEFAULT_TARGETING_OPTIONS, 
  saveTargetingOptions 
} from '../../lib/targetingOptions';
import { triggerHapticFeedback } from './ArAudioSynthesizer';

interface TargetingOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  options: TargetingOptions;
  onOptionsChange: (newOptions: TargetingOptions) => void;
}

export const TargetingOptionsDrawer: React.FC<TargetingOptionsDrawerProps> = ({
  isOpen,
  onClose,
  options,
  onOptionsChange
}) => {
  if (!isOpen) return null;

  const toggleOption = (key: 'motionTracker' | 'jetLockOn' | 'flightGuide' | 'smartShutter') => {
    triggerHapticFeedback([15]);
    const next: TargetingOptions = {
      ...options,
      [key]: !options[key]
    };
    onOptionsChange(next);
    saveTargetingOptions(next);
  };

  const setTextScale = (scale: 'normal' | 'large') => {
    triggerHapticFeedback([20]);
    const next: TargetingOptions = {
      ...options,
      hudTextScale: scale
    };
    onOptionsChange(next);
    saveTargetingOptions(next);
  };

  const handleResetDefaults = () => {
    triggerHapticFeedback([25]);
    onOptionsChange({ ...DEFAULT_TARGETING_OPTIONS });
    saveTargetingOptions({ ...DEFAULT_TARGETING_OPTIONS });
  };

  const ITEMS: Array<{
    key: 'motionTracker' | 'jetLockOn' | 'flightGuide' | 'smartShutter';
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'motionTracker',
      label: 'Motion Tracker',
      sublabel: 'Spots moving dots against the bright sky',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />
    },
    {
      key: 'jetLockOn',
      label: 'Jet Lock-On',
      sublabel: 'Snaps fighter-jet target box onto object',
      icon: <Crosshair className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'flightGuide',
      label: 'Flight Guide',
      sublabel: 'On-screen arrow points to nearest plane',
      icon: <Compass className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'smartShutter',
      label: 'Auto-Capture',
      sublabel: 'Snaps hands-free photo when locked',
      icon: <Camera className="w-4 h-4 text-rose-400" />
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in pointer-events-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-950 border border-white/15 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 pb-safe sm:pb-6 space-y-4 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Simple & Clean */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Targeting Assist
            </h3>
            <p className="text-xs text-slate-400">
              Assists with spotting & tracking daytime sky targets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technological Hierarchy Guide */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Technological Assistance Hierarchy
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              <span className="font-bold text-white text-xs block">1. Manual</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Pure camera (Default)</span>
            </div>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">
              <span className="font-bold text-cyan-300 text-xs block">2. Assist</span>
              <span className="text-[10px] text-cyan-400/80 block mt-0.5">On-device HUD</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <span className="font-bold text-amber-300 text-xs block">3. AI Scan</span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">Cloud Gemini</span>
            </div>
          </div>
        </div>

        {/* Bonus Option: Text Size Toggle (Normal vs Large) */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">HUD Text Size</div>
              <div className="text-xs text-slate-400">Outdoor & daylight readability</div>
            </div>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-white/10">
            <button
              type="button"
              onClick={() => setTextScale('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                options.hudTextScale === 'normal'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setTextScale('large')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                options.hudTextScale === 'large'
                  ? 'bg-cyan-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Large
            </button>
          </div>
        </div>

        {/* 4 Clean Options */}
        <div className="space-y-2.5">
          {ITEMS.map((item) => {
            const active = options[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleOption(item.key)}
                className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between text-left cursor-pointer active:scale-[0.99] ${
                  active 
                    ? 'bg-white/[0.05] border-cyan-500/50 shadow-md' 
                    : 'bg-white/[0.01] border-white/5 hover:border-white/10 opacity-75'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    active ? 'bg-cyan-500/15 border border-cyan-500/30' : 'bg-white/5 border border-white/5'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{item.label}</span>
                      {active && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          ON
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 leading-normal truncate mt-0.5">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {/* Custom Accessible Toggle Switch */}
                <div className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 ${
                  active ? 'bg-cyan-400' : 'bg-slate-800'
                }`}>
                  <div className={`w-5.5 h-5.5 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                    active ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition font-mono cursor-pointer py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono transition cursor-pointer shadow-md text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
