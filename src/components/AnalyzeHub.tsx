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
  const [activeTier, setActiveTier] = useState<AnalyzeTier>('osint');

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
      description: `${analysis.verdictSummary}\n\n[DTC Code]: ${analysis.dtcCode || 'P1947'} - ${analysis.dtcTitle || ''}\n\n${analysis.parallaxPanel ? `[Multi-Lens Review]: ${analysis.parallaxPanel.consensusVerdict} (${analysis.parallaxPanel.consensusConfidence}% Conf. - ${analysis.parallaxPanel.agreementLevel})\nPrimary Suspect: ${analysis.parallaxPanel.primarySuspect}\nKey Question: ${analysis.parallaxPanel.unresolvedQuestion}\n\n` : ''}[Lens A Classical Baseline]: ${analysis.dualLens?.classicalDeconfliction || 'Screened against FAA airspace'}\n\n[Lens B Metric Signature]: ${analysis.dualLens?.metricSignature || 'Boundary-layer decoupling evaluated'}`,
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
        analysis.parallaxPanel ? 'MultiLensReview' : 'Analyzed',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
            <ScanSearch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wide">
              Analyze Sky Phenomena
            </h2>
            <p className="text-[11px] text-slate-400">
              Forensic media inspection, triangulation, and sensor deconfliction.
            </p>
          </div>
        </div>

        {/* Utility Shortcuts */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 font-mono text-[11px]">
          {onOpenUapClassesGuide && (
            <button
              onClick={onOpenUapClassesGuide}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1 cursor-pointer"
            >
              <Landmark className="w-3 h-3 text-cyan-400" />
              <span>9 Classes</span>
            </button>
          )}

          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition flex items-center space-x-1 cursor-pointer font-bold"
            >
              <HardDrive className="w-3 h-3 text-amber-400" />
              <span>Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Switcher (Tool-001 Clean Low-Ink Bar) */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTier('osint')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            activeTier === 'osint'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Forensics</span>
        </button>

        <button
          onClick={() => setActiveTier('witness')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            activeTier === 'witness'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Sensor View</span>
        </button>

        <button
          onClick={() => setActiveTier('triangulate')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            activeTier === 'triangulate'
              ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Triangulate</span>
        </button>

        <button
          onClick={() => setActiveTier('sonic')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            activeTier === 'sonic'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sonic FFT</span>
        </button>

        <button
          onClick={() => setActiveTier('feed')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            activeTier === 'feed'
              ? 'bg-purple-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Ledger ({sightings.length})</span>
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
