export type { AppArchetypeTheme } from '../types';
import { AppArchetypeTheme } from '../types';
import { ARCHETYPE_THEMES, ArchetypeThemeMetadata } from '../data/logoPresets';
import checkSkyLogoImg from '../assets/images/check_sky_icon_obd3_1792430211713.jpg';

export const THEME_STORAGE_KEY = 'checkskylight_active_archetype_v1';
export const DEFAULT_ARCHETYPE: AppArchetypeTheme = 'black_project';

const themeEventTarget = new EventTarget();

export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

export function loadActiveArchetype(): AppArchetypeTheme {
  if (typeof window === 'undefined') return DEFAULT_ARCHETYPE;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppArchetypeTheme;
    if (saved && ARCHETYPE_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch (err) {
    console.warn('Could not read archetype theme from localStorage:', err);
  }
  return DEFAULT_ARCHETYPE;
}

export function applyArchetypeToDocument(archetypeId: AppArchetypeTheme): void {
  if (typeof document === 'undefined') return;

  const meta = ARCHETYPE_THEMES.find((t) => t.id === archetypeId) || ARCHETYPE_THEMES[0];
  const root = document.documentElement;

  root.setAttribute('data-archetype', archetypeId);
  root.style.setProperty('--csl-accent', meta.accentHex);
  root.style.setProperty('--csl-accent-rgb', hexToRgb(meta.accentHex));
  root.style.setProperty('--csl-accent-sec', meta.accentSecondaryHex);
  root.style.setProperty('--csl-accent-sec-rgb', hexToRgb(meta.accentSecondaryHex));
  root.style.setProperty('--csl-bg-base', meta.baseBgHex);
  root.style.backgroundColor = meta.baseBgHex;

  if (document.body) {
    document.body.style.backgroundColor = meta.baseBgHex;
  }

  // Sync theme-color meta tag for mobile browsers / iOS Safari
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', meta.baseBgHex);
  }
}

export function saveActiveArchetype(archetypeId: AppArchetypeTheme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, archetypeId);
    applyArchetypeToDocument(archetypeId);
    themeEventTarget.dispatchEvent(new CustomEvent('archetypeChanged', { detail: archetypeId }));
  } catch (err) {
    console.error('Failed to save archetype theme:', err);
  }
}

export function subscribeArchetype(callback: (archetype: AppArchetypeTheme) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<AppArchetypeTheme>;
    callback(customEvent.detail);
  };
  themeEventTarget.addEventListener('archetypeChanged', handler);
  return () => {
    themeEventTarget.removeEventListener('archetypeChanged', handler);
  };
}

export function getArchetypeMetadata(archetypeId: AppArchetypeTheme): ArchetypeThemeMetadata {
  return ARCHETYPE_THEMES.find((t) => t.id === archetypeId) || ARCHETYPE_THEMES[0];
}

/**
 * Returns the unified Check Sky Light main logo/icon (OBD-III & P0312).
 * Remains identical across all themes as requested.
 */
export function getArchetypeIcon(_archetypeId?: AppArchetypeTheme): string {
  return checkSkyLogoImg;
}

/**
 * Dynamically shifts the glowing neon hue of the main logo/icon to match the active theme.
 */
export function getThemeLogoFilter(archetypeId: AppArchetypeTheme): string {
  switch (archetypeId) {
    case 'retro_obd':
      return 'hue-rotate-[160deg] saturate-150 contrast-105';
    case 'nvg_flir':
      return 'hue-rotate-[85deg] saturate-150 contrast-105';
    case 'observatory':
      return 'hue-rotate-[330deg] saturate-200 contrast-110';
    case 'black_project':
    default:
      return '';
  }
}
