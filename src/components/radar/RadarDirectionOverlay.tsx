import React, { useState } from 'react';
import { 
  Compass, Navigation, RotateCw, SlidersHorizontal, 
  CheckCircle2, AlertTriangle, Eye, Crosshair, ChevronRight,
  Maximize2, Smartphone, ArrowUp
} from 'lucide-react';
import { 
  RadarOrientationMode, 
  getCardinal, 
  getMajorCardinal, 
  angleDifference,
  normalizeAngle
} from '../../lib/radarOrientation';

interface RadarDirectionOverlayProps {
  heading: number;
  pitch: number;
  orientationMode: RadarOrientationMode;
  onToggleOrientationMode: () => void;
  targetBearing?: number | null;
  targetName?: string | null;
  hasSensor: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  onRequestPermission: () => void;
  onRecenter: () => void;
  isManualControl: boolean;
  onToggleManualControl: () => void;
  onManualHeadingChange: (heading: number) => void;
  showRadarSweep?: boolean;
}

export const RadarDirectionOverlay: React.FC<RadarDirectionOverlayProps> = ({
  heading,
  pitch,
  orientationMode,
  onToggleOrientationMode,
  targetBearing,
  targetName,
  hasSensor,
  permissionState,
  onRequestPermission,
  onRecenter,
  isManualControl,
  onToggleManualControl,
  onManualHeadingChange,
  showRadarSweep = true
}) => {
  const [showManualControls, setShowManualControls] = useState<boolean>(false);

  const roundedHeading = Math.round(heading);
  const cardinal = getCardinal(heading);
  const majorCardinal = getMajorCardinal(heading);
  const roundedPitch = Math.round(pitch);

  // Calculate target angular difference
  const hasTarget = targetBearing !== null && targetBearing !== undefined;
  const targetDelta = hasTarget ? angleDifference(targetBearing!, heading) : 0;
  const isTargetAligned = hasTarget && Math.abs(targetDelta) <= 8;

  // The angle for the rotating compass ring
  // In Heading-Up: ring rotates counter-clockwise by heading so phone forward direction is at 12 o'clock
  // In North-Up: ring is fixed at 0 deg
  const compassRingRotation = orientationMode === 'heading-up' ? -heading : 0;

  // Beam rotation:
  // In Heading-Up: forward cone is always straight up (0 deg)
  // In North-Up: cone rotates to point along heading
  const sightlineBeamRotation = orientationMode === 'heading-up' ? 0 : heading;

  // Target line rotation relative to screen top:
  // In Heading-Up: relative angle is (targetBearing - heading)
  // In North-Up: angle is targetBearing
  const targetLineRotation = hasTarget
    ? orientationMode === 'heading-up'
      ? targetDelta
      : targetBearing!
    : 0;

  // Determine look-down attitude
  let attitudeText = 'Level (Radar Table)';
  if (roundedPitch >= 15 && roundedPitch <= 55) {
    attitudeText = 'Look-Down (Optimal)';
  } else if (roundedPitch > 55) {
    attitudeText = 'Elevated (Horizon/Sky)';
  } else if (roundedPitch < 10) {
    attitudeText = 'Flat (Horizontal)';
  }

  // Generate 360-degree ticks for the outer bezel
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const deg = i * 5;
    const isMajor = deg % 30 === 0;
    const isCardinal = deg % 90 === 0;
    const isInter = deg % 45 === 0 && !isCardinal;
    return { deg, isMajor, isCardinal, isInter };
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Tactical Radar Azimuth Bezel & Directions (SVG Layer) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Circular Radar Bezel Container (Scaled to radar radius) */}
        <div className="relative w-[min(92vw,92vh,680px)] h-[min(92vw,92vh,680px)] flex items-center justify-center">
          
          {/* Rotating Compass Scale */}
          <div 
            className="absolute inset-0 transition-transform duration-150 ease-out origin-center pointer-events-none"
            style={{ transform: `rotate(${compassRingRotation}deg)` }}
          >
            {/* SVG Compass Ring with Cardinal Badges & Graduation Ticks */}
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              {/* Concentric subtle outer bezel tracks */}
              <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="1" strokeDasharray="6 3" />
              <circle cx="200" cy="200" r="186" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
              <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="1" strokeDasharray="3 6" />
              <circle cx="200" cy="200" r="90" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="1" strokeDasharray="2 4" />

              {/* Crosshair Sector Lines */}
              <line x1="200" y1="6" x2="200" y2="394" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="4 8" />
              <line x1="6" y1="200" x2="394" y2="200" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="4 8" />

              {/* Graduation Ticks */}
              {ticks.map(({ deg, isMajor, isCardinal, isInter }) => {
                const tickLen = isCardinal ? 14 : isMajor ? 10 : isInter ? 8 : 4;
                const strokeColor = isCardinal 
                  ? deg === 0 ? '#38bdf8' : '#06b6d4' 
                  : isMajor 
                  ? 'rgba(6,182,212,0.7)' 
                  : 'rgba(6,182,212,0.35)';
                const strokeW = isCardinal ? 2 : isMajor ? 1.5 : 1;

                return (
                  <g key={deg} transform={`rotate(${deg} 200 200)`}>
                    <line 
                      x1="200" 
                      y1="14" 
                      x2="200" 
                      y2={14 + tickLen} 
                      stroke={strokeColor} 
                      strokeWidth={strokeW} 
                    />
                    {/* Degree labels on 30-deg marks */}
                    {isMajor && !isCardinal && (
                      <text
                        x="200"
                        y="34"
                        textAnchor="middle"
                        fill="rgba(148,163,184,0.75)"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="600"
                        transform={`rotate(${deg > 90 && deg < 270 ? 180 : 0} 200 34)`}
                      >
                        {deg.toString().padStart(3, '0')}°
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 4 Primary Cardinal Direction Badges */}
              {/* NORTH (000°) */}
              <g transform="translate(200, 24)" className="cursor-default">
                <rect x="-18" y="-12" width="36" height="20" rx="6" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M 0 -17 L 4 -12 L -4 -12 Z" fill="#38bdf8" />
                <text x="0" y="2" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="900" fontFamily="monospace">
                  N
                </text>
              </g>

              {/* EAST (090°) */}
              <g transform="translate(376, 200)" className="cursor-default">
                <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#020617" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M 23 0 L 18 -4 L 18 4 Z" fill="#06b6d4" />
                <text x="0" y="4" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="900" fontFamily="monospace">
                  E
                </text>
              </g>

              {/* SOUTH (180°) */}
              <g transform="translate(200, 376)" className="cursor-default">
                <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#020617" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M 0 15 L 4 10 L -4 10 Z" fill="#06b6d4" />
                <text x="0" y="4" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="900" fontFamily="monospace">
                  S
                </text>
              </g>

              {/* WEST (270°) */}
              <g transform="translate(24, 200)" className="cursor-default">
                <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#020617" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M -23 0 L -18 -4 L -18 4 Z" fill="#06b6d4" />
                <text x="0" y="4" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="900" fontFamily="monospace">
                  W
                </text>
              </g>

              {/* Intercardinal Labels (NE, SE, SW, NW) */}
              <text x="325" y="85" textAnchor="middle" fill="rgba(6,182,212,0.8)" fontSize="10" fontWeight="700" fontFamily="monospace">NE</text>
              <text x="325" y="325" textAnchor="middle" fill="rgba(6,182,212,0.8)" fontSize="10" fontWeight="700" fontFamily="monospace">SE</text>
              <text x="75" y="325" textAnchor="middle" fill="rgba(6,182,212,0.8)" fontSize="10" fontWeight="700" fontFamily="monospace">SW</text>
              <text x="75" y="85" textAnchor="middle" fill="rgba(6,182,212,0.8)" fontSize="10" fontWeight="700" fontFamily="monospace">NW</text>
            </svg>
          </div>

          {/* 2. Forward Observer Sightline Radar Beam (FOV Cone) */}
          <div 
            className="absolute inset-0 transition-transform duration-150 ease-out origin-center pointer-events-none"
            style={{ transform: `rotate(${sightlineBeamRotation}deg)` }}
          >
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
              <defs>
                <radialGradient id="sightlineGradient" cx="200" cy="200" r="180" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(6,182,212,0.4)" />
                  <stop offset="40%" stopColor="rgba(6,182,212,0.18)" />
                  <stop offset="85%" stopColor="rgba(6,182,212,0.06)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                </radialGradient>
              </defs>

              {/* 40-degree Conical Radar Sightline Sector */}
              {/* Arc from -20° to +20° relative to top (y = 200 - r*cos(theta), x = 200 + r*sin(theta)) */}
              <path 
                d="M 200 200 L 138.4 30.8 A 180 180 0 0 1 261.6 30.8 Z" 
                fill="url(#sightlineGradient)" 
                stroke="rgba(6,182,212,0.5)"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />

              {/* Center Sightline Vector Line with Crosshairs */}
              <line x1="200" y1="200" x2="200" y2="18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
              
              {/* Range Distance Ticks along Sightline */}
              <line x1="194" y1="145" x2="206" y2="145" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="210" y="148" fill="#38bdf8" fontSize="8" fontFamily="monospace">15mi</text>

              <line x1="193" y1="95" x2="207" y2="95" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="211" y="98" fill="#38bdf8" fontSize="8" fontFamily="monospace">35mi</text>

              <line x1="191" y1="45" x2="209" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="213" y="48" fill="#38bdf8" fontSize="8" fontFamily="monospace">50mi</text>

              {/* Forward Reticle Cap */}
              <polygon points="200,10 206,20 194,20" fill="#38bdf8" />
            </svg>
          </div>

          {/* 3. Target Sighting Bearing Vector (if target tracked in Target scanner) */}
          {hasTarget && (
            <div 
              className="absolute inset-0 transition-transform duration-200 ease-out origin-center pointer-events-none"
              style={{ transform: `rotate(${targetLineRotation}deg)` }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                {/* Target Bearing Dashed Vector */}
                <line 
                  x1="200" 
                  y1="200" 
                  x2="200" 
                  y2="16" 
                  stroke={isTargetAligned ? '#10b981' : '#f43f5e'} 
                  strokeWidth="2" 
                  strokeDasharray="5 4" 
                />
                
                {/* Target Beacon Marker */}
                <circle 
                  cx="200" 
                  cy="20" 
                  r="7" 
                  fill={isTargetAligned ? '#10b981' : '#f43f5e'} 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                  className={isTargetAligned ? 'animate-ping' : ''}
                />
                <circle 
                  cx="200" 
                  cy="20" 
                  r="4" 
                  fill="#ffffff" 
                />
                
                {/* Target Badge Label */}
                <rect 
                  x="212" 
                  y="10" 
                  width="78" 
                  height="18" 
                  rx="4" 
                  fill="#020617" 
                  stroke={isTargetAligned ? '#10b981' : '#f43f5e'} 
                  strokeWidth="1" 
                />
                <text 
                  x="216" 
                  y="22" 
                  fill={isTargetAligned ? '#34d399' : '#fda4af'} 
                  fontSize="8" 
                  fontWeight="bold" 
                  fontFamily="monospace"
                >
                  TARGET {Math.round(targetBearing!)}°
                </text>
              </svg>
            </div>
          )}

          {/* 4. Fixed Forward Reference Marker (Top of screen, 12 o'clock) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 flex flex-col items-center pointer-events-none z-20">
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-cyan-400 text-[9px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)] backdrop-blur-md">
              <ArrowUp className="w-3 h-3 text-cyan-400 animate-bounce" />
              <span className="font-extrabold tracking-wider">
                {orientationMode === 'heading-up' ? `AHEAD · ${roundedHeading}° ${cardinal}` : 'TOP · NORTH'}
              </span>
            </div>
          </div>

          {/* 5. Center Observer Fix Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center pointer-events-none z-10">
            <div className="w-3 h-3 rounded-full bg-cyan-400 border border-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
          </div>

        </div>
      </div>

      {/* 2. Top Status HUD & Target Sighting Alignment Banner */}
      <div className="relative pt-12 sm:pt-14 px-3 flex flex-col items-center space-y-1.5 pointer-events-auto">
        {/* Target Sighting Cross-Reference Banner (When coming from Target Scan) */}
        {hasTarget && (
          <div className={`px-3 py-1.5 rounded-2xl text-[10px] sm:text-[11px] font-mono shadow-2xl flex items-center space-x-2 backdrop-blur-md transition-all border ${
            isTargetAligned
              ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-200 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-950/90 border-rose-500/70 text-rose-200'
          }`}>
            <Crosshair className={`w-3.5 h-3.5 shrink-0 ${isTargetAligned ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="font-bold">
              {isTargetAligned ? (
                <span>SIGHTLINE LOCKED ON TARGET: {targetName || 'UAP'} (AZ {Math.round(targetBearing!)}°)</span>
              ) : (
                <span>
                  TARGET {Math.round(targetBearing!)}° ({targetName || 'UAP'}):{' '}
                  <strong className="text-amber-300">
                    {targetDelta > 0 ? `Turn Right ${Math.round(targetDelta)}°` : `Turn Left ${Math.round(Math.abs(targetDelta))}°`}
                  </strong>
                </span>
              )}
            </span>
          </div>
        )}

        {/* iOS Permission Prompt (if user hasn't granted orientation permission yet) */}
        {permissionState === 'prompt' && !hasSensor && (
          <button
            onClick={onRequestPermission}
            className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-200 text-[10px] font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg animate-pulse"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Enable iPhone Compass Tracking (Tap Here)</span>
          </button>
        )}
      </div>

      {/* 3. Bottom Interactive Orientation Command Deck */}
      <div className="relative pb-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-auto">
        {/* Left: Direction & Attitude Readout Capsule */}
        <div className="flex items-center space-x-2 bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-800/80 text-[10px] sm:text-[11px] font-mono text-slate-200 shadow-2xl">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-white text-xs">{roundedHeading}°</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px]">
              {cardinal}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400 text-[10px] hidden xs:inline">
            <span>{attitudeText} ({roundedPitch}°)</span>
          </div>
          <span className="text-slate-600 hidden xs:inline">|</span>
          <div className="flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${hasSensor ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[9px] text-slate-400">{hasSensor ? '60Hz IMU' : 'Manual'}</span>
          </div>
        </div>

        {/* Right: Mode Switcher & Tools */}
        <div className="flex items-center space-x-1.5 bg-slate-950/95 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-2xl text-[10px] sm:text-[11px] font-mono">
          {/* Heading-Up vs North-Up Mode Toggle */}
          <button
            onClick={onToggleOrientationMode}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              orientationMode === 'heading-up'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-300 hover:text-cyan-400 border border-slate-750'
            }`}
            title={
              orientationMode === 'heading-up'
                ? 'Heading-Up: Radar rotates to match how you hold your phone. What is in front of you in the sky appears at the top of the screen.'
                : 'North-Up: Map is fixed with North at the top. The dynamic compass shows your direction.'
            }
          >
            <Navigation className={`w-3.5 h-3.5 ${orientationMode === 'heading-up' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span>{orientationMode === 'heading-up' ? 'TRACK-UP (PHONE)' : 'NORTH-UP'}</span>
          </button>

          {/* Re-Center on Observer Button */}
          <button
            onClick={onRecenter}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
            title="Center Radar on Observer Base Station"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Manual Simulator Toggle (For Desktop / Testing) */}
          <button
            onClick={() => setShowManualControls(!showManualControls)}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              showManualControls || isManualControl
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Manual Heading Simulator (Rotate Radar without motion sensors)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Manual Orientation Simulator Drawer (For Desktop / Evaluation) */}
      {showManualControls && (
        <div className="absolute bottom-14 right-3 sm:right-4 z-30 bg-slate-950/98 backdrop-blur-xl border border-cyan-600/70 rounded-2xl p-3 shadow-2xl max-w-xs w-full text-xs font-mono pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Observer Orientation Simulator</span>
            </div>
            <button
              onClick={() => setShowManualControls(false)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>

          <p className="text-[10px] text-slate-400">
            On iPhone, this moves automatically with the built-in compass. You can also manually rotate or test here:
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>FACING HEADING:</span>
              <span className="text-cyan-400 font-bold">{roundedHeading}° ({cardinal})</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={roundedHeading}
              onChange={(e) => {
                if (!isManualControl) onToggleManualControl();
                onManualHeadingChange(parseInt(e.target.value));
              }}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Cardinal Direction Buttons */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <button
              onClick={() => {
                if (!isManualControl) onToggleManualControl();
                onManualHeadingChange(0);
              }}
              className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-bold cursor-pointer"
            >
              N (0°)
            </button>
            <button
              onClick={() => {
                if (!isManualControl) onToggleManualControl();
                onManualHeadingChange(90);
              }}
              className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold cursor-pointer"
            >
              E (90°)
            </button>
            <button
              onClick={() => {
                if (!isManualControl) onToggleManualControl();
                onManualHeadingChange(180);
              }}
              className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold cursor-pointer"
            >
              S (180°)
            </button>
            <button
              onClick={() => {
                if (!isManualControl) onToggleManualControl();
                onManualHeadingChange(270);
              }}
              className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold cursor-pointer"
            >
              W (270°)
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
            <button
              onClick={() => onManualHeadingChange(normalizeAngle(roundedHeading - 45))}
              className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              ◀ Turn 45° Left
            </button>
            <button
              onClick={() => onManualHeadingChange(normalizeAngle(roundedHeading + 45))}
              className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              Turn 45° Right ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
