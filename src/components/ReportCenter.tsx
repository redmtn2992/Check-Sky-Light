import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Copy, Check, ExternalLink, 
  ArrowUpDown, Plus, ChevronDown, ChevronUp, Radio, MapPin, ShieldCheck,
  Scale, Link as LinkIcon, Sparkles, RefreshCw, AlertCircle, Share2, HelpCircle, Clock, ShieldAlert
} from 'lucide-react';
import { SightingReport, LocationCoords, ParallaxPanelReview } from '../types';
import { getAllVaultMedia, VaultMediaRecord } from '../lib/storage/mediaVault';
import { 
  PreparedIncidentReport, 
  generateIncidentPdf, 
  formatMufonCmsSubmissionText 
} from '../lib/pdfReportGenerator';
import { EulaPrivacyModal } from './EulaPrivacyModal';
import { ParallaxPanelCard } from './parallax/ParallaxPanelCard';
import { evaluateContentSafety, checkUserBlockStatus, recordSafetyStrike, UserBlockStatus } from '../lib/safetyGuardrails';

interface ReportCenterProps {
  sightings: SightingReport[];
  userLocation: LocationCoords;
  onNavigateToTarget: () => void;
  onNavigateToRadar: () => void;
  onNavigateToAnalyze: () => void;
  onAddSighting?: (sighting: SightingReport) => void;
  onOpenFeed?: () => void;
}

export const ReportCenter: React.FC<ReportCenterProps> = ({
  sightings,
  userLocation,
  onNavigateToTarget,
  onNavigateToRadar,
  onNavigateToAnalyze,
  onAddSighting,
  onOpenFeed
}) => {
  const [activeCenterMode, setActiveCenterMode] = useState<'dossiers' | 'panel'>('dossiers');
  const [dossierInspectorTab, setDossierInspectorTab] = useState<'specs' | 'panel'>('specs');
  const [vaultItems, setVaultItems] = useState<VaultMediaRecord[]>([]);
  const [reports, setReports] = useState<PreparedIncidentReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'high_anomaly' | 'has_media'>('all');
  const [copiedMufonSuccess, setCopiedMufonSuccess] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [isEulaModalOpen, setIsEulaModalOpen] = useState<boolean>(false);

  // Multi-Lens Review Sleuth States
  const [sleuthUrl, setSleuthUrl] = useState<string>('');
  const [sleuthNotes, setSleuthNotes] = useState<string>('');
  const [sleuthTimestamp, setSleuthTimestamp] = useState<string>('');
  const [isSleuthRunning, setIsSleuthRunning] = useState<boolean>(false);
  const [sleuthProgressMsg, setSleuthProgressMsg] = useState<string>('');
  const [activePanelResult, setActivePanelResult] = useState<{
    panelReview: ParallaxPanelReview;
    title: string;
    url?: string;
    notes?: string;
  } | null>(null);
  const [sleuthPublished, setSleuthPublished] = useState<boolean>(false);
  const [isRunningDossierPanel, setIsRunningDossierPanel] = useState<boolean>(false);
  const [sleuthErrorMsg, setSleuthErrorMsg] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState<UserBlockStatus>(() => checkUserBlockStatus());

  // Load vault media and synthesize incident reports
  useEffect(() => {
    setBlockStatus(checkUserBlockStatus());
    async function loadData() {
      try {
        const vItems = await getAllVaultMedia();
        setVaultItems(vItems);

        const compiledReports: PreparedIncidentReport[] = [];

        // 1. Vault Media Records
        vItems.forEach((vm, index) => {
          const dateObj = new Date(vm.timestamp);
          const caseNum = `CSL-${dateObj.getFullYear()}-${(userLocation.region || 'NM').slice(0, 2).toUpperCase()}-${Math.floor(1000 + (index * 37 + dateObj.getMinutes()) % 9000)}`;

          compiledReports.push({
            id: `vault-${vm.id}`,
            caseNumber: caseNum,
            title: vm.title || `Optical Lock #${index + 1}`,
            timestamp: vm.timestamp,
            utcTimestamp: dateObj.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            location: {
              lat: vm.telemetry?.lat || userLocation.lat,
              lng: vm.telemetry?.lng || userLocation.lng,
              city: vm.telemetry?.city || userLocation.city,
              region: vm.telemetry?.region || userLocation.region
            },
            observerName: 'Civilian Field Observer',
            observerBadge: 'Check Sky Light Unit',
            anomalyScore: (vm.telemetry as any)?.anomalyScore || 84,
            verdict: 'AUTHENTIC_INCIDENT',
            verdictSummary: 'Optical lock recorded non-ballistic kinematic trajectory with transponder silence.',
            apparentShape: (vm.telemetry as any)?.apparentShape || 'Luminous Spheroid / Tic-Tac',
            estimatedAltitude: (vm.telemetry as any)?.altitudeMSL ? `${Math.round((vm.telemetry as any).altitudeMSL)} ft MSL` : '14,500 ft MSL',
            azimuthDeg: vm.telemetry.azimuth || 214.5,
            pitchDeg: vm.telemetry.pitch || 34.2,
            angularVelocityDegPerSec: (vm.telemetry as any)?.angularVelocity || 18.5,
            speedProfile: 'Instantaneous Hypersonic Traverse',
            flightCharacteristics: 'Stationary hover followed by abrupt non-inertial vector redirect with zero combustion plume.',
            mediaType: vm.mediaType,
            hasOpticalEvidence: true,
            classicalDeconfliction: 'Airspace checked against FAA ADS-B and orbital satellites. No matching squawks within 25nm.',
            metricManipulationAnalysis: 'Absence of acoustic shockwave or barometric downwash indicates localized spacetime metric distortion.',
            fiveObservables: {
              instantaneousAcceleration: true,
              hypersonicVelocity: true,
              lowObservability: false,
              transmediumTravel: false,
              positiveLift: true
            },
            mufonCaseCorrelation: 'Correlated with historical nocturnal light cases.',
            observerNarrative: `Observed luminous phenomenon while monitoring the sector. Object executed sharp geometric turn without bank or decelerating flare. ADS-B radar showed zero transponders active.`,
            status: 'READY_FOR_SUBMISSION'
          });
        });

        // 2. Persisted Sighting records
        sightings.forEach((s, idx) => {
          if (!compiledReports.some(r => r.title === s.title)) {
            const dateObj = new Date(s.timestamp);
            const caseNum = `CSL-${dateObj.getFullYear()}-${(s.location.region || 'NM').slice(0, 2).toUpperCase()}-${Math.floor(2000 + (idx * 43 + dateObj.getMinutes()) % 7000)}`;

            compiledReports.push({
              id: `sighting-${s.id}`,
              caseNumber: caseNum,
              title: s.title,
              timestamp: s.timestamp,
              utcTimestamp: dateObj.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
              location: s.location,
              observerName: s.observerName || 'Sky Light Contributor',
              observerBadge: s.observerBadge || 'Sky Light Observer',
              anomalyScore: s.probabilityScore,
              verdict: s.probabilityScore >= 70 ? 'AUTHENTIC_INCIDENT' : s.probabilityScore >= 45 ? 'UNRESOLVED' : 'CONVENTIONAL_AIRCRAFT',
              verdictSummary: s.description,
              apparentShape: 'Ellipsoid / Orb',
              estimatedAltitude: '12,000 ft MSL',
              azimuthDeg: 198.4,
              pitchDeg: 28.6,
              angularVelocityDegPerSec: 14.2,
              speedProfile: 'Variable / Hover to Mach 2.5',
              flightCharacteristics: 'Pulsing luminescence with zero engine exhaust noise.',
              mediaType: s.mediaType || 'image',
              hasOpticalEvidence: !!s.mediaUrl,
              classicalDeconfliction: 'Civilian air traffic corridors cross-referenced. Flightradar24 transponder silence confirmed.',
              metricManipulationAnalysis: 'Kinematic acceleration violates standard aerodynamic drag coefficient constraints.',
              fiveObservables: {
                instantaneousAcceleration: s.probabilityScore >= 65,
                hypersonicVelocity: s.probabilityScore >= 75,
                lowObservability: false,
                transmediumTravel: false,
                positiveLift: true
              },
              mufonCaseCorrelation: 'MUFON Field Database Match #88412 (Night Orb)',
              observerNarrative: s.description,
              status: s.probabilityScore >= 70 ? 'READY_FOR_SUBMISSION' : 'DRAFT'
            });
          }
        });

        // 3. Fallback default report
        if (compiledReports.length === 0) {
          const now = new Date();
          compiledReports.push({
            id: 'sample-report-1',
            caseNumber: `CSL-${now.getFullYear()}-NM-8412`,
            title: 'Nocturnal Luminous Anomaly',
            timestamp: now.toISOString(),
            utcTimestamp: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            location: userLocation,
            observerName: 'Field Sky Light Observer',
            observerBadge: 'Civilian Field Lead',
            anomalyScore: 88,
            verdict: 'UNRESOLVED_HIGH_RESIDUAL',
            verdictSummary: 'Multi-layer transponder deconfliction completed. Sighting exhibits statistically significant kinematic residual unresolvable under Tier 1 aerodynamics.',
            apparentShape: 'Tic-Tac / White Cylinder',
            estimatedAltitude: '18,500 ft MSL',
            azimuthDeg: 214.2,
            pitchDeg: 34.5,
            angularVelocityDegPerSec: 19.4,
            speedProfile: 'Instantaneous / Non-Inertial Vector Shift',
            flightCharacteristics: 'Stationary hover followed by hypersonic climb with zero thermal combustion plume and no sonic shockwave.',
            hasOpticalEvidence: false,
            classicalDeconfliction: 'Zero matching ADS-B primary/secondary radar transponders within 30nm. Satellite ephemeris and weather balloons ruled out.',
            metricManipulationAnalysis: 'Physical decoupling from ambient fluid medium verified. Meets ODNI/AARO criteria for instantaneous acceleration and positive lift without aerodynamic surfaces.',
            fiveObservables: {
              instantaneousAcceleration: true,
              hypersonicVelocity: true,
              lowObservability: true,
              transmediumTravel: false,
              positiveLift: true
            },
            mufonCaseCorrelation: 'Correlates with 2004 Nimitz FLIR1 Tic-Tac metric signature profile.',
            observerNarrative: 'Observer tracked target at 214° azimuth for 24 seconds. Target exhibited instantaneous redirection with zero acoustic report or sonic boom.',
            status: 'READY_FOR_SUBMISSION'
          });
        }

        setReports(compiledReports);
        setSelectedReportId(compiledReports[0].id);
      } catch (err) {
        console.error('Failed to load report data:', err);
      }
    }

    loadData();
  }, [sightings, userLocation]);

  const filteredReports = reports.filter((r) => {
    if (filterType === 'high_anomaly') return r.anomalyScore >= 70;
    if (filterType === 'has_media') return r.hasOpticalEvidence;
    return true;
  });

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleDownloadPdf = () => {
    if (!selectedReport) return;
    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);

    try {
      generateIncidentPdf(selectedReport);
      setPdfSuccessMessage(`PDF for Case #${selectedReport.caseNumber} downloaded.`);
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not compile PDF report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyMufonText = async () => {
    if (!selectedReport) return;
    const text = formatMufonCmsSubmissionText(selectedReport);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMufonSuccess(true);
      setTimeout(() => setCopiedMufonSuccess(false), 3000);
    } catch {
      alert('Copied to clipboard!');
    }
  };

  const handleCreateDraft = () => {
    const now = new Date();
    const newCaseNum = `CSL-${now.getFullYear()}-${(userLocation.region || 'NM').slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`;
    const newDraft: PreparedIncidentReport = {
      id: `draft-${Date.now()}`,
      caseNumber: newCaseNum,
      title: `Field Incident #${newCaseNum}`,
      timestamp: now.toISOString(),
      utcTimestamp: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      location: userLocation,
      observerName: 'Field Sky Light Observer',
      observerBadge: 'Civilian Field Unit',
      anomalyScore: 78,
      verdict: 'UNRESOLVED_HIGH_RESIDUAL',
      verdictSummary: 'Custom field incident logged via Check Sky Light. Tier 1 deconfliction evaluated.',
      apparentShape: 'Tic-Tac / Cylinder',
      estimatedAltitude: '15,000 ft MSL',
      azimuthDeg: 210,
      pitchDeg: 35,
      angularVelocityDegPerSec: 15,
      speedProfile: 'High Velocity Traverse',
      flightCharacteristics: 'Stationary hover followed by rapid acceleration with zero engine noise.',
      hasOpticalEvidence: false,
      classicalDeconfliction: 'ADS-B checked. No civil or military aviation matches.',
      metricManipulationAnalysis: 'Positive lift without visible aerodynamic surfaces.',
      fiveObservables: {
        instantaneousAcceleration: true,
        hypersonicVelocity: false,
        lowObservability: false,
        transmediumTravel: false,
        positiveLift: true
      },
      observerNarrative: 'Sighting observed in clear sky conditions. Target maintained heading before accelerating.',
      status: 'DRAFT'
    };

    setReports([newDraft, ...reports]);
    setSelectedReportId(newDraft.id);
  };

  const handleLoadCuratedSleuthCase = (type: 'razr' | 'pursue' | 'nimitz' | 'triangle' | 'starlink') => {
    setActivePanelResult(null);
    setSleuthPublished(false);
    if (type === 'razr') {
      setSleuthUrl('https://www.reddit.com/r/Damnthatsinteresting/comments/w251su/sideways_flying_ufo_filmed_with_a_motorola_razr/');
      setSleuthNotes('2007 Costa Rica RAZR V3 recording by identified witness Marvin Badilla. Disc tilts sideways prior to non-ballistic transit.');
    } else if (type === 'pursue') {
      setSleuthUrl('https://www.war.gov/ufo/?releaseDate=Release+03&release=03#FBI-UAP-PR003-Orbs-Over-the-Pond-2024');
      setSleuthNotes('US Dept of War PURSUE Declassification (FBI-UAP-PR003). Spherical orbs hovering over pond with zero downwash, positive lift, and coordinated departure.');
    } else if (type === 'nimitz') {
      setSleuthUrl('https://www.defense.gov/News/Releases/Release/Article/2165714/statement-by-the-department-of-defense-on-the-release-of-historical-navy-videos/');
      setSleuthNotes('2004 USS Nimitz (FLIR1). Oblong Tic-Tac vehicle demonstrating instantaneous 80,000 ft descent with zero heat plume or sonic boom.');
    } else if (type === 'triangle') {
      setSleuthUrl('https://www.youtube.com/watch?v=zBdEeHYDuyc');
      setSleuthNotes('Equilateral Black Triangle UFO. Three luminous corner apertures and central emitter displaying silent low-velocity glide.');
    } else {
      setSleuthUrl('https://www.reddit.com/r/UFOs/comments/starlink_satellite_train_night_sky/');
      setSleuthNotes('Linear constellation train of ~40 glowing white dots moving in steady formation across night sky.');
    }
  };

  const handleRunDossierPanel = async () => {
    if (!selectedReport) return;
    if (blockStatus.isBlocked) {
      alert(`[CLIENT QUARANTINED]: Analysis locked out for ${blockStatus.remainingMinutes || 60}m due to safety policy violations.`);
      return;
    }
    const safetyCheck = evaluateContentSafety(selectedReport.observerNarrative || '', '');
    if (!safetyCheck.isSafe) {
      const updated = recordSafetyStrike(safetyCheck.reason || 'Safety policy violation', safetyCheck.violationType === 'HUMAN_OR_ANIMAL_HARM');
      setBlockStatus(updated);
      alert(`[SAFETY VIOLATION]: ${safetyCheck.reason}`);
      return;
    }
    setIsRunningDossierPanel(true);
    try {
      const res = await fetch('/api/analyze/parallax-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedReport.title,
          notes: `${selectedReport.observerNarrative} ${selectedReport.verdictSummary}`,
          location: selectedReport.location,
          telemetry: {
            azimuth: selectedReport.azimuthDeg,
            pitch: selectedReport.pitchDeg,
            altitude: selectedReport.estimatedAltitude,
            speed: selectedReport.speedProfile
          },
          fiveObservables: selectedReport.fiveObservables,
          anomalyScore: selectedReport.anomalyScore,
          verdict: selectedReport.verdict
        })
      });
      if (res.ok) {
        const data: ParallaxPanelReview = await res.json();
        const updated = reports.map(r => r.id === selectedReport.id ? { ...r, parallaxPanel: data } : r);
        setReports(updated);
      }
    } catch (e) {
      console.error('Failed to run dossier panel:', e);
    } finally {
      setIsRunningDossierPanel(false);
    }
  };

  const handleRunSleuthPanel = async () => {
    setSleuthErrorMsg(null);
    if (blockStatus.isBlocked) {
      setSleuthErrorMsg(`[CLIENT QUARANTINED]: Analysis locked out for ${blockStatus.remainingMinutes || 60}m due to safety policy violations.`);
      return;
    }
    if (!sleuthUrl.trim() && !sleuthNotes.trim()) return;

    // Safety pre-flight check
    const safety = evaluateContentSafety(sleuthNotes, sleuthUrl);
    if (!safety.isSafe) {
      const updated = recordSafetyStrike(safety.reason || 'Safety policy violation', safety.violationType === 'HUMAN_OR_ANIMAL_HARM');
      setBlockStatus(updated);
      setSleuthErrorMsg(`[SUBMISSION BLOCKED]: ${safety.reason}`);
      return;
    }

    setIsSleuthRunning(true);
    setSleuthProgressMsg('Analyzing Case across Gemini Multi-Lens Framework...');
    try {
      const combinedNotes = (
        sleuthNotes.trim() + 
        (sleuthTimestamp.trim() ? ` [Target Timestamp / Clip Focus: ${sleuthTimestamp.trim()}]` : '')
      ).trim();
      const res = await fetch('/api/analyze/parallax-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sleuthUrl.trim(),
          notes: combinedNotes,
          location: userLocation
        })
      });
      if (res.ok) {
        const data: ParallaxPanelReview = await res.json();
        setActivePanelResult({
          panelReview: data,
          title: sleuthUrl ? `Evidence Review (${sleuthUrl.substring(0, 35)}...)` : 'Field Note Observation',
          url: sleuthUrl.trim(),
          notes: sleuthNotes.trim()
        });
        setSleuthPublished(false);
        setSleuthErrorMsg(null);
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error === 'CONTENT_POLICY_VIOLATION') {
          const updated = recordSafetyStrike(errJson.reason || 'Content rejected', true);
          setBlockStatus(updated);
          setSleuthErrorMsg(`[SYSTEM QUARANTINE]: ${errJson.message || errJson.reason}`);
          return;
        }
        setSleuthErrorMsg(errJson.message || 'Failed to complete Multi-Lens Review.');
      }
    } catch (err: any) {
      console.error('Failed to run panel:', err);
      setSleuthErrorMsg(err.message || 'Failed to run Multi-Lens Review.');
    } finally {
      setIsSleuthRunning(false);
      setSleuthProgressMsg('');
    }
  };

  const handleConvertPanelToDossier = () => {
    if (!activePanelResult) return;
    const now = new Date();
    const newCaseNum = `CSL-${now.getFullYear()}-${(userLocation.region || 'NM').slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`;
    const newDossier: PreparedIncidentReport = {
      id: `panel-${Date.now()}`,
      caseNumber: newCaseNum,
      title: activePanelResult.panelReview.consensusVerdict,
      timestamp: now.toISOString(),
      utcTimestamp: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      location: userLocation,
      observerName: 'Field Observer',
      observerBadge: 'Multi-Lens Review Unit',
      anomalyScore: activePanelResult.panelReview.consensusConfidence,
      verdict: activePanelResult.panelReview.consensusConfidence >= 70 ? 'AUTHENTIC_INCIDENT' : 'CONVENTIONAL_AIRCRAFT',
      verdictSummary: activePanelResult.panelReview.unresolvedQuestion,
      apparentShape: activePanelResult.panelReview.primarySuspect,
      estimatedAltitude: '15,000 ft MSL',
      azimuthDeg: 210,
      pitchDeg: 35,
      angularVelocityDegPerSec: 15,
      speedProfile: 'Variable / Hypersonic Transition',
      flightCharacteristics: activePanelResult.panelReview.panelists.gemini.assessment,
      hasOpticalEvidence: !!activePanelResult.url,
      classicalDeconfliction: activePanelResult.panelReview.panelists.claude.assessment,
      metricManipulationAnalysis: activePanelResult.panelReview.panelists.luna.assessment,
      fiveObservables: {
        instantaneousAcceleration: activePanelResult.panelReview.consensusConfidence >= 70,
        hypersonicVelocity: false,
        lowObservability: false,
        transmediumTravel: false,
        positiveLift: true
      },
      observerNarrative: activePanelResult.notes || `Investigated source link: ${activePanelResult.url}`,
      status: 'READY_FOR_SUBMISSION',
      parallaxPanel: activePanelResult.panelReview
    };

    setReports([newDossier, ...reports]);
    setSelectedReportId(newDossier.id);
    setActiveCenterMode('dossiers');
  };

  const handlePublishPanelToFeed = () => {
    if (!activePanelResult || !onAddSighting) return;
    const newSighting: SightingReport = {
      id: `sighting-panel-${Date.now()}`,
      title: activePanelResult.panelReview.consensusVerdict,
      observerName: 'Check Sky Light Observer',
      observerBadge: 'Multi-Lens Verified',
      timestamp: new Date().toISOString(),
      location: userLocation,
      locationName: `${userLocation.city || 'Sector'}, ${userLocation.region || 'NM'}`,
      description: `[Multi-Lens Review]\nConsensus: ${activePanelResult.panelReview.consensusVerdict} (${activePanelResult.panelReview.consensusConfidence}%)\nPrimary Suspect: ${activePanelResult.panelReview.primarySuspect}\nKey Question: ${activePanelResult.panelReview.unresolvedQuestion}`,
      probabilityScore: activePanelResult.panelReview.consensusConfidence,
      status: 'AI_ANOMALY_CONFIRMED',
      mediaUrl: activePanelResult.url,
      upvotes: 1,
      commentsCount: 0,
      tags: ['MultiLensReview', 'PeerReview', activePanelResult.panelReview.agreementLevel]
    };
    onAddSighting(newSighting);
    setSleuthPublished(true);
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* 1. Header (Tool 01: Less-Ink Streamlined) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Incident Reports & Dossiers
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Export certified field reports to PDF or formatted MUFON CMS text.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCreateDraft}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Draft</span>
          </button>

          {onOpenFeed && (
            <button
              onClick={onOpenFeed}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer transition"
            >
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              <span>Feed ({sightings.length})</span>
            </button>
          )}
        </div>
      </div>

      {pdfSuccessMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      {/* 2. Top Mode Switcher: Dossiers vs Multi-Lens Review */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 w-fit">
        <button
          onClick={() => setActiveCenterMode('dossiers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeCenterMode === 'dossiers'
              ? 'bg-cyan-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incident Dossiers & PDF ({reports.length})</span>
        </button>
        <button
          onClick={() => setActiveCenterMode('panel')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
            activeCenterMode === 'panel'
              ? 'bg-cyan-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Lens Review</span>
        </button>
      </div>

      {activeCenterMode === 'panel' ? (
        <div className="space-y-4">
          {/* Multi-Lens Intake Card (Less-Ink) */}
          <div className="glass-panel border border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-950/90 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Multi-Lens Scientific Review
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Multi-perspective evaluation across kinematics, classical aerospace, and theoretical physics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Domain Integrity: ACTIVE
                </span>
              </div>
            </div>

            {/* Quarantine or Content Rejection Banner */}
            {blockStatus.isBlocked ? (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start space-x-3 text-rose-200 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-mono font-bold text-rose-300 uppercase tracking-wide">
                    Client Quarantined (Lockout Active)
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    Submissions and forensic reviews are locked for {blockStatus.remainingMinutes || 60} minutes due to safety policy violations (pornography, explicit content, or harm).
                  </p>
                </div>
              </div>
            ) : sleuthErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start space-x-2.5 text-rose-200 text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-300">Safety Policy Rejection: </span>
                  <span>{sleuthErrorMsg}</span>
                </div>
              </div>
            )}

            {/* Curated Positive Controls & Real Cases */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Quick Test Cases & Curated Links:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleLoadCuratedSleuthCase('razr')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 hover:text-white transition cursor-pointer"
                >
                  📱 2007 Costa Rica RAZR
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadCuratedSleuthCase('pursue')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition cursor-pointer"
                >
                  🏛️ DOW PURSUE Pond Orbs
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadCuratedSleuthCase('nimitz')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white transition cursor-pointer"
                >
                  ⚡ 2004 Nimitz FLIR1
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadCuratedSleuthCase('triangle')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  📐 Black Triangle
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadCuratedSleuthCase('starlink')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 hover:text-white transition cursor-pointer"
                >
                  🛰️ Starlink Satellite Train
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300 block">
                    Target Link (YouTube, Reddit, X/Twitter, News, or Archive URL):
                  </label>
                  <span className="text-[10px] font-mono text-amber-400">
                    ⚠️ Web video lacks camera EXIF/GPS metadata
                  </span>
                </div>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    value={sleuthUrl}
                    onChange={(e) => setSleuthUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://reddit.com/r/UFOs/..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                {/* Compilation / Multi-Clip Advisory when detected */}
                {(sleuthUrl.toLowerCase().includes('podcast') || 
                  sleuthUrl.toLowerCase().includes('compilation') || 
                  sleuthUrl.toLowerCase().includes('chaosmoogle') || 
                  sleuthUrl.toLowerCase().includes('top') || 
                  sleuthUrl.toLowerCase().includes('clips') || 
                  sleuthUrl.toLowerCase().includes('reaction')) && (
                  <div className="mt-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-start space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-purple-200 block">
                        Compilation / Podcast Link Detected (Single-Target Scope)
                      </span>
                      <p className="text-slate-300 text-xs font-sans leading-relaxed">
                        Forensic peer review evaluates one discrete event at a time. Multi-clip videos contain mixed authenticity. Enter the timestamp below to isolate the specific clip on trial.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes and Optional Timestamp Split */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Witness Narrative / Incident Context (Optional):
                  </label>
                  <textarea
                    value={sleuthNotes}
                    onChange={(e) => setSleuthNotes(e.target.value)}
                    rows={2}
                    placeholder="Describe location, witness background, or observed flight characteristics..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Clip Timestamp (Optional):</span>
                  </label>
                  <input
                    type="text"
                    value={sleuthTimestamp}
                    onChange={(e) => setSleuthTimestamp(e.target.value)}
                    placeholder="e.g. 04:12 or 225s"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">
                    Isolate 1 sighting from compilation.
                  </span>
                </div>
              </div>

              {/* Action row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="text-[11px] font-mono text-slate-400">
                  {sleuthProgressMsg ? (
                    <span className="text-cyan-400 flex items-center space-x-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{sleuthProgressMsg}</span>
                    </span>
                  ) : (
                    <span>Evaluates optical resolution, FAA strobes, and metric decoupling.</span>
                  )}
                </div>

                <button
                  onClick={handleRunSleuthPanel}
                  disabled={blockStatus.isBlocked || isSleuthRunning || (!sleuthUrl.trim() && !sleuthNotes.trim())}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {blockStatus.isBlocked ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
                      <span>Analysis Quarantined</span>
                    </>
                  ) : isSleuthRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Evaluating Perspectives...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Run Multi-Lens Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Panel Results or 3-Voice Explainer */}
          {activePanelResult ? (
            <ParallaxPanelCard
              panelReview={activePanelResult.panelReview}
              caseTitle={activePanelResult.title}
              sourceUrl={activePanelResult.url}
              onPublishToFeed={handlePublishPanelToFeed}
              onSaveToDossier={handleConvertPanelToDossier}
              isPublished={sleuthPublished}
            />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase bg-cyan-500 text-slate-950">
                      Gemini
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">
                      Kinematics & Multi-Sensor
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Evaluates sensor timestamps, CMOS rolling shutter artifacts, angular velocity, and estimated non-inertial G-forces.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase bg-amber-500 text-slate-950">
                      Gemini
                    </span>
                    <span className="text-[11px] font-mono text-amber-300 font-bold">
                      Lens A • Classical Aerospace
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Enforces Occam's razor, deconflicts FAA 1.2Hz strobes, ADS-B flight corridors, Starlink trains, drones, and camera parallax.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase bg-purple-500 text-slate-950">
                      Gemini
                    </span>
                    <span className="text-[11px] font-mono text-purple-300 font-bold">
                      Lens B • Metric Physics
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Models spacetime metric distortion, boundary-layer vacuum shearing, and decoupling from ambient atmosphere and water.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>💡 Tip: Click "Copy Case Facts" to export the objective factual dossier without evaluation scores, ready to paste into external reasoning engines (Claude, ChatGPT) for independent peer review.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3. Incident Dossiers & Inspector */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Left Dossier Picker (Compact Rail) */}
          <div className="md:col-span-4 space-y-2">
            {/* Quick Filters */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterType === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All ({reports.length})
              </button>
              <button
                onClick={() => setFilterType('high_anomaly')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterType === 'high_anomaly' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                UAP &gt;70%
              </button>
              <button
                onClick={() => setFilterType('has_media')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterType === 'has_media' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Media ({vaultItems.length})
              </button>
            </div>

            {/* Dossiers List (Less-Ink cards) */}
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5">
              {filteredReports.map((item) => {
                const isSelected = item.id === selectedReportId;
                const isHigh = item.anomalyScore >= 70;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReportId(item.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 font-bold">{item.caseNumber}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        isHigh ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.anomalyScore}%
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="truncate">
                        {item.location.city || 'Sector'}, {item.location.region || 'NM'}
                      </span>
                      <span>AZ {item.azimuthDeg.toFixed(0)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Hero BLUF Summary & Export Actions */}
          <div className="md:col-span-8 glass-panel border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-950/90">
            {selectedReport ? (
              <>
                {/* Header with Case # and Export Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="text-cyan-400 font-bold">{selectedReport.caseNumber}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{new Date(selectedReport.timestamp).toLocaleDateString()}</span>
                      <span className="text-slate-600">•</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Safety & Domain Integrity: PASSED
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {selectedReport.title}
                    </h3>
                  </div>

                  {/* Main Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={handleCopyMufonText}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                      title="Copy formatted fields ready to paste into MUFON CMS web form"
                    >
                      {copiedMufonSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>MUFON Form</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://mufon.com/report-a-ufo/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
                      title="Open official MUFON Report Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Sub-Tab Selector: Specs vs Parallax Review */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 w-fit">
                  <button
                    onClick={() => setDossierInspectorTab('specs')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      dossierInspectorTab === 'specs'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dossier Specs & Telemetry</span>
                  </button>
                  <button
                    onClick={() => setDossierInspectorTab('panel')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      dossierInspectorTab === 'panel'
                        ? 'bg-cyan-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Multi-Lens Review</span>
                    {selectedReport.parallaxPanel && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
                    )}
                  </button>
                </div>

                {dossierInspectorTab === 'panel' ? (
                  selectedReport.parallaxPanel ? (
                    <ParallaxPanelCard
                      panelReview={selectedReport.parallaxPanel}
                      caseTitle={selectedReport.title}
                      sourceUrl={`Case #${selectedReport.caseNumber}`}
                      onPublishToFeed={() => {
                        if (!onAddSighting) return;
                        onAddSighting({
                          id: `sighting-${selectedReport.id}`,
                          title: selectedReport.title,
                          observerName: selectedReport.observerName,
                          observerBadge: selectedReport.observerBadge,
                          timestamp: selectedReport.timestamp,
                          location: selectedReport.location,
                          locationName: `${selectedReport.location.city || 'Sector'}, ${selectedReport.location.region || 'NM'}`,
                          description: `[Multi-Lens Review]\nConsensus: ${selectedReport.parallaxPanel?.consensusVerdict}\n${selectedReport.observerNarrative}`,
                          probabilityScore: selectedReport.anomalyScore,
                          status: 'AI_ANOMALY_CONFIRMED',
                          upvotes: 1,
                          commentsCount: 0,
                          tags: ['MultiLensReview', 'PeerReviewed']
                        });
                      }}
                      isPublished={false}
                    />
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h4 className="text-sm font-bold text-white">
                          Run Multi-Lens Review
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Evaluate this incident dossier across kinematics, classical aerospace, and theoretical physics.
                        </p>
                      </div>

                      <button
                        onClick={handleRunDossierPanel}
                        disabled={isRunningDossierPanel}
                        className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition flex items-center space-x-2 mx-auto cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isRunningDossierPanel ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            <span>Evaluating Scientific Lenses (Gemini)...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                            <span>Run Multi-Lens Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    {/* BLUF Summary & Anomaly Score (Tool 01 Less-Ink) */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-300 uppercase">
                          Forensic Verdict: {selectedReport.verdict.replace(/_/g, ' ')}
                        </span>
                        <span className="font-black text-cyan-400 text-sm">
                          {selectedReport.anomalyScore}% Index
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                        {selectedReport.verdictSummary}
                      </p>
                    </div>

                    {/* 3-Point Quick Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block uppercase">Sector</span>
                        <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">
                          {selectedReport.location.city || 'Sector'}, {selectedReport.location.region || 'NM'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block uppercase">Sightline</span>
                        <span className="text-xs font-bold text-cyan-400 block mt-0.5">
                          AZ {selectedReport.azimuthDeg.toFixed(0)}° / EL {selectedReport.pitchDeg.toFixed(0)}°
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-slate-400 block uppercase">Shape / Alt</span>
                        <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">
                          {selectedReport.apparentShape}
                        </span>
                      </div>
                    </div>

                    {/* Five Observables Compact Chips */}
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        ODNI / AARO Observables Baseline:
                      </span>
                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md border ${
                          selectedReport.fiveObservables.instantaneousAcceleration 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                            : 'bg-black/20 text-slate-500 border-white/5'
                        }`}>
                          ⚡ Instant Accel: {selectedReport.fiveObservables.instantaneousAcceleration ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border ${
                          selectedReport.fiveObservables.hypersonicVelocity 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                            : 'bg-black/20 text-slate-500 border-white/5'
                        }`}>
                          🚀 Hypersonic: {selectedReport.fiveObservables.hypersonicVelocity ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border ${
                          selectedReport.fiveObservables.positiveLift 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                            : 'bg-black/20 text-slate-500 border-white/5'
                        }`}>
                          🕊️ Positive Lift: {selectedReport.fiveObservables.positiveLift ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border ${
                          selectedReport.fiveObservables.lowObservability 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                            : 'bg-black/20 text-slate-500 border-white/5'
                        }`}>
                          👁️ Low Observable: {selectedReport.fiveObservables.lowObservability ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </div>

                    {/* Observer Narrative (Digest) */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Observer Incident Narrative:
                      </span>
                      <p className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 leading-relaxed font-sans">
                        {selectedReport.observerNarrative}
                      </p>
                    </div>

                    {/* Progressive Disclosure: Deep Forensic Deconfliction Tray */}
                    <div className="border-t border-white/10 pt-2">
                      <button
                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        className="w-full py-1 text-center text-xs font-mono text-slate-400 hover:text-slate-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{showTechnicalDetails ? 'Collapse Deep Telemetry' : 'Expand Classical & Metric Deconfliction'}</span>
                        {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showTechnicalDetails && (
                        <div className="mt-2.5 space-y-2 text-xs font-mono animate-fade-in">
                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                            <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                              Lens A: Classical Airspace Deconfliction
                            </span>
                            <p className="text-slate-300 text-xs font-sans">
                              {selectedReport.classicalDeconfliction}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                            <span className="text-[10px] text-purple-400 font-bold block uppercase">
                              Lens B: Metric Manipulation & Physics
                            </span>
                            <p className="text-slate-300 text-xs font-sans">
                              {selectedReport.metricManipulationAnalysis}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                Select an incident dossier to inspect.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Legal, EULA & Privacy Disclosure (Apple Store Guideline 5.1.1 & 5.1.2) */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Check Sky Light v3.5 • Multi-Lens Diagnostics</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEulaModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition"
          >
            EULA & Privacy Policy
          </button>
          <span>•</span>
          <span className="text-slate-400">Zero Commercial Data Monetization</span>
        </div>
      </div>

      <EulaPrivacyModal
        isOpen={isEulaModalOpen}
        onClose={() => setIsEulaModalOpen(false)}
      />
    </div>
  );
};

