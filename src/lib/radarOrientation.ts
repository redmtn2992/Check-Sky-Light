import { useEffect, useRef, useState } from 'react';
import { AlphaBetaOrientationFilter } from '../components/ar/ArOpticalCentroidTracker';

export type RadarOrientationMode = 'heading-up' | 'north-up';

export const CARDINALS_16 = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW'
] as const;

export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function getCardinal(deg: number): string {
  const norm = normalizeAngle(deg);
  const index = Math.round(norm / 22.5) % 16;
  return CARDINALS_16[index];
}

export function getMajorCardinal(deg: number): 'N' | 'E' | 'S' | 'W' | 'NE' | 'SE' | 'SW' | 'NW' {
  const norm = normalizeAngle(deg);
  const index = Math.round(norm / 45) % 8;
  const major = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
  return major[index];
}

/**
 * Returns the shortest angular difference in degrees from `current` to `target`.
 * Positive value = target is to the right (clockwise).
 * Negative value = target is to the left (counter-clockwise).
 * Range: -180 to +180.
 */
export function angleDifference(target: number, current: number): number {
  return ((target - current + 540) % 360) - 180;
}

const PREF_KEY = 'csl_radar_orientation_mode';

export function loadRadarOrientationPreference(): RadarOrientationMode {
  try {
    const saved = localStorage.getItem(PREF_KEY);
    if (saved === 'heading-up' || saved === 'north-up') {
      return saved;
    }
  } catch {
    // ignore
  }
  // Default to heading-up as requested by user ("orient how phone is held")
  return 'heading-up';
}

export function saveRadarOrientationPreference(mode: RadarOrientationMode) {
  try {
    localStorage.setItem(PREF_KEY, mode);
  } catch {
    // ignore
  }
}

export interface UseDeviceOrientationResult {
  heading: number;
  pitch: number;
  roll: number;
  hasSensor: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isManualControl: boolean;
  setIsManualControl: (val: boolean) => void;
  setManualHeading: (val: number) => void;
  requestPermission: () => Promise<boolean>;
}

export function useDeviceOrientation(initialHeading = 0): UseDeviceOrientationResult {
  const [heading, setHeading] = useState<number>(initialHeading);
  const [pitch, setPitch] = useState<number>(25); // typical 25° look-down angle
  const [roll, setRoll] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [isManualControl, setIsManualControl] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  const filterRef = useRef(new AlphaBetaOrientationFilter());
  const manualHeadingRef = useRef(initialHeading);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.DeviceOrientationEvent) {
      setPermissionState('unsupported');
      return;
    }

    // Check if iOS 13+ permission is required
    const isIos = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    if (!isIos) {
      setPermissionState('granted');
    }

    let lastUpdateTimestamp = 0;
    // Throttle orientation dispatch to max 30Hz to prevent mobile CPU thermal throttling
    const MIN_EVENT_INTERVAL_MS = 33; 

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isManualControl) return;
      if (document.hidden) return; // Zero computation while tab is in background or phone locked

      const now = performance.now();
      if (now - lastUpdateTimestamp < MIN_EVENT_INTERVAL_MS) {
        return;
      }
      lastUpdateTimestamp = now;

      let rawHeading = 0;
      let rawPitch = e.beta ?? 25;
      let rawRoll = e.gamma ?? 0;

      // iOS Safari provides webkitCompassHeading (0 = North, 90 = East, 180 = South, 270 = West)
      // pointing straight out the top edge of the iPhone.
      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        rawHeading = (e as any).webkitCompassHeading;
        setHasSensor(true);
        setPermissionState('granted');
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Standard W3C DeviceOrientationEvent: alpha increases counter-clockwise on Android/standard browsers
        rawHeading = (360 - e.alpha) % 360;
        setHasSensor(true);
        setPermissionState('granted');
      } else {
        // No orientation data in event
        return;
      }

      // Smooth heading and pitch
      const smoothed = filterRef.current.filter(rawHeading, rawPitch, rawRoll);
      setHeading(smoothed.az);
      setPitch(smoothed.pitch);
      setRoll(smoothed.roll);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isManualControl]);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setPermissionState('granted');
          setHasSensor(true);
          return true;
        } else {
          setPermissionState('denied');
          return false;
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
        setPermissionState('denied');
        return false;
      }
    }
    setPermissionState('granted');
    return true;
  };

  const handleSetManualHeading = (newHeading: number) => {
    const norm = normalizeAngle(newHeading);
    manualHeadingRef.current = norm;
    setHeading(norm);
  };

  return {
    heading,
    pitch,
    roll,
    hasSensor,
    permissionState,
    isManualControl,
    setIsManualControl,
    setManualHeading: handleSetManualHeading,
    requestPermission,
  };
}
