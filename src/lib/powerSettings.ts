/**
 * Check Sky Light - Hardware Thermal & Power Management Engine
 * 
 * Provides adaptive power profiles to prevent device overheating on MacBook Pro and iPhone:
 * - 'standard': Standard operational tactical telemetry HUD.
 * - 'eco': Throttled optical processing, minimal radar animation load, and 45s airspace polling.
 */

export type PowerProfile = 'standard' | 'eco';

export interface PowerSettings {
  profile: PowerProfile;
  autoEcoOnBattery: boolean;
  throttleBackgroundTabs: boolean;
}

export const POWER_SETTINGS_STORAGE_KEY = 'checkskylight_power_settings_v1';

export const DEFAULT_POWER_SETTINGS: PowerSettings = {
  profile: 'standard',
  autoEcoOnBattery: true,
  throttleBackgroundTabs: true
};

const powerEventTarget = new EventTarget();

export function loadPowerSettings(): PowerSettings {
  if (typeof window === 'undefined') return DEFAULT_POWER_SETTINGS;
  try {
    const raw = localStorage.getItem(POWER_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_POWER_SETTINGS,
        ...parsed
      };
    }
  } catch (err) {
    console.warn('Could not read power settings from localStorage:', err);
  }
  return DEFAULT_POWER_SETTINGS;
}

export function savePowerSettings(settings: PowerSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(POWER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    powerEventTarget.dispatchEvent(new CustomEvent('powerSettingsChanged', { detail: settings }));
  } catch (err) {
    console.warn('Could not save power settings to localStorage:', err);
  }
}

export function subscribePowerSettings(callback: (settings: PowerSettings) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<PowerSettings>;
    callback(custom.detail);
  };
  powerEventTarget.addEventListener('powerSettingsChanged', handler);
  return () => {
    powerEventTarget.removeEventListener('powerSettingsChanged', handler);
  };
}
