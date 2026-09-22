import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, 
  ExternalLink, Share2, HardDrive, FileText, 
  ArrowUpRight, AlertTriangle, Layers, Activity,
  Info, Cpu, Copy, Check, GraduationCap, Smile,
  Telescope, BookOpen, Lightbulb
} from 'lucide-react';
import { GeminiForensicAnalysis } from '../../types';

interface DiagnosticReportCardProps {
  analysis: GeminiForensicAnalysis;
  onPublishToFeed?: () => void;
  onSaveToVault?: () => void;
  isPublished?: boolean;
}

export const DiagnosticReportCard: React.FC<DiagnosticReportCardProps> = ({
  analysis,
  onPublishToFeed,
  onSaveToVault,
  isPublished = false
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'dualLens' | 'observables' | 'kinematics'>('overview');
  const [isAcademyExpanded, setIsAcademyExpanded] = useState(false);

  const isAuthentic = analysis.verdict === 'AUTHENTIC_INCIDENT';
  const isSynthetic = analysis.verdict === 'SYNTHETIC_FAKE';
  const isConventional = analysis.verdict === 'CONVENTIONAL_AIRCRAFT';
  const isUnresolved = analysis.verdict === 'UNRESOLVED';

  const dtcCode = analysis.dtcCode || (isAuthentic ? 'P1947' : isSynthetic ? 'P0420' : isConventional ? 'P0505' : 'P0100');
  const dtcTitle = analysis.dtcTitle || (isAuthentic ? 'P1947: Anomalous Lift / Spacetime Metric Decoupling' : isSynthetic ? 'P0420: Synthetic CGI / Digital Frame Compositing' : isConventional ? 'P0505: Deconflicted Civilian Airspace Target' : 'P0100: Airspace Metric Anomaly');

  const handleShareReport = () => {
    const text = `Check Sky Light Forensic Diagnostic Report\n` +
      `Incident: ${analysis.sourceTitle}\n` +
      `Score: ${analysis.authenticityScore}% Anomaly Probability\n` +
      `Verdict: ${analysis.verdictTitle}\n` +
      `Diagnostic DTC: ${dtcCode}\n` +
      `Summary: ${analysis.verdictSummary}`;

    if (navigator.share) {
      navigator.share({
        title: 'Check Sky Light Report',
        text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="glass-panel border border-cyan-500/30 rounded-3xl p-4 sm:p-6 space-y-6 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      {/* Top Header Badge & DTC Diagnostic Fault Code */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl border ${
            isAuthentic 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : isSynthetic
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : isConventional
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
          }`}>
            {isAuthentic ? <ShieldCheck className="w-6 h-6" /> : isSynthetic ? <ShieldAlert className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-cyan-400">
                CHECK SKY LIGHT DIAGNOSTIC REPORT
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                MIL DTC {dtcCode}
              </span>
              {analysis.mundaneObjectDetected && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center space-x-1">
                  <Smile className="w-3 h-3 text-purple-400" />
                  <span>TERRESTRIAL MUNDANE TEST</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              {analysis.verdictTitle}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShareReport}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
            title="Share or copy forensic diagnostic summary"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
          {onSaveToVault && (
            <button
              onClick={onSaveToVault}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
              title="Save report and telemetry to offline vault"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Probability Gauges (Easy to Understand) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core UAP Probability Gauge */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between relative overflow-hidden ${
          isAuthentic
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 border-emerald-500/40'
            : isSynthetic
            ? 'bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950 border-rose-500/40'
            : isConventional
            ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950 border-amber-500/40'
            : 'bg-slate-900/60 border-cyan-500/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              UAP Anomaly Probability
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              isAuthentic ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              isSynthetic ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {isAuthentic ? 'ANOMALOUS' : isSynthetic ? 'SYNTHETIC' : 'DECONFLICTED'}
            </span>
          </div>

          <div className="my-3 flex items-baseline space-x-2">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter ${
              isAuthentic ? 'text-emerald-400' : isSynthetic ? 'text-rose-400' : isConventional ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {analysis.authenticityScore}%
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100% Genuine Anomaly</span>
          </div>

          {/* Probability Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  isAuthentic ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                  isSynthetic ? 'bg-gradient-to-r from-rose-500 to-amber-500' :
                  'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${Math.max(5, analysis.authenticityScore)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Conventional / Fake</span>
              <span>Authentic Physical UAP</span>
            </div>
          </div>
        </div>

        {/* Synthetic Media / CGI Hoax Probability */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              CGI / Synthetic Media
            </span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>

          <div className="my-2.5 flex items-baseline space-x-2">
            <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tighter ${
              analysis.fakeProbability > 60 ? 'text-rose-400' : analysis.fakeProbability > 30 ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {analysis.fakeProbability}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">VFX Index</span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
            {analysis.dualLens?.vfxForensics || 'Neural diffusion & frame composite screen.'}
          </p>
        </div>

        {/* DTC Classification Diagnostic Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Diagnostic Code
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              OBD-II
            </span>
          </div>

          <div className="my-2">
            <span className="text-2xl font-black font-mono text-amber-400 block tracking-tight">
              {dtcCode}
            </span>
            <span className="text-xs font-bold text-slate-200 block truncate">
              {dtcTitle}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
            {isAuthentic 
              ? 'Confirmed boundary-layer decoupling.'
              : isSynthetic 
              ? 'Artificial pixel interpolation flagged.'
              : 'Civilian airframe deconfliction matched.'}
          </p>
        </div>
      </div>

      {/* Condensed Executive Forensic Summary */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
        <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wide">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Forensic Summary</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {analysis.verdictSummary}
        </p>
      </div>

      {/* Rated PG-13 Forensic Humor Callout (Compact Banner) */}
      {(analysis.humorousQuirk || analysis.mundaneObjectDetected) && (
        <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start space-x-3 text-xs">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
            <Smile className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                Terrestrial Object Check (PG-13)
              </span>
            </div>
            <p className="text-xs text-purple-200/90 italic font-medium leading-normal">
              "{analysis.humorousQuirk || 'Target identified as terrestrial matter. Zero anti-gravity field or warp-metric distortion detected. Sensor diagnostic confirms object is 100% earthly.'}"
            </p>
          </div>
        </div>
      )}

      {/* Avionics & Astronomy Academy: Condensed Teachable Moment with Expandable Detail */}
      {analysis.educationalAeroAstronomyLesson && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide">
              <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Avionics & Astronomy Academy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                {analysis.educationalAeroAstronomyLesson.topic}
              </span>
              <button
                onClick={() => setIsAcademyExpanded(!isAcademyExpanded)}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer transition"
              >
                {isAcademyExpanded ? 'Less' : 'Details'}
              </button>
            </div>
          </div>

          <p className={`text-xs text-slate-200 leading-relaxed ${isAcademyExpanded ? '' : 'line-clamp-2'}`}>
            {analysis.educationalAeroAstronomyLesson.concept}
          </p>

          {analysis.educationalAeroAstronomyLesson.skyWatcherTip && (
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center space-x-2 text-xs font-mono text-slate-300">
              <Telescope className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">
                <strong className="text-cyan-300 font-semibold mr-1">Skywatcher Tip:</strong>
                {analysis.educationalAeroAstronomyLesson.skyWatcherTip}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation for Detailed Scientific Investigation */}
      <div className="space-y-4">
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Features
          </button>
          <button
            onClick={() => setActiveTab('dualLens')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'dualLens'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual-Lens Framework
          </button>
          <button
            onClick={() => setActiveTab('observables')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'observables'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ODNI/AARO 5 Observables
          </button>
          <button
            onClick={() => setActiveTab('kinematics')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'kinematics'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kinematics & Corroboration
          </button>
        </div>

        {/* Tab 1: Overview & Detected Features */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* Detected Key Physical Features */}
            {analysis.detectedFeatures && analysis.detectedFeatures.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Identified Physical & Optical Markers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedFeatures.map((feat, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-200 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Platform / Provenance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <span className="text-slate-400 block text-[10px]">EVIDENCE PROVENANCE:</span>
                <span className="text-slate-200 font-bold">{analysis.sourceTitle}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <span className="text-slate-400 block text-[10px]">ANALYSIS TIMESTAMP:</span>
                <span className="text-slate-200 font-bold">{new Date(analysis.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dual-Lens Analytical Framework */}
        {activeTab === 'dualLens' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in font-mono text-xs">
            {/* Lens A */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold border-b border-white/10 pb-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>LENS A: Classical Aerospace Baseline</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {analysis.dualLens?.classicalDeconfliction || 'Screened against FAA Class B traffic, 1.2 Hz anti-collision strobes, and aerodynamic lift mechanics.'}
              </p>
            </div>

            {/* Lens B */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-teal-300 font-bold border-b border-white/10 pb-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>LENS B: Metric Manipulation & Physics</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {analysis.dualLens?.metricSignature || 'Evaluates boundary-layer fluid decoupling, positive lift without aerodynamic surfaces, and zero acoustic shockwaves.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Five Observables Matrix */}
        {activeTab === 'observables' && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 animate-fade-in">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
              ODNI / AARO Five Observables Evaluation:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                analysis.fiveObservables?.instantaneousAcceleration 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-white/10 text-slate-500'
              }`}>
                <span>1. Instantaneous Acceleration</span>
                <span className="font-bold">{analysis.fiveObservables?.instantaneousAcceleration ? 'DETECTED' : 'NEGATIVE'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                analysis.fiveObservables?.hypersonicVelocity 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-white/10 text-slate-500'
              }`}>
                <span>2. Hypersonic Velocity (No Heat)</span>
                <span className="font-bold">{analysis.fiveObservables?.hypersonicVelocity ? 'DETECTED' : 'NEGATIVE'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                analysis.fiveObservables?.lowObservability 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-white/10 text-slate-500'
              }`}>
                <span>3. Low Observability / Cloaking</span>
                <span className="font-bold">{analysis.fiveObservables?.lowObservability ? 'DETECTED' : 'NEGATIVE'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                analysis.fiveObservables?.transmediumTravel 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-white/10 text-slate-500'
              }`}>
                <span>4. Transmedium Travel</span>
                <span className="font-bold">{analysis.fiveObservables?.transmediumTravel ? 'DETECTED' : 'NEGATIVE'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between sm:col-span-2 ${
                analysis.fiveObservables?.positiveLift 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-white/10 text-slate-500'
              }`}>
                <span>5. Positive Lift Without Wings / Rotors</span>
                <span className="font-bold">{analysis.fiveObservables?.positiveLift ? 'DETECTED' : 'NEGATIVE'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Kinematics & Corroborations */}
        {activeTab === 'kinematics' && (
          <div className="space-y-4 animate-fade-in font-mono text-xs">
            {analysis.kinematics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">ESTIMATED SPEED:</span>
                  <span className="text-cyan-400 font-bold">{analysis.kinematics.estimatedSpeed || 'Hover to Mach 2+'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">ESTIMATED ALTITUDE:</span>
                  <span className="text-cyan-400 font-bold">{analysis.kinematics.estimatedAltitude || '14,000 ft MSL'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">KINEMATIC G-FORCE:</span>
                  <span className="text-cyan-400 font-bold">{analysis.kinematics.kinematicGForce || 'Non-inertial'}</span>
                </div>
              </div>
            )}

            {/* Database Corroboration Citations */}
            {analysis.databaseCorrelations && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-300 block uppercase">
                  Multi-Database Corroborations:
                </span>
                <div className="space-y-2 text-[11px] text-slate-300">
                  {analysis.databaseCorrelations.warDeptDoD && (
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold shrink-0">US Dept of War / AARO:</span>
                      <span>{analysis.databaseCorrelations.warDeptDoD.caseMatch} ({analysis.databaseCorrelations.warDeptDoD.correlationScore}% match)</span>
                    </div>
                  )}
                  {analysis.databaseCorrelations.mufon && (
                    <div className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold shrink-0">MUFON CMS:</span>
                      <span>{analysis.databaseCorrelations.mufon.caseMatch} ({analysis.databaseCorrelations.mufon.correlationScore}% match)</span>
                    </div>
                  )}
                  {analysis.databaseCorrelations.skywatcher && (
                    <div className="flex items-start space-x-2">
                      <span className="text-teal-400 font-bold shrink-0">Skywatcher AI:</span>
                      <span>{analysis.databaseCorrelations.skywatcher.caseMatch}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Publish to Community Sighting Feed CTA */}
      {onPublishToFeed && (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/10">
          <div className="text-xs text-slate-400 font-mono">
            <span>Ready to submit this forensic analysis to the civilian airspace incident ledger?</span>
          </div>
          <button
            onClick={onPublishToFeed}
            disabled={isPublished}
            className={`px-5 py-2.5 rounded-2xl font-bold font-mono text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${
              isPublished
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isPublished ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Submitted to Community Ledger</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Submit to Verified Sightings Feed</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
