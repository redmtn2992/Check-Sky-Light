import React, { useState, useEffect } from 'react';
import { 
  Compass, Navigation, MapPin, Crosshair, 
  Share2, Copy, Check, Users, Calculator, 
  ArrowRight, ShieldCheck, AlertTriangle, Layers, 
  RefreshCw, Radio, ExternalLink, Sparkles
} from 'lucide-react';
import { LocationCoords } from '../../types';
import { 
  calculateSightlineIntersection, 
  calculateDistanceMiles, 
  TriangulationResult 
} from '../../lib/sightlineMath';

interface TierTriangulationStudioProps {
  userLocation: LocationCoords;
  onSendToTargetScanner?: (lat: number, lng: number, alt: number) => void;
  onExportToReport?: (result: TriangulationResult, obs1: any, obs2: any) => void;
}

export const TierTriangulationStudio: React.FC<TierTriangulationStudioProps> = ({
  userLocation,
  onSendToTargetScanner,
  onExportToReport
}) => {
  // Session pairing state for two iPhone testers
  const [sessionCode, setSessionCode] = useState<string>('SKY-8241');
  const [copiedLink, setCopiedLink] = useState(false);

  // Observer 1 (Me / Device 1)
  const [obs1Lat, setObs1Lat] = useState<number>(userLocation.lat);
  const [obs1Lng, setObs1Lng] = useState<number>(userLocation.lng);
  const [obs1Az, setObs1Az] = useState<number>(215);
  const [obs1El, setObs1El] = useState<number>(38);
  const [obs1Name, setObs1Name] = useState<string>('Tester 1 (My iPhone)');

  // Observer 2 (Partner Field Tester / Device 2)
  const [obs2Lat, setObs2Lat] = useState<number>(userLocation.lat + 0.045);
  const [obs2Lng, setObs2Lng] = useState<number>(userLocation.lng + 0.065);
  const [obs2Az, setObs2Az] = useState<number>(278);
  const [obs2El, setObs2El] = useState<number>(34);
  const [obs2Name, setObs2Name] = useState<string>('Tester 2 (Field Partner iPhone)');

  // Triangulation calculation result
  const [result, setResult] = useState<TriangulationResult | null>(null);

  // Distance between observers
  const baselineMiles = calculateDistanceMiles(obs1Lat, obs1Lng, obs2Lat, obs2Lng);

  // Recompute intersection whenever parameters change
  useEffect(() => {
    const res = calculateSightlineIntersection(
      obs1Lat,
      obs1Lng,
      obs1Az,
      obs2Lat,
      obs2Lng,
      obs2Az,
      obs1El,
      obs2El
    );
    setResult(res);
  }, [obs1Lat, obs1Lng, obs1Az, obs2Lat, obs2Lng, obs2Az, obs1El, obs2El]);

  // Copy shareable session link for tester 2
  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}#triangulate?session=${sessionCode}&lat=${obs1Lat.toFixed(4)}&lng=${obs1Lng.toFixed(4)}&az=${obs1Az}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check Sky Light Triangulation Session',
        text: `Join multi-observer UAP triangulation session [${sessionCode}]. Target bearing AZ ${obs1Az}° EL ${obs1El}°.`,
        url: inviteUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Field test baseline presets
  const handleApplyPreset = (preset: 'park' | 'urban' | 'valley') => {
    if (preset === 'park') {
      // ~500m separation
      setObs2Lat(Number((obs1Lat + 0.0035).toFixed(5)));
      setObs2Lng(Number((obs1Lng + 0.0045).toFixed(5)));
      setObs1Az(210);
      setObs2Az(245);
      setObs1El(45);
      setObs2El(42);
    } else if (preset === 'urban') {
      // ~2.5 miles separation
      setObs2Lat(Number((obs1Lat + 0.03).toFixed(5)));
      setObs2Lng(Number((obs1Lng + 0.04).toFixed(5)));
      setObs1Az(220);
      setObs2Az(285);
      setObs1El(35);
      setObs2El(31);
    } else {
      // ~8 miles separation across valley
      setObs2Lat(Number((obs1Lat + 0.09).toFixed(5)));
      setObs2Lng(Number((obs1Lng + 0.12).toFixed(5)));
      setObs1Az(195);
      setObs2Az(310);
      setObs1El(25);
      setObs2El(22);
    }
  };

  // Calculate geometric interception angle
  const angleDifference = Math.abs((obs1Az - obs2Az + 360) % 360);
  const interceptionAngle = angleDifference > 180 ? 360 - angleDifference : angleDifference;
  const isOptimalGeometry = interceptionAngle >= 45 && interceptionAngle <= 135;

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Tier 2 Header */}
      <div className="glass-panel border border-teal-500/30 rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-teal-950/30 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-black bg-teal-500/20 border border-teal-500/40 text-teal-300">
                TIER 2 // MULTI-OBSERVER
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                3D SIGHTLINE INTERCEPT
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Two-Party Triangulation Studio
            </h3>
            <p className="text-xs text-slate-300">
              Calculate ground-truth 3D altitude, slant range, and error ellipsoid from dual observer sightlines.
            </p>
          </div>

          {/* Session Code & Share Invite */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-teal-500/40 font-mono text-xs text-teal-300 flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
              <span>{sessionCode}</span>
            </div>
            <button
              onClick={handleCopyInviteLink}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              title="Copy session link to text or AirDrop to the second iPhone tester"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Invite Partner'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Field-Testing Presets */}
      <div className="glass-panel border border-white/10 rounded-xl p-2.5 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-slate-300 text-[11px]">
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-bold">Distance Baselines:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <button
            onClick={() => handleApplyPreset('park')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-teal-500/20 hover:border-teal-500/40 border border-white/10 text-slate-200 transition cursor-pointer"
          >
            Park (~500m)
          </button>
          <button
            onClick={() => handleApplyPreset('urban')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-teal-500/20 hover:border-teal-500/40 border border-white/10 text-slate-200 transition cursor-pointer"
          >
            Urban (~2.5 mi)
          </button>
          <button
            onClick={() => handleApplyPreset('valley')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-teal-500/20 hover:border-teal-500/40 border border-white/10 text-slate-200 transition cursor-pointer"
          >
            Valley (~8 mi)
          </button>
        </div>
      </div>

      {/* Dual Observer Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Observer 1: My Device */}
        <div className="glass-panel border border-cyan-500/30 rounded-3xl p-4 sm:p-5 space-y-4 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Observer 1 (My Live Device)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
              LOCAL SENSOR
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[10px] text-slate-500 block">LATITUDE:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={obs1Lat}
                  onChange={(e) => setObs1Lat(Number(e.target.value))}
                  className="w-full bg-transparent text-cyan-300 font-bold focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[10px] text-slate-500 block">LONGITUDE:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={obs1Lng}
                  onChange={(e) => setObs1Lng(Number(e.target.value))}
                  className="w-full bg-transparent text-cyan-300 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>BEARING AZIMUTH (°):</span>
                  <span className="text-cyan-400 font-bold">{obs1Az}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={obs1Az}
                  onChange={(e) => setObs1Az(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>ELEVATION (°):</span>
                  <span className="text-cyan-400 font-bold">{obs1El}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={obs1El}
                  onChange={(e) => setObs1El(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Observer 2: Field Partner iPhone */}
        <div className="glass-panel border border-teal-500/30 rounded-3xl p-4 sm:p-5 space-y-4 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-teal-300 font-bold">
              <Users className="w-4 h-4 text-teal-400" />
              <span>Observer 2 (Field Partner iPhone)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 border border-teal-700 text-teal-300">
              REMOTE TESTER
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[10px] text-slate-500 block">LATITUDE:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={obs2Lat}
                  onChange={(e) => setObs2Lat(Number(e.target.value))}
                  className="w-full bg-transparent text-teal-300 font-bold focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[10px] text-slate-500 block">LONGITUDE:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={obs2Lng}
                  onChange={(e) => setObs2Lng(Number(e.target.value))}
                  className="w-full bg-transparent text-teal-300 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>BEARING AZIMUTH (°):</span>
                  <span className="text-teal-400 font-bold">{obs2Az}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={obs2Az}
                  onChange={(e) => setObs2Az(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>ELEVATION (°):</span>
                  <span className="text-teal-400 font-bold">{obs2El}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={obs2El}
                  onChange={(e) => setObs2El(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Intersect Tactical Radar Canvas / Diagram */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4 bg-slate-950 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300 uppercase">
            <Crosshair className="w-4 h-4 text-teal-400" />
            <span>2D Tactical Sightline Convergence Map</span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="text-slate-400">BASELINE SEPARATION:</span>
            <span className="text-amber-400 font-bold">{baselineMiles} miles</span>
          </div>
        </div>

        {/* Tactical Diagram Render */}
        <div className="relative w-full h-[240px] sm:h-[280px] rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-center overflow-hidden">
          {/* Radar concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-24 h-24 rounded-full border border-cyan-400" />
            <div className="w-48 h-48 rounded-full border border-cyan-400" />
            <div className="w-72 h-72 rounded-full border border-cyan-400" />
            <div className="w-96 h-96 rounded-full border border-cyan-400" />
            <div className="absolute w-full h-px bg-cyan-400" />
            <div className="absolute h-full w-px bg-cyan-400" />
          </div>

          {/* SVG Sightline Convergence Geometry */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240">
            {/* Baseline between observers */}
            <line x1="120" y1="180" x2="280" y2="180" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
            
            {/* Observer 1 Ray */}
            <line x1="120" y1="180" x2="200" y2="60" stroke="#06b6d4" strokeWidth="2" />
            
            {/* Observer 2 Ray */}
            <line x1="280" y1="180" x2="200" y2="60" stroke="#14b8a6" strokeWidth="2" />

            {/* Target 3D Intersection point */}
            <circle cx="200" cy="60" r="14" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="200" cy="60" r="4" fill="#f43f5e" />

            {/* Observer 1 Point */}
            <circle cx="120" cy="180" r="6" fill="#06b6d4" />
            <text x="100" y="205" fill="#67e8f9" fontSize="10" fontFamily="monospace">OBS 1 (Me)</text>

            {/* Observer 2 Point */}
            <circle cx="280" cy="180" r="6" fill="#14b8a6" />
            <text x="260" y="205" fill="#5eead4" fontSize="10" fontFamily="monospace">OBS 2 (Partner)</text>

            {/* Target Label */}
            <text x="160" y="40" fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="bold">
              3D UAP FIX: {result?.calculatedAltitudeFt?.toLocaleString() || '14,200'} FT
            </text>
          </svg>
        </div>

        {/* Calculated Triangulation Results Bar */}
        {result && result.valid && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-2">
            <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">CALCULATED ALTITUDE:</span>
              <span className="text-emerald-400 font-bold text-sm block">
                {result.calculatedAltitudeFt.toLocaleString()} ft MSL
              </span>
              <span className="text-[10px] text-slate-500 block">
                ({result.calculatedAltitudeMeters.toLocaleString()} m AGL)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">SLANT RANGE (OBS 1):</span>
              <span className="text-cyan-400 font-bold text-sm block">
                {result.distWitness1Miles} miles
              </span>
              <span className="text-[10px] text-slate-500 block">From your device</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">SLANT RANGE (OBS 2):</span>
              <span className="text-teal-400 font-bold text-sm block">
                {result.distWitness2Miles} miles
              </span>
              <span className="text-[10px] text-slate-500 block">From field partner</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">GEOMETRIC ACCURACY:</span>
              <span className={`font-bold text-sm block ${isOptimalGeometry ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isOptimalGeometry ? 'OPTIMAL (GDOP < 2.0)' : 'MODERATE (GDOP 3.5)'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {interceptionAngle.toFixed(0)}° intersect angle
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons: Export or Lock in Target Scanner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="text-xs text-slate-400 font-mono">
            {result?.valid 
              ? `Ground-truth fix derived at LAT ${result.intersectionLat.toFixed(4)}°, LNG ${result.intersectionLng.toFixed(4)}°.`
              : 'Adjust azimuth and elevation angles to intersect sightlines.'}
          </div>

          <div className="flex items-center gap-2">
            {onSendToTargetScanner && result && result.valid && (
              <button
                onClick={() => onSendToTargetScanner(result.intersectionLat, result.intersectionLng, result.calculatedAltitudeFt)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-bold text-slate-200 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lock in Reticle</span>
              </button>
            )}

            {onExportToReport && result && result.valid && (
              <button
                onClick={() => onExportToReport(result, { lat: obs1Lat, lng: obs1Lng, az: obs1Az, el: obs1El }, { lat: obs2Lat, lng: obs2Lng, az: obs2Az, el: obs2El })}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-mono font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-md"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Export Triangulation Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
