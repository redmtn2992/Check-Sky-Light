import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, FileText, CheckCircle2, Search, BookOpen } from 'lucide-react';
import { AARO_CASE_RECORDS, AARO_INFORMATION_PAPERS, AaroCaseRecord } from '../../data/aaroRecordsData';

interface AaroRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseRecord: AaroCaseRecord) => void;
}

export const AaroRecordsModal: React.FC<AaroRecordsModalProps> = ({
  isOpen,
  onClose,
  onSelectCase
}) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'papers'>('cases');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredCases = AARO_CASE_RECORDS.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.geographicRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sensorSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  AARO Official Records Database
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Tier I Declassified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All-domain Anomaly Resolution Office Case Resolution Reports & Information Papers (
                <a
                  href="https://www.aaro.mil/UAP-Records/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center space-x-0.5"
                >
                  <span>aaro.mil/UAP-Records</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
                )
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-white/5 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'cases'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Case Resolutions ({AARO_CASE_RECORDS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'papers'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scientific Papers ({AARO_INFORMATION_PAPERS.length})</span>
            </button>
          </div>

          {activeTab === 'cases' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PR-016, GoFast, Birds..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'cases' ? (
            <div className="space-y-3">
              {filteredCases.map((c) => (
                <div
                  key={c.caseId}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-emerald-500/40 transition space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          c.isUnresolved
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {c.caseId}
                        </span>
                        <h4 className="font-bold text-sm text-white">{c.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          c.isUnresolved
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {c.isUnresolved ? 'Positive Control (Unresolved)' : 'Negative Control (Resolved)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {c.geographicRegion} • {c.incidentYear} • {c.sensorSystem}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onSelectCase && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCase(c);
                            onClose();
                          }}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer ${
                            c.isUnresolved
                              ? 'bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300'
                              : 'bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {c.isUnresolved ? 'Load Positive Control' : 'Load Negative Control'}
                        </button>
                      )}
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                        title="View Official Source Record"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Verdict & Deconfliction */}
                  <div className={`p-2.5 rounded-lg border space-y-1.5 text-slate-300 ${
                    c.isUnresolved
                      ? 'bg-amber-950/25 border-amber-500/30'
                      : 'bg-emerald-950/20 border-emerald-500/20'
                  }`}>
                    <div className={`flex items-center space-x-1.5 font-bold ${
                      c.isUnresolved ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{c.officialVerdict}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {c.officialSummary}
                    </p>
                  </div>

                  {/* Physics Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div className="p-2 rounded bg-slate-900 border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Optical Parallax / Illusion:</span>
                      <span>{c.physicsDeconfliction.apparentIllusion}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ground Truth Mechanics:</span>
                      <span>{c.physicsDeconfliction.groundTruth}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] font-mono text-emerald-400">
                      DTC: {c.dtcCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {AARO_INFORMATION_PAPERS.map((paper) => (
                <div
                  key={paper.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2 text-slate-300"
                >
                  <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>{paper.title}</span>
                  </h4>
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    <strong>Scientific Principle:</strong> {paper.keyPrinciple}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {paper.applicationToUap}
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 border-t border-white/5 pt-2">
                    <strong>Forensic Standard:</strong> {paper.resolutionMetric}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Source: Office of the Under Secretary of Defense for Intelligence & Security (AARO)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition cursor-pointer"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
