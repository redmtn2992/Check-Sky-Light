import React, { useState } from 'react';
import { 
  X, Compass, Navigation, Crosshair, MapPin, 
  CheckCircle2, AlertTriangle, Sparkles, Layers, 
  ExternalLink, Calculator, ArrowRight 
} from 'lucide-react';
import { LocationCoords } from '../types';
import { TargetLockData } from './ar/ArTargetLockTypes';
import { 
  calculateSightlineIntersection, 
  calculateDistanceMiles, 
  TriangulationResult 
} from '../lib/sightlineMath';

interface SightlineTriangulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: LocationCoords;
  currentTargetLock?: TargetLockData | null;
  currentAzimuth: number;
  currentPitch: number;
}

export const SightlineTriangulationModal: React.FC<SightlineTriangulationModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  currentTargetLock,
  currentAzimuth,
  currentPitch
}) => {
  const [obs1Lat, setObs1Lat] = useState<number>(userLocation.lat);
  const [obs1Lng, setObs1Lng] = useState<number>(userLocation.lng);
  const [obs1Az, setObs1Az] = useState<number>(currentAzimuth || 215);
  const [obs1El, setObs1El] = useState<number>(currentPitch || 38);

  const [obs2Lat, setObs2Lat] = useState<number>(userLocation.lat + 0.08);
  const [obs2Lng, setObs2Lng] = useState<number>(userLocation.lng + 0.12);
  const [obs2Az, setObs2Az] = useState<number>(275);
  const [obs2El, setObs2El] = useState<number>(34);

  const [triangulationResult, setTriangulationResult] = useState<TriangulationResult | null>(null);

  if (!isOpen) return null;

  const handleComputeTriangulation = () => {
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
    setTriangulationResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-3xl w-full max-w-4xl max-h-[94vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-700 text-cyan-400 shadow-inner">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wide">
                  Multi-Observer Sightline Triangulation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                  GEOMETRIC TRUTH ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Intersects simultaneous bearings from two or more observers to derive ground-truth 3D position & altitude
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800/80 pb-2">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Observer 1 (Your Live Device)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  LOCAL SENSOR
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={obs1Lat}
                    onChange={(e) => setObs1Lat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={obs1Lng}
                    onChange={(e) => setObs1Lng(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Azimuth Bearing (°)</label>
                  <input
                    type="number"
                    value={obs1Az}
                    onChange={(e) => setObs1Az(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-cyan-300 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Elevation Pitch (°)</label>
                  <input
                    type="number"
                    value={obs1El}
                    onChange={(e) => setObs1El(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-teal-300 font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-teal-300 font-bold border-b border-slate-800/80 pb-2">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span>Observer 2 (Secondary Ground Node)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
                  NETWORK PEER
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={obs2Lat}
                    onChange={(e) => setObs2Lat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={obs2Lng}
                    onChange={(e) => setObs2Lng(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Azimuth Bearing (°)</label>
                  <input
                    type="number"
                    value={obs2Az}
                    onChange={(e) => setObs2Az(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-teal-300 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block">Elevation Pitch (°)</label>
                  <input
                    type="number"
                    value={obs2El}
                    onChange={(e) => setObs2El(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-teal-300 font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleComputeTriangulation}
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-slate-950" />
              <span>INTERSECT BEARING SIGHTLINES (GEODESIC SOLVE)</span>
            </button>
          </div>

          {triangulationResult && (
            <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-700 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-cyan-400 text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>TRIANGULATION SOLUTION DERIVED</span>
                </div>
                <span className={`text-xs font-bold ${triangulationResult.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {triangulationResult.valid ? 'VALID GEODESIC INTERSECTION' : 'APPROXIMATION / DIVERGENT'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Solved Latitude</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {triangulationResult.intersectionLat.toFixed(5)}°
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Solved Longitude</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {triangulationResult.intersectionLng.toFixed(5)}°
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Estimated Altitude</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {triangulationResult.calculatedAltitudeMeters.toLocaleString()} m ({triangulationResult.calculatedAltitudeFt.toLocaleString()} ft)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Dist to Witness 1/2</span>
                  <span className="text-sm font-bold text-amber-400">
                    {triangulationResult.distWitness1Miles.toFixed(1)} / {triangulationResult.distWitness2Miles.toFixed(1)} mi
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-300 leading-relaxed font-sans">
                <strong className="text-cyan-300 font-mono">Dual-Lens Kinematics Assessment:</strong> {triangulationResult.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
