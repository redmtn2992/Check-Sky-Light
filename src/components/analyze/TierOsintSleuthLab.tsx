import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, Upload, Sparkles, CheckCircle2, 
  FileText, RefreshCw, AlertTriangle, ExternalLink, 
  Volume2, Film, Image as ImageIcon, Check, Info, X, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { LocationCoords, GeminiForensicAnalysis } from '../../types';
import { DiagnosticReportCard } from './DiagnosticReportCard';
import { AaroRecordsModal } from './AaroRecordsModal';
import { matchAaroCase, AaroCaseRecord } from '../../data/aaroRecordsData';
import { evaluateContentSafety, checkUserBlockStatus, recordSafetyStrike, UserBlockStatus } from '../../lib/safetyGuardrails';

interface TierOsintSleuthLabProps {
  userLocation: LocationCoords;
  onPublishSighting?: (analysis: GeminiForensicAnalysis) => void;
}

export const TierOsintSleuthLab: React.FC<TierOsintSleuthLabProps> = ({
  userLocation,
  onPublishSighting
}) => {
  const [intakeTab, setIntakeTab] = useState<'media' | 'url'>('media');

  // URL Intake State
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [incidentNotes, setIncidentNotes] = useState<string>('');

  // Media File State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'audio'>('photo');

  // Execution & Progress State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<GeminiForensicAnalysis | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAaroModalOpen, setIsAaroModalOpen] = useState<boolean>(false);
  const [blockStatus, setBlockStatus] = useState<UserBlockStatus>(() => checkUserBlockStatus());

  useEffect(() => {
    setBlockStatus(checkUserBlockStatus());
  }, []);

  // 3 Presets: Positive Control (DoD AARO PR-013), Negative Control (AARO PR-016 Birds), and Puppy Control
  const handleLoadPreset = (type: 'positive' | 'negative' | 'puppy') => {
    setAnalysisResult(null);
    setIsPublished(false);
    setErrorMsg(null);

    if (type === 'positive') {
      setIntakeTab('url');
      setTargetUrl('https://www.dvidshub.net/video/992262/pr-013-unresolved-uap-report-europe-2022');
      setIncidentNotes('Positive Control: DoD AARO Case PR-013 (Unresolved UAP Report, Europe 2022 / DVIDS 992262). Airborne military forward-looking infrared (FLIR/MWIR) telemetry confirmed with high confidence by AARO to depict an authenticated physical object in flight. Exhibits continuous level horizontal kinematics without observable aerodynamic wings, control surfaces, rotor downwash, or visible engine thermal exhaust plumes.');
      setMediaPreviewUrl('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop');
      setMediaFile(null);
      setMediaBase64(null);
      setMediaType('video');
    } else if (type === 'negative') {
      // Official DoD AARO Case Resolution PR-016 (Resolved: Birds, Europe 2023)
      setIntakeTab('url');
      setTargetUrl('https://www.dvidshub.net/video/988673/pr-016-resolved-birds-europe-2023');
      setIncidentNotes('Negative Control: DoD AARO Case Resolution PR-016 (Resolved: Birds, Europe 2023). USEUCOM MQ-9 Reaper airborne FLIR recording definitively resolved by AARO as biological avian fauna (birds in flight) under sensor platform parallax.');
      setMediaPreviewUrl('https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=800&auto=format&fit=crop');
      setMediaFile(null);
      setMediaBase64(null);
      setMediaType('video');
    } else {
      // Puppy Control
      setIntakeTab('media');
      setMediaType('photo');
      setTargetUrl('');
      setIncidentNotes('Puppy Control: Golden retriever puppy executing rapid living room zoomies. Checking for gravitational field distortion vs bio-canine happiness.');
      setMediaPreviewUrl('https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop');
      setMediaFile(null);
      setMediaBase64(null);
    }
  };

  const handleSelectAaroCase = (c: AaroCaseRecord) => {
    setIntakeTab('url');
    setTargetUrl(c.url);
    if (c.isUnresolved) {
      setIncidentNotes(`Official DoD / AARO Unresolved UAP Report [${c.caseId}] "${c.title}" (DVIDS ${c.dvidsId || 'N/A'}). Sensor: ${c.sensorSystem}. Official AARO Status: ${c.officialVerdict} Physics Rationale: ${c.physicsDeconfliction.groundTruth}. Target DTC: ${c.dtcCode}.`);
    } else {
      setIncidentNotes(`AARO Case Record [${c.caseId}] "${c.title}". Geographic Region: ${c.geographicRegion}. Sensor System: ${c.sensorSystem}. Official DoD Resolution: ${c.officialVerdict} Physics Rationale: ${c.physicsDeconfliction.mechanism} - ${c.physicsDeconfliction.groundTruth}. Target DTC: ${c.dtcCode}.`);
    }
    setMediaPreviewUrl(c.caseId === 'PR-016' ? 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop');
    setMediaFile(null);
    setMediaBase64(null);
    setMediaType('video');
    setAnalysisResult(null);
  };

  const extractVideoKeyframe = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1.0, (video.duration || 2.0) / 2);
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth || 960, 1280);
            canvas.height = Math.min(video.videoHeight || 540, 720);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              URL.revokeObjectURL(url);
              resolve(dataUrl);
              return;
            }
          } catch {
            // ignore
          }
          URL.revokeObjectURL(url);
          resolve('');
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('');
        };
      } catch {
        resolve('');
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      // Cleanly decouple and purge any leftover Web URL preset
      setTargetUrl('');

      const matchedCase = matchAaroCase(file.name) || matchAaroCase(incidentNotes);
      const combinedNameAndNotes = `${file.name} ${incidentNotes}`.toLowerCase();
      const isAaroPr016Avian = !matchedCase?.isUnresolved && (
        combinedNameAndNotes.includes('pr-016') ||
        combinedNameAndNotes.includes('988673') ||
        combinedNameAndNotes.includes('resolved-birds') ||
        (combinedNameAndNotes.includes('bird') && !combinedNameAndNotes.includes('pr-013') && !combinedNameAndNotes.includes('992262'))
      );

      // Purge previous preset notes if they were auto-loaded
      const hasStalePresetNotes = incidentNotes.includes('Positive Control:') ||
                                 incidentNotes.includes('Negative Control:') ||
                                 incidentNotes.includes('Puppy Control:');

      if (matchedCase) {
        if (matchedCase.isUnresolved) {
          setIncidentNotes(`Official DoD / AARO Unresolved UAP Report [${matchedCase.caseId}] "${matchedCase.title}" (DVIDS ${matchedCase.dvidsId || 'N/A'}). Sensor: ${matchedCase.sensorSystem}. Official AARO Status: ${matchedCase.officialVerdict} Ground Truth: ${matchedCase.physicsDeconfliction.groundTruth}. Target DTC: ${matchedCase.dtcCode}.`);
        } else {
          setIncidentNotes(`AARO Case Record [${matchedCase.caseId}] "${matchedCase.title}". Sensor System: ${matchedCase.sensorSystem}. Official DoD Resolution: ${matchedCase.officialVerdict} Physics Rationale: ${matchedCase.physicsDeconfliction.mechanism} - ${matchedCase.physicsDeconfliction.groundTruth}. Target DTC: ${matchedCase.dtcCode}.`);
        }
      } else if (isAaroPr016Avian) {
        setIncidentNotes('AARO Case Resolution PR-016 (Europe 2023): USAF MQ-9 Reaper FLIR recording deconflicted by DoD as avian fauna (birds in flight) with optical parallax.');
      } else if (hasStalePresetNotes || !incidentNotes.trim()) {
        setIncidentNotes(`Uploaded evidence file: ${file.name}`);
      }

      const preview = URL.createObjectURL(file);
      setMediaPreviewUrl(preview);

      if (file.type.startsWith('video')) {
        setMediaType('video');
        extractVideoKeyframe(file).then((frameData) => {
          if (frameData) {
            setMediaBase64(frameData);
          }
        });
      } else if (file.type.startsWith('audio')) {
        setMediaType('audio');
      } else {
        setMediaType('photo');
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setMediaBase64(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }

      setAnalysisResult(null);
      setIsPublished(false);
      setErrorMsg(null);
    }
  };

  const handleClearMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaBase64(null);
    setTargetUrl('');
    if (incidentNotes.startsWith('Uploaded evidence file:') || incidentNotes.includes('AARO Case Resolution PR-016')) {
      setIncidentNotes('');
    }
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleRunOsintAnalysis = async () => {
    setErrorMsg(null);

    if (blockStatus.isBlocked) {
      setErrorMsg(`[CLIENT QUARANTINED]: Analysis locked out for ${blockStatus.remainingMinutes || 60}m due to safety policy violations.`);
      return;
    }

    // Validation
    if (intakeTab === 'url') {
      if (!targetUrl.trim()) {
        setErrorMsg('Please enter a target URL or select a preset above.');
        return;
      }
      // Safety pre-flight
      const safety = evaluateContentSafety(incidentNotes, targetUrl);
      if (!safety.isSafe) {
        const updated = recordSafetyStrike(safety.reason || 'Safety policy violation', safety.violationType === 'HUMAN_OR_ANIMAL_HARM');
        setBlockStatus(updated);
        setErrorMsg(`[SUBMISSION BLOCKED]: ${safety.reason}`);
        return;
      }
    } else {
      if (!mediaFile && !mediaPreviewUrl) {
        setErrorMsg('Please upload an evidence file (photo, video, or audio) or select a preset above.');
        return;
      }
      // Safety pre-flight
      const safety = evaluateContentSafety(`${incidentNotes} ${mediaFile?.name || ''}`, mediaPreviewUrl || undefined);
      if (!safety.isSafe) {
        const updated = recordSafetyStrike(safety.reason || 'Safety policy violation', safety.violationType === 'HUMAN_OR_ANIMAL_HARM');
        setBlockStatus(updated);
        setErrorMsg(`[SUBMISSION BLOCKED]: ${safety.reason}`);
        return;
      }
    }

    setIsAnalyzing(true);
    setProgressMsg('Ingesting evidence and verifying optical frames...');

    try {
      if (intakeTab === 'url') {
        setProgressMsg('Evaluating dual-lens physics & deconfliction archives...');

        const res = await fetch('/api/analyze/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl.trim(),
            incidentNotes: incidentNotes.trim(),
            location: userLocation
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          if (errJson.error === 'CONTENT_POLICY_VIOLATION') {
            const updated = recordSafetyStrike(errJson.reason || 'Content rejected', true);
            setBlockStatus(updated);
            setErrorMsg(`[SYSTEM QUARANTINE]: ${errJson.message || errJson.reason}`);
            return;
          }
          throw new Error(errJson.message || `Server returned HTTP ${res.status}`);
        }

        const data: GeminiForensicAnalysis = await res.json();
        setAnalysisResult({
          ...data,
          sourcePreviewUrl: mediaPreviewUrl || data.sourcePreviewUrl
        });
        setIsPublished(false);
      } else {
        // Media File Analysis
        setProgressMsg('Processing media through forensic vision pipeline...');

        // If file is selected but base64 wasn't finished reading, extract now
        let base64Payload = mediaBase64;
        if (mediaFile && !base64Payload) {
          if (mediaType === 'video') {
            base64Payload = await extractVideoKeyframe(mediaFile);
          } else {
            base64Payload = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(mediaFile);
            });
          }
        }

        const res = await fetch('/api/analyze/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaType,
            mediaBase64: base64Payload || undefined,
            mediaUrl: mediaPreviewUrl || undefined,
            notes: incidentNotes.trim() || `Third-party OSINT media file (${mediaType})`,
            sourceTitle: mediaFile?.name || (targetUrl ? targetUrl : `Uploaded ${mediaType.toUpperCase()} Evidence`),
            location: userLocation
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          if (errJson.error === 'CONTENT_POLICY_VIOLATION') {
            const updated = recordSafetyStrike(errJson.reason || 'Content rejected', true);
            setBlockStatus(updated);
            setErrorMsg(`[SYSTEM QUARANTINE]: ${errJson.message || errJson.reason}`);
            return;
          }
          throw new Error(errJson.message || `Server returned HTTP ${res.status}`);
        }

        const data: GeminiForensicAnalysis = await res.json();
        setAnalysisResult({
          ...data,
          sourcePreviewUrl: mediaPreviewUrl || data.sourcePreviewUrl
        });
        setIsPublished(false);
      }
    } catch (err: any) {
      console.warn('OSINT analysis failed:', err);
      setErrorMsg(err.message || 'Analysis service unavailable. Check API configuration or connection.');
    } finally {
      setIsAnalyzing(false);
      setProgressMsg('');
    }
  };

  const handlePublish = () => {
    if (analysisResult && onPublishSighting) {
      onPublishSighting(analysisResult);
      setIsPublished(true);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Tool-001 Streamlined Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wide">
            Forensic Analysis Lab
          </h3>
        </div>

        {/* Exactly 3 Presets */}
        <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Presets:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset('positive')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer text-[11px] whitespace-nowrap shadow-sm"
            title="Positive Control: DoD AARO PR-013 Unresolved UAP Report"
          >
            🛸 Positive Control
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('negative')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold transition cursor-pointer text-[11px] whitespace-nowrap shadow-sm"
            title="Negative Control: DoD AARO PR-016 (Resolved: Birds)"
          >
            🎭 Negative Control
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('puppy')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition cursor-pointer text-[11px] whitespace-nowrap shadow-sm"
            title="Puppy Control: Terrestrial pet non-anomalous baseline"
          >
            🐶 Puppy Control
          </button>
        </div>
      </div>

      {/* Intake Switcher: Upload File vs Web URL */}
      <div className="glass-panel border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3 bg-slate-900/80">
        <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => {
              setIntakeTab('media');
              setTargetUrl('');
              if (incidentNotes.includes('Positive Control: FBI-UAP-PR003') || incidentNotes.includes('Negative Control: Viral social media')) {
                setIncidentNotes('');
              }
              setAnalysisResult(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              intakeTab === 'media'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIntakeTab('url');
              setMediaFile(null);
              setMediaPreviewUrl(null);
              setMediaBase64(null);
              if (incidentNotes.startsWith('Uploaded evidence file:')) {
                setIncidentNotes('');
              }
              setAnalysisResult(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              intakeTab === 'url'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Web URL</span>
          </button>
        </div>

        {/* Tab A: Media File Intake */}
        {intakeTab === 'media' ? (
          <div className="space-y-3 font-mono text-xs">
            {mediaPreviewUrl ? (
              <div className="relative rounded-xl border border-white/15 bg-black p-2 flex flex-col items-center justify-center">
                {mediaType === 'video' ? (
                  <video src={mediaPreviewUrl} controls className="max-h-52 rounded-lg w-full object-contain" />
                ) : mediaType === 'photo' ? (
                  <img src={mediaPreviewUrl} alt="Preview" className="max-h-52 rounded-lg w-full object-contain" />
                ) : (
                  <div className="py-6 flex flex-col items-center space-y-2 text-cyan-300">
                    <Volume2 className="w-8 h-8 text-cyan-400" />
                    <span>{mediaFile?.name || 'Acoustic audio file loaded'}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between w-full pt-2 px-1 text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]">
                    {mediaFile?.name || (mediaPreviewUrl.includes('photo-1552053831-71594a27632d') ? 'Golden Retriever Puppy Control' : 'Evidence Loaded')}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Change File</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-white/15 bg-slate-950/60 p-5 flex flex-col items-center justify-center text-center">
                <Upload className="w-8 h-8 text-amber-400 mb-2" />
                <label 
                  htmlFor="media-file-input"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs cursor-pointer inline-flex items-center space-x-2 transition shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo, Video, or Audio</span>
                </label>
                <input 
                  id="media-file-input"
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-sans">
                  Supports image files (PNG, JPEG, WEBP), videos (MP4, WEBM), or acoustic recordings.
                </p>
              </div>
            )}

            {/* Context notes */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                CONTEXT / WITNESS NOTES (OPTIONAL):
              </label>
              <input
                type="text"
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="Observed trajectory, sound, flight behavior, location, camera used..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition font-sans placeholder:text-slate-600"
              />
            </div>
          </div>
        ) : (
          /* Tab B: URL Intake */
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                TARGET MEDIA URL (YOUTUBE, WAR.GOV, REDDIT, X):
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-amber-300 text-xs focus:outline-none focus:border-amber-400 transition font-mono placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                INCIDENT PROVENANCE / CONTEXT NOTES:
              </label>
              <input
                type="text"
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="Source description, witness background, target timestamps..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400 transition font-sans placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* Quarantine banner */}
        {blockStatus.isBlocked && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-sans flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wide font-mono text-rose-300 text-xs">
                Device Quarantined ({blockStatus.remainingMinutes || 0}m Remaining)
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {blockStatus.reason || 'Repeated safety policy violations. Adult content and harm are prohibited.'}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Trigger Button */}
        <button
          onClick={handleRunOsintAnalysis}
          disabled={isAnalyzing || blockStatus.isBlocked}
          className={`w-full py-3 rounded-xl font-bold font-mono text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${
            blockStatus.isBlocked
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              : isAnalyzing
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
          }`}
        >
          {blockStatus.isBlocked ? (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Analysis Intake Quarantined</span>
            </>
          ) : isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>{progressMsg || 'Running Forensic Engine...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Multi-Lens Forensic Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Render Generated Diagnostic Report Card */}
      {analysisResult && (
        <div className="space-y-3 pt-2 animate-fade-in">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-400">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Forensic Diagnostic Report Ready</span>
          </div>
          <DiagnosticReportCard
            analysis={analysisResult}
            onPublishToFeed={handlePublish}
            isPublished={isPublished}
          />
        </div>
      )}

      {/* AARO Official Records Collection Modal */}
      <AaroRecordsModal
        isOpen={isAaroModalOpen}
        onClose={() => setIsAaroModalOpen(false)}
        onSelectCase={handleSelectAaroCase}
      />
    </div>
  );
};
