import React, { useState } from 'react';
import { 
  X, Search, ExternalLink, Sparkles, Cpu, Circle, Pill, Disc, 
  Triangle, Waves, Grid, Zap, Box, CheckCircle2, Send, Landmark, 
  Info, ShieldAlert, Activity, ArrowRight, HelpCircle, ChevronRight 
} from 'lucide-react';
import { THE_NINE_UAP_CLASSES, UapClassDefinition } from '../data/uapClassesData';

interface UapClassesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClassForScan?: (notes: string) => void;
  onSelectClassForReport?: (uapClass: UapClassDefinition) => void;
}

export const UapClassesGuideModal: React.FC<UapClassesGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectClassForScan,
  onSelectClassForReport
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(THE_NINE_UAP_CLASSES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredClasses = THE_NINE_UAP_CLASSES.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.shapeCategory.toLowerCase().includes(q) ||
      item.keywordTriggers.some((k) => k.toLowerCase().includes(q))
    );
  });

  const activeClass = THE_NINE_UAP_CLASSES.find((c) => c.id === selectedClassId) || THE_NINE_UAP_CLASSES[0];

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Circle': return <Circle className={className} />;
      case 'Pill': return <Pill className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'Triangle': return <Triangle className={className} />;
      case 'Waves': return <Waves className={className} />;
      case 'Grid': return <Grid className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Box': return <Box className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden my-4">
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/90 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0 shadow-inner">
              <Landmark className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
                  Nine Observed UAP Classes Reference
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-[11px] font-bold">
                  Check Sky Light AI Taxonomy
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Standardized categorization framework for observed Unidentified Anomalous Phenomena (UAP) based on visual geometry, kinematics, and telemetry signatures.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition shrink-0 cursor-pointer"
            aria-label="Close reference guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search UAP shapes (e.g. Tic-Tac, Orb, Triangle)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
              {filteredClasses.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-mono bg-slate-950/50 rounded-xl border border-slate-800">
                  No UAP class matches found for "{searchQuery}".
                </div>
              ) : (
                filteredClasses.map((item) => {
                  const isSelected = item.id === activeClass.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedClassId(item.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-950/50 text-slate-100'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${item.badgeColor} shrink-0`}>
                          {getIcon(item.iconName, 'w-4 h-4')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs tracking-wide">
                              {item.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                            {item.shapeCategory} • ~{item.typicalAnomalyScore}% Anomaly
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-1 mt-auto">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <span className="flex items-center">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Source: Check Sky Light Research
                </span>
                <span className="text-cyan-300 flex items-center">
                  Dual-Lens Analytical Framework
                </span>
              </div>
              <p className="text-slate-500 text-[10px]">
                Cross-referenced with military aviation safety logs & AARO/NUFORC taxonomy standards.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl border ${activeClass.badgeColor}`}>
                    {getIcon(activeClass.iconName, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {activeClass.code}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {activeClass.shapeCategory}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-100 mt-0.5">
                      {activeClass.name}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Typical Anomaly Index
                  </span>
                  <span className="text-lg font-mono font-black text-rose-400">
                    {activeClass.typicalAnomalyScore}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed">
                  "{activeClass.summary}"
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeClass.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  Observed Flight Kinematics & Physics
                </h4>
                <div className="space-y-1.5">
                  {activeClass.kinematics.map((kin, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{kin}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/90 border border-cyan-900/50">
                <div className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telemetry Signature & Radar Correlation:</span>
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  {activeClass.telemetrySignature}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Sample Observer Description Log:
                </span>
                <p className="text-xs text-cyan-200 italic font-mono">
                  "{activeClass.sampleObservationNote}"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
              {onSelectClassForScan && (
                <button
                  onClick={() => {
                    onSelectClassForScan(activeClass.sampleObservationNote);
                    onClose();
                  }}
                  className="flex-1 py-3 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/90 text-cyan-200 font-sans text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm min-h-[44px]"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Test in Sky Radar Scanner</span>
                </button>
              )}
              {onSelectClassForReport && (
                <button
                  onClick={() => {
                    onSelectClassForReport(activeClass);
                    onClose();
                  }}
                  className="flex-1 py-3 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-cyan-500/20 min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Use in Sighting Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
