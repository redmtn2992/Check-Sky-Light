export type { AppArchetypeTheme } from '../types';
import { AppArchetypeTheme } from '../types';
import { ARCHETYPE_THEMES, ArchetypeThemeMetadata } from '../data/logoPresets';

export const THEME_STORAGE_KEY = 'checkskylight_active_archetype_v1';
export const DEFAULT_ARCHETYPE: AppArchetypeTheme = 'black_project';

const themeEventTarget = new EventTarget();

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
  root.style.setProperty('--csl-accent-sec', meta.accentSecondaryHex);
  root.style.setProperty('--csl-bg-base', meta.baseBgHex);

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
