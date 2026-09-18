import { LocationCoords } from '../../types';
import { TargetLockData, DisplayDayNightMode } from '../../components/ar/ArTargetLockTypes';

export interface VaultMediaRecord {
  id: string;
  timestamp: string;
  mediaType: 'photo' | 'burst' | 'video';
  title: string;
  dataUrl?: string;
  blob?: Blob;
  mimeType?: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  burstFrames?: string[];
  telemetry: {
    azimuth: number;
    pitch: number;
    roll?: number;
    lat: number;
    lng: number;
    city?: string;
    region?: string;
    dayNightMode: DisplayDayNightMode;
    starMapEnabled?: boolean;
    soundMode?: string;
    hasAmbientAudio?: boolean;
  };
  targetLock?: TargetLockData | null;
  aiAnalysis?: {
    anomalyScore?: number;
    isAnomaly?: boolean;
    classification?: string;
    summary?: string;
  };
  notes?: string;
  savedToDeviceAlbum?: boolean;
  cloudSynced?: boolean;
}

export interface StorageUsageSummary {
  totalItems: number;
  photoCount: number;
  burstCount: number;
  videoCount: number;
  totalSizeBytes: number;
  totalSizeMb: number;
  quotaEstimatedMb?: number;
  quotaUsedPercent?: number;
}

export interface VaultStorageSettings {
  storagePolicy: 'local_only' | 'local_plus_ai' | 'cloud_sync_optin';
  autoSaveToVault: boolean;
  maxLocalRetentionCount: number;
}

const DB_NAME = 'CheckSkyLightObserverVault';
const DB_VERSION = 1;
const STORE_MEDIA = 'vault_media';
const STORE_SETTINGS = 'vault_settings';

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        const mediaStore = db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
        mediaStore.createIndex('timestamp', 'timestamp', { unique: false });
        mediaStore.createIndex('mediaType', 'mediaType', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaToVault(record: Omit<VaultMediaRecord, 'id' | 'fileSizeBytes' | 'timestamp'> & { id?: string; fileSizeBytes?: number; timestamp?: string }): Promise<VaultMediaRecord> {
  const db = await openVaultDb();
  const id = record.id || `VAULT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = record.timestamp || new Date().toISOString();
  let calculatedSize = record.fileSizeBytes || 0;
  if (!calculatedSize && record.blob) {
    calculatedSize = record.blob.size;
  } else if (!calculatedSize && record.dataUrl) {
    calculatedSize = Math.round((record.dataUrl.length * 3) / 4);
  } else if (!calculatedSize && record.burstFrames) {
    calculatedSize = record.burstFrames.reduce((acc, f) => acc + Math.round((f.length * 3) / 4), 0);
  }

  const completeRecord: VaultMediaRecord = {
    ...record,
    id,
    timestamp,
    fileSizeBytes: calculatedSize
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEDIA], 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const req = store.put(completeRecord);
    req.onsuccess = () => resolve(completeRecord);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllVaultMedia(): Promise<VaultMediaRecord[]> {
  try {
    const db = await openVaultDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_MEDIA], 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result as VaultMediaRecord[]) || [];
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get vault media records from IndexedDB:', err);
    return [];
  }
}

export async function deleteVaultMedia(id: string): Promise<boolean> {
  const db = await openVaultDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEDIA], 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllVaultMedia(): Promise<boolean> {
  const db = await openVaultDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEDIA], 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function getStorageUsageSummary(): Promise<StorageUsageSummary> {
  const items = await getAllVaultMedia();
  let photoCount = 0;
  let burstCount = 0;
  let videoCount = 0;
  let totalSizeBytes = 0;

  for (const item of items) {
    if (item.mediaType === 'photo') photoCount++;
    else if (item.mediaType === 'burst') burstCount++;
    else if (item.mediaType === 'video') videoCount++;
    totalSizeBytes += item.fileSizeBytes || 0;
  }

  const totalSizeMb = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));
  let quotaEstimatedMb: number | undefined;
  let quotaUsedPercent: number | undefined;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) {
        quotaEstimatedMb = Math.round(estimate.quota / (1024 * 1024));
        if (estimate.usage) {
          quotaUsedPercent = Number(((estimate.usage / estimate.quota) * 100).toFixed(1));
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    totalItems: items.length,
    photoCount,
    burstCount,
    videoCount,
    totalSizeBytes,
    totalSizeMb,
    quotaEstimatedMb,
    quotaUsedPercent
  };
}

export function saveMediaToDeviceAlbum(mediaUrlOrBlob: string | Blob, filename: string) {
  if (typeof document === 'undefined') return;
  let url: string;
  let isTempUrl = false;
  if (typeof mediaUrlOrBlob === 'string') {
    url = mediaUrlOrBlob;
  } else {
    url = URL.createObjectURL(mediaUrlOrBlob);
    isTempUrl = true;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (isTempUrl) {
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}

export function exportIncidentBundle(item: VaultMediaRecord) {
  const telemetryData = {
    incidentId: item.id,
    title: item.title,
    timestamp: item.timestamp,
    mediaType: item.mediaType,
    telemetry: item.telemetry,
    targetLock: item.targetLock,
    aiAnalysis: item.aiAnalysis,
    notes: item.notes,
    exportedAt: new Date().toISOString()
  };

  const jsonBlob = new Blob([JSON.stringify(telemetryData, null, 2)], { type: 'application/json' });
  saveMediaToDeviceAlbum(jsonBlob, `CheckSkyLight_${item.id}_Telemetry.json`);

  if (item.blob) {
    const ext = item.mediaType === 'video' ? 'webm' : 'png';
    saveMediaToDeviceAlbum(item.blob, `CheckSkyLight_${item.id}.${ext}`);
  } else if (item.dataUrl) {
    const ext = item.mediaType === 'video' ? 'webm' : 'png';
    saveMediaToDeviceAlbum(item.dataUrl, `CheckSkyLight_${item.id}.${ext}`);
  } else if (item.burstFrames && item.burstFrames.length > 0) {
    item.burstFrames.forEach((frame, idx) => {
      setTimeout(() => {
        saveMediaToDeviceAlbum(frame, `CheckSkyLight_${item.id}_Frame_${idx + 1}.png`);
      }, idx * 200);
    });
  }
}
