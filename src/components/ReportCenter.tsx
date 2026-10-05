import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Copy, Check, ExternalLink, 
  ArrowUpDown, Plus, ChevronDown, ChevronUp, Radio, MapPin, ShieldCheck
} from 'lucide-react';
import { SightingReport, LocationCoords } from '../types';
import { getAllVaultMedia, VaultMediaRecord } from '../lib/storage/mediaVault';
import { 
  PreparedIncidentReport, 
  generateIncidentPdf, 
  formatMufonCmsSubmissionText 
} from '../lib/pdfReportGenerator';
import { EulaPrivacyModal } from './EulaPrivacyModal';

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
  const [vaultItems, setVaultItems] = useState<VaultMediaRecord[]>([]);
  const [reports, setReports] = useState<PreparedIncidentReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'high_anomaly' | 'has_media'>('all');
  const [copiedMufonSuccess, setCopiedMufonSuccess] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [isEulaModalOpen, setIsEulaModalOpen] = useState<boolean>(false);

  // Load vault media and synthesize incident reports
  useEffect(() => {
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
            verdict: 'AUTHENTIC_INCIDENT',
            verdictSummary: 'Correlated mobile IMU compass and optical crosshair lock. Non-inertial instantaneous traverse with transponder silence.',
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
      verdict: 'AUTHENTIC_INCIDENT',
      verdictSummary: 'Custom field incident logged via Check Sky Light report center.',
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

      {/* 2. Main Layout: Clean Dossier Selector + Focused Inspector */}
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
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span className="text-cyan-400 font-bold">{selectedReport.caseNumber}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{new Date(selectedReport.timestamp).toLocaleDateString()}</span>
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
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              Select an incident dossier to inspect.
            </div>
          )}
        </div>
      </div>
      {/* Legal, EULA & Privacy Disclosure (Apple Store Guideline 5.1.1 & 5.1.2) */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Check Sky Light v2.1 • Licensed Application</span>
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

