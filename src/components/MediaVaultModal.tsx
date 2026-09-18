import React, { useState, useEffect } from 'react';
import { 
  X, HardDrive, Download, Trash2, ShieldCheck, Sparkles, 
  ExternalLink, FileText, Image as ImageIcon, Video, Layers, 
  Share2, Compass, MapPin, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  getAllVaultMedia, 
  deleteVaultMedia, 
  clearAllVaultMedia, 
  getStorageUsageSummary, 
  saveMediaToDeviceAlbum, 
  exportIncidentBundle, 
  VaultMediaRecord, 
  StorageUsageSummary 
} from '../lib/storage/mediaVault';

interface MediaVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForReport?: (media: VaultMediaRecord) => void;
}

export const MediaVaultModal: React.FC<MediaVaultModalProps> = ({
  isOpen,
  onClose,
  onSelectForReport
}) => {
  const [items, setItems] = useState<VaultMediaRecord[]>([]);
  const [summary, setSummary] = useState<StorageUsageSummary | null>(null);
  const [selectedItem, setSelectedItem] = useState<VaultMediaRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'burst' | 'video'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [burstFrameIdx, setBurstFrameIdx] = useState<number>(0);

  const loadVaultData = async () => {
    setLoading(true);
    try {
      const records = await getAllVaultMedia();
      setItems(records);
      const usage = await getStorageUsageSummary();
      setSummary(usage);
      if (records.length > 0 && !selectedItem) {
        setSelectedItem(records[0]);
      }
    } catch (err) {
      console.error('Failed to load media vault:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadVaultData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.mediaType === activeTab;
  });

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this encrypted optical capture from local vault?')) return;
    await deleteVaultMedia(id);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    await loadVaultData();
  };

  const handleClearAll = async () => {
    await clearAllVaultMedia();
    setSelectedItem(null);
    setConfirmClearAll(false);
    await loadVaultData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-3xl w-full max-w-6xl max-h-[94vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-700 text-cyan-400 shadow-inner">
              <HardDrive className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wide">
                  LOCAL OPTICAL TELEMETRY VAULT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                  OFFLINE INDEXED-DB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Cryptographically bound sensor frames, multi-spectral burst sequences, and sightline triangulation telemetry
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadVaultData}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
              title="Refresh vault"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {summary && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400">
                Stored Captures: <strong className="text-slate-100">{summary.totalItems}</strong>
              </span>
              <span className="text-cyan-400">
                Photos: <strong>{summary.photoCount}</strong> | Bursts: <strong>{summary.burstCount}</strong> | Videos: <strong>{summary.videoCount}</strong>
              </span>
              <span className="text-slate-400">
                Total Storage: <strong className="text-emerald-400">{summary.totalSizeMb} MB</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {summary.quotaEstimatedMb && (
                <span className="text-slate-500 text-[11px]">
                  Browser Quota: ~{summary.quotaEstimatedMb} MB ({summary.quotaUsedPercent ?? 0}% used)
                </span>
              )}
              {items.length > 0 && (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="text-rose-400 hover:text-rose-300 text-[11px] underline cursor-pointer"
                >
                  Clear All Vault
                </button>
              )}
            </div>
          </div>
        )}

        {confirmClearAll && (
          <div className="p-3 bg-rose-950/60 border-b border-rose-800 flex items-center justify-between text-xs font-mono text-rose-200">
            <span>Are you sure you want to permanently delete all {items.length} optical captures from this device?</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearAll}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col max-h-[280px] sm:max-h-[340px] lg:max-h-none h-full bg-slate-950/50">
            <div className="p-3 border-b border-slate-800/80 flex items-center space-x-1.5 text-xs font-mono">
              {(['all', 'photo', 'burst', 'video'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold uppercase transition cursor-pointer ${
                    activeTab === tab
                      ? 'bg-cyan-950 border border-cyan-600 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'All Items' : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3 font-mono text-xs">
                  <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No optical captures stored in this category.</p>
                  <p className="text-[11px] text-slate-500">
                    Use the AR Sky Radar HUD to snap photos, multi-frame bursts, or record video telemetry.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const thumb = item.dataUrl || item.burstFrames?.[0];
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setBurstFrameIdx(0);
                      }}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/50 text-slate-100'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                          {thumb ? (
                            <img src={thumb} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Video className="w-5 h-5 text-cyan-400" />
                          )}
                          <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-slate-950/80 text-[8px] font-mono text-cyan-300 uppercase">
                            {item.mediaType}
                          </span>
                        </div>
                        <div className="truncate space-y-0.5">
                          <h4 className="font-bold text-xs truncate group-hover:text-cyan-300">
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                            <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="text-cyan-400">
                              AZ {item.telemetry.azimuth.toFixed(0)}° / EL {item.telemetry.pitch.toFixed(0)}°
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        title="Delete capture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col h-full bg-slate-950/80 overflow-y-auto p-4 sm:p-6 space-y-5">
            {selectedItem ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold uppercase">
                        {selectedItem.mediaType}
                      </span>
                      <span className="text-slate-400">
                        {new Date(selectedItem.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100">
                      {selectedItem.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportIncidentBundle(selectedItem)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
                      title="Download Incident Telemetry JSON + Media"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export Bundle</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-black overflow-hidden flex flex-col items-center justify-center relative min-h-[260px] max-h-[380px]">
                  {selectedItem.mediaType === 'video' ? (
                    <video
                      src={selectedItem.dataUrl || (selectedItem.blob ? URL.createObjectURL(selectedItem.blob) : undefined)}
                      controls
                      playsInline
                      className="max-h-[360px] w-full object-contain"
                    />
                  ) : selectedItem.mediaType === 'burst' && selectedItem.burstFrames ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                      <img
                        src={selectedItem.burstFrames[burstFrameIdx]}
                        alt={`Burst frame ${burstFrameIdx + 1}`}
                        className="max-h-[300px] w-full object-contain rounded-xl"
                      />
                      <div className="mt-2 flex items-center space-x-2 font-mono text-xs text-slate-300">
                        <span>Frame {burstFrameIdx + 1} of {selectedItem.burstFrames.length}</span>
                        <div className="flex space-x-1">
                          {selectedItem.burstFrames.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setBurstFrameIdx(idx)}
                              className={`w-5 h-5 rounded text-[10px] font-bold ${
                                burstFrameIdx === idx ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={selectedItem.dataUrl}
                      alt={selectedItem.title}
                      className="max-h-[360px] w-full object-contain"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Azimuth Heading</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {selectedItem.telemetry.azimuth.toFixed(1)}° True
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Pitch Elevation</span>
                    <span className="text-sm font-bold text-teal-400">
                      {selectedItem.telemetry.pitch.toFixed(1)}°
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Ground Sector</span>
                    <span className="text-sm font-bold text-slate-200 truncate block">
                      {selectedItem.telemetry.city || 'Local Grid'}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">File Size</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {((selectedItem.fileSizeBytes || 0) / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                {selectedItem.targetLock && (
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-cyan-300 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>HARDWARE SENSOR TARGET LOCK TELEMETRY:</span>
                      </span>
                      <span className="text-rose-400">
                        {selectedItem.targetLock.anomalyScore}% ANOMALY INDEX
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300 text-[11px] pt-1">
                      <div>Range: <strong>{selectedItem.targetLock.rangeKm.toFixed(1)} km</strong></div>
                      <div>Speed: <strong>Mach {selectedItem.targetLock.speedMach.toFixed(1)}</strong></div>
                      <div>Altitude: <strong>{selectedItem.targetLock.altitudeM.toLocaleString()} m</strong></div>
                      <div>Centroid Confidence: <strong>{selectedItem.targetLock.confidence}%</strong></div>
                      <div>Transponder: <strong className="text-rose-400">{selectedItem.targetLock.transponderStatus}</strong></div>
                      <div>Deconfliction: <strong className="text-emerald-400">{selectedItem.targetLock.airspaceDeconfliction}</strong></div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const mediaPayload = selectedItem.blob || selectedItem.dataUrl || selectedItem.burstFrames?.[0];
                      if (mediaPayload) {
                        saveMediaToDeviceAlbum(mediaPayload, `CheckSkyLight_${selectedItem.id}.png`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Save to iPhone Photos</span>
                  </button>

                  {onSelectForReport && (
                    <button
                      onClick={() => {
                        onSelectForReport(selectedItem);
                        onClose();
                      }}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Attach to Sighting Report</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs space-y-2">
                <HardDrive className="w-10 h-10 text-slate-600" />
                <p>Select a capture on the left to inspect sensor telemetry</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
