import { SightingReport, ChatMessage, AlertNotification } from '../types';
import { INITIAL_SIGHTINGS, INITIAL_CHAT_MESSAGES, INITIAL_ALERTS } from '../data/mockData';

const SIGHTINGS_KEY = 'checkskylight_sightings_vault_v1';
const CHAT_KEY = 'checkskylight_chat_vault_v1';
const ALERTS_KEY = 'checkskylight_alerts_vault_v1';

const storageEvents = new EventTarget();

function getStoredSightings(): SightingReport[] {
  try {
    const raw = localStorage.getItem(SIGHTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse local sightings storage:', err);
  }
  return INITIAL_SIGHTINGS;
}

function getStoredChatMessages(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse local chat storage:', err);
  }
  return INITIAL_CHAT_MESSAGES;
}

function getStoredAlerts(): AlertNotification[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse local alerts storage:', err);
  }
  return INITIAL_ALERTS;
}

export function seedInitialDataIfEmpty(): void {
  try {
    if (!localStorage.getItem(SIGHTINGS_KEY)) {
      localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(INITIAL_SIGHTINGS));
    }
    if (!localStorage.getItem(CHAT_KEY)) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
    }
    if (!localStorage.getItem(ALERTS_KEY)) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(INITIAL_ALERTS));
    }
  } catch (e) {
    console.warn('Storage initialization notice:', e);
  }
}

export function subscribeToSightings(callback: (sightings: SightingReport[]) => void): () => void {
  callback(getStoredSightings());
  const handler = () => {
    callback(getStoredSightings());
  };
  storageEvents.addEventListener('sightings_updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    storageEvents.removeEventListener('sightings_updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function saveSightingToStorage(
  sighting: Omit<SightingReport, 'id'> | SightingReport
): Promise<SightingReport> {
  const id = 'id' in sighting && sighting.id ? sighting.id : `sighting-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullReport: SightingReport = {
    ...sighting,
    id,
    upvotes: sighting.upvotes ?? 0,
    timestamp: sighting.timestamp || new Date().toISOString()
  };
  const list = getStoredSightings();
  const existingIdx = list.findIndex((item) => item.id === id);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...fullReport };
  } else {
    list.unshift(fullReport);
  }
  try {
    localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Storage save notice:', e);
  }
  storageEvents.dispatchEvent(new Event('sightings_updated'));
  return fullReport;
}

export async function upvoteSightingInStorage(sightingId: string): Promise<void> {
  const list = getStoredSightings();
  const target = list.find((item) => item.id === sightingId);
  if (target) {
    target.upvotes = (target.upvotes || 0) + 1;
    target.upvotedByMe = true;
    try {
      localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage upvote save notice:', e);
    }
    storageEvents.dispatchEvent(new Event('sightings_updated'));
  }
}

export function subscribeToChatMessages(
  channelId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const emit = () => {
    const chatMap = getStoredChatMessages();
    const messages = chatMap[channelId] || [];
    callback([...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
  };
  emit();
  const handler = () => emit();
  storageEvents.addEventListener('chat_updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    storageEvents.removeEventListener('chat_updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function saveChatMessageToStorage(msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const fullMessage: ChatMessage = {
    ...msg,
    id,
    timestamp: msg.timestamp || new Date().toISOString()
  };
  const chatMap = getStoredChatMessages();
  if (!chatMap[msg.channelId]) {
    chatMap[msg.channelId] = [];
  }
  chatMap[msg.channelId].push(fullMessage);
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatMap));
  } catch (e) {
    console.warn('Chat save notice:', e);
  }
  storageEvents.dispatchEvent(new Event('chat_updated'));
  return fullMessage;
}

export function subscribeToAlerts(callback: (alerts: AlertNotification[]) => void): () => void {
  callback(getStoredAlerts());
  const handler = () => {
    callback(getStoredAlerts());
  };
  storageEvents.addEventListener('alerts_updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    storageEvents.removeEventListener('alerts_updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function markAlertReadInStorage(alertId: string): Promise<void> {
  const list = getStoredAlerts();
  const target = list.find((a) => a.id === alertId);
  if (target) {
    target.isRead = true;
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Alert update notice:', e);
    }
    storageEvents.dispatchEvent(new Event('alerts_updated'));
  }
}

export function loadSightingsFromStorage(): SightingReport[] {
  return getStoredSightings();
}

export function saveSightingsToStorage(list: SightingReport[]): void {
  try {
    localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(list));
    storageEvents.dispatchEvent(new Event('sightings_updated'));
  } catch (e) {
    console.warn('Failed to save sightings to storage:', e);
  }
}

export const DEFAULT_APP_LOCATION = {
  lat: 35.0844,
  lng: -106.6504,
  city: 'GPS',
  region: 'Sector Telemetry'
};

const LOCATION_PREF_KEY = 'checkskylight_user_location_pref_v2';

export function loadLocationPreference(): { lat: number; lng: number; city?: string; region?: string } {
  try {
    const raw = localStorage.getItem(LOCATION_PREF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        // If it was the legacy default 'Albuquerque' or 'Denver' before user acquired actual GPS or picked a city, migrate to clean 'GPS'
        if ((parsed.city === 'Albuquerque' || parsed.city === 'Denver') && Math.abs(parsed.lat - 35.0844) < 0.05) {
          saveLocationPreference(DEFAULT_APP_LOCATION);
          return DEFAULT_APP_LOCATION;
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_APP_LOCATION;
}

export function saveLocationPreference(loc: { lat: number; lng: number; city?: string; region?: string }): void {
  try {
    localStorage.setItem(LOCATION_PREF_KEY, JSON.stringify(loc));
  } catch {
    // fallback
  }
}

