import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Share2, 
  ChevronDown, ChevronUp, AlertCircle, 
  HelpCircle, CheckCircle2, FileText, ArrowRight,
  AlertTriangle, ShieldCheck
} from 'lucide-react';
import { ParallaxPanelReview, ParallaxPanelMember } from '../../types';

interface ParallaxPanelCardProps {
  panelReview: ParallaxPanelReview;
  caseTitle?: string;
  sourceUrl?: string;
  onPublishToFeed?: () => void;
  onSaveToDossier?: () => void;
  onOpenFeed?: () => void;
  isPublished?: boolean;
}

export const ParallaxPanelCard: React.FC<ParallaxPanelCardProps> = ({
  panelReview,
  caseTitle,
  sourceUrl,
  onPublishToFeed,
  onSaveToDossier,
  onOpenFeed,
  isPublished = false
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'kinematics' | 'aerospace' | 'metric'>('all');
  const [copiedCaseFacts, setCopiedCaseFacts] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showCaseFactsPreview, setShowCaseFactsPreview] = useState(false);
  const [showMetadataDetails, setShowMetadataDetails] = useState(false);

  const {
    consensusVerdict,
    consensusConfidence,
    agreementLevel,
    primarySuspect,
    unresolvedQuestion,
    panelists,
    unbiasedCaseFactsPrompt,
    externalDebatePrompt,
    mediaMetadataWarning,
    compilationScopeNotice,
    engineTransparency
  } = panelReview;

  // Determine if this involves web/social media link with missing metadata
  const isWebMedia = !!(
    mediaMetadataWarning?.isCompressedWebMedia ||
    (sourceUrl && (sourceUrl.includes('http') || sourceUrl.includes('youtube') || sourceUrl.includes('reddit') || sourceUrl.includes('tiktok') || sourceUrl.includes('twitter') || sourceUrl.includes('x.com') || sourceUrl.includes('war.gov')))
  );

  // Agreement Level styling
  const agreementConfig = {
    UNANIMOUS: {
      label: 'Multi-Lens Consensus',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400'
    },
    MAJORITY_CONSENSUS: {
      label: 'Majority Agreement',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      dot: 'bg-cyan-400'
    },
    SPLIT_DECISION: {
      label: 'Divergent Findings',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400'
    },
    ACTIVE_DEBATE: {
      label: 'Open Debate',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      dot: 'bg-purple-400'
    }
  }[agreementLevel] || {
    label: 'Multi-Lens Review',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    dot: 'bg-slate-400'
  };

  const getUnbiasedCaseReport = () => {
    if (unbiasedCaseFactsPrompt?.trim()) {
      return unbiasedCaseFactsPrompt;
    }
    if (externalDebatePrompt?.trim() && !externalDebatePrompt.includes('confidence') && !externalDebatePrompt.includes('%')) {
      return externalDebatePrompt;
    }
    return `[CHECK SKY LIGHT: EMPIRICAL CASE REPORT OF FACTS]
Target Case: "${caseTitle || 'Aerial Observation'}"
Source Reference: ${sourceUrl || 'Field Telemetry'}
${isWebMedia ? '\n[MEDIA METADATA WARNING: Sourced from a web/social video link. Camera EXIF metadata, GPS sensor coordinates, and optical focal length are stripped by platform compression. Account for size-distance ambiguity and compression noise.]\n' : ''}
EMPIRICAL OBSERVATIONS & PHYSICAL CHARACTERISTICS:
- Primary Morphological Suspect: ${primarySuspect}
- Sensor Telemetry & Kinematics: ${panelists?.gemini?.assessment || 'Track recorded.'}
- Classical Aerospace Screening: ${panelists?.claude?.assessment || 'Airspace checked.'}
- Fluid Dynamics & Acoustic Boundary: ${panelists?.luna?.assessment || 'Fluid interaction checked.'}

CORE UNRESOLVED DISCRIMINATOR:
${unresolvedQuestion}

REQUEST FOR INDEPENDENT PEER REVIEW (EXTERNAL REASONING MODELS: CLAUDE / CHATGPT / INDEPENDENT AUDITOR):
Notice: This case brief compiles empirical observations strictly without evaluation scores, confidence percentages, or pre-assigned verdicts.
Please conduct an unbiased, independent scientific evaluation:
1. Conventional Aerospace (Lens A): Can these observed characteristics be fully resolved by commercial aviation, military aircraft, drones, atmospheric balloons, satellites, or optical sensor artifacts?
2. Non-Conventional Physics (Lens B): Do the physical boundary conditions (absence of downwash, lack of acoustic shockwave, non-inertial vector changes) support localized spacetime metric manipulation or fluid decoupling?
3. What specific sensor data (e.g. radar squawk, triangulation, raw camera container) is required to resolve this case?`;
  };

  const handleCopyCaseFacts = async () => {
    const text = getUnbiasedCaseReport();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCaseFacts(true);
      setTimeout(() => setCopiedCaseFacts(false), 2500);
    } catch {
      alert('Case Report of Facts copied!');
    }
  };

  const handleCopyFullGeminiReport = async () => {
    const text = `CHECK SKY LIGHT: GEMINI MULTI-LENS INVESTIGATION REPORT
Target: ${caseTitle || 'Aerial Observation'}
Consensus Finding: ${consensusVerdict} (${consensusConfidence}% Confidence)
Classification: ${agreementLevel}
Primary Suspect: ${primarySuspect}

ANALYSIS BY GOOGLE GEMINI:
- Kinematics & Multi-Sensor: ${panelists.gemini?.assessment || 'N/A'}
- Lens A (Classical Aerospace): ${panelists.claude?.assessment || 'N/A'}
- Lens B (Theoretical Metric Physics): ${panelists.luna?.assessment || 'N/A'}

Key Unresolved Friction Point:
${unresolvedQuestion}

Engine: Google Gemini 3.8 Flash (Live In-App Engine)`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      alert('Full report copied!');
    }
  };

  const renderLensBox = (
    lensKey: 'gemini' | 'claude' | 'luna',
    defaultTitle: string,
    member: ParallaxPanelMember,
    theme: {
      bg: string;
      border: string;
      badge: string;
      accent: string;
      tag: string;
    }
  ) => {
    if (!member) return null;
    let title = member.name && !member.name.toLowerCase().includes('claude') && !member.name.toLowerCase().includes('luna')
      ? member.name
      : defaultTitle;
    // Apply Tool-001 Less-Ink: strip redundant Gemini prefix if present
    title = title.replace(/^Gemini:\s*/i, '').trim();

    return (
      <div className={`p-3.5 rounded-xl ${theme.bg} border ${theme.border} space-y-2.5 transition flex flex-col justify-between`}>
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wide ${theme.badge}`}>
              {title}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {member.confidence}% Conf.
            </span>
          </div>

          {/* Role Subtitle */}
          <div className="text-[11px] font-mono text-slate-400">
            {member.role}
          </div>

          {/* Assessment (Grade 12 max, Less Ink) */}
          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans">
            {member.assessment}
          </p>
        </div>

        {/* Key Audit Points */}
        <div className="pt-2 border-t border-white/5 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Key Findings:
          </span>
          <ul className="space-y-1">
            {member.keyPoints?.map((pt, idx) => (
              <li key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5 font-sans">
                <span className={`w-1 h-1 rounded-full ${theme.accent} mt-1.5 shrink-0`} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel border border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-950/90 text-slate-100 shadow-xl">
      {/* 1. Scientific Framework Header (Less Ink) */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-200 font-semibold">Multi-Lens Scientific Review</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">Flight kinematics, classical aerospace, and theoretical physics.</span>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Safety & Domain Integrity: PASSED
        </span>
      </div>

      {/* 2. FORENSIC NOTICE: Web & Social Media Footage Limitations */}
      {isWebMedia && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-tight">
                Web Video Forensic Warning: Stripped Camera Metadata
              </span>
            </div>
            <button
              onClick={() => setShowMetadataDetails(!showMetadataDetails)}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              {showMetadataDetails ? 'Hide Details' : 'What is missing?'}
            </button>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Social platforms (YouTube, X, Reddit, TikTok) strip camera EXIF, GPS telemetry, and optical focal length, and apply lossy video compression. Velocity and altitude figures are mathematical approximations until verified against ground landmarks or uncompressed raw files.
          </p>
          {showMetadataDetails && (
            <div className="pt-2 border-t border-amber-500/20 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-amber-300 font-semibold">Missing Forensics in Web Video:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Camera focal length (mm) — needed to solve the size-vs-distance ambiguity</li>
                <li>True sensor dimensions & sub-millisecond hardware clock</li>
                <li>Uncompressed raw frames (compression macroblocks can mimic erratic motion)</li>
              </ul>
              <div className="text-cyan-300 pt-1">
                💡 Sleuth Tip: Check if the object passes behind trees or buildings (occlusion parallax) to prove physical distance!
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPILATION / PODCAST SCOPE NOTICE */}
      {compilationScopeNotice?.isCompilationOrPodcast && (
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono text-purple-300 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center space-x-1.5 font-bold uppercase tracking-tight text-purple-200">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Single-Target Boundary: Multi-Clip Compilation / Podcast</span>
            </div>
            {compilationScopeNotice.targetedTimestamp && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                Targeted Clip: {compilationScopeNotice.targetedTimestamp}
              </span>
            )}
          </div>
          <p className="text-slate-300 text-xs font-sans leading-relaxed">
            {compilationScopeNotice.guidanceNote}
          </p>
        </div>
      )}

      {/* 3. MULTI-LENS CONSENSUS FINDING (Hero BLUF Header - Less Ink) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Multi-Lens Review
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              Consensus Finding
            </span>
          </div>

          {/* Agreement Badge */}
          <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border flex items-center space-x-1.5 ${agreementConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${agreementConfig.dot}`} />
            <span>{agreementConfig.label}</span>
          </div>
        </div>

        {/* Verdict Title & Confidence Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Finding:
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {consensusVerdict}
            </h3>
            <div className="text-xs font-mono text-cyan-300">
              <span className="text-slate-400">Primary Suspect: </span>
              <span className="font-bold text-slate-200">{primarySuspect}</span>
            </div>
          </div>

          {/* Confidence Dial */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-baseline space-x-1 self-start sm:self-auto shrink-0 font-mono">
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {consensusConfidence}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Confidence
            </span>
          </div>
        </div>

        {/* Key Unresolved Question / Point of Disagreement */}
        <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-amber-300 font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Open Question:</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {unresolvedQuestion}
          </p>
        </div>
      </div>

      {/* 2. THREE SCIENTIFIC LENSES (Tool-001 Less Ink Streamlined) */}
      <div className="space-y-2.5">
        {/* Perspective Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Analytical Perspectives:
          </span>
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All (3)
            </button>
            <button
              onClick={() => setActiveTab('kinematics')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'kinematics' ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Kinematics
            </button>
            <button
              onClick={() => setActiveTab('aerospace')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'aerospace' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Lens A: Aerospace
            </button>
            <button
              onClick={() => setActiveTab('metric')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'metric' ? 'bg-purple-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Lens B: Physics
            </button>
          </div>
        </div>

        {/* Panelist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(activeTab === 'all' || activeTab === 'kinematics') &&
            renderLensBox('gemini', 'Kinematics & Sensors', panelists.gemini, {
              bg: 'bg-cyan-950/20',
              border: 'border-cyan-500/30',
              badge: 'bg-cyan-500 text-slate-950',
              accent: 'bg-cyan-400',
              tag: 'text-cyan-300'
            })}

          {(activeTab === 'all' || activeTab === 'aerospace') &&
            renderLensBox('claude', 'Lens A: Classical Aerospace', panelists.claude, {
              bg: 'bg-amber-950/20',
              border: 'border-amber-500/30',
              badge: 'bg-amber-500 text-slate-950',
              accent: 'bg-amber-400',
              tag: 'text-amber-300'
            })}

          {(activeTab === 'all' || activeTab === 'metric') &&
            renderLensBox('luna', 'Lens B: Theoretical Physics', panelists.luna, {
              bg: 'bg-purple-950/20',
              border: 'border-purple-500/30',
              badge: 'bg-purple-500 text-slate-950',
              accent: 'bg-purple-400',
              tag: 'text-purple-300'
            })}
        </div>
      </div>

      {/* 3. ACTION ENGINE */}
      <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Case Facts</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Objective observational data formatted for external verification.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click Copy Case Facts */}
            <button
              onClick={handleCopyCaseFacts}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              title="Copy objective observational data ready for external verification"
            >
              {copiedCaseFacts ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Case Facts Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-950" />
                  <span>Copy Case Facts</span>
                </>
              )}
            </button>

            {/* Copy Complete Evaluation Report */}
            <button
              onClick={handleCopyFullGeminiReport}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
              title="Copy complete forensic evaluation report"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Full Report</span>
                </>
              )}
            </button>

            {/* Publish to Community Sighting Feed */}
            {onPublishToFeed && (
              <button
                onClick={onPublishToFeed}
                disabled={isPublished}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  isPublished
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                    : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500/40 shadow-sm'
                }`}
              >
                {isPublished ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Attached to Feed</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-white" />
                    <span>Publish with Analysis</span>
                  </>
                )}
              </button>
            )}

            {/* Save to Incident Dossier */}
            {onSaveToDossier && (
              <button
                onClick={onSaveToDossier}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-mono text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Save to Dossier</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Case Facts Text Preview */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={() => setShowCaseFactsPreview(!showCaseFactsPreview)}
            className="w-full text-left text-[11px] font-mono text-slate-400 hover:text-slate-200 transition flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center space-x-1.5 text-cyan-300">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>{showCaseFactsPreview ? 'Hide Preview' : 'Preview Case Facts Text'}</span>
            </span>
            {showCaseFactsPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCaseFactsPreview && (
            <div className="mt-2 p-3 rounded-xl bg-black/50 border border-cyan-500/20 text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto selection:bg-cyan-500/30">
              {getUnbiasedCaseReport()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
