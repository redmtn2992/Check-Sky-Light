export interface TargetingOptions {
  motionTracker: boolean;           // Spot moving objects against sky
  jetLockOn: boolean;               // Snap fighter-jet brackets on target
  flightGuide: boolean;             // AR arrow points to nearest plane
  smartShutter: boolean;            // Hands-free capture on steady lock
  hudTextScale: 'normal' | 'large'; // Bonus Option: Standard vs Large font size
}

export const DEFAULT_TARGETING_OPTIONS: TargetingOptions = {
  motionTracker: true,
  jetLockOn: true,
  flightGuide: true,
  smartShutter: false,
  hudTextScale: 'large' // Set to large by default for comfortable mobile reading
};

const STORAGE_KEY = 'csl_targeting_options_v2';
const listeners: Array<(options: TargetingOptions) => void> = [];

export function loadTargetingOptions(): TargetingOptions {
  if (typeof window === 'undefined') return { ...DEFAULT_TARGETING_OPTIONS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TARGETING_OPTIONS };
    const parsed = JSON.parse(raw);
    return {
      motionTracker: parsed.motionTracker ?? DEFAULT_TARGETING_OPTIONS.motionTracker,
      jetLockOn: parsed.jetLockOn ?? DEFAULT_TARGETING_OPTIONS.jetLockOn,
      flightGuide: parsed.flightGuide ?? DEFAULT_TARGETING_OPTIONS.flightGuide,
      smartShutter: parsed.smartShutter ?? DEFAULT_TARGETING_OPTIONS.smartShutter,
      hudTextScale: parsed.hudTextScale ?? DEFAULT_TARGETING_OPTIONS.hudTextScale
    };
  } catch {
    return { ...DEFAULT_TARGETING_OPTIONS };
  }
}

export function saveTargetingOptions(options: TargetingOptions): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    listeners.forEach((cb) => cb(options));
  } catch (err) {
    console.warn('Failed to save targeting options:', err);
  }
}

export function subscribeTargetingOptions(callback: (options: TargetingOptions) => void): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
