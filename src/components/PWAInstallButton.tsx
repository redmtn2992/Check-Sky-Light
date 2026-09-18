import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-native-btn"
        onClick={install}
        className={`flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-3 py-1.5 text-xs font-mono text-cyan-300 transition duration-150 shadow-sm ${className}`}
        title="Install Check Sky Light as a full-screen application"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold tracking-wider">INSTALL APP</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-3 py-1.5 text-xs font-mono text-cyan-300 transition duration-150 ${className}`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold tracking-wider">INSTALL ON IPHONE</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
                    <img src="/favicon.png" alt="App Icon" className="w-5 h-5 rounded" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">Install On iPhone</h3>
                    <p className="text-[11px] text-cyan-400 font-mono">100% Full-Screen Field Mode</p>
                  </div>
                </div>
                <button
                  id="pwa-modal-close-btn"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 1: Tap Share</span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      In Safari's bottom toolbar, tap the <strong>Share</strong> icon.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 2: Add to Home Screen</span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      Scroll down in the share sheet and tap <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 3: Launch Dedicated App</span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      Tap the icon on your home screen. Safari bars will be gone, giving you full-screen AR radar tracking!
                    </p>
                    <p className="text-amber-400/90 mt-1 text-[10px] font-mono">
                      * If replacing an older bookmark, delete the previous home screen bookmark first so iOS captures the updated amber icon.
                    </p>
                  </div>
                </div>
              </div>

              <button
                id="pwa-modal-confirm-btn"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-950 transition"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      id="pwa-install-generic-btn"
      onClick={() => {
        alert('To install this web app on your home screen or desktop, use your browser menu and select "Install" or "Add to Home Screen".');
      }}
      className={`hidden md:flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 text-xs font-mono text-slate-300 transition duration-150 ${className}`}
      title="Install App"
    >
      <Download className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-semibold tracking-wider">INSTALL APP</span>
    </button>
  );
};
