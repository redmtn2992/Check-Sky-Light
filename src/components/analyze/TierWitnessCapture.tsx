import React, { useState, useEffect } from 'react';
import { 
  Camera, Video, Upload, Sparkles, Compass, 
  MapPin, CheckCircle2, AlertTriangle, ShieldCheck, 
  HardDrive, RefreshCw, Eye, ArrowRight, Play, Info, ShieldAlert
} from 'lucide-react';
import { LocationCoords, GeminiForensicAnalysis } from '../../types';
import { DiagnosticReportCard } from './DiagnosticReportCard';
import { evaluateContentSafety, checkUserBlockStatus, recordSafetyStrike, UserBlockStatus } from '../../lib/safetyGuardrails';

interface TierWitnessCaptureProps {
  userLocation: LocationCoords;
  onOpenVault?: () => void;
  onPublishSighting?: (analysis: GeminiForensicAnalysis) => void;
  prefilledMediaUrl?: string;
  prefilledMediaType?: 'photo' | 'video';
  prefilledNotes?: string;
  prefilledAzimuth?: number;
  prefilledElevation?: number;
}

export const TierWitnessCapture: React.FC<TierWitnessCaptureProps> = ({
  userLocation,
  onOpenVault,
  onPublishSighting,
  prefilledMediaUrl,
  prefilledMediaType,
  prefilledNotes,
  prefilledAzimuth,
  prefilledElevation
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(prefilledMediaUrl || null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>(prefilledMediaType || 'video');
  const [witnessNotes, setWitnessNotes] = useState<string>(prefilledNotes || '');
  
  // Device sensor metadata
  const [deviceAzimuth, setDeviceAzimuth] = useState<number>(prefilledAzimuth ?? 218);
  const [deviceElevation, setDeviceElevation] = useState<number>(prefilledElevation ?? 42);
  const [isUsingLiveSensor, setIsUsingLiveSensor] = useState<boolean>(true);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<GeminiForensicAnalysis | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState<UserBlockStatus>(() => checkUserBlockStatus());

  useEffect(() => {
    setBlockStatus(checkUserBlockStatus());
  }, []);

  useEffect(() => {
    if (prefilledMediaUrl) {
      setPreviewUrl(prefilledMediaUrl);
      if (prefilledMediaType) {
        setMediaType(prefilledMediaType);
      }
      if (prefilledNotes) {
        setWitnessNotes(prefilledNotes);
      }
      if (prefilledAzimuth !== undefined) {
        setDeviceAzimuth(prefilledAzimuth);
      }
      if (prefilledElevation !== undefined) {
        setDeviceElevation(prefilledElevation);
      }
      setAnalysisResult(null);
      setIsPublished(false);
      setAnalysisError(null);
    }
  }, [prefilledMediaUrl, prefilledMediaType, prefilledNotes, prefilledAzimuth, prefilledElevation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMediaType(file.type.startsWith('video') ? 'video' : 'photo');
      setAnalysisResult(null);
      setIsPublished(false);
      setAnalysisError(null);
    }
  };

  const handleUseSampleWitnessCapture = (type: 'positive' | 'negative' | 'puppy') => {
    setMediaType(type === 'negative' ? 'video' : 'photo');
    
    if (type === 'positive') {
      setPreviewUrl('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80');
      setWitnessNotes('Positive Control: Glowing spherical orb witnessed hovering silently at ~3,500 ft AGL over ridge line, sudden instant vertical acceleration without sound or downwash.');
      setDeviceAzimuth(224);
      setDeviceElevation(38);
    } else if (type === 'negative') {
      setPreviewUrl('https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80');
      setWitnessNotes('Negative Control: Consumer quadcopter drone hovering at 120 ft AGL with 4 distinct rotor blade wash patterns and standard red/green navigation LED strobes.');
      setDeviceAzimuth(175);
      setDeviceElevation(22);
    } else {
      // Puppy Control
      setPreviewUrl('https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80');
      setWitnessNotes('Puppy Control: Golden retriever puppy executing rapid living room zoomies. Checking for gravitational field distortion or bio-warp engine.');
      setDeviceAzimuth(145);
      setDeviceElevation(2);
    }

    setSelectedFile(null);
    setAnalysisResult(null);
    setIsPublished(false);
    setAnalysisError(null);
  };

  const handleRunWitnessAnalysis = async () => {
    if (blockStatus.isBlocked) {
      setAnalysisError(`[CLIENT QUARANTINED]: Analysis locked out for ${blockStatus.remainingMinutes || 60}m due to safety policy violations.`);
      return;
    }

    // Pre-flight check
    const safety = evaluateContentSafety(witnessNotes, previewUrl || undefined);
    if (!safety.isSafe) {
      const updated = recordSafetyStrike(safety.reason || 'Safety policy violation', safety.violationType === 'HUMAN_OR_ANIMAL_HARM');
      setBlockStatus(updated);
      setAnalysisError(`[SUBMISSION BLOCKED]: ${safety.reason}`);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress('Stabilizing optical frames & extracting sensor telemetry...');

    try {
      // Step 1: Extract base64 if user uploaded a file
      let base64Data: string | undefined = undefined;
      if (selectedFile) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      await new Promise((r) => setTimeout(r, 600));
      setAnalysisProgress('Computing multimodal vision & kinematic trajectory...');

      const response = await fetch('/api/analyze/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaBase64: base64Data,
          mediaType: mediaType,
          mediaUrl: previewUrl,
          notes: witnessNotes || `Eyewitness ${mediaType} capture at AZ ${deviceAzimuth}°, EL ${deviceElevation}°.`,
          sourceTitle: `Eyewitness ${mediaType.toUpperCase()} Capture: ${witnessNotes ? witnessNotes.substring(0, 32) : 'Optical Target'}`,
          location: userLocation,
          telemetry: {
            azimuth: deviceAzimuth,
            elevation: deviceElevation,
            location: userLocation
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.error === 'CONTENT_POLICY_VIOLATION') {
          const updated = recordSafetyStrike(errJson.reason || 'Content rejected', true);
          setBlockStatus(updated);
          setAnalysisError(`[SYSTEM QUARANTINE]: ${errJson.message || errJson.reason}`);
          return;
        }
        throw new Error(errJson.message || `Analysis server returned status ${response.status}`);
      }

      const data: GeminiForensicAnalysis = await response.json();
      setAnalysisResult(data);
      setIsPublished(false);
    } catch (err: any) {
      console.warn('Witness analysis failed:', err);
      setAnalysisError(err.message || 'Analysis service unavailable. Check API configuration or connection.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handlePublish = () => {
    if (analysisResult && onPublishSighting) {
      onPublishSighting(analysisResult);
      setIsPublished(true);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Tier 1 Header */}
      <div className="glass-panel border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-black bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                TIER 1 // OPTICAL FORENSICS
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                EYEWITNESS CAPTURE
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Eyewitness Optical Analysis
            </h3>
            <p className="text-xs text-slate-300">
              Automated multi-modal evaluation with instant anomaly scoring and ADS-B deconfliction.
            </p>
          </div>

          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-bold text-slate-200 transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Import from Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Intake Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Media Uploader & Preview */}
        <div className="lg:col-span-6 space-y-3">
          <div className="glass-panel border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Optical Evidence</span>
              </span>
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-950 border border-white/10 text-[10px] font-mono">
                <button
                  onClick={() => setMediaType('video')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    mediaType === 'video' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => setMediaType('photo')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    mediaType === 'photo' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Photo
                </button>
              </div>
            </div>

            {/* Media Dropzone / Preview */}
            <div className="relative rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/60 overflow-hidden min-h-[200px] flex flex-col items-center justify-center p-3 text-center">
              {previewUrl ? (
                <div className="relative w-full h-full max-h-[300px] rounded-xl overflow-hidden flex items-center justify-center bg-black">
                  {mediaType === 'video' ? (
                    <video 
                      key={previewUrl}
                      src={previewUrl} 
                      controls 
                      className="max-h-[280px] w-auto rounded-lg object-contain"
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Witness preview" 
                      className="max-h-[280px] w-auto rounded-lg object-contain"
                    />
                  )}
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-950/80 border border-white/20 text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <label 
                      htmlFor="witness-upload" 
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer inline-flex items-center space-x-1.5 transition shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Select Witness Capture</span>
                    </label>
                    <input 
                      id="witness-upload" 
                      type="file" 
                      accept={mediaType === 'video' ? 'video/*' : 'image/*'} 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                      iPhone 4K 60fps video, Live Photos, or High-Res Stills
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Presets (Consolidated 3 Controls: Positive, Negative, Puppy) */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0">Presets:</span>
                <button
                  onClick={() => handleUseSampleWitnessCapture('positive')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer"
                  title="Positive Control: Declassified UAP benchmark"
                >
                  🛸 Positive Control
                </button>
                <button
                  onClick={() => handleUseSampleWitnessCapture('negative')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold transition cursor-pointer"
                  title="Negative Control: FAA Drone deconfliction"
                >
                  🚁 Negative Control
                </button>
                <button
                  onClick={() => handleUseSampleWitnessCapture('puppy')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition cursor-pointer"
                  title="Puppy Control: Terrestrial pet baseline"
                >
                  🐶 Puppy Control
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Observation Telemetry & Gemini Run Trigger */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 bg-slate-900/80 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-slate-200 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Observer Sensor Telemetry</span>
              </span>
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>GPS LOC LOCKED</span>
              </div>
            </div>

            {/* Location & Sector */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">OBSERVER SECTOR:</span>
                  <span className="text-slate-200 font-bold">{userLocation.city}, {userLocation.region}</span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>LAT {userLocation.lat.toFixed(4)}°</div>
                <div>LNG {userLocation.lng.toFixed(4)}°</div>
              </div>
            </div>

            {/* Sightline Angles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-500 block">COMPASS AZIMUTH (°):</span>
                <input 
                  type="number"
                  min="0"
                  max="360"
                  value={deviceAzimuth}
                  onChange={(e) => setDeviceAzimuth(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 font-bold text-sm"
                />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-500 block">CAMERA ELEVATION (°):</span>
                <input 
                  type="number"
                  min="-90"
                  max="90"
                  value={deviceElevation}
                  onChange={(e) => setDeviceElevation(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 font-bold text-sm"
                />
              </div>
            </div>

            {/* Witness Notes */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 block font-bold">
                WITNESS OBSERVATION NOTES:
              </span>
              <textarea
                value={witnessNotes}
                onChange={(e) => setWitnessNotes(e.target.value)}
                placeholder="Describe flight characteristics, sounds, lighting behavior, duration, weather conditions..."
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600 font-sans"
              />
            </div>

            {/* Quarantine Banner */}
            {blockStatus.isBlocked && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-sans flex items-start space-x-2.5">
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

            {/* Run Analysis Trigger Button */}
            <button
              onClick={handleRunWitnessAnalysis}
              disabled={isAnalyzing || blockStatus.isBlocked}
              className={`w-full py-3.5 rounded-2xl font-bold font-mono text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${
                blockStatus.isBlocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : isAnalyzing
                  ? 'bg-slate-800 text-slate-500 cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              }`}
            >
              {blockStatus.isBlocked ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Intake Quarantined</span>
                </>
              ) : isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{analysisProgress || 'Running Forensic Engine...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Witness Capture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs">
          <span className="font-bold block mb-1">[ANALYSIS UNAVAILABLE]</span>
          <span>{analysisError}</span>
        </div>
      )}

      {/* Render Generated Diagnostic Report Card */}
      {analysisResult && (
        <div className="space-y-4 pt-4 animate-fade-in">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Forensic Inspection Complete — Report Ready</span>
          </div>
          <DiagnosticReportCard
            analysis={analysisResult}
            onPublishToFeed={handlePublish}
            isPublished={isPublished}
          />
        </div>
      )}
    </div>
  );
};
