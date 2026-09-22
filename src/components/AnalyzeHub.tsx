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
    const newReport: SightingReport = {
      id: `sighting-${Date.now()}`,
      title: analysis.verdictTitle || 'Gemini Forensic Analysis Report',
      observerName: 'Check Sky Light Forensic Observer',
      observerBadge: analysis.authenticityScore >= 70 ? 'AI Verified Anomaly' : 'Media Forensic Analyst',
      timestamp: new Date().toISOString(),
      location: userLocation,
      locationName: userLocation.city ? `${userLocation.city}, ${userLocation.region || ''}` : 'Local Airspace Sector',
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

      {/* Primary 3-Tier Navigation Switcher */}
      <div className="glass-panel border border-cyan-500/30 rounded-2xl p-1.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1 text-xs font-mono">
          {/* Tier 1: Eyewitness AI */}
          <button
            onClick={() => setActiveTier('witness')}
            className={`p-2 rounded-xl text-left transition cursor-pointer flex flex-col justify-between ${
              activeTier === 'witness'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeTier === 'witness' ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-950 text-cyan-400'
              }`}>
                TIER 1
              </span>
              <Sparkles className={`w-3.5 h-3.5 ${activeTier === 'witness' ? 'text-slate-950' : 'text-cyan-400'}`} />
            </div>
            <div className="mt-1">
              <span className="font-extrabold text-xs block truncate">1. Eyewitness</span>
              <span className={`text-[10px] block truncate ${activeTier === 'witness' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                AI Optical Score
              </span>
            </div>
          </button>

          {/* Tier 2: 2-Phone Triangulation */}
          <button
            onClick={() => setActiveTier('triangulate')}
            className={`p-2 rounded-xl text-left transition cursor-pointer flex flex-col justify-between ${
              activeTier === 'triangulate'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeTier === 'triangulate' ? 'bg-slate-950 text-teal-300' : 'bg-teal-950 text-teal-400'
              }`}>
                TIER 2
              </span>
              <Users className={`w-3.5 h-3.5 ${activeTier === 'triangulate' ? 'text-slate-950' : 'text-teal-400'}`} />
            </div>
            <div className="mt-1">
              <span className="font-extrabold text-xs block truncate">2. Triangulate</span>
              <span className={`text-[10px] block truncate ${activeTier === 'triangulate' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                Dual Sightlines
              </span>
            </div>
          </button>

          {/* Tier 3: OSINT Sleuth Lab */}
          <button
            onClick={() => setActiveTier('osint')}
            className={`p-2 rounded-xl text-left transition cursor-pointer flex flex-col justify-between ${
              activeTier === 'osint'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeTier === 'osint' ? 'bg-slate-950 text-amber-300' : 'bg-amber-950 text-amber-400'
              }`}>
                TIER 3
              </span>
              <Globe className={`w-3.5 h-3.5 ${activeTier === 'osint' ? 'text-slate-950' : 'text-amber-400'}`} />
            </div>
            <div className="mt-1">
              <span className="font-extrabold text-xs block truncate">3. OSINT Sleuth</span>
              <span className={`text-[10px] block truncate ${activeTier === 'osint' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                URL & CGI Screen
              </span>
            </div>
          </button>

          {/* Utility 1: Sonic FFT */}
          <button
            onClick={() => setActiveTier('sonic')}
            className={`p-2 rounded-xl text-left transition cursor-pointer flex flex-col justify-between ${
              activeTier === 'sonic'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeTier === 'sonic' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                AUDIO
              </span>
              <Volume2 className={`w-3.5 h-3.5 ${activeTier === 'sonic' ? 'text-slate-950' : 'text-cyan-400'}`} />
            </div>
            <div className="mt-1">
              <span className="font-extrabold text-xs block truncate">Sonic FFT</span>
              <span className={`text-[10px] block truncate ${activeTier === 'sonic' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                Acoustics
              </span>
            </div>
          </button>

          {/* Utility 2: Verified Feed */}
          <button
            onClick={() => setActiveTier('feed')}
            className={`p-2 rounded-xl text-left transition cursor-pointer flex flex-col justify-between ${
              activeTier === 'feed'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeTier === 'feed' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                FEED
              </span>
              <Radio className={`w-3.5 h-3.5 ${activeTier === 'feed' ? 'text-slate-950' : 'text-cyan-400'}`} />
            </div>
            <div className="mt-1">
              <span className="font-extrabold text-xs block truncate">Feed ({sightings.length})</span>
              <span className={`text-[10px] block truncate ${activeTier === 'feed' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                Ledger
              </span>
            </div>
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
