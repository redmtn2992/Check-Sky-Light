import React, { useState } from 'react';
import { 
  ScanSearch, Sparkles, Compass, Users, 
  Globe, Volume2, Radio, Crosshair, Radar, 
  FileText, Landmark, HardDrive, ShieldCheck, 
  Layers, CheckCircle2, ChevronRight
} from 'lucide-react';
import { SightingReport, LocationCoords, GeminiForensicAnalysis } from '../types';
import { SightingFeed } from './SightingFeed';
import { AudioSonicMonitor } from './AudioSonicMonitor';
import { TierWitnessCapture } from './analyze/TierWitnessCapture';
import { TierTriangulationStudio } from './analyze/TierTriangulationStudio';
import { TierOsintSleuthLab } from './analyze/TierOsintSleuthLab';
import { TriangulationResult } from '../lib/sightlineMath';

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

export type AnalyzeTier = 'witness' | 'triangulate' | 'osint' | 'sonic' | 'feed';

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
  const [activeTier, setActiveTier] = useState<AnalyzeTier>('witness');

  // Convert analysis result into a community verified sighting report
  const handlePublishAnalysis = (analysis: GeminiForensicAnalysis) => {
    // If this analysis came from a web URL or third-party media, use the extracted incident location (or "Online OSINT Review")
    // rather than stamping the local observer's physical GPS onto an external event.
    const isExternalMedia = analysis.sourceType === 'url';
    const resolvedLocationName = isExternalMedia
      ? (analysis.incidentLocation || 'Online / Remote OSINT Analysis')
      : userLocation.city
      ? `${userLocation.city}, ${userLocation.region || ''}`
      : 'Local Airspace Sector';

    const resolvedLocation: LocationCoords = isExternalMedia
      ? {
          lat: 0,
          lng: 0,
          city: analysis.incidentLocation || 'Remote OSINT Incident',
          region: 'Global / Web'
        }
      : userLocation;

    const newReport: SightingReport = {
      id: `sighting-${Date.now()}`,
      title: analysis.verdictTitle || 'Gemini Forensic Analysis Report',
      observerName: 'Check Sky Light Forensic Observer',
      observerBadge: analysis.authenticityScore >= 70 ? 'AI Verified Anomaly' : 'Media Forensic Analyst',
      timestamp: new Date().toISOString(),
      location: resolvedLocation,
      locationName: resolvedLocationName,
      description: `${analysis.verdictSummary}\n\n[DTC Code]: ${analysis.dtcCode || 'P1947'} - ${analysis.dtcTitle || ''}\n\n[Lens A Classical Baseline]: ${analysis.dualLens?.classicalDeconfliction || 'Screened against FAA airspace'}\n\n[Lens B Metric Signature]: ${analysis.dualLens?.metricSignature || 'Boundary-layer decoupling evaluated'}`,
      probabilityScore: analysis.authenticityScore,
      status: analysis.authenticityScore >= 70 ? 'AI_ANOMALY_CONFIRMED' : 'COMMUNITY_VERIFIED',
      upvotes: 1,
      upvotedByMe: true,
      commentsCount: 0,
      mediaUrl: analysis.sourcePreviewUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      mediaType: analysis.sourceType === 'video' ? 'video' : 'image',
      tags: [
        `Score: ${analysis.authenticityScore}%`,
        analysis.dtcCode || 'P1947',
        analysis.verdict === 'AUTHENTIC_INCIDENT' ? 'Authentic Target' : 'Deconflicted',
        ...(analysis.detectedFeatures || []).slice(0, 2)
      ]
    };

    if (onAddAnalyzedSighting) {
      onAddAnalyzedSighting(newReport);
    }
  };

  // Export triangulation calculation into a sighting report
  const handleExportTriangulation = (result: TriangulationResult, obs1: any, obs2: any) => {
    const newReport: SightingReport = {
      id: `triangulation-${Date.now()}`,
      title: `Multi-Observer Sightline Intercept: ${result.calculatedAltitudeFt.toLocaleString()} ft MSL`,
      observerName: 'Dual iPhone Field Observers',
      observerBadge: 'Triangulation Verified',
      timestamp: new Date().toISOString(),
      location: {
        lat: result.intersectionLat,
        lng: result.intersectionLng,
        city: userLocation.city,
        region: userLocation.region
      },
      locationName: `${userLocation.city || 'Local Sector'} (Intercept Fix)`,
      description: `Simultaneous multi-observer sightline convergence. Observer 1 (AZ ${obs1.az}°, EL ${obs1.el}°) and Observer 2 (AZ ${obs2.az}°, EL ${obs2.el}°) converged at 3D altitude of ${result.calculatedAltitudeFt.toLocaleString()} ft MSL (${result.calculatedAltitudeMeters.toLocaleString()} m AGL). Slant range: ${result.distWitness1Miles} mi (Obs 1), ${result.distWitness2Miles} mi (Obs 2).`,
      probabilityScore: 95,
      status: 'AI_ANOMALY_CONFIRMED',
      upvotes: 2,
      upvotedByMe: true,
      commentsCount: 0,
      mediaUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
      mediaType: 'image',
      tags: [
        'Triangulation Fix',
        `${result.calculatedAltitudeFt.toLocaleString()} ft`,
        'P1947',
        '2-Phone Corroboration'
      ]
    };

    if (onAddAnalyzedSighting) {
      onAddAnalyzedSighting(newReport);
    }
    setActiveTier('feed');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <ScanSearch className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-wide">
              Analyze Sky Phenomena
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-modal investigation: witness capture, sightline triangulation, and OSINT synthetic fake detection.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onOpenUapClassesGuide && (
            <button
              onClick={onOpenUapClassesGuide}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
              title="Official 9 Observed UAP Morphology Reference Guide"
            >
              <Landmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>9 UAP Classes</span>
            </button>
          )}

          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
              title="Target Capture Offline Vault"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Switcher (Less-Ink Streamlined) */}
      <div className="glass-panel border border-white/10 rounded-2xl p-1 bg-slate-950/80 shadow-md">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 text-xs font-mono">
          {/* Option 1: URL / Media Link */}
          <button
            onClick={() => setActiveTier('osint')}
            className={`p-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeTier === 'osint'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <Globe className={`w-4 h-4 ${activeTier === 'osint' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="font-extrabold text-[11px] block truncate">URL / Media</span>
          </button>

          {/* Option 2: Witness Capture */}
          <button
            onClick={() => setActiveTier('witness')}
            className={`p-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeTier === 'witness'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTier === 'witness' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span className="font-extrabold text-[11px] block truncate">Capture / Photo</span>
          </button>

          {/* Option 3: Triangulate */}
          <button
            onClick={() => setActiveTier('triangulate')}
            className={`p-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeTier === 'triangulate'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTier === 'triangulate' ? 'text-slate-950' : 'text-teal-400'}`} />
            <span className="font-extrabold text-[11px] block truncate">Triangulate</span>
          </button>

          {/* Option 4: Sonic FFT */}
          <button
            onClick={() => setActiveTier('sonic')}
            className={`p-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeTier === 'sonic'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 border border-white/5'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${activeTier === 'sonic' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span className="font-extrabold text-[11px] block truncate">Sonic FFT</span>
          </button>

          {/* Option 5: Feed */}
          <button
            onClick={() => setActiveTier('feed')}
            className={`p-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeTier === 'feed'
                ? 'bg-purple-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 border border-white/5'
            }`}
          >
            <Radio className={`w-4 h-4 ${activeTier === 'feed' ? 'text-slate-950' : 'text-purple-400'}`} />
            <span className="font-extrabold text-[11px] block truncate">Ledger ({sightings.length})</span>
          </button>
        </div>
      </div>

      {/* Sleek Tactical Pipeline Stepper */}
      <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-400">
        <button
          onClick={onNavigateToTarget}
          disabled={!onNavigateToTarget}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg transition ${
            onNavigateToTarget ? 'hover:bg-slate-800 text-slate-300 cursor-pointer' : 'opacity-60 cursor-default'
          }`}
        >
          <Crosshair className="w-3 h-3 text-slate-400" />
          <span>1. Target</span>
        </button>

        <span className="text-slate-700">›</span>

        <button
          onClick={onNavigateToRadar}
          disabled={!onNavigateToRadar}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg transition ${
            onNavigateToRadar ? 'hover:bg-slate-800 text-slate-300 cursor-pointer' : 'opacity-60 cursor-default'
          }`}
        >
          <Radar className="w-3 h-3 text-slate-400" />
          <span>2. Radar</span>
        </button>

        <span className="text-slate-700">›</span>

        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
          <ScanSearch className="w-3 h-3 text-cyan-400" />
          <span>3. Analyze</span>
        </div>

        <span className="text-slate-700">›</span>

        <button
          onClick={onNavigateToReport}
          disabled={!onNavigateToReport}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg transition ${
            onNavigateToReport ? 'hover:bg-slate-800 text-slate-300 cursor-pointer' : 'opacity-60 cursor-default'
          }`}
        >
          <FileText className="w-3 h-3 text-slate-400" />
          <span>4. Report</span>
        </button>
      </div>

      {/* ACTIVE TIER CONTENT */}
      {activeTier === 'witness' && (
        <TierWitnessCapture
          userLocation={userLocation}
          onOpenVault={onOpenVault}
          onPublishSighting={handlePublishAnalysis}
        />
      )}

      {activeTier === 'triangulate' && (
        <TierTriangulationStudio
          userLocation={userLocation}
          onSendToTargetScanner={(lat, lng, alt) => {
            if (onNavigateToTarget) onNavigateToTarget();
          }}
          onExportToReport={handleExportTriangulation}
        />
      )}

      {activeTier === 'osint' && (
        <TierOsintSleuthLab
          userLocation={userLocation}
          onPublishSighting={handlePublishAnalysis}
        />
      )}

      {activeTier === 'sonic' && (
        <AudioSonicMonitor />
      )}

      {activeTier === 'feed' && (
        <SightingFeed
          sightings={sightings}
          userLocation={userLocation}
          onSelectSighting={onSelectSighting}
          onUpvote={onUpvote}
          onOpenCreateReport={onOpenCreateReport}
          onOpenUapClassesGuide={onOpenUapClassesGuide}
        />
      )}
    </div>
  );
};
