import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, 
  Share2, HardDrive, FileText, Check, GraduationCap, 
  Telescope, ChevronDown, ChevronUp, Cpu, Activity,
  MapPin, Landmark, Award, Shield, UserCheck, Info
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
  // Default to compact summary; deep technical details collapsed to avoid overwhelming users
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showAcademyDetails, setShowAcademyDetails] = useState(false);

  const isAuthentic = analysis.verdict === 'AUTHENTIC_INCIDENT';
  const isSynthetic = analysis.verdict === 'SYNTHETIC_FAKE';
  const isConventional = analysis.verdict === 'CONVENTIONAL_AIRCRAFT';

  const dtcCode = analysis.dtcCode || (isAuthentic ? 'P1947' : isSynthetic ? 'P0420' : isConventional ? 'P0505' : 'P0100');

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

  // Verdict Accent Colors
  const verdictTheme = isAuthentic
    ? {
        border: 'border-purple-500/40',
        bg: 'bg-purple-950/20',
        badge: 'bg-purple-500 text-slate-950',
        text: 'text-purple-300',
        icon: <Sparkles className="w-5 h-5 text-purple-400" />
      }
    : isConventional
    ? {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/25',
        badge: 'bg-emerald-500 text-slate-950',
        text: 'text-emerald-300',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
      }
    : isSynthetic
    ? {
        border: 'border-rose-500/40',
        bg: 'bg-rose-950/20',
        badge: 'bg-rose-500 text-white',
        text: 'text-rose-300',
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />
      }
    : {
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-950/20',
        badge: 'bg-cyan-500 text-slate-950',
        text: 'text-cyan-300',
        icon: <Activity className="w-5 h-5 text-cyan-400" />
      };

  return (
    <div className={`glass-panel border ${verdictTheme.border} rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-950/90 text-slate-100 shadow-xl`}>
      {/* 1. HERO VERDICT: Bottom Line Up Front (BLUF) - Clean, Zero Overwhelm */}
      <div className={`p-4 rounded-xl ${verdictTheme.bg} border ${verdictTheme.border} space-y-3`}>
        {/* Top Badges & Anomaly Score Callout */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {verdictTheme.icon}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black uppercase tracking-tight ${verdictTheme.badge}`}>
              {isConventional ? 'DECONFLICTED: CONVENTIONAL OBJECT' : isAuthentic ? 'POTENTIAL ANOMALY CANDIDATE' : isSynthetic ? 'SYNTHETIC / CGI MEDIA' : 'UNRESOLVED TARGET'}
            </span>
            {analysis.sourceMetadata?.positiveControlVerified && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-amber-400" />
                <span>PURSUE / DOW POSITIVE CONTROL</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <span className="text-slate-400">DTC {dtcCode}</span>
          </div>
        </div>

        {/* Hero Title & Intuitive Score Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {analysis.verdictTitle}
            </h3>

            {/* Source Provenance & Incident Location */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono">
              {analysis.incidentLocation && (
                <div className="flex items-center space-x-1 text-cyan-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Sector:</span>
                  <span className="font-bold text-slate-200">{analysis.incidentLocation}</span>
                </div>
              )}
              {analysis.sourceMetadata?.classificationTier && (
                <div className="flex items-center space-x-1 text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-400">Vetting:</span>
                  <span className="font-bold text-amber-200">{analysis.sourceMetadata.classificationTier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prominent Intuitive Anomaly Score Dial */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-baseline space-x-1.5 self-start sm:self-auto shrink-0 shadow-inner">
            <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter ${
              analysis.authenticityScore >= 70 ? 'text-purple-400' : analysis.authenticityScore >= 40 ? 'text-cyan-400' : 'text-slate-400'
            }`}>
              {analysis.authenticityScore}%
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Anomaly Index
            </span>
          </div>
        </div>

        {/* 1-2 sentence plain-language digest */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {analysis.verdictSummary}
        </p>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <button
              onClick={handleShareReport}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-cyan-400" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            {onSaveToVault && (
              <button
                onClick={onSaveToVault}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
              >
                <HardDrive className="w-3 h-3 text-amber-400" />
                <span>Save</span>
              </button>
            )}
          </div>

          {onPublishToFeed && (
            <button
              onClick={onPublishToFeed}
              disabled={isPublished}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                isPublished
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-sm'
              }`}
            >
              {isPublished ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report Saved</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Post to Feed</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. THREE-METRIC SCORECARD AT A GLANCE (Less-Ink) */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Confidence</span>
          <span className="text-base sm:text-lg font-black text-cyan-400 block mt-0.5">
            {analysis.confidenceScore || 95}%
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">CGI / Hoax Risk</span>
          <span className={`text-base sm:text-lg font-black block mt-0.5 ${
            analysis.fakeProbability > 50 ? 'text-rose-400' : 'text-slate-300'
          }`}>
            {analysis.fakeProbability}%
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Airframe Check</span>
          <span className={`text-xs sm:text-sm font-bold block mt-1 truncate ${
            isConventional ? 'text-emerald-400' : 'text-slate-300'
          }`}>
            {isConventional ? 'Class B / UAS' : isAuthentic ? 'Unidentified' : 'Conventional'}
          </span>
        </div>
      </div>

      {/* 3. FIVE OBSERVABLES CHECKLIST (Compact visual badges) */}
      {analysis.fiveObservables && (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
            Five Observables Screening:
          </span>
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            <span className={`px-2 py-0.5 rounded-md border ${
              analysis.fiveObservables.instantaneousAcceleration 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' 
                : 'bg-black/30 text-slate-500 border-white/5'
            }`}>
              ⚡ Instant Acceleration: {analysis.fiveObservables.instantaneousAcceleration ? 'YES' : 'NO'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${
              analysis.fiveObservables.hypersonicVelocity 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' 
                : 'bg-black/30 text-slate-500 border-white/5'
            }`}>
              🚀 Hypersonic: {analysis.fiveObservables.hypersonicVelocity ? 'YES' : 'NO'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${
              analysis.fiveObservables.lowObservability 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' 
                : 'bg-black/30 text-slate-500 border-white/5'
            }`}>
              👁️ Low Observable: {analysis.fiveObservables.lowObservability ? 'YES' : 'NO'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${
              analysis.fiveObservables.transmediumTravel 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' 
                : 'bg-black/30 text-slate-500 border-white/5'
            }`}>
              🌊 Transmedium: {analysis.fiveObservables.transmediumTravel ? 'YES' : 'NO'}
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${
              analysis.fiveObservables.positiveLift 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' 
                : 'bg-black/30 text-slate-500 border-white/5'
            }`}>
              🕊️ Positive Lift: {analysis.fiveObservables.positiveLift ? 'DETECTED' : 'CONVENTIONAL'}
            </span>
          </div>
        </div>
      )}

      {/* 4. WITNESS CREDIBILITY & ON-THE-RECORD ASSESSMENT */}
      {analysis.witnessCredibility && (
        <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[11px]">
            <div className="flex items-center space-x-1.5 text-teal-300 font-bold">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>WITNESS CREDIBILITY & TESTIMONIAL INTEGRITY</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                {analysis.witnessCredibility.credibilityScore}% Reliability
              </span>
              {analysis.witnessCredibility.onTheRecord && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ON THE RECORD
                </span>
              )}
            </div>
          </div>

          {analysis.witnessCredibility.witnessName && (
            <div className="text-xs font-mono text-slate-300">
              <span className="text-slate-400">Identified Witness: </span>
              <span className="text-white font-bold">{analysis.witnessCredibility.witnessName}</span>
            </div>
          )}

          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {analysis.witnessCredibility.credibilityAssessment}
          </p>

          {analysis.witnessCredibility.corroboratingFactors && analysis.witnessCredibility.corroboratingFactors.length > 0 && (
            <div className="pt-1 border-t border-teal-500/20 flex flex-wrap gap-1 font-mono text-[10px]">
              {analysis.witnessCredibility.corroboratingFactors.map((factor, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-teal-950/60 text-teal-200 border border-teal-800/60">
                  ✓ {factor}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Terrestrial Observation Notes (If applicable) */}
      {(analysis.humorousQuirk || analysis.mundaneObjectDetected) && (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex items-start space-x-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="font-sans leading-relaxed">
            {analysis.humorousQuirk || 'Terrestrial object verified. Standard Newtonian dynamics confirmed.'}
          </span>
        </div>
      )}

      {/* 5. Avionics Lesson (Compact with Expandable Details) */}
      {analysis.educationalAeroAstronomyLesson && (
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-sans space-y-1">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{analysis.educationalAeroAstronomyLesson.topic}</span>
            </span>
            <button
              onClick={() => setShowAcademyDetails(!showAcademyDetails)}
              className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{showAcademyDetails ? 'Hide' : 'Tip'}</span>
              {showAcademyDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-slate-300 text-xs">
            {analysis.educationalAeroAstronomyLesson.concept}
          </p>
          {showAcademyDetails && analysis.educationalAeroAstronomyLesson.observerTip && (
            <div className="mt-2 pt-2 border-t border-cyan-500/20 text-cyan-200 font-mono text-[11px] flex items-center gap-1.5">
              <Telescope className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{analysis.educationalAeroAstronomyLesson.observerTip}</span>
            </div>
          )}
        </div>
      )}

      {/* 6. PROGRESSIVE DISCLOSURE: Deep Telemetry Drawer for Engineers & Observers */}
      <div className="border-t border-white/10 pt-2">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full py-1.5 text-center text-xs font-mono text-slate-400 hover:text-slate-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <span>{showTechnicalDetails ? 'Collapse Deep Telemetry' : 'Expand Deep Forensics & Lens A/B Telemetry'}</span>
          {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 space-y-3 font-mono text-xs animate-fade-in">
            {/* Dual-Lens Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                  Lens A: Classical Baseline
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  {analysis.dualLens?.classicalDeconfliction || 'Screened against FAA traffic & aerodynamics.'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                <span className="text-[10px] text-purple-400 font-bold block uppercase">
                  Lens B: Metric Signature
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  {analysis.dualLens?.metricSignature || 'Fluid boundary-layer decoupling analyzed.'}
                </p>
              </div>
            </div>

            {/* Kinematics row if available */}
            {analysis.kinematics && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] p-2.5 rounded-xl bg-slate-900 border border-white/10">
                <div>
                  <span className="text-[9px] text-slate-400 block">EST. SPEED</span>
                  <span className="font-bold text-cyan-400">{analysis.kinematics.estimatedSpeed || 'Hover'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">ALTITUDE</span>
                  <span className="font-bold text-cyan-400">{analysis.kinematics.estimatedAltitude || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">G-FORCE</span>
                  <span className="font-bold text-cyan-400">{analysis.kinematics.kinematicGForce || '1.0 G'}</span>
                </div>
              </div>
            )}

            {/* Detected features */}
            {analysis.detectedFeatures && analysis.detectedFeatures.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.detectedFeatures.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
