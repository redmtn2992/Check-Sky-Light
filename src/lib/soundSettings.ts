/**
 * Check Sky Light - Sound & Acoustic Capture Configuration
 * 
 * Core Design Tenet:
 * The application MUST BE ABSOLUTELY SILENT by default.
 * All synthesizers, locks, radar chirps, and shutter clicks are muted
 * so that when an observer records a UAP encounter, the device microphone
 * captures genuine ambient acoustic signatures (Doppler shifts, infrasound,
 * propulsion hums, or silence) without contamination from the phone's speaker.
 */

export interface SoundSettings {
  // Master mute switch. False = 100% Absolute Silence (Default)
  soundEnabled: boolean;
  // Granular sound toggles (only active if soundEnabled is true)
  targetLockTones: boolean;
  radarSweepPings: boolean;
  cameraShutterSound: boolean;
  // Ambient recording settings
  recordAmbientAudio: boolean;
  rawAcousticMode: boolean; // Bypasses OS noise suppression/echo cancellation
}

export const SOUND_SETTINGS_STORAGE_KEY = 'checkskylight_sound_settings_v1';

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  soundEnabled: false, // ABSOLUTELY SILENT BY DEFAULT
  targetLockTones: false,
  radarSweepPings: false,
  cameraShutterSound: false,
  recordAmbientAudio: true, // Captures genuine ambient environmental sound
  rawAcousticMode: true     // Preserves faint high/low frequencies without OS filtering
};

const soundEventTarget = new EventTarget();

export function loadSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS;
  try {
    const raw = localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SOUND_SETTINGS,
        ...parsed,
        // Guarantee safety: if soundEnabled is undefined, keep false
        soundEnabled: Boolean(parsed.soundEnabled)
      };
    }
  } catch (err) {
    console.warn('Could not read sound settings from localStorage:', err);
  }
  return DEFAULT_SOUND_SETTINGS;
}

export function saveSoundSettings(settings: SoundSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    soundEventTarget.dispatchEvent(new CustomEvent('soundSettingsChanged', { detail: settings }));
  } catch (err) {
    console.warn('Could not save sound settings to localStorage:', err);
  }
}

export function isAppSoundEnabled(): boolean {
  return loadSoundSettings().soundEnabled;
}

export function isTargetLockSoundEnabled(): boolean {
  const s = loadSoundSettings();
  return s.soundEnabled && s.targetLockTones;
}

export function isRadarPingSoundEnabled(): boolean {
  const s = loadSoundSettings();
  return s.soundEnabled && s.radarSweepPings;
}

export function isCameraShutterSoundEnabled(): boolean {
  const s = loadSoundSettings();
  return s.soundEnabled && s.cameraShutterSound;
}

export function isRecordAmbientAudioEnabled(): boolean {
  return loadSoundSettings().recordAmbientAudio;
}

export function isRawAcousticModeEnabled(): boolean {
  return loadSoundSettings().rawAcousticMode;
}

export function subscribeSoundSettings(callback: (settings: SoundSettings) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<SoundSettings>;
    callback(custom.detail || loadSoundSettings());
  };
  soundEventTarget.addEventListener('soundSettingsChanged', handler);
  return () => {
    soundEventTarget.removeEventListener('soundSettingsChanged', handler);
  };
}
