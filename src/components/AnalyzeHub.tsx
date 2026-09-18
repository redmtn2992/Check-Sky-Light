import React, { useState, useRef } from 'react';
import { 
  ScanSearch, Sparkles, Upload, Link2, Image as ImageIcon, Video, Mic, 
  HardDrive, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, 
  Compass, Activity, RefreshCw, FileText, ChevronRight, Plus, ExternalLink,
  Volume2, Play, Pause, Landmark, Layers, AlertCircle, ArrowUpRight,
  Crosshair, Database, BookOpen, Radio, Globe, Check, Radar
} from 'lucide-react';
import { SightingReport, LocationCoords, GeminiForensicAnalysis } from '../types';
import { SightingFeed } from './SightingFeed';
import { AudioSonicMonitor } from './AudioSonicMonitor';
import { getAllVaultMedia, VaultMediaRecord } from '../lib/storage/mediaVault';

interface AnalyzeHubProps {
  sightings: SightingReport[];
  userLocation: LocationCoords;
  onSelectSighting: (sighting: SightingReport) => void;
  onUpvote: (id: string) => void;
  onOpenCreateReport: () => void;
  onOpenUapClassesGuide?: () => void;
  onOpenVault?: () => void;
  onOpenTriangulation?: () => void;
  onAddAnalyzedSighting?: (newSighting: SightingReport) => void;
  onNavigateToReport?: () => void;
  onNavigateToRadar?: () => void;
  onNavigateToTarget?: () => void;
}

type AnalysisSourceType = 'telemetry' | 'photo' | 'video' | 'audio' | 'url';
type SubView = 'lab' | 'sonic' | 'feed';

export const AnalyzeHub: React.FC<AnalyzeHubProps> = ({
  sightings,
  userLocation,
  onSelectSighting,
  onUpvote,
  onOpenCreateReport,
  onOpenUapClassesGuide,
  onOpenVault,
  onOpenTriangulation,
  onAddAnalyzedSighting,
  onNavigateToReport,
  onNavigateToRadar,
  onNavigateToTarget
}) => {
  const [subView, setSubView] = useState<SubView>('lab');
  const [sourceType, setSourceType] = useState<AnalysisSourceType>('telemetry');

  // Input states
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [incidentNotes, setIncidentNotes] = useState<string>('');
  const [sourceTitle, setSourceTitle] = useState<string>('');

  // Telemetry Input States (for mobile sensor UAP probability calculations)
  const [telemetryAzimuth, setTelemetryAzimuth] = useState<number>(214.2);
  const [telemetryPitch, setTelemetryPitch] = useState<number>(34.5);
  const [telemetryRoll, setTelemetryRoll] = useState<number>(0);
  const [telemetryAngularVelocity, setTelemetryAngularVelocity] = useState<number>(19.4);
  const [telemetryShape, setTelemetryShape] = useState<string>('Tic-Tac / Cylinder');
  const [telemetrySpeedProfile, setTelemetrySpeedProfile] = useState<string>('Instantaneous / Non-Inertial');
  const [telemetryAltitude, setTelemetryAltitude] = useState<string>('18,500 ft MSL');
  const [telemetryCharacteristics, setTelemetryCharacteristics] = useState<string>('Stationary hover followed by instantaneous hypersonic vector shift with zero aerodynamic control surfaces and no thermal combustion plume.');

  // Audio recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Vault picker modal state
  const [isVaultPickerOpen, setIsVaultPickerOpen] = useState<boolean>(false);
  const [vaultItems, setVaultItems] = useState<VaultMediaRecord[]>([]);

  // Execution & result states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<GeminiForensicAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Curated demo test cases for instant verification
  const loadDemoIncident = (type: 'authentic_nimitz' | 'fake_cgi' | 'starlink' | 'aguadilla' | 'nimitz_telemetry' | 'drone_telemetry') => {
    setErrorMsg(null);
    setAnalysisResult(null);
    setPublishedSuccess(false);

    if (type === 'nimitz_telemetry') {
      setSourceType('telemetry');
      setSourceTitle('2004 USS Nimitz ATFLIR Tic-Tac Telemetry');
      setTelemetryAzimuth(214.2);
      setTelemetryPitch(34.5);
      setTelemetryRoll(0);
      setTelemetryAngularVelocity(24.8);
      setTelemetryShape('Tic-Tac / Cylinder');
      setTelemetrySpeedProfile('Instantaneous / Non-Inertial');
      setTelemetryAltitude('24,000 ft to Sea Level (0.78s)');
      setTelemetryCharacteristics('Rapid non-ballistic descent with positive lift, zero aerodynamic surfaces, zero thermal exhaust, and complete decoupling from ambient air.');
      setIncidentNotes('Corroborated by AN/SPY-1B radar on USS Princeton and Cmdr. David Fravor visual observation.');
    } else if (type === 'drone_telemetry') {
      setSourceType('telemetry');
      setSourceTitle('Civilian Quadcopter Part 107 Profile');
      setTelemetryAzimuth(312.0);
      setTelemetryPitch(48.2);
      setTelemetryRoll(4.5);
      setTelemetryAngularVelocity(3.2);
      setTelemetryShape('Quadcopter / Drone');
      setTelemetrySpeedProfile('Hover / Stationary');
      setTelemetryAltitude('380 ft AGL');
      setTelemetryCharacteristics('Multi-rotor propulsion with classical aerodynamic rotor wash and audible blade chatter.');
      setIncidentNotes('Matches consumer drone flight profile within Class G airspace.');
    } else if (type === 'authentic_nimitz') {
      setSourceType('url');
      setUrlInput('https://www.youtube.com/watch?v=6r0py4X2GYk');
      setSourceTitle('2004 USS Nimitz ATFLIR Tic-Tac Incident');
      setIncidentNotes('Declassified Navy FLIR footage recorded off San Diego coast. Pilot Cmdr. David Fravor reported rapid descent from 28,000 ft to sea level in 0.78s.');
    } else if (type === 'fake_cgi') {
      setSourceType('url');
      setUrlInput('https://www.tiktok.com/@vfx_artist/video/saucer_flyby_hyperdrive_cgi');
      setSourceTitle('Viral CGI Saucer Flyby (Blender Animation)');
      setIncidentNotes('Viral social media video showing metallic saucer buzzing close to camera with sudden motion blur warp effect.');
    } else if (type === 'starlink') {
      setSourceType('url');
      setUrlInput('https://reddit.com/r/UFOs/comments/starlink_train_sky_line_las_vegas');
      setSourceTitle('Linear String of Luminous Flashes (Starlink Train)');
      setIncidentNotes('Dozens of evenly spaced lights moving in a straight line across night sky 50 minutes after sunset.');
    } else if (type === 'aguadilla') {
      setSourceType('photo');
      setUrlInput('');
      setSourceTitle('2013 Aguadilla Puerto Rico Thermal Transmedium');
      setIncidentNotes('US Customs & Border Protection DHC-8 infrared sensor capturing an object traveling at 110 mph into the ocean without deceleration or cavitation.');
      // 1x1 neutral mock frame
      setMediaBase64('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');
      setMediaPreviewUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop');
    }
  };

  // Import latest capture from Vault into Telemetry
  const handleImportLastVaultTelemetry = async () => {
    try {
      const records = await getAllVaultMedia();
      if (records.length > 0) {
        const latest = records[0];
        setTelemetryAzimuth(latest.telemetry.azimuth || 210);
        setTelemetryPitch(latest.telemetry.pitch || 30);
        setTelemetryRoll(latest.telemetry.roll || 0);
        setSourceTitle(latest.title || `Vault Telemetry Lock (${latest.timestamp.substring(11, 19)})`);
        setTelemetryCharacteristics(latest.notes || 'Recorded with mobile device compass & inertial measurement unit');
        setSourceType('telemetry');
        if (latest.dataUrl) {
          setMediaPreviewUrl(latest.dataUrl);
          setMediaBase64(latest.dataUrl);
        }
        setErrorMsg(null);
      } else {
        setErrorMsg('No recordings found in Vault yet. Capture a target in the Target tab or enter telemetry manually below.');
      }
    } catch (err) {
      console.error('Failed to import vault telemetry:', err);
    }
  };

  // Handle file selection (Photo, Video, Audio)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    setSourceTitle(file.name);
    setErrorMsg(null);
    setAnalysisResult(null);
    setPublishedSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setMediaBase64(base64);
      setMediaPreviewUrl(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  // Open Vault to pick stored Target capture
  const handleOpenVaultPicker = async () => {
    try {
      const records = await getAllVaultMedia();
      setVaultItems(records);
      setIsVaultPickerOpen(true);
    } catch (err) {
      console.error('Failed to load media vault:', err);
    }
  };

  const handleSelectVaultItem = (item: VaultMediaRecord) => {
    const url = item.dataUrl || item.burstFrames?.[0] || '';
    setMediaBase64(url);
    setMediaPreviewUrl(url);
    setSourceTitle(item.title || `Vault Record (${item.timestamp.substring(11, 19)})`);
    setIncidentNotes(`Azimuth: ${item.telemetry.azimuth.toFixed(0)}°, Elevation: ${item.telemetry.pitch.toFixed(0)}°. Notes: ${item.notes || 'Recorded via Target Sky Scanner'}`);
    setSourceType(item.mediaType === 'video' ? 'video' : 'photo');
    setIsVaultPickerOpen(false);
    setAnalysisResult(null);
    setPublishedSuccess(false);
  };

  // Live Audio Recording toggle
  const toggleAudioRecording = async () => {
    if (isRecordingAudio) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const file = new File([audioBlob], `acoustic-capture-${Date.now()}.wav`, { type: 'audio/wav' });
          setMediaFile(file);
          setSourceTitle(file.name);
          setMediaPreviewUrl(URL.createObjectURL(audioBlob));

          const reader = new FileReader();
          reader.onload = (e) => {
            setMediaBase64(e.target?.result as string);
          };
          reader.readAsDataURL(audioBlob);

          // Stop mic tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setIsRecordingAudio(true);
        setSourceType('audio');
      } catch (err) {
        console.error('Microphone access failed:', err);
        setErrorMsg('Microphone access denied or unsupported. Please upload an audio file instead.');
      }
    }
  };

  // Execute Gemini Deep Forensic Analysis
  const runForensicAnalysis = async () => {
    setErrorMsg(null);
    setAnalysisResult(null);
    setPublishedSuccess(false);
    setIsAnalyzing(true);

    try {
      setAnalysisStep('Ingesting optical/acoustic signatures...');
      await new Promise((r) => setTimeout(r, 400));

      if (sourceType === 'telemetry') {
        setAnalysisStep('Ingesting mobile gyro, compass & kinematics telemetry...');
        await new Promise((r) => setTimeout(r, 350));
        setAnalysisStep('Cross-referencing MUFON CMS, DoD/AARO & Skywatcher databases with Gemini...');

        const response = await fetch('/api/analyze/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telemetry: {
              azimuth: Number(telemetryAzimuth),
              pitch: Number(telemetryPitch),
              roll: Number(telemetryRoll),
              angularVelocity: Number(telemetryAngularVelocity),
              apparentShape: telemetryShape,
              flightCharacteristics: telemetryCharacteristics,
              estimatedAltitude: telemetryAltitude,
              sourceTitle: sourceTitle || `${telemetryShape} Sensor Telemetry Lock`,
              notes: incidentNotes,
              location: userLocation,
              mediaBase64: mediaBase64 || undefined
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        setAnalysisStep('Synthesizing cross-database probability score...');
        const data: GeminiForensicAnalysis = await response.json();
        setAnalysisResult(data);
      } else if (sourceType === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Please enter or paste a valid URL or social media link.');
        }

        setAnalysisStep('Querying Gemini model with Dual-Lens Framework...');
        const response = await fetch('/api/analyze/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlInput.trim(),
            incidentNotes: incidentNotes.trim(),
            location: userLocation
          })
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        setAnalysisStep('Calculating authentic vs synthetic probability score...');
        const data: GeminiForensicAnalysis = await response.json();
        setAnalysisResult(data);
      } else {
        // Media (photo, video, audio)
        if (!mediaBase64) {
          throw new Error(`Please select or upload a ${sourceType} file to analyze.`);
        }

        setAnalysisStep('Screening for digital CGI/VFX compression artifacts (Lens A)...');
        await new Promise((r) => setTimeout(r, 450));

        setAnalysisStep('Cross-referencing Five Observables & metric tensor kinematics (Lens B)...');
        const response = await fetch('/api/analyze/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaBase64,
            mediaType: sourceType,
            sourceTitle: sourceTitle || `Captured ${sourceType.toUpperCase()}`,
            notes: incidentNotes,
            location: userLocation
          })
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        setAnalysisStep('Computing multi-sensor probability verdict...');
        const data: GeminiForensicAnalysis = await response.json();
        setAnalysisResult(data);
      }
    } catch (err: any) {
      console.error('Forensic analysis error:', err);
      setErrorMsg(err?.message || 'Failed to complete analysis. Please retry.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Convert analysis result into a community verified sighting report
  const handlePublishToSightings = () => {
    if (!analysisResult) return;

    const newReport: SightingReport = {
      id: `sighting-${Date.now()}`,
      title: analysisResult.verdictTitle || sourceTitle || 'Gemini-Analyzed Sky Anomaly',
      observerName: 'Gemini Forensic Lab Observer',
      observerBadge: analysisResult.authenticityScore >= 70 ? 'AI Verified Anomaly' : 'Media Forensic Analyst',
      timestamp: new Date().toISOString(),
      location: userLocation,
      locationName: userLocation.city ? `${userLocation.city}, ${userLocation.region || ''}` : 'Local Sector Airspace',
      description: `${analysisResult.verdictSummary}\n\n[Dual-Lens Lens A]: ${analysisResult.dualLens.classicalDeconfliction}\n\n[Dual-Lens Lens B]: ${analysisResult.dualLens.metricSignature}`,
      probabilityScore: analysisResult.authenticityScore,
      status: analysisResult.authenticityScore >= 70 ? 'AI_ANOMALY_CONFIRMED' : 'COMMUNITY_VERIFIED',
      upvotes: 1,
      upvotedByMe: true,
      commentsCount: 0,
      mediaUrl: mediaPreviewUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      mediaType: sourceType === 'video' ? 'video' : 'image',
      tags: [
        `Score: ${analysisResult.authenticityScore}%`,
        analysisResult.verdict === 'AUTHENTIC_INCIDENT' ? 'Authentic Target' : 'Deconflicted',
        ...analysisResult.detectedFeatures.slice(0, 2)
      ]
    };

    if (onAddAnalyzedSighting) {
      onAddAnalyzedSighting(newReport);
    }
    setPublishedSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-view Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <ScanSearch className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
              Analyze Sky Phenomena
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dual-Lens multi-modal forensic evaluation powered by Gemini AI. Quantifying authentic anomaly probability vs. synthetic CGI/VFX hoaxes and commercial flights.
          </p>
        </div>

        {/* Actions & Sub-view switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onOpenTriangulation && (
            <button
              onClick={onOpenTriangulation}
              className="px-3.5 py-2 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Multi-Observer Sightline Triangulation Engine"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Triangulate</span>
            </button>
          )}

          <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setSubView('lab')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                subView === 'lab'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Gemini Lab</span>
            </button>
            <button
              onClick={() => setSubView('sonic')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                subView === 'sonic'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Sonic FFT</span>
            </button>
            <button
              onClick={() => setSubView('feed')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                subView === 'feed'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>UAP Feed ({sightings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Investigation Flow Breadcrumb Tracker */}
      <div className="glass-panel border border-cyan-500/20 rounded-2xl p-2.5 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
          {onNavigateToTarget ? (
            <button
              onClick={onNavigateToTarget}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-left transition cursor-pointer flex items-center space-x-2"
            >
              <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Crosshair className="w-3 h-3" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-slate-500 block">STEP 1</span>
                <span className="font-bold text-slate-300 truncate block">TARGET: Camera</span>
              </div>
            </button>
          ) : (
            <div className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-left flex items-center space-x-2">
              <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Crosshair className="w-3 h-3" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-slate-500 block">STEP 1</span>
                <span className="font-bold text-slate-300 truncate block">TARGET: Camera</span>
              </div>
            </div>
          )}

          {onNavigateToRadar ? (
            <button
              onClick={onNavigateToRadar}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-left transition cursor-pointer flex items-center space-x-2"
            >
              <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Radar className="w-3 h-3" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-slate-500 block">STEP 2</span>
                <span className="font-bold text-slate-300 truncate block">RADAR: Deconflict</span>
              </div>
            </button>
          ) : (
            <div className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-left flex items-center space-x-2">
              <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Radar className="w-3 h-3" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-slate-500 block">STEP 2</span>
                <span className="font-bold text-slate-300 truncate block">RADAR: Deconflict</span>
              </div>
            </div>
          )}

          <div className="p-1.5 rounded-xl border border-cyan-500/60 bg-cyan-500/15 text-left flex items-center space-x-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <div className="w-5 h-5 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              <ScanSearch className="w-3 h-3" />
            </div>
            <div className="truncate">
              <span className="text-[9px] text-cyan-300 font-bold block">STEP 3 (ACTIVE)</span>
              <span className="font-extrabold text-cyan-200 truncate block">ANALYZE: Gemini</span>
            </div>
          </div>

          {onNavigateToReport ? (
            <button
              onClick={onNavigateToReport}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-left transition cursor-pointer flex items-center space-x-2"
            >
              <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <FileText className="w-3 h-3" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-slate-500 block">STEP 4</span>
                <span className="font-bold text-slate-300 truncate block">REPORT: PDF Export</span>
              </div>
            </button>
          ) : (
            <div className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-left flex items-center space-x-2">
              <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <FileText className="w-3 h-3" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-slate-500 block">STEP 4</span>
                <span className="font-bold text-slate-300 truncate block">REPORT: PDF Export</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUBVIEW 1: GEMINI FORENSIC LAB */}
      {subView === 'lab' && (
        <div className="space-y-6">
          {/* Quick Demo Test Bar */}
          <div className="glass-panel border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-slate-300">Quick Test Curated Cases:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => loadDemoIncident('nimitz_telemetry')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition cursor-pointer font-bold"
                title="Mobile sensor telemetry for 2004 Tic-Tac incident"
              >
                Tic-Tac Telemetry (Authentic)
              </button>
              <button
                onClick={() => loadDemoIncident('drone_telemetry')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                title="Quadcopter drone kinematic profile"
              >
                Drone Telemetry (Conventional)
              </button>
              <button
                onClick={() => loadDemoIncident('authentic_nimitz')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                title="Declassified 2004 Pentagon FLIR1 footage (Authentic)"
              >
                USS Nimitz Video
              </button>
              <button
                onClick={() => loadDemoIncident('aguadilla')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition cursor-pointer"
                title="CBP Infrared Thermal Transmedium Footage"
              >
                Aguadilla Transmedium
              </button>
              <button
                onClick={() => loadDemoIncident('fake_cgi')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                title="Viral CGI TikTok Saucer Flyby (Synthetic Fake)"
              >
                Saucer VFX (Fake)
              </button>
            </div>
          </div>

          {/* Main Input Configuration Card */}
          <div className="glass-panel border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6">
            {/* Input Modality Selectors */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                1. Select Evidence Modality to Analyze with Gemini
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => setSourceType('telemetry')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    sourceType === 'telemetry'
                      ? 'bg-gradient-to-b from-cyan-500/25 to-teal-500/15 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Crosshair className={`w-4 h-4 ${sourceType === 'telemetry' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {sourceType === 'telemetry' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">App Telemetry</span>
                    <span className="text-[10px] text-cyan-300 font-mono">4-DB Multi-Match</span>
                  </div>
                </button>

                <button
                  onClick={() => setSourceType('photo')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    sourceType === 'photo'
                      ? 'bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ImageIcon className={`w-4 h-4 ${sourceType === 'photo' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {sourceType === 'photo' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Captured Photo</span>
                    <span className="text-[10px] text-slate-400">RAW/JPEG/PNG</span>
                  </div>
                </button>

                <button
                  onClick={() => setSourceType('video')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    sourceType === 'video'
                      ? 'bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Video className={`w-4 h-4 ${sourceType === 'video' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {sourceType === 'video' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Captured Video</span>
                    <span className="text-[10px] text-slate-400">MP4/MOV/WebM</span>
                  </div>
                </button>

                <button
                  onClick={() => setSourceType('audio')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    sourceType === 'audio'
                      ? 'bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Mic className={`w-4 h-4 ${sourceType === 'audio' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {sourceType === 'audio' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Acoustic Audio</span>
                    <span className="text-[10px] text-slate-400">WAV/Sonic FFT</span>
                  </div>
                </button>

                <button
                  onClick={() => setSourceType('url')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    sourceType === 'url'
                      ? 'bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Link2 className={`w-4 h-4 ${sourceType === 'url' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {sourceType === 'url' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Paste URL</span>
                    <span className="text-[10px] text-slate-400">YouTube, TikTok, X</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Input Body based on Modality */}
            {sourceType === 'telemetry' ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center space-x-2">
                    <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-200">Mobile Device Sensor Lock & Kinematics</span>
                      <p className="text-[10px] text-slate-400">
                        Analyzed against MUFON CMS, DoD/AARO UAP Archives, Skywatcher AI & Google Scholar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleImportLastVaultTelemetry}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                    title="Load heading, pitch & timestamp from last Target capture in Media Vault"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Import from Vault</span>
                  </button>
                </div>

                {/* Telemetry Sliders and Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Azimuth */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Azimuth / Bearing:</span>
                      <span className="text-cyan-400 font-bold">{Number(telemetryAzimuth).toFixed(1)}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="0.5"
                      value={telemetryAzimuth}
                      onChange={(e) => setTelemetryAzimuth(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Elevation / Pitch */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Pitch / Elevation:</span>
                      <span className="text-cyan-400 font-bold">{Number(telemetryPitch).toFixed(1)}°</span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="0.5"
                      value={telemetryPitch}
                      onChange={(e) => setTelemetryPitch(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Angular Rate */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Angular Velocity:</span>
                      <span className="text-cyan-400 font-bold">{Number(telemetryAngularVelocity).toFixed(1)}°/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={telemetryAngularVelocity}
                      onChange={(e) => setTelemetryAngularVelocity(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Shape, Speed & Altitude */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">Apparent Morphology / Shape:</label>
                    <select
                      value={telemetryShape}
                      onChange={(e) => setTelemetryShape(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Tic-Tac / Cylinder">Tic-Tac / Cylinder (Smooth, White)</option>
                      <option value="Spheroid / Orb">Spheroid / Luminous Orb</option>
                      <option value="Disc / Saucer">Disc / Saucer (Rotating Apex)</option>
                      <option value="Triangle / Chevron">Triangle / Chevron (Corner Lights)</option>
                      <option value="Luminous Centroid">Luminous Centroid / Point Source</option>
                      <option value="Metamorphic / Transmedium">Metamorphic / Transmedium</option>
                      <option value="Quadcopter / Drone">Quadcopter / Civilian Drone</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">Kinematic / Speed Profile:</label>
                    <select
                      value={telemetrySpeedProfile}
                      onChange={(e) => setTelemetrySpeedProfile(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Instantaneous / Non-Inertial">Instantaneous / Non-Inertial (Mach 5+)</option>
                      <option value="Hypersonic > Mach 5">Hypersonic Velocity (No Sonic Boom)</option>
                      <option value="Trans-sonic / High Subsonic">Trans-sonic / High Subsonic (400–600 kts)</option>
                      <option value="Hover / Stationary">Stationary Hover (Zero Wind Drift)</option>
                      <option value="Conventional Flight Path">Conventional Constant Velocity</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">Estimated Altitude MSL:</label>
                    <input
                      type="text"
                      value={telemetryAltitude}
                      onChange={(e) => setTelemetryAltitude(e.target.value)}
                      placeholder="e.g. 18,500 ft MSL or Sea Level"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Flight Characteristics */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Observed Flight Characteristics & Metric Signature:</label>
                  <textarea
                    rows={2}
                    value={telemetryCharacteristics}
                    onChange={(e) => setTelemetryCharacteristics(e.target.value)}
                    placeholder="Describe motion anomalies: instant stop, sharp 90-degree turn, absence of downwash, transmedium water transition..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            ) : sourceType === 'url' ? (
              <div className="space-y-4">
                {/* AI Fake Detection Spotlight Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      AI-Generated Fake UAP / UFO Video Forensic Reviewer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Paste links from TikTok, YouTube, X (Twitter), Reddit, or Instagram. Gemini AI evaluates generative diffusion artifacts, 3D CGI camera tracking jitter, neural upscaling anomalies, and synthetic motion blur against the Five Observables of authentic non-inertial craft to output a falsification & authenticity probability score.
                  </p>
                  
                  {/* Preset Test Case Buttons */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold uppercase tracking-wider">
                      Quick Load Presets (AI Fake vs Declassified Cases):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInput('https://tiktok.com/@viral_skies/video/7391823901-fake-saucer');
                          setIncidentNotes('Viral TikTok video claiming metallic flying disc floating over highway, exhibiting synthetic camera shake and uniform depth field.');
                          setSourceTitle('Viral TikTok AI CGI Saucer Clip');
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold transition cursor-pointer"
                      >
                        TikTok CGI Saucer (AI Fake)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInput('https://x.com/tech_visuals/status/1789230492-sora-uap-test');
                          setIncidentNotes('Generative AI text-to-video clip showing saucer with morphing rim geometry and floating lighting discrepancies.');
                          setSourceTitle('Sora/Diffusion AI Generative UAP');
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold transition cursor-pointer"
                      >
                        Sora/AI UFO Clip (AI Fake)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInput('https://www.navy.mil/uap-flir1-nimitz-2004');
                          setIncidentNotes('USS Nimitz Strike Group ATFLIR sensor video showing white oblong craft with instantaneous acceleration and zero aerodynamic wash.');
                          setSourceTitle('2004 Nimitz Tic-Tac (Authentic)');
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition cursor-pointer"
                      >
                        2004 Nimitz Tic-Tac (Authentic)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInput('https://youtu.be/zBdEeHYDuyc?si=hKG9wgLh_9-gJOMJ');
                          setIncidentNotes('Low-altitude equilateral black triangle hovering silently at night with 3 distinct vertex luminous apertures and axial planar rotation. Observer voice captures dramatic psychological progression from shock/excitement to vulnerability and fear as the silent massive craft rotates and departs vertically without acoustic signature.');
                          setSourceTitle('Black Triangle UFO - stabilized - part 1');
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold transition cursor-pointer"
                      >
                        Black Triangle (TR-3B) Stabilized Part 1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInput('https://www.defense.gov/gimbal-flir-encounter-2015');
                          setIncidentNotes('US Navy F/A-18 Super Hornet Raytheon ATFLIR optical infrared capture showing top-shaped craft rotating against prevailing winds with no thermal plume.');
                          setSourceTitle('2015 Gimbal FLIR (Authentic)');
                        }}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition cursor-pointer"
                      >
                        2015 Gimbal FLIR (Authentic)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                    <span>Target Video or Incident Web URL:</span>
                    <span className="text-[10px] text-slate-400 font-normal">YouTube, TikTok, Reddit, X/Twitter, News</span>
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://x.com/... or https://tiktok.com/..."
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Incident Context / Claims / Observer Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={incidentNotes}
                    onChange={(e) => setIncidentNotes(e.target.value)}
                    placeholder="Enter observer claims, estimated altitude, reported location, or notes..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            ) : (
              /* Media upload (Photo, Video, Audio) */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* File Uploader Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      sourceType === 'photo' 
                        ? 'image/*' 
                        : sourceType === 'video' 
                        ? 'video/*' 
                        : 'audio/*'
                    }
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[48px]"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Upload {sourceType === 'photo' ? 'Photo' : sourceType === 'video' ? 'Video File' : 'Audio File'}</span>
                  </button>

                  {/* Pick from Local Target Vault */}
                  <button
                    onClick={handleOpenVaultPicker}
                    className="px-4 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[48px]"
                    title="Select from captures saved in your Check Sky Light Offline Vault"
                  >
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>Select from Vault</span>
                  </button>

                  {/* Live Mic Recorder for Audio */}
                  {sourceType === 'audio' && (
                    <button
                      onClick={toggleAudioRecording}
                      className={`px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer min-h-[48px] ${
                        isRecordingAudio
                          ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isRecordingAudio ? 'Stop Recording' : 'Record Mic'}</span>
                    </button>
                  )}
                </div>

                {/* Media Preview Box */}
                {mediaPreviewUrl && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center flex-shrink-0 relative">
                      {sourceType === 'photo' && (
                        <img 
                          src={mediaPreviewUrl} 
                          alt="Evidence preview" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      {sourceType === 'video' && (
                        <video 
                          src={mediaPreviewUrl} 
                          controls 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      {sourceType === 'audio' && (
                        <div className="flex flex-col items-center justify-center space-y-1 text-cyan-400">
                          <Volume2 className="w-8 h-8 animate-pulse" />
                          <span className="text-[10px] font-mono">ACOUSTIC TRACE</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-300 truncate">
                          {sourceTitle || 'Selected Media Item'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          READY FOR SCAN
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Sector: {userLocation.city || 'Local Airspace'} • Ready for multi-spectral & synthetic media discrimination.
                      </p>
                      {sourceType === 'audio' && (
                        <audio src={mediaPreviewUrl} controls className="w-full h-8 mt-2" />
                      )}
                    </div>
                  </div>
                )}

                {/* Optional Observer Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Observer Telemetry Notes (Optional):
                  </label>
                  <input
                    type="text"
                    value={incidentNotes}
                    onChange={(e) => setIncidentNotes(e.target.value)}
                    placeholder="e.g. Azimuth 210°, elevation 45°, no sound detected, non-ballistic change of direction..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Run Analysis Action Button */}
            <div className="pt-2">
              <button
                onClick={runForensicAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition flex items-center justify-center space-x-2.5 cursor-pointer shadow-xl min-h-[52px] ${
                  isAnalyzing
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-wait'
                    : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{analysisStep || 'Gemini Multi-Modal Forensics Running...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Review with Gemini & Calculate Probability Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RESULTS CARD: PROBABILITY SCORE & DUAL-LENS VERDICT */}
          {analysisResult && (
            <div className="glass-panel border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-in fade-in duration-300">
              {/* Verdict Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {analysisResult.verdict === 'AUTHENTIC_INCIDENT' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AUTHENTIC ANOMALOUS TARGET</span>
                      </span>
                    ) : analysisResult.verdict === 'SYNTHETIC_FAKE' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center space-x-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>SYNTHETIC CGI / VFX FAKE</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>CONVENTIONAL AIRSPACE DECONFLICTION</span>
                      </span>
                    )}

                    <span className="text-xs font-mono text-slate-400">
                      Gemini Confidence: {analysisResult.confidenceScore}%
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-100 mt-1">
                    {analysisResult.verdictTitle}
                  </h3>
                </div>

                {/* Probability Score Display */}
                <div className="flex items-center space-x-3 bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl">
                  {/* Gauge */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          analysisResult.authenticityScore >= 70
                            ? 'text-emerald-400'
                            : analysisResult.authenticityScore >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                        strokeDasharray={`${analysisResult.authenticityScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-sm font-black font-mono text-slate-100">
                        {analysisResult.authenticityScore}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[11px] font-mono font-bold text-slate-200">
                      AUTHENTICITY SCORE
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Fake Likelihood: <span className="font-bold text-rose-300">{analysisResult.fakeProbability}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Description */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="text-cyan-400 font-mono font-bold block mb-1">EXECUTIVE FORENSIC SUMMARY:</span>
                {analysisResult.verdictSummary}
              </div>

              {/* Dual-Lens Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lens A */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>LENS A: CLASSICAL AEROSPACE & VFX DECONFLICTION</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
                    {analysisResult.dualLens.classicalDeconfliction}
                  </p>
                  {analysisResult.dualLens.vfxForensics && (
                    <p className="text-xs text-amber-300/90 leading-relaxed font-mono text-[11px] pt-1 border-t border-white/5">
                      <span className="font-bold text-amber-400">VFX Assessment: </span>
                      {analysisResult.dualLens.vfxForensics}
                    </p>
                  )}
                </div>

                {/* Lens B */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-teal-500/20 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-teal-300">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>LENS B: THEORETICAL METRIC MANIPULATION</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
                    {analysisResult.dualLens.metricSignature}
                  </p>
                </div>
              </div>

              {/* CROSS-DATABASE CORRELATION MATRIX (MUFON, US Dept. of War / DoD AARO, Skywatcher, Google Scholar) */}
              {analysisResult.databaseCorrelations && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        Cross-Database Telemetry Correlation:
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                      Multi-Archive Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* MUFON CMS */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <Radio className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs font-bold text-purple-300 font-mono">MUFON CMS</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                            {analysisResult.databaseCorrelations.mufon.correlationScore}% Match
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-100 mb-1">
                          {analysisResult.databaseCorrelations.mufon.caseMatch}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          Morphology: <span className="text-slate-200">{analysisResult.databaseCorrelations.mufon.morphology}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                          {analysisResult.databaseCorrelations.mufon.notes}
                        </p>
                      </div>
                      <a
                        href={analysisResult.databaseCorrelations.mufon.databaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center space-x-1 pt-2 border-t border-purple-500/20"
                      >
                        <span>Query MUFON Archives</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* DoD / War Dept / AARO */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-300 font-mono">US Dept. of War / DoD</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            {analysisResult.databaseCorrelations.warDeptDoD.correlationScore}% Match
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-100 mb-1">
                          {analysisResult.databaseCorrelations.warDeptDoD.caseMatch}
                        </div>
                        {analysisResult.databaseCorrelations.warDeptDoD.fiveObservablesTriggered?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {analysisResult.databaseCorrelations.warDeptDoD.fiveObservablesTriggered.map((obs, idx) => (
                              <span key={idx} className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {obs}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                          {analysisResult.databaseCorrelations.warDeptDoD.notes}
                        </p>
                      </div>
                      <a
                        href={analysisResult.databaseCorrelations.warDeptDoD.databaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 pt-2 border-t border-emerald-500/20"
                      >
                        <span>US DoD/AARO Case Library</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Skywatcher Research */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs font-bold text-cyan-300 font-mono">Skywatcher AI</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                            {analysisResult.databaseCorrelations.skywatcher.correlationScore}% Match
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-100 mb-1">
                          {analysisResult.databaseCorrelations.skywatcher.caseMatch}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          Modality: <span className="text-slate-200">{analysisResult.databaseCorrelations.skywatcher.sensorModality}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                          {analysisResult.databaseCorrelations.skywatcher.notes}
                        </p>
                      </div>
                      <a
                        href={analysisResult.databaseCorrelations.skywatcher.databaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 pt-2 border-t border-cyan-500/20"
                      >
                        <span>Skywatcher Network Grounding</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Google Scholar Peer-Reviewed Research Articles */}
                  {analysisResult.databaseCorrelations.scholarArticles?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-mono font-bold text-slate-200">
                            Google Scholar Grounding & Peer-Reviewed Physics Articles:
                          </span>
                        </div>
                        <a
                          href="https://scholar.google.com/scholar?q=unidentified+aerial+phenomena+kinematics+acceleration"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                        >
                          <span>Open Google Scholar</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {analysisResult.databaseCorrelations.scholarArticles.map((article, idx) => (
                          <a
                            key={idx}
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 transition flex flex-col justify-between group cursor-pointer"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-2">
                                  {article.title}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 mt-1">
                                {article.authors} ({article.year}) • {article.citation}
                              </p>
                            </div>
                            <p className="text-[10px] font-mono text-emerald-400/90 mt-2 line-clamp-2">
                              {article.relevance}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Five Observables Baseline Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    AARO / ODNI Five Observables Audit:
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Metric Decoupling Indicators
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Instantaneous Acceleration', active: analysisResult.fiveObservables.instantaneousAcceleration },
                    { label: 'Hypersonic Velocity', active: analysisResult.fiveObservables.hypersonicVelocity },
                    { label: 'Low Observability', active: analysisResult.fiveObservables.lowObservability },
                    { label: 'Transmedium Travel', active: analysisResult.fiveObservables.transmediumTravel },
                    { label: 'Positive Lift (No Wings)', active: analysisResult.fiveObservables.positiveLift },
                  ].map((obs, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-center font-mono text-[10px] transition ${
                        obs.active
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-white/[0.02] border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="mb-1">
                        {obs.active ? '● POSITIVE' : '○ NEGATIVE'}
                      </div>
                      <div className="truncate" title={obs.label}>{obs.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kinematics and Detected Features */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="flex items-center space-x-4 text-slate-400">
                  {analysisResult.kinematics?.estimatedSpeed && (
                    <div>Speed: <span className="text-slate-200 font-bold">{analysisResult.kinematics.estimatedSpeed}</span></div>
                  )}
                  {analysisResult.kinematics?.estimatedAltitude && (
                    <div>Alt: <span className="text-slate-200 font-bold">{analysisResult.kinematics.estimatedAltitude}</span></div>
                  )}
                  {analysisResult.kinematics?.kinematicGForce && (
                    <div>G-Load: <span className="text-slate-200 font-bold">{analysisResult.kinematics.kinematicGForce}</span></div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onNavigateToReport && (
                    <button
                      onClick={onNavigateToReport}
                      className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      title="Proceed to Step 4 to compile and export this analysis into an official MUFON CMS PDF report"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Step 4: Prepare PDF Incident Report →</span>
                    </button>
                  )}

                  {publishedSuccess ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Published to Community Stream!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handlePublishToSightings}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer border border-white/20"
                    >
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>Publish to Stream</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 2: SONIC FFT ACOUSTIC ANALYSIS TOOL */}
      {subView === 'sonic' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Sonic FFT Acoustic Spectrum Telemetry
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time acoustic Fourier transform analyzing infrasound (&lt;20Hz) and ultrasonic (&gt;15kHz) pulses. Authentic UAP metric manipulation theoretically operates without fluid dynamic cavitation or jet turbine acoustics.
              </p>
            </div>
            <button
              onClick={() => setSubView('lab')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition self-start sm:self-auto cursor-pointer"
            >
              ← Back to Gemini Lab
            </button>
          </div>

          <AudioSonicMonitor
            onSendToGemini={(acousticData) => {
              setSubView('lab');
              setSourceType('telemetry');
              setSourceTitle(`Acoustic Signature (${acousticData.peakFreqHz}Hz) Telemetry`);
              setIncidentNotes(`Live acoustic spectrum capture: Peak Frequency: ${acousticData.peakFreqHz}Hz, Ambient Volume: ${acousticData.ambientDb}dB. Ultrasonic Status: ${acousticData.hasUltrasonic ? 'ULTRASONIC PULSE DETECTED (>15kHz)' : 'Sub-ultrasonic nominal'}. Note absence of conventional jet turbine blade pass frequencies.`);
            }}
          />
        </div>
      )}

      {/* SUBVIEW 3: COMMUNITY SIGHTINGS STREAM */}
      {subView === 'feed' && (
        <SightingFeed
          sightings={sightings}
          userLocation={userLocation}
          onSelectSighting={onSelectSighting}
          onUpvote={onUpvote}
          onOpenCreateReport={onOpenCreateReport}
          onOpenUapClassesGuide={onOpenUapClassesGuide}
        />
      )}

      {/* VAULT PICKER MODAL */}
      {isVaultPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Select Media from Target Vault</h3>
              </div>
              <button
                onClick={() => setIsVaultPickerOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {vaultItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-mono">
                  No saved media in your Offline Vault yet. Capture anomalies in the Target tab first!
                </div>
              ) : (
                vaultItems.map((item) => {
                  const previewImg = item.dataUrl || item.burstFrames?.[0] || '';
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectVaultItem(item)}
                      className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center space-x-3 text-left transition cursor-pointer group"
                    >
                      <div className="w-16 h-14 rounded-xl overflow-hidden bg-black/60 flex-shrink-0">
                        {previewImg ? (
                          <img src={previewImg} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] font-mono">VAULT</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 truncate">
                            {item.title || 'Target Capture'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                            {item.mediaType}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {item.timestamp} • Az: {item.telemetry.azimuth.toFixed(0)}° • Alt: {item.telemetry.pitch.toFixed(0)}°
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsVaultPickerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
