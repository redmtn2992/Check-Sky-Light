import React from 'react';
import { ShieldCheck, FileText, Lock, X, Check, ExternalLink } from 'lucide-react';

interface EulaPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EulaPrivacyModal: React.FC<EulaPrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                END USER LICENSE AGREEMENT (EULA) & PRIVACY
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/90">
                Apple App Store & Civilian Scientific Research Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close EULA"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Legal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>1. Standard End User License Agreement (EULA)</span>
            </h3>
            <p className="text-slate-300 text-[11px]">
              By downloading, accessing, or using <strong>Check Sky Light</strong>, you agree to be bound by the terms of this Agreement. 
              Check Sky Light is licensed, not sold, to you for use strictly under the terms of the standard Apple Licensed Application End User License Agreement (Apple Standard EULA) and the additional terms outlined below.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 font-mono flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>2. Privacy Policy & Sensor Telemetry Principles</span>
            </h3>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-slate-300 text-[11px]">
                <strong>Zero Commercial Monetization:</strong> We do not sell, rent, monetize, or broker your personal data, sensor streams, or location coordinates to third-party ad networks or brokers.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Camera & Optical Data:</strong> Camera video feeds are processed locally on your device hardware for real-time Augmented Reality overlay, optical zoom, and target reticle positioning. No video stream is transmitted to external servers without your explicit, voluntary action to generate a report.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Microphone & Acoustic Data:</strong> Audio capture is used solely to record ambient sounds during voluntary video capture to test for aerodynamic shockwaves or silence. The app defaults to silent operation to avoid self-contaminating field recordings.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Location Telemetry:</strong> GPS coordinates are used exclusively to query public unclassified ADS-B aircraft positions, NOAA sounding balloons, and orbital satellite ephemeris in your immediate observation sector.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 font-mono">
              3. Independent Civilian Tool Disclaimer
            </h3>
            <p className="text-slate-400 text-[11px]">
              Check Sky Light is an independent civilian observational and scientific diagnostic tool. It is not affiliated with, endorsed by, or an official agency of the Federal Aviation Administration (FAA), Department of Defense (DoD), or local law enforcement. In the event of an immediate aviation safety emergency, contact official aviation authorities.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 font-mono">
              4. User Content & Voluntary Research Reporting
            </h3>
            <p className="text-slate-400 text-[11px]">
              Any incident reports, telemetry dossiers, or media files created in Check Sky Light remain under your sole discretion. Voluntary submissions to external research databases (e.g., MUFON CMS, SCU) are performed explicitly by you through manual export or standard submission workflows.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">
            Last Updated: October 2026 • v2.1 Release
          </span>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
