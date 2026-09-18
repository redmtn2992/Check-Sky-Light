import React, { useState, useEffect } from 'react';
import { 
  VolumeX, Volume2, Mic, ShieldCheck, CheckCircle2, 
  Info, X, Sliders, Music, Radio, Camera, Sparkles, AlertCircle
} from 'lucide-react';
import { 
  SoundSettings, 
  loadSoundSettings, 
  saveSoundSettings 
} from '../lib/soundSettings';
import { playDiagnosticSpeakerTest, triggerHapticFeedback } from './ar/ArAudioSynthesizer';

interface SoundOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundOptionsModal: React.FC<SoundOptionsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<SoundSettings>(loadSoundSettings);
  const [testTonePlayed, setTestTonePlayed] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSoundSettings());
      setTestTonePlayed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof SoundSettings>(key: K, value: SoundSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSoundSettings(updated);
    triggerHapticFeedback([15]);
  };

  const setMasterMode = (enabled: boolean) => {
    const updated: SoundSettings = {
      ...settings,
      soundEnabled: enabled,
      targetLockTones: enabled ? true : false,
      radarSweepPings: enabled ? true : false,
      cameraShutterSound: enabled ? true : false
    };
    setSettings(updated);
    saveSoundSettings(updated);
    triggerHapticFeedback(enabled ? [20, 20] : [30]);
  };

  const handleTestSpeaker = () => {
    playDiagnosticSpeakerTest();
    triggerHapticFeedback([20]);
    setTestTonePlayed(true);
    setTimeout(() => setTestTonePlayed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-cyan-800/70 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              !settings.soundEnabled 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {!settings.soundEnabled ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                  Sound & Acoustic Options
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                  !settings.soundEnabled
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                }`}>
                  {!settings.soundEnabled ? 'Silent Mode' : 'Audible HUD'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400/90">
                Pristine Environmental Acoustic Capture Controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close sound options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Scientific Rationale Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-cyan-200 block text-xs tracking-wide">
                Why Absolute Silence is Critical for UAP Research
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                During an authentic encounter, synthetic speaker sounds (HUD lock beeps, fake shutter clicks, radar chirps) bleed into the device's microphone and contaminate audio recordings. 
                <strong> Check Sky Light is completely silent by default</strong> so that the microphone records <em>only authentic ambient environmental acoustics</em> for frequency and Doppler analysis.
              </p>
            </div>
          </div>

          {/* Master Sound Mode Switch Cards */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Master Acoustic Profile
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Card 1: Absolute Silence (Default) */}
              <button
                type="button"
                onClick={() => setMasterMode(false)}
                className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between space-y-2 relative ${
                  !settings.soundEnabled
                    ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <VolumeX className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Absolute Silence</span>
                  </div>
                  {!settings.soundEnabled && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-300 leading-snug">
                  <strong>Recommended</strong>. Device speaker muted. Zero synthesizer bleed. Microphone captures pure ambient acoustic frequencies.
                </p>
                <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                  0 dB Internal Interference
                </span>
              </button>

              {/* Card 2: Tactical HUD Audio (Opt-in) */}
              <button
                type="button"
                onClick={() => setMasterMode(true)}
                className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between space-y-2 relative ${
                  settings.soundEnabled
                    ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">Audible Tactical HUD</span>
                  </div>
                  {settings.soundEnabled && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-300 leading-snug">
                  Opt-in tactical feedback. Plays synthesized lock tones, radar sweep pings, and camera shutter sounds through speaker.
                </p>
                <span className="text-[9px] font-mono text-amber-400 font-semibold">
                  Audible Speaker Tones
                </span>
              </button>
            </div>
          </div>

          {/* Granular Sound Controls (Enabled only if soundEnabled is true) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Synthesized Speaker Sound FX
              </span>
              {!settings.soundEnabled && (
                <span className="text-[9px] font-mono text-slate-500 italic">
                  (Disabled by Absolute Silence)
                </span>
              )}
            </div>

            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-2.5 space-y-2">
              {/* Target Lock Tones */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Reticle Target Lock Tones</span>
                    <span className="text-[10px] text-slate-400">Audio chimes when locking onto aircraft, satellites, or UAPs</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.soundEnabled}
                  checked={settings.soundEnabled && settings.targetLockTones}
                  onChange={(e) => updateSetting('targetLockTones', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Radar Sweep Pings */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Radar Sweep Pings</span>
                    <span className="text-[10px] text-slate-400">750 Hz sonar ping synchronized with circular radar sweep</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.soundEnabled}
                  checked={settings.soundEnabled && settings.radarSweepPings}
                  onChange={(e) => updateSetting('radarSweepPings', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Camera Shutter Sound */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Camera Shutter Click</span>
                    <span className="text-[10px] text-slate-400">Audio feedback click when capturing sighting photos</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.soundEnabled}
                  checked={settings.soundEnabled && settings.cameraShutterSound}
                  onChange={(e) => updateSetting('cameraShutterSound', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer disabled:opacity-30"
                />
              </div>
            </div>
          </div>

          {/* Encounter Microphone Acoustic Capture Options */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              Encounter Acoustic Recording (Microphone Input)
            </span>

            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-2.5 space-y-2">
              {/* Record Ambient Audio in Video */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Record Live Microphone in Video</span>
                    <span className="text-[10px] text-slate-400">Embeds environmental audio into video tracks for acoustic analysis</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.recordAmbientAudio}
                  onChange={(e) => updateSetting('recordAmbientAudio', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Raw Acoustic Mode (No DSP) */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Raw Acoustic Mode (Bypass OS DSP)</span>
                    <span className="text-[10px] text-slate-400">Disables phone noise cancellation to capture faint high/low frequencies</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.rawAcousticMode}
                  onChange={(e) => updateSetting('rawAcousticMode', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Diagnostic Test Tone */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block text-xs">Diagnostic Speaker Check</span>
              <span className="text-[10px] text-slate-400">Test phone volume with a brief 0.2s 880Hz tone without leaving silence</span>
            </div>
            <button
              type="button"
              onClick={handleTestSpeaker}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer min-h-[36px]"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{testTonePlayed ? 'Testing...' : 'Test Speaker'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <span className={`w-2 h-2 rounded-full ${!settings.soundEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{!settings.soundEnabled ? 'Stealth Audio Active' : 'Audible Mode Active'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition cursor-pointer min-h-[40px]"
          >
            Apply & Return
          </button>
        </div>
      </div>
    </div>
  );
};
