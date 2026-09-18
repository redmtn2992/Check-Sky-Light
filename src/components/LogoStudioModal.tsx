import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  Sliders,
  Radio,
  FileCode,
  Layers,
  HelpCircle,
  Eye,
  RotateCw,
  Award,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Compass
} from 'lucide-react';
import { LogoConfig, LogoVariantId, LogoColorTheme, DtcFaultCode } from '../types';
import { LOGO_VARIANTS, DTC_FAULT_CODES, COLOR_THEMES, DEFAULT_LOGO_CONFIG } from '../data/logoPresets';
import { CheckEngineLogo } from './CheckEngineLogo';
import conceptOneImg from '../assets/images/concept_one_obd_1789670680785.jpg';
import conceptFourImg from '../assets/images/concept_four_gauge_1789670692167.jpg';
import conceptFiveImg from '../assets/images/concept_five_bubble_1789670701994.jpg';

interface LogoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: LogoConfig;
  onSaveConfig?: (config: LogoConfig) => void;
}

const DEFAULT_CONFIG: LogoConfig = DEFAULT_LOGO_CONFIG;

export const LogoStudioModal: React.FC<LogoStudioModalProps> = ({
  isOpen,
  onClose,
  currentConfig = DEFAULT_CONFIG,
  onSaveConfig = () => {},
}) => {
  const [selectedVariant, setSelectedVariant] = useState<LogoVariantId>(currentConfig.variantId);
  const [selectedColor, setSelectedColor] = useState<LogoColorTheme>(currentConfig.colorTheme);
  const [animationMode, setAnimationMode] = useState<'solid' | 'pulse' | 'strobe' | 'beam_scan'>(
    currentConfig.animationMode
  );
  const [showCowLift, setShowCowLift] = useState<boolean>(currentConfig.showCowLift);
  const [showFaultCodeBadge, setShowFaultCodeBadge] = useState<boolean>(currentConfig.showFaultCodeBadge);
  const [glowIntensity, setGlowIntensity] = useState<'subtle' | 'high' | 'off'>(
    currentConfig.glowIntensity
  );
  const [activeDtcCode, setActiveDtcCode] = useState<string>(currentConfig.customFaultCode || 'P1947');
  const [activeTab, setActiveTab] = useState<'candidates' | 'showcase' | 'scanner' | 'export'>('candidates');
  const [previewSize, setPreviewSize] = useState<'squircle' | 'compact' | 'homescreen'>('squircle');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [clearingCodes, setClearingCodes] = useState<boolean>(false);
  const [codesCleared, setCodesCleared] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentThemeObj = COLOR_THEMES.find((t) => t.id === selectedColor) || COLOR_THEMES[0];
  const activeVariantMeta = LOGO_VARIANTS.find((v) => v.id === selectedVariant) || LOGO_VARIANTS[0];

  const handleApplyToApp = () => {
    const newConfig: LogoConfig = {
      variantId: selectedVariant,
      colorTheme: selectedColor,
      animationMode,
      showCowLift,
      showFaultCodeBadge,
      glowIntensity,
      customFaultCode: activeDtcCode,
    };
    onSaveConfig(newConfig);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
    }, 2500);
  };

  const handleCopySvgCode = () => {
    const svgString = `<!-- Check Sky / Check Engine Humorous Logo (${selectedVariant} - ${selectedColor}) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <rect width="100" height="100" rx="16" fill="#030712"/>
  <path d="M 22,32 L 32,32 L 32,24 L 38,24 L 38,18 L 62,18 L 62,24 L 68,24 L 68,32 L 80,32 L 80,42 L 86,42 L 86,52 L 80,52 L 80,62 L 64,62 L 64,66 L 36,66 L 36,62 L 22,62 Z" fill="${currentThemeObj.hex}" stroke="${currentThemeObj.accentHex}" stroke-width="2.5"/>
  <ellipse cx="50" cy="18" rx="18" ry="7" fill="#0F172A" stroke="${currentThemeObj.accentHex}" stroke-width="2.5"/>
  <ellipse cx="50" cy="14" rx="10" ry="5.5" fill="${currentThemeObj.accentHex}" fill-opacity="0.4" stroke="#FFFFFF" stroke-width="1.5"/>
  <polygon points="38,62 62,62 82,96 18,96" fill="${currentThemeObj.hex}" fill-opacity="0.3"/>
  <text x="50" y="94" fill="${currentThemeObj.accentHex}" font-size="6" font-weight="bold" font-family="monospace" text-anchor="middle">CHECK SKY SOON [DTC ${activeDtcCode}]</text>
</svg>`;
    navigator.clipboard.writeText(svgString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSvg = () => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" rx="20" fill="#030712"/>
  <path d="M 22,32 L 32,32 L 32,24 L 38,24 L 38,18 L 62,18 L 62,24 L 68,24 L 68,32 L 80,32 L 80,42 L 86,42 L 86,52 L 80,52 L 80,62 L 64,62 L 64,66 L 36,66 L 36,62 L 22,62 Z" fill="${currentThemeObj.hex}" stroke="${currentThemeObj.accentHex}" stroke-width="2.5"/>
  <ellipse cx="50" cy="18" rx="18" ry="7" fill="#0F172A" stroke="${currentThemeObj.accentHex}" stroke-width="2.5"/>
  <ellipse cx="50" cy="14" rx="10" ry="5.5" fill="${currentThemeObj.accentHex}" fill-opacity="0.4" stroke="#FFFFFF" stroke-width="1.5"/>
  <polygon points="38,62 62,62 82,96 18,96" fill="${currentThemeObj.hex}" fill-opacity="0.35"/>
  <text x="50" y="93" fill="${currentThemeObj.accentHex}" font-size="6.5" font-weight="900" font-family="sans-serif" text-anchor="middle">CHECK SKY</text>
</svg>`;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `check_sky_logo_${selectedVariant}_${selectedColor}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearFaultCodes = () => {
    setClearingCodes(true);
    setTimeout(() => {
      setClearingCodes(false);
      setCodesCleared(true);
      setTimeout(() => setCodesCleared(false), 3500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-5xl shadow-2xl shadow-amber-950/40 overflow-hidden flex flex-col max-h-[94vh] my-auto">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/50 text-amber-400 shadow-inner shadow-amber-500/20">
              <CheckEngineLogo
                variantId={selectedVariant}
                colorTheme={selectedColor}
                animationMode="pulse"
                size="sm"
                showCowLift={showCowLift}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wide">
                  CHECK SKY LOGO STUDIO
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  HUMOR & BRANDING
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Humorous take on the iconic automotive Check Engine dash light symbol for UAP / Sky Radar
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApplyToApp}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>APPLIED TO APP!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>SET AS ACTIVE LOGO</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-1 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 text-xs font-mono shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`py-3 px-3.5 border-b-2 font-bold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'candidates'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>App Icon Candidates (Concepts 1, 4 & 5)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              3 CONCEPTS
            </span>
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            className={`py-3 px-3.5 border-b-2 font-bold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'showcase'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Vector Customizer ({LOGO_VARIANTS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-3 px-3.5 border-b-2 font-bold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'scanner'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>OBD-II Sky Fault Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3.5 border-b-2 font-bold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Vector SVG & Export</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              {/* Header Context Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/40 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                        APP ICON COMPARISON
                      </span>
                      <span className="text-xs font-mono text-amber-300">
                        CONCEPTS 1, 4 & 5 // 100% ORIGINAL ASSETS
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                      Compare App Icon Directions
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                      Evaluate how each concept translates the <strong>"Check Engine Light"</strong> unignorable diagnostic metaphor into a high-impact mobile app icon. Rendered at 1:1 squircle format with aerospace and automotive finish.
                    </p>
                  </div>

                  {/* Display View Toggle */}
                  <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shrink-0 self-stretch md:self-auto justify-center">
                    <button
                      onClick={() => setPreviewSize('squircle')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        previewSize === 'squircle'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1:1 Squircle
                    </button>
                    <button
                      onClick={() => setPreviewSize('homescreen')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        previewSize === 'homescreen'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Phone Springboard
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Candidate Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CANDIDATE 1: OBD-II SKY DIAGNOSTIC MIL */}
                <div className="rounded-3xl bg-slate-950 border-2 border-amber-400 overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-amber-300 transition-all duration-300 relative">
                  <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 font-bold flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span>CONCEPT 1</span>
                      <span className="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-black border border-emerald-500/40">
                        ACTIVE APP ICON
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                      DTC P1947
                    </span>
                  </div>

                  {/* Icon Visual Stage */}
                  <div className="p-6 flex flex-col items-center justify-center bg-radial from-amber-950/25 via-slate-950 to-slate-950 min-h-[300px]">
                    {previewSize === 'squircle' ? (
                      <div className="relative group/img rounded-[28px] overflow-hidden border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] max-w-[240px] w-full aspect-square bg-slate-900">
                        <img
                          src={conceptOneImg}
                          alt="Concept 1: OBD-II Sky Diagnostic MIL"
                          className="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      /* Home Screen Mockup */
                      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center space-y-2 w-full max-w-[200px]">
                        <div className="relative rounded-2xl overflow-hidden border border-amber-500/50 shadow-lg w-16 h-16 bg-slate-950">
                          <img
                            src={conceptOneImg}
                            alt="Concept 1 Mini"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-200 tracking-wide">
                          Check Sky
                        </span>
                        <div className="w-12 h-1 bg-slate-700/50 rounded-full mt-2"></div>
                      </div>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 mt-4 text-center">
                      The "OBD-II Sky Diagnostic MIL"
                    </span>
                  </div>

                  {/* Design & Philosophy Details */}
                  <div className="p-5 bg-slate-900/40 border-t border-slate-800 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h4 className="text-base font-bold text-slate-100 flex items-center justify-between">
                        <span>Pure Automotive Metaphor</span>
                        <span className="text-xs font-mono text-amber-400 font-normal">MIL Class</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Features an amber engine block silhouette fused with an atmospheric radar disc. An illuminated OBD-II diagnostic connector streams sensor leads into a scanning reticle reading fault code <strong>P1947 (Anomalous Lift)</strong>.
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Aesthetic:</span>
                          <span className="font-mono text-amber-300">Instrument Cluster / OBD-II</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Primary Color:</span>
                          <span className="font-mono text-amber-400 font-bold">590nm Amber (#F59E0B)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Driver Psychology:</span>
                          <span className="text-slate-200">"Must triage; cannot ignore"</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Maximum literal clarity</span>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedVariant('piston_saucer');
                          setSelectedColor('amber');
                          setActiveDtcCode('P1947');
                          setActiveTab('showcase');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold transition cursor-pointer"
                      >
                        Inspect Vector
                      </button>
                    </div>
                  </div>
                </div>

                {/* CANDIDATE 4: AVIONICS CLUSTER & 5 OBSERVABLES GAUGE */}
                <div className="rounded-3xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-cyan-500/60 transition-all duration-300">
                  <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>CONCEPT 4</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                      DTC P0505
                    </span>
                  </div>

                  {/* Icon Visual Stage */}
                  <div className="p-6 flex flex-col items-center justify-center bg-radial from-cyan-950/20 via-slate-950 to-slate-950 min-h-[300px]">
                    {previewSize === 'squircle' ? (
                      <div className="relative group/img rounded-[28px] overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.2)] max-w-[240px] w-full aspect-square bg-slate-900">
                        <img
                          src={conceptFourImg}
                          alt="Concept 4: Avionics Cluster Gauge"
                          className="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      /* Home Screen Mockup */
                      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center space-y-2 w-full max-w-[200px]">
                        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/50 shadow-lg w-16 h-16 bg-slate-950">
                          <img
                            src={conceptFourImg}
                            alt="Concept 4 Mini"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-200 tracking-wide">
                          Check Sky
                        </span>
                        <div className="w-12 h-1 bg-slate-700/50 rounded-full mt-2"></div>
                      </div>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 mt-4 text-center">
                      The "Avionics Cluster & Five Observables"
                    </span>
                  </div>

                  {/* Design & Philosophy Details */}
                  <div className="p-5 bg-slate-900/40 border-t border-slate-800 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h4 className="text-base font-bold text-slate-100 flex items-center justify-between">
                        <span>Cockpit Telemetry Dial</span>
                        <span className="text-xs font-mono text-cyan-400 font-normal">Avionics Suite</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Inspired by aerospace glass cockpits. A circular instrument gauge features the Check Engine MIL light at 12 o'clock, with five curved LED arc meters for AARO's <strong>Five Observables</strong> (instant acceleration, hypersonic speed, cloaking, transmedium, positive lift).
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Aesthetic:</span>
                          <span className="font-mono text-cyan-300">Cockpit Glass / Carbon Fiber</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Primary Color:</span>
                          <span className="font-mono text-cyan-400 font-bold">Aviation Green & Caution Yellow</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Sensor Focus:</span>
                          <span className="text-slate-200">5 Simultaneous Flight Vectors</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>High-tech multi-parameter triage</span>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedVariant('annunciator_dash');
                          setSelectedColor('stealth');
                          setActiveDtcCode('P0505');
                          setActiveTab('showcase');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] font-bold transition cursor-pointer"
                      >
                        Inspect Vector
                      </button>
                    </div>
                  </div>
                </div>

                {/* CANDIDATE 5: THE METRIC BUBBLE HAZARD */}
                <div className="rounded-3xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-purple-500/60 transition-all duration-300">
                  <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-400 font-bold flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>CONCEPT 5</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40">
                      DTC P0420
                    </span>
                  </div>

                  {/* Icon Visual Stage */}
                  <div className="p-6 flex flex-col items-center justify-center bg-radial from-purple-950/20 via-slate-950 to-slate-950 min-h-[300px]">
                    {previewSize === 'squircle' ? (
                      <div className="relative group/img rounded-[28px] overflow-hidden border-2 border-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.2)] max-w-[240px] w-full aspect-square bg-slate-900">
                        <img
                          src={conceptFiveImg}
                          alt="Concept 5: Metric Bubble Hazard"
                          className="w-full h-full object-cover transform group-hover/img:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      /* Home Screen Mockup */
                      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center space-y-2 w-full max-w-[200px]">
                        <div className="relative rounded-2xl overflow-hidden border border-purple-500/50 shadow-lg w-16 h-16 bg-slate-950">
                          <img
                            src={conceptFiveImg}
                            alt="Concept 5 Mini"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-200 tracking-wide">
                          Check Sky
                        </span>
                        <div className="w-12 h-1 bg-slate-700/50 rounded-full mt-2"></div>
                      </div>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 mt-4 text-center">
                      The "Metric Bubble Hazard"
                    </span>
                  </div>

                  {/* Design & Philosophy Details */}
                  <div className="p-5 bg-slate-900/40 border-t border-slate-800 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h4 className="text-base font-bold text-slate-100 flex items-center justify-between">
                        <span>Spacetime Warp & Scale</span>
                        <span className="text-xs font-mono text-purple-400 font-normal">Metric Bubble</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        An automotive hazard warning triangle with beveled corners framing an Alcubierre gravitational lensing bubble. Distorts background starlight in glowing cyan around a central craft. Along the base, a miniature pasture fence & cow provide whimsical terrestrial scale!
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Aesthetic:</span>
                          <span className="font-mono text-purple-300">Hazard Triangle + Warp Lensing</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Primary Color:</span>
                          <span className="font-mono text-purple-400 font-bold">Obsidian, Amber & Cyan Warp</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Cow Humor Element:</span>
                          <span className="text-slate-200">Subtle pasture baseline scale</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Theoretical physics & scale humor</span>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedVariant('bovine_abduction');
                          setSelectedColor('amber');
                          setActiveDtcCode('P0042');
                          setActiveTab('showcase');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono text-[11px] font-bold transition cursor-pointer"
                      >
                        Inspect Vector
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Decision & Deployment Confirmation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Check className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100">Candidate 1 Deployed as Primary Icon</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                        PWA & APPLE-TOUCH-ICON UPDATED
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      To add to your iPhone Home Screen: in Safari, tap the <strong>Share</strong> button (square with arrow up), then tap <strong>"Add to Home Screen"</strong>. Candidate 1 will appear directly on your springboard!
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 whitespace-nowrap font-bold">
                  ✓ PRODUCTION READY
                </div>
              </div>
            </div>
          )}

          {activeTab === 'showcase' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-6 rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-2 z-10">
                    <span className="flex items-center space-x-1 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>DASH CLUSTER #4</span>
                    </span>
                    <span className="text-slate-400 font-bold">FAULT CODE: {activeDtcCode}</span>
                    <span className="text-emerald-400">12.8V NOMINAL</span>
                  </div>
                  <div className="my-6 sm:my-8 flex flex-col items-center justify-center relative z-10">
                    <div className="p-8 rounded-full bg-slate-900/80 border border-slate-800/80 shadow-2xl relative">
                      <CheckEngineLogo
                        variantId={selectedVariant}
                        colorTheme={selectedColor}
                        animationMode={animationMode}
                        size="xl"
                        showCowLift={showCowLift}
                        showFaultCodeBadge={showFaultCodeBadge}
                        glowIntensity={glowIntensity}
                        customFaultCode={activeDtcCode}
                        interactiveHover={true}
                      />
                    </div>
                    <div className="mt-4 text-center space-y-1">
                      <h3 className="font-black text-base text-slate-100">
                        {activeVariantMeta.name}
                      </h3>
                      <p className="text-xs text-amber-300 font-mono">
                        "{activeVariantMeta.tagline}"
                      </p>
                    </div>
                  </div>
                  <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                      <span>Status:</span>
                      <span className="text-amber-400 font-bold uppercase">{animationMode} MODE</span>
                    </div>
                    <button
                      onClick={handleApplyToApp}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      {appliedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>APPLIED!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-slate-950" />
                          <span>USE THIS LOGO</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-3xl bg-slate-950/80 border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-200 text-sm">Dashboard Warning Controls</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">REAL-TIME TWEAKS</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Instrument Cluster Warning Color:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COLOR_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedColor(theme.id)}
                          className={`p-2 rounded-xl border flex items-center space-x-2 text-left transition cursor-pointer text-xs ${
                            selectedColor === theme.id
                              ? `${theme.bgClass} ${theme.borderClass} ${theme.textClass} font-bold shadow-sm`
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner"
                            style={{ backgroundColor: theme.hex }}
                          ></span>
                          <span className="truncate">{theme.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Warning Light Flashing Pattern:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'pulse', label: 'Amber Pulse' },
                        { id: 'strobe', label: 'Fault Strobe' },
                        { id: 'beam_scan', label: 'Tractor Scan' },
                        { id: 'solid', label: 'Solid Glow' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setAnimationMode(mode.id as any)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs ${
                            animationMode === mode.id
                              ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="block font-bold">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setShowCowLift(!showCowLift)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        showCowLift
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">Bovine Abduction Beam</span>
                        <span className="text-[10px] text-slate-400 block">Miniature cow levitation</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        showCowLift ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {showCowLift ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    <div
                      onClick={() => setShowFaultCodeBadge(!showFaultCodeBadge)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        showFaultCodeBadge
                          ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">OBD-II Fault Badge</span>
                        <span className="text-[10px] text-slate-400 block">Show code on logo</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        showFaultCodeBadge ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {showFaultCodeBadge ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-100 text-sm sm:text-base uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Select from 7 Humorous Check Sky Logo Concepts:</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Click any card to preview</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {LOGO_VARIANTS.map((variant) => {
                    const isSelected = selectedVariant === variant.id;
                    return (
                      <div
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant.id);
                          if (variant.recommendedTheme) {
                            setSelectedColor(variant.recommendedTheme);
                          }
                          if (variant.recommendedAnimation) {
                            setAnimationMode(variant.recommendedAnimation);
                          }
                          if (variant.dtcCode) {
                            setActiveDtcCode(variant.dtcCode);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center space-x-1 shadow">
                            <Check className="w-3 h-3" />
                            <span>ACTIVE SELECTION</span>
                          </span>
                        )}
                        <div className="flex items-start space-x-3.5">
                          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0 group-hover:border-amber-500/40 transition">
                            <CheckEngineLogo
                              variantId={variant.id}
                              colorTheme={isSelected ? selectedColor : variant.recommendedTheme}
                              animationMode={isSelected ? animationMode : 'pulse'}
                              size="md"
                              showCowLift={variant.supportsCowLift}
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-100 text-xs sm:text-sm group-hover:text-amber-300 transition">
                              {variant.name}
                            </h4>
                            <p className="text-[11px] text-amber-400 font-mono">
                              {variant.tagline}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800/80 pt-2.5">
                          "{variant.humorLore}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                          <span>DTC: {variant.dtcCode}</span>
                          <span className="text-amber-400/80 font-bold group-hover:text-amber-300">
                            {isSelected ? 'Selected' : 'Click to preview →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scanner' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-800/60 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-100 text-sm sm:text-base">
                        OBD-II UAP DIAGNOSTIC SCANNER (PROTOCOL SAE J1947)
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono">
                        Connected to Celestial Engine Control Module (ECU #51)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearFaultCodes}
                    disabled={clearingCodes}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${clearingCodes ? 'animate-spin' : ''}`} />
                    <span>{clearingCodes ? 'CLEARING DTCs...' : 'CLEAR FAULT CODES'}</span>
                  </button>
                </div>

                {codesCleared && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>DTC codes cleared! Check Engine bulb turned off for 3.2 seconds.</span>
                    </div>
                    <span className="text-emerald-400/80 italic font-sans">(Anomaly still hovering overhead)</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Engine RPM / Warp</span>
                    <span className="text-sm font-bold text-cyan-400">42,000 RPM</span>
                    <span className="text-[10px] text-slate-500 block">Zero internal pistons</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Manifold Vacuum</span>
                    <span className="text-sm font-bold text-emerald-400">0.0001 Torr</span>
                    <span className="text-[10px] text-slate-500 block">Space vacuum seal</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Exhaust Temperature</span>
                    <span className="text-sm font-bold text-amber-400">-40.0°C</span>
                    <span className="text-[10px] text-slate-500 block">FLIR thermal stealth</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Tractor Beam Draw</span>
                    <span className="text-sm font-bold text-rose-400">1.21 GW</span>
                    <span className="text-[10px] text-slate-500 block">Pasture cow lock</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Detected Diagnostic Trouble Codes (DTCs):</span>
                </h4>
                <div className="space-y-2.5">
                  {DTC_FAULT_CODES.map((dtc) => {
                    const isCurrent = activeDtcCode === dtc.code.replace('DTC ', '');
                    return (
                      <div
                        key={dtc.code}
                        onClick={() => {
                          const code = dtc.code.replace('DTC ', '');
                          setActiveDtcCode(code);
                          setShowFaultCodeBadge(true);
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-amber-500 text-slate-950">
                              {dtc.code}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              dtc.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : dtc.severity === 'WARNING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            }`}>
                              {dtc.severity}
                            </span>
                            <h5 className="font-bold text-slate-100 text-xs sm:text-sm">
                              {dtc.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-300">
                            {dtc.description}
                          </p>
                          <p className="text-[11px] text-amber-400/90 font-mono">
                            ⚡ <strong>Suggested Action:</strong> {dtc.suggestedAction}
                          </p>
                        </div>
                        <button
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isCurrent ? 'ACTIVE ON LOGO' : 'SET AS BADGE'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                      Export Ready-to-Use Vector Assets & Badges
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Clean scalable SVG code compatible with Figma, Illustrator, React, and CSS
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopySvgCode}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>COPY SVG CODE</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadSvg}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>DOWNLOAD .SVG</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-amber-300 overflow-x-auto max-h-48">
                  <pre>{`<!-- CHECK SKY LIGHT: ${selectedVariant.toUpperCase()} -->
<svg viewBox="0 0 100 100" width="100" height="100" fill="none">
  <path d="M 22,32 L 32,32 L 32,24 L 38,24 L 38,18 L 62,18 L 62,24 L 68,24 L 68,32 L 80,32 L 80,42 L 86,42 L 86,52 L 80,52 L 80,62 L 64,62 L 64,66 L 36,66 L 36,62 L 22,62 Z"
        fill="${currentThemeObj.hex}"
        stroke="${currentThemeObj.accentHex}"
        stroke-width="2.5"/>
  <ellipse cx="50" cy="18" rx="18" ry="7" fill="#0F172A" stroke="${currentThemeObj.accentHex}" stroke-width="2.5"/>
  <polygon points="38,62 62,62 82,96 18,96" fill="${currentThemeObj.hex}" fill-opacity="0.35"/>
</svg>`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <CheckEngineLogo
              variantId={selectedVariant}
              colorTheme={selectedColor}
              animationMode="solid"
              size="xs"
            />
            <span>Active: <strong>{activeVariantMeta.name}</strong> ({selectedColor.toUpperCase()} | {activeDtcCode})</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleApplyToApp}
              className="w-1/2 sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVED TO APP!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>APPLY TO APP HEADER</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
