import React, { useState } from 'react';
import { Bot, Copy, Check, ExternalLink, X, Sparkles, Scale, ShieldCheck } from 'lucide-react';

interface AiPeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPeerReviewModal: React.FC<AiPeerReviewModalProps> = ({ isOpen, onClose }) => {
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  if (!isOpen) return null;

  const peerReviewPrompt = `Role: Multi-Lens Scientific Reviewer (Aerospace Engineering / Atmospheric Physics / Applied Statistics)

Task: Conduct an adversarial technical audit of "Check Sky Light" (Open-Access Sky Diagnostics & Forensic Deconfliction):
Deployment: https://ais-pre-ukflj6nzej45ykwobcj43x-497180163446.us-west2.run.app

Audit Standards & Verification Checklist:
1. Evidence Hierarchy: Rigorously distinguish mathematical derivations, implemented TypeScript functions, Phase 0 Monte Carlo simulations (synthetic Gaussian noise), empirical field data, and theoretical hypotheses.
2. Geometric Regimes & Table 2 Discrepancy:
   - Audit the shipped-vs-oracle refusal-rate discrepancy at crossing angles α < 20°.
   - Verify directional Jacobians g₁, g₂ for δ = w₀·(d₁×d₂)/‖d₁×d₂‖ and establish linearization failure boundaries.
   - Confirm χ² validity is strictly confined to α ≥ 20°, noting that α < 20° requires nonlinear treatment.
3. Lens A vs. Lens B Demarcation:
   - Lens A: Classical aerospace baseline (ADS-B, SGP4/TLE, FAA 1.2 Hz strobes, atmospheric shear).
   - Lens B: Theoretical metric manipulation (Alcubierre/Lentz). Treat absence of acoustic/fluid signatures as exploratory hypothesis, not empirical proof of exotic craft. Measurement error must remain a first-class hypothesis.
4. Cryptographic & Temporal Bounds:
   - Local hash chains prove tamper-evidence only when externally anchored (RFC 3161).
   - Browser timestamping cannot guarantee nanosecond precision.

Deliverables: Categorized audit items (Critical / Methodological / Theoretical), Jacobian derivation checks, and falsifiable field-test protocols.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(peerReviewPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Independent Peer Review Exporter
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  External Benchmark
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Export empirical verification prompts for independent second-opinion audit in external reasoning engines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 font-sans">
          {/* Methodological Context Pill */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/20 flex items-start space-x-3 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-purple-300 block">Adversarial Peer Review Protocol</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Evaluates math derivations, Phase 0 simulation boundaries (α ≥ 20°), Table 2 code discrepancies, and Lens A vs Lens B demarcation with zero model bias.
              </p>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                Independent Audit Benchmark Prompt:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow-md"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Benchmark Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {peerReviewPrompt}
            </div>
          </div>

          {/* External Verification Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/70 border border-white/10 hover:border-purple-500/40 flex items-center justify-between transition group"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block group-hover:text-purple-300">
                  Anthropic Claude (External)
                </span>
                <span className="text-[10px] text-slate-400">
                  Paste prompt into claude.ai for second-opinion audit
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-300 shrink-0 ml-2" />
            </a>

            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/70 border border-white/10 hover:border-cyan-500/40 flex items-center justify-between transition group"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block group-hover:text-cyan-300">
                  OpenAI ChatGPT (External)
                </span>
                <span className="text-[10px] text-slate-400">
                  Paste prompt into chatgpt.com for statistical check
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 shrink-0 ml-2" />
            </a>
          </div>

          {/* Trademark Disclaimer */}
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-mono text-slate-400 leading-relaxed">
            Legal Trademark Notice: Claude is a trademark of Anthropic, PBC. ChatGPT is a trademark of OpenAI, LLC. Check Sky Light is an independent application powered in-app by Google Gemini and is not affiliated with, sponsored, or endorsed by Anthropic or OpenAI.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Multi-Lens Benchmark Protocol • Open Science
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
