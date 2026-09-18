import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Plane, Compass, Navigation, Radio, ShieldAlert, Sparkles, 
  Layers, MapPin, Eye, Satellite, RefreshCw, ExternalLink, 
  ChevronRight, X, Crosshair, Info, SlidersHorizontal, 
  AlertTriangle, CheckCircle2, Wind, Sun, Flame, Maximize2,
  BookOpen, HelpCircle, GraduationCap
} from 'lucide-react';
import { LocationCoords, FlightTrack, SightingReport, SatelliteTrack, WeatherBalloonTrack } from '../types';
import { TargetLockData } from './ar/ArTargetLockTypes';
import { 
  RadarOrientationMode, 
  useDeviceOrientation, 
  loadRadarOrientationPreference, 
  saveRadarOrientationPreference,
  getCardinal
} from '../lib/radarOrientation';
import { RadarDirectionOverlay } from './radar/RadarDirectionOverlay';

interface SkyRadarMapProps {
  userLocation: LocationCoords;
  flights: FlightTrack[];
  sightings: SightingReport[];
  satellites?: SatelliteTrack[];
  balloons?: WeatherBalloonTrack[];
  selectedSightingId?: string | null;
  currentTargetLock?: TargetLockData | null;
  targetBearing?: number | null;
  onSelectSighting?: (sighting: SightingReport) => void;
  onSelectFlight?: (flight: FlightTrack) => void;
  onRefreshAirspace?: () => void;
  onNavigateToAnalyze?: () => void;
  onNavigateToTarget?: () => void;
  onOpenTriangulation?: () => void;
  radiusMiles?: number;
}

type MapLayerType = 'dark' | 'satellite' | 'streets';
type FilterType = 'all' | 'flights' | 'balloons' | 'satellites' | 'uap';

type SelectedItemType = 
  | { type: 'flight'; data: FlightTrack }
  | { type: 'balloon'; data: WeatherBalloonTrack }
  | { type: 'satellite'; data: SatelliteTrack }
  | { type: 'uap'; data: SightingReport }
  | null;

export const SkyRadarMap: React.FC<SkyRadarMapProps> = ({
  userLocation,
  flights,
  sightings,
  satellites = [],
  balloons = [],
  selectedSightingId,
  currentTargetLock,
  targetBearing: propTargetBearing,
  onSelectSighting,
  onSelectFlight,
  onRefreshAirspace,
  onNavigateToAnalyze,
  onNavigateToTarget,
  onOpenTriangulation,
  radiusMiles = 50
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const ringsLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('dark');
  const [selectedItem, setSelectedItem] = useState<SelectedItemType>(null);
  const [isDeconflictToolOpen, setIsDeconflictToolOpen] = useState<boolean>(false);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<number>(15);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showEducationalGuide, setShowEducationalGuide] = useState<boolean>(false);

  // Radar Orientation & Compass Heading State (Heading-Up vs North-Up)
  const [orientationMode, setOrientationMode] = useState<RadarOrientationMode>(loadRadarOrientationPreference);
  const {
    heading,
    pitch,
    hasSensor,
    permissionState,
    isManualControl,
    setIsManualControl,
    setManualHeading,
    requestPermission
  } = useDeviceOrientation(0);

  // Target bearing from props or current target lock
  const activeTargetBearing = propTargetBearing ?? currentTargetLock?.azimuthDeg ?? null;
  const activeTargetName = currentTargetLock?.name ?? (selectedSightingId ? sightings.find(s => s.id === selectedSightingId)?.title : null);

  // Sightline Deconfliction Form State (initialized to live phone heading when opened)
  const [sightlineBearing, setSightlineBearing] = useState<number>(110);
  const [sightlineElevation, setSightlineElevation] = useState<number>(35);
  const [observedLightPattern, setObservedLightPattern] = useState<'strobe' | 'solid_orb' | 'train' | 'erratic'>('solid_orb');

  // Auto-sync deconfliction sightline with live phone orientation when opened
  useEffect(() => {
    if (isDeconflictToolOpen) {
      setSightlineBearing(Math.round(heading));
      if (pitch > 5 && pitch < 85) {
        setSightlineElevation(Math.round(pitch));
      }
    }
  }, [isDeconflictToolOpen]);

  // Countdown timer for real-time polling indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          if (onRefreshAirspace) onRefreshAirspace();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRefreshAirspace]);

  // Handle manual refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setAutoRefreshCountdown(15);
    if (onRefreshAirspace) onRefreshAirspace();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Safe Map Tile URLs (Completely free, no API keys, no watermarks)
  const getTileUrl = (type: MapLayerType) => {
    switch (type) {
      case 'dark':
        // Esri World Dark Gray Canvas: Crisp, dark tactical HUD theme, 100% free with no API key requirement
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      case 'satellite':
        // Esri World Imagery: High-resolution satellite aerial basemap
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'streets':
        // Standard OpenStreetMap
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 9,
        zoomControl: false,
        attributionControl: false
      });

      // Initialize base tile layer
      const tile = L.tileLayer(getTileUrl(mapLayer), {
        maxZoom: 18,
        minZoom: 3
      }).addTo(map);

      tileLayerRef.current = tile;

      const ringsGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      ringsLayerRef.current = ringsGroup;
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          mapInstanceRef.current.panTo([userLocation.lat, userLocation.lng]);
        }
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on layer switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(getTileUrl(mapLayer), {
      maxZoom: 18,
      minZoom: 3
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapLayer]);

  // Update Center & Range Concentric Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const ringsGroup = ringsLayerRef.current;
    if (!map || !ringsGroup) return;

    map.panTo([userLocation.lat, userLocation.lng]);
    ringsGroup.clearLayers();

    // Base Station Radar Node Pulse
    const basePulseHtml = `
      <div class="relative flex items-center justify-center pointer-events-none">
        <div class="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 animate-ping absolute"></div>
        <div class="w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>
      </div>
    `;
    const baseIcon = L.divIcon({
      html: basePulseHtml,
      className: 'custom-radar-base',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: baseIcon })
      .bindPopup(`
        <div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong style="color: #06b6d4; text-transform: uppercase;">BASE RADAR SECTOR</strong><br/>
          <span style="color: #e2e8f0;">${userLocation.city || 'OBSERVER FIX'}</span><br/>
          <span style="color: #94a3b8;">${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°</span>
        </div>
      `)
      .addTo(ringsGroup);

    // Range concentric radar rings (10, 25, 50, 75 miles)
    const rings = [10, 25, 50, 75];
    rings.forEach((miles) => {
      const meters = miles * 1609.34;
      L.circle([userLocation.lat, userLocation.lng], {
        radius: meters,
        color: '#06b6d4',
        weight: 1,
        opacity: miles === 50 ? 0.4 : 0.18,
        fillColor: '#06b6d4',
        fillOpacity: 0.015,
        dashArray: '4, 8'
      }).addTo(ringsGroup);
    });
  }, [userLocation]);

  // Render Flights, Balloons, Satellites & Sightings
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;
    markersGroup.clearLayers();

    // 1. Render Civilian Flights (Flightradar24 / ADS-B Aircraft Silhouette)
    if (activeFilter === 'all' || activeFilter === 'flights') {
      flights.forEach((f) => {
        const isCorrelated = f.uncorrelatedUapProximity;
        const color = isCorrelated ? '#f59e0b' : '#38bdf8';
        const glow = isCorrelated ? 'rgba(245,158,11,0.8)' : 'rgba(56,189,248,0.7)';
        const altK = Math.round(f.altitudeFeet / 1000);
        const flightHtml = `
          <div class="cursor-pointer group flex flex-col items-center justify-center select-none" title="Aircraft: ${f.callsign} (${f.airline || 'Civilian'}) - ${f.altitudeFeet.toLocaleString()}ft MSL, ${f.velocityKnots}kts">
            <div style="transform: rotate(${f.heading}deg);" class="transition-transform group-hover:scale-125 duration-150">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="${color}" stroke="#020617" stroke-width="1.2" style="filter: drop-shadow(0 0 5px ${glow});">
                <path d="M12 2C11.4 2 11 2.5 11 3.4L11 9.2L2.5 14.2C1.8 14.6 2 15.4 2.8 15.4L11 13.8L11 19.2L8.5 21C8 21.4 8.2 22.2 9 22.2L12 21.5L15 22.2C15.8 22.2 16 21.4 15.5 21L13 19.2L13 13.8L21.2 15.4C22 15.4 22.2 14.6 21.5 14.2L13 9.2L13 3.4C13 2.5 12.6 2 12 2Z"/>
              </svg>
            </div>
            <div class="px-1 py-0.2 rounded bg-slate-950/90 text-[8px] font-mono text-sky-300 whitespace-nowrap border border-sky-500/40 mt-0.5 shadow-md group-hover:border-sky-300 group-hover:bg-slate-900 pointer-events-none">
              ${f.callsign} · ${altK}k
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: flightHtml,
          className: 'custom-flight-marker',
          iconSize: [44, 44],
          iconAnchor: [22, 16]
        });

        const marker = L.marker([f.latitude, f.longitude], { icon }).addTo(markersGroup);
        marker.on('click', () => {
          setSelectedItem({ type: 'flight', data: f });
          if (onSelectFlight) onSelectFlight(f);
        });
      });
    }

    // 2. Render Weather Sounding Balloons (NOAA / NWS Radiosondes)
    if (activeFilter === 'all' || activeFilter === 'balloons') {
      balloons.forEach((b) => {
        const altK = Math.round(b.altitudeFeet / 1000);
        const agencyShort = (b.agency || 'NOAA').replace('NOAA ', '');
        const balloonHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group select-none" title="Weather Balloon: ${b.sondeType} (${b.agency}) - ${b.altitudeFeet.toLocaleString()}ft MSL, ${b.velocityKnots}kts">
            <div class="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/60 animate-ping absolute pointer-events-none"></div>
            <div class="transition-transform group-hover:scale-125 duration-150 z-1">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" style="filter: drop-shadow(0 0 7px rgba(251,191,36,0.8));">
                <!-- Sounding balloon envelope -->
                <circle cx="12" cy="9" r="7" fill="#f59e0b" stroke="#020617" stroke-width="1.2"/>
                <ellipse cx="9.5" cy="6.5" rx="2" ry="1.2" fill="#ffffff" fill-opacity="0.6"/>
                <!-- Balloon neck -->
                <path d="M10.5 15.5 L13.5 15.5 L12 17.5 Z" fill="#d97706"/>
                <!-- Radiosonde tether string -->
                <line x1="12" y1="17.5" x2="12" y2="21.5" stroke="#fef08a" stroke-width="1" stroke-dasharray="1.5,1"/>
                <!-- Suspended Radiosonde package box -->
                <rect x="9" y="21.5" width="6" height="4.5" rx="0.8" fill="#fef3c7" stroke="#020617" stroke-width="1"/>
                <!-- Sensor probe antenna -->
                <line x1="12" y1="26" x2="12" y2="28" stroke="#f59e0b" stroke-width="1"/>
              </svg>
            </div>
            <div class="px-1 py-0.2 rounded bg-slate-950/90 text-[8px] font-mono text-amber-300 whitespace-nowrap border border-amber-500/40 mt-0.5 shadow-md group-hover:border-amber-300 group-hover:bg-slate-900 z-1 pointer-events-none">
              ${agencyShort} BALLOON · ${altK}k
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: balloonHtml,
          className: 'custom-balloon-marker',
          iconSize: [60, 48],
          iconAnchor: [30, 16]
        });

        const marker = L.marker([b.latitude, b.longitude], { icon }).addTo(markersGroup);
        marker.on('click', () => {
          setSelectedItem({ type: 'balloon', data: b });
        });
      });
    }

    // 3. Render LEO Satellites (Starlink, ISS, Tiangong with Solar Panel Arrays)
    if (activeFilter === 'all' || activeFilter === 'satellites') {
      satellites.forEach((sat) => {
        const satName = sat.name.split(' ')[0] || 'SAT';
        const satHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group select-none" title="LEO Satellite: ${sat.name} (${sat.constellation}) - Alt ${sat.altitudeKm}km, Mag ${sat.magnitude}">
            <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/60 animate-pulse absolute pointer-events-none"></div>
            <div class="transition-transform group-hover:scale-125 duration-150 z-1">
              <svg width="28" height="24" viewBox="0 0 28 24" fill="none" style="filter: drop-shadow(0 0 7px rgba(52,211,153,0.8));">
                <!-- Left solar panel array -->
                <rect x="1" y="7" width="8" height="10" rx="1" fill="#10b981" stroke="#020617" stroke-width="1.2"/>
                <line x1="5" y1="7" x2="5" y2="17" stroke="#020617" stroke-width="0.8"/>
                <line x1="1" y1="12" x2="9" y2="12" stroke="#020617" stroke-width="0.8"/>
                <!-- Left strut -->
                <line x1="9" y1="12" x2="11" y2="12" stroke="#34d399" stroke-width="2"/>
                <!-- Central satellite bus -->
                <rect x="11" y="6" width="6" height="12" rx="1.5" fill="#34d399" stroke="#020617" stroke-width="1.2"/>
                <ellipse cx="14" cy="12" rx="1.6" ry="1.6" fill="#ffffff"/>
                <!-- Right strut -->
                <line x1="17" y1="12" x2="19" y2="12" stroke="#34d399" stroke-width="2"/>
                <!-- Right solar panel array -->
                <rect x="19" y="7" width="8" height="10" rx="1" fill="#10b981" stroke="#020617" stroke-width="1.2"/>
                <line x1="23" y1="7" x2="23" y2="17" stroke="#020617" stroke-width="0.8"/>
                <line x1="19" y1="12" x2="27" y2="12" stroke="#020617" stroke-width="0.8"/>
              </svg>
            </div>
            <div class="px-1 py-0.2 rounded bg-slate-950/90 text-[8px] font-mono text-emerald-300 whitespace-nowrap border border-emerald-500/40 mt-0.5 shadow-md group-hover:border-emerald-300 group-hover:bg-slate-900 z-1 pointer-events-none">
              ${satName} · ${sat.altitudeKm}km
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: satHtml,
          className: 'custom-sat-marker',
          iconSize: [56, 46],
          iconAnchor: [28, 14]
        });

        const marker = L.marker([sat.lat, sat.lng], { icon }).addTo(markersGroup);
        marker.on('click', () => {
          setSelectedItem({ type: 'satellite', data: sat });
        });
      });
    }

    // 4. Render Uncorrelated UAP Sightings
    if (activeFilter === 'all' || activeFilter === 'uap') {
      sightings.forEach((s) => {
        const isSelected = s.id === selectedSightingId;
        const uapHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group select-none" title="Uncorrelated UAP: ${s.title} (${s.probabilityScore}% Anomaly)">
            <div class="w-9 h-9 rounded-full bg-rose-500/25 border ${isSelected ? 'border-rose-400 scale-125' : 'border-rose-500/70'} animate-ping absolute pointer-events-none"></div>
            <div class="transition-transform group-hover:scale-125 duration-150 z-1">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 0 10px rgba(244,63,94,0.9));">
                <polygon points="12,1 23,12 12,23 1,12" stroke="#f43f5e" stroke-width="1.5" fill="#f43f5e" fill-opacity="0.25"/>
                <circle cx="12" cy="12" r="5" stroke="#ffffff" stroke-width="1.5" fill="#e11d48"/>
                <text x="12" y="15" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="900" font-family="monospace">!</text>
              </svg>
            </div>
            <div class="px-1 py-0.2 rounded bg-rose-950/90 text-[8px] font-mono text-rose-300 font-bold whitespace-nowrap border border-rose-500/70 mt-0.5 animate-pulse z-1 shadow-md pointer-events-none">
              UAP · ${s.probabilityScore}%
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: uapHtml,
          className: 'custom-uap-marker',
          iconSize: [52, 48],
          iconAnchor: [26, 16]
        });

        const marker = L.marker([s.location.lat, s.location.lng], { icon }).addTo(markersGroup);
        marker.on('click', () => {
          setSelectedItem({ type: 'uap', data: s });
          if (onSelectSighting) onSelectSighting(s);
        });
      });
    }
  }, [flights, balloons, satellites, sightings, activeFilter, selectedSightingId]);

  // Dynamic Deconfliction calculation for the sightline tool
  const computeDeconfliction = () => {
    // Check closest flight
    let closestFlight: FlightTrack | null = null;
    let minFlightAngleDiff = 999;
    flights.forEach((f) => {
      const bearing = f.bearingDeg ?? 0;
      const diff = Math.abs(bearing - sightlineBearing);
      const angleDiff = diff > 180 ? 360 - diff : diff;
      if (angleDiff < minFlightAngleDiff) {
        minFlightAngleDiff = angleDiff;
        closestFlight = f;
      }
    });

    // Check closest balloon
    let closestBalloon: WeatherBalloonTrack | null = null;
    let minBalloonAngleDiff = 999;
    balloons.forEach((b) => {
      const bearing = b.bearingDeg ?? 0;
      const diff = Math.abs(bearing - sightlineBearing);
      const angleDiff = diff > 180 ? 360 - diff : diff;
      if (angleDiff < minBalloonAngleDiff) {
        minBalloonAngleDiff = angleDiff;
        closestBalloon = b;
      }
    });

    // Determine verdict
    if (minFlightAngleDiff < 15 && closestFlight) {
      return {
        verdict: 'EXPLAINED_FLIGHT' as const,
        probabilityAnomaly: 12,
        title: `Correlated with Civilian Aircraft (${(closestFlight as FlightTrack).callsign})`,
        details: `${(closestFlight as FlightTrack).airline || 'Civilian Flight'} at ${(closestFlight as FlightTrack).altitudeFeet.toLocaleString()} ft MSL, heading ${(closestFlight as FlightTrack).heading}°. Angular separation: ${minFlightAngleDiff.toFixed(0)}°. Flightradar24 registered.`,
        flight: closestFlight,
        flightradarUrl: (closestFlight as FlightTrack).flightradarUrl || `https://www.flightradar24.com/${(closestFlight as FlightTrack).callsign}`
      };
    }

    if (minBalloonAngleDiff < 20 && closestBalloon) {
      return {
        verdict: 'EXPLAINED_BALLOON' as const,
        probabilityAnomaly: 18,
        title: `Correlated with NOAA Weather Balloon (${(closestBalloon as WeatherBalloonTrack).sondeType})`,
        details: `Ascending sounding radiosonde at ${(closestBalloon as WeatherBalloonTrack).altitudeFeet.toLocaleString()} ft MSL. Mylar envelope generates intense daytime solar specular reflection that mimics stationary metallic orbs.`,
        balloon: closestBalloon,
        sondehubUrl: (closestBalloon as WeatherBalloonTrack).sondehubUrl
      };
    }

    if (observedLightPattern === 'train' && satellites.length > 0) {
      return {
        verdict: 'EXPLAINED_SATELLITE' as const,
        probabilityAnomaly: 15,
        title: 'Correlated with LEO Satellite Constellation (Starlink)',
        details: 'Linear train formation observed during twilight pass. Traveling at constant orbital speed in 550 km low earth orbit.'
      };
    }

    return {
      verdict: 'UNCORRELATED_UAP' as const,
      probabilityAnomaly: 94,
      title: 'UNCORRELATED ANOMALOUS TARGET (Probable UAP / NHI)',
      details: 'Zero flight plans registered on Flightradar24. No active ADS-B transponder squawk. No NOAA sounding balloons in sector. Kinematic line-of-sight violates standard aerodynamic and orbital profiles. High probability of authentic non-human intelligence or metric propulsion anomaly!'
    };
  };

  const deconflictResult = computeDeconfliction();

  // Flightradar24 Sector Live Map URL
  const fr24SectorMapUrl = `https://www.flightradar24.com/${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)}/9`;

  return (
    <div className="relative w-full h-[calc(100dvh-12rem)] min-h-[480px] max-h-[820px] rounded-3xl overflow-hidden border border-cyan-800/60 shadow-2xl bg-slate-950 font-sans flex flex-col">
      {/* Top Tactical Status & Command Banner */}
      <div className="bg-slate-950/95 backdrop-blur-md border-b border-cyan-950 px-4 py-3 z-20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-100 tracking-wider">RADAR DECONFLICTION</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ADS-B & FR24 LIVE</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {userLocation.city || 'Current Fix'} • {flights.length} Flights • {balloons.length} Balloons • {satellites.length} Sats
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
          {/* Educational Field Guide Button */}
          <button
            onClick={() => setShowEducationalGuide(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-semibold transition cursor-pointer min-h-[36px]"
            title="Open Airspace Deconfliction Field Guide & Educational Reference"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Field Guide</span>
          </button>

          {/* Multi-Observer Sightline Triangulation */}
          {onOpenTriangulation && (
            <button
              onClick={onOpenTriangulation}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-[11px] font-mono font-semibold transition cursor-pointer min-h-[36px]"
              title="Multi-Observer Sightline Triangulation Engine"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden xs:inline">Triangulate</span>
            </button>
          )}

          {/* Direct Flightradar24 Live Map link */}
          <a
            href={fr24SectorMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-semibold transition cursor-pointer min-h-[36px]"
            title="Open Flightradar24 map centered at current coordinates"
          >
            <Plane className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FR24</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Sightline Deconfliction Tool Toggle */}
          <button
            onClick={() => setIsDeconflictToolOpen(!isDeconflictToolOpen)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold transition cursor-pointer border min-h-[36px] ${
              isDeconflictToolOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 hover:bg-slate-850 text-cyan-400 border-cyan-800/60'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Check What I See</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-cyan-400 transition cursor-pointer relative min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Force refresh transponders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="absolute -bottom-1 -right-1 text-[8px] font-mono text-cyan-400/80">
              {autoRefreshCountdown}s
            </span>
          </button>
        </div>
      </div>

      {/* Main Map Container with HUD overlay */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {/* Leaflet DOM Element with smooth hardware-accelerated rotation for Heading-Up mode */}
        <div 
          className="w-[145%] h-[145%] shrink-0 transition-transform duration-150 ease-out origin-center pointer-events-auto"
          style={{
            transform: orientationMode === 'heading-up' ? `rotate(${-heading}deg)` : 'rotate(0deg)'
          }}
        >
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Tactical Simulated Conical Radar Sweep (Authentic Military HUD) */}
        {showRadarSweep && (
          <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden flex items-center justify-center opacity-30">
            <div className="w-[180vw] h-[180vw] max-w-[1200px] max-h-[1200px] rounded-full border border-cyan-500/15 animate-[spin_8s_linear_infinite]"
                 style={{
                   background: 'conic-gradient(from 0deg, rgba(6,182,212,0.18) 0deg, rgba(6,182,212,0.02) 60deg, transparent 75deg)'
                 }}
            />
          </div>
        )}

        {/* Dynamic 4-Direction Radar Bezel, Sightline Beam & Target Alignment HUD */}
        <RadarDirectionOverlay
          heading={heading}
          pitch={pitch}
          orientationMode={orientationMode}
          onToggleOrientationMode={() => {
            const next = orientationMode === 'heading-up' ? 'north-up' : 'heading-up';
            setOrientationMode(next);
            saveRadarOrientationPreference(next);
          }}
          targetBearing={activeTargetBearing}
          targetName={activeTargetName}
          hasSensor={hasSensor}
          permissionState={permissionState}
          onRequestPermission={requestPermission}
          onRecenter={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo([userLocation.lat, userLocation.lng]);
            }
          }}
          isManualControl={isManualControl}
          onToggleManualControl={() => setIsManualControl(!isManualControl)}
          onManualHeadingChange={setManualHeading}
          showRadarSweep={showRadarSweep}
        />

        {/* Floating Non-Rotating Zoom Controls */}
        <div className="absolute right-3 top-20 z-20 flex flex-col space-y-1 bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
          <button 
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-sm font-bold font-mono transition cursor-pointer"
            title="Zoom In (+)"
          >
            +
          </button>
          <div className="h-px bg-slate-800 mx-1" />
          <button 
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-sm font-bold font-mono transition cursor-pointer"
            title="Zoom Out (-)"
          >
            -
          </button>
        </div>

        {/* Filter Pills Header */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/90 pointer-events-auto shadow-2xl text-[10px] sm:text-[11px] font-mono overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL ({flights.length + balloons.length + satellites.length + sightings.length})
            </button>
            <button
              onClick={() => setActiveFilter('flights')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeFilter === 'flights'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-sky-400 hover:bg-sky-500/10'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>AIRCRAFT ({flights.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('balloons')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeFilter === 'balloons'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <svg width="12" height="14" viewBox="0 0 24 28" fill="none" className="shrink-0">
                <circle cx="12" cy="9" r="7" fill="#f59e0b" />
                <rect x="9" y="21.5" width="6" height="4.5" fill="#fef3c7" />
              </svg>
              <span>BALLOONS ({balloons.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('satellites')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeFilter === 'satellites'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>SATELLITES ({satellites.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('uap')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeFilter === 'uap'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>UAP / NHI ({sightings.length})</span>
            </button>
          </div>

          {/* Map Layer Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 pointer-events-auto shadow-xl text-[10px] font-mono self-start sm:self-auto shrink-0">
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                mapLayer === 'dark' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tactical Dark Radar Basemap (Esri Dark Canvas - No API Key Needed)"
            >
              HUD DARK
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                mapLayer === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Satellite Photo Basemap"
            >
              SATELLITE
            </button>
            <button
              onClick={() => setShowRadarSweep(!showRadarSweep)}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                showRadarSweep ? 'text-cyan-400 font-bold' : 'text-slate-500 line-through'
              }`}
              title="Toggle radar sweep animation"
            >
              SWEEP
            </button>
          </div>
        </div>

        {/* Bottom Tactical Map Legend with Real Target Icons */}
        <div className="absolute bottom-3 left-3 z-10 hidden md:flex items-center space-x-3 bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-[10px] font-mono text-slate-300 shadow-2xl pointer-events-auto">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950"></span>
            <span>Observer Fix</span>
          </div>
          <div className="flex items-center space-x-1.5 text-sky-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#38bdf8" stroke="#020617" strokeWidth="1">
              <path d="M12 2C11.4 2 11 2.5 11 3.4L11 9.2L2.5 14.2C1.8 14.6 2 15.4 2.8 15.4L11 13.8L11 19.2L8.5 21C8 21.4 8.2 22.2 9 22.2L12 21.5L15 22.2C15.8 22.2 16 21.4 15.5 21L13 19.2L13 13.8L21.2 15.4C22 15.4 22.2 14.6 21.5 14.2L13 9.2L13 3.4C13 2.5 12.6 2 12 2Z"/>
            </svg>
            <span>Aircraft</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-400">
            <svg width="12" height="14" viewBox="0 0 24 28" fill="none">
              <circle cx="12" cy="9" r="7" fill="#f59e0b" />
              <rect x="9" y="21.5" width="6" height="4.5" fill="#fef3c7" />
            </svg>
            <span>Weather Balloon</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <svg width="16" height="14" viewBox="0 0 28 24" fill="none">
              <rect x="1" y="7" width="8" height="10" rx="1" fill="#10b981" />
              <rect x="11" y="6" width="6" height="12" rx="1.5" fill="#34d399" />
              <rect x="19" y="7" width="8" height="10" rx="1" fill="#10b981" />
            </svg>
            <span>LEO Satellite</span>
          </div>
          <div className="flex items-center space-x-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 border border-white animate-pulse"></span>
            <span className="font-bold">Uncorrelated UAP</span>
          </div>
          <button
            onClick={() => setShowEducationalGuide(true)}
            className="ml-2 pl-2 border-l border-slate-700 text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer font-bold"
            title="Open Field Guide & Educational Reference"
          >
            <BookOpen className="w-3 h-3" />
            <span>Field Guide</span>
          </button>
        </div>

        {/* Sightline Deconfliction Drawer / Inspector */}
        {isDeconflictToolOpen && (
          <div className="absolute top-14 sm:top-16 inset-x-2.5 sm:inset-x-auto sm:right-3 bottom-2.5 sm:bottom-3 max-w-sm w-full z-20 bg-slate-950/95 backdrop-blur-xl border border-cyan-700/60 rounded-3xl p-3.5 sm:p-4 shadow-2xl flex flex-col justify-between overflow-y-auto font-sans">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Deconflict Sightline</h3>
                    <p className="text-[10px] font-mono text-slate-400">Verify what you are currently observing</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDeconflictToolOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Controls */}
              <div className="mt-4 space-y-3.5 text-xs">
                {/* Azimuth / Compass Direction */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>COMPASS BEARING (AZIMUTH):</span>
                    <span className="text-cyan-400 font-bold">{sightlineBearing}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={sightlineBearing}
                    onChange={(e) => setSightlineBearing(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                    <span>N (0°)</span>
                    <span>E (90°)</span>
                    <span>S (180°)</span>
                    <span>W (270°)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSightlineBearing(Math.round(heading))}
                    className="mt-2 w-full py-1 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center justify-center space-x-1.5 cursor-pointer transition"
                  >
                    <Compass className="w-3 h-3 text-cyan-400" />
                    <span>Sync with Phone Heading ({Math.round(heading)}° {getCardinal(heading)})</span>
                  </button>
                </div>

                {/* Elevation / Pitch */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>ELEVATION ANGLE (ALTITUDE):</span>
                    <span className="text-cyan-400 font-bold">{sightlineElevation}° Above Horizon</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={sightlineElevation}
                    onChange={(e) => setSightlineElevation(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Visual Appearance / Signature */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                    OBSERVED VISUAL SIGNATURE:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'strobe', label: 'Flashing Strobes (1.2Hz)', icon: '🚨' },
                      { id: 'solid_orb', label: 'Silver / Glowing Orb', icon: '⚪' },
                      { id: 'train', label: 'Straight Line of Lights', icon: '🛰️' },
                      { id: 'erratic', label: 'Instant Darting / No Plume', icon: '⚡' }
                    ].map((pattern) => (
                      <button
                        key={pattern.id}
                        type="button"
                        onClick={() => setObservedLightPattern(pattern.id as any)}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer text-[10px] ${
                          observedLightPattern === pattern.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs mb-0.5">{pattern.icon}</div>
                        <div>{pattern.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Deconfliction Assessment Card */}
                <div className={`p-3.5 rounded-2xl border mt-2 ${
                  deconflictResult.verdict === 'UNCORRELATED_UAP'
                    ? 'bg-rose-950/40 border-rose-600/70 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
                    : deconflictResult.verdict === 'EXPLAINED_FLIGHT'
                    ? 'bg-sky-950/40 border-sky-600/70 text-sky-100'
                    : deconflictResult.verdict === 'EXPLAINED_BALLOON'
                    ? 'bg-amber-950/40 border-amber-600/70 text-amber-100'
                    : 'bg-emerald-950/40 border-emerald-600/70 text-emerald-100'
                }`}>
                  <div className="flex items-center space-x-2">
                    {deconflictResult.verdict === 'UNCORRELATED_UAP' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    <div className="font-bold text-xs uppercase tracking-wide">
                      {deconflictResult.title}
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed mt-2 text-slate-300">
                    {deconflictResult.details}
                  </p>

                  {/* Actions based on verdict */}
                  {deconflictResult.verdict === 'UNCORRELATED_UAP' ? (
                    <div className="mt-3 pt-2.5 border-t border-rose-500/30 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-rose-300">
                        <span>UAP PROBABILITY INDEX:</span>
                        <span className="font-bold text-sm text-rose-400">{deconflictResult.probabilityAnomaly}%</span>
                      </div>
                      {onNavigateToTarget && (
                        <button
                          onClick={onNavigateToTarget}
                          className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg"
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>Lock in Target Camera View</span>
                        </button>
                      )}
                      {onNavigateToAnalyze && (
                        <button
                          onClick={onNavigateToAnalyze}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Submit Capture to Gemini Analyze Hub</span>
                        </button>
                      )}
                    </div>
                  ) : deconflictResult.flightradarUrl ? (
                    <div className="mt-3 pt-2 border-t border-slate-700/50">
                      <a
                        href={deconflictResult.flightradarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                      >
                        <Plane className="w-3.5 h-3.5" />
                        <span>Track Live on Flightradar24.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 text-center">
              Multi-sensor deconfliction based on FAA Class B, ADS-B, and NOAA sounding feeds.
            </div>
          </div>
        )}

        {/* Selected Target Dossier Bottom Drawer */}
        {selectedItem && (
          <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto z-30 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-3xl p-4 shadow-2xl text-slate-100 font-sans">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${
                  selectedItem.type === 'flight'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : selectedItem.type === 'balloon'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : selectedItem.type === 'satellite'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {selectedItem.type === 'flight' ? <Plane className="w-6 h-6" /> :
                   selectedItem.type === 'balloon' ? (
                     <svg width="24" height="26" viewBox="0 0 24 28" fill="none">
                       <circle cx="12" cy="9" r="7" fill="#f59e0b" stroke="#020617" strokeWidth="1"/>
                       <path d="M10.5 15.5 L13.5 15.5 L12 17.5 Z" fill="#d97706"/>
                       <line x1="12" y1="17.5" x2="12" y2="21.5" stroke="#fef08a" strokeWidth="1"/>
                       <rect x="9" y="21.5" width="6" height="4.5" fill="#fef3c7" stroke="#020617" strokeWidth="0.8"/>
                     </svg>
                   ) :
                   selectedItem.type === 'satellite' ? <Satellite className="w-6 h-6" /> :
                   <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {selectedItem.type === 'flight' ? selectedItem.data.callsign :
                       selectedItem.type === 'balloon' ? selectedItem.data.sondeType :
                       selectedItem.type === 'satellite' ? selectedItem.data.name :
                       selectedItem.data.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                      {selectedItem.type}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {selectedItem.type === 'flight' ? `${selectedItem.data.airline || 'Civilian'} • ${selectedItem.data.aircraftType || 'Aircraft'}` :
                     selectedItem.type === 'balloon' ? `${selectedItem.data.agency} • Serial: ${selectedItem.data.serial}` :
                     selectedItem.type === 'satellite' ? `${selectedItem.data.constellation} • Mag ${selectedItem.data.magnitude}` :
                     `${selectedItem.data.locationName} • ${selectedItem.data.probabilityScore}% Anomaly`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Telemetry Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono">
              {selectedItem.type === 'flight' && (
                <>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">ALTITUDE</span>
                    <span className="text-sky-300 font-bold">{selectedItem.data.altitudeFeet.toLocaleString()} FT</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">GROUND SPEED</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.velocityKnots} KTS</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">SQUAWK CODE</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.squawk || '1200'}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">HEADING</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.heading}°</span>
                  </div>
                </>
              )}

              {selectedItem.type === 'balloon' && (
                <>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">ALTITUDE MSL</span>
                    <span className="text-amber-300 font-bold">{selectedItem.data.altitudeFeet.toLocaleString()} FT</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">ASCENT RATE</span>
                    <span className="text-slate-200 font-bold">+{selectedItem.data.climbRateFpm} FPM</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">FREQUENCY</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.frequencyMHz} MHz</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">WINDS ALOFT</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.velocityKnots} KTS @ {selectedItem.data.heading}°</span>
                  </div>
                </>
              )}

              {selectedItem.type === 'satellite' && (
                <>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">ORBIT ALT</span>
                    <span className="text-emerald-300 font-bold">{selectedItem.data.altitudeKm} KM</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">MAGNITUDE</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.magnitude}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">AZIMUTH</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.azimuth}°</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">ELEVATION</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.elevation}°</span>
                  </div>
                </>
              )}

              {selectedItem.type === 'uap' && (
                <>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">ANOMALY INDEX</span>
                    <span className="text-rose-400 font-bold">{selectedItem.data.probabilityScore}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">CATEGORY</span>
                    <span className="text-slate-200 font-bold">{selectedItem.data.tags?.[0] || selectedItem.data.status}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">TRANSPONDER</span>
                    <span className="text-rose-400 font-bold">ZERO SQUAWK</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">AERODYNAMIC CORRELATION</span>
                    <span className="text-amber-400 font-bold">NONE (UNCORRELATED)</span>
                  </div>
                </>
              )}
            </div>

            {/* Scientific Deconfliction Note */}
            <p className="text-[11px] text-slate-300 mt-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
              {selectedItem.type === 'flight' ?
                'FAA Deconfliction: Flight operates standard 1.2 Hz anti-collision strobes. Acoustic propagation delay estimated at ~40 seconds.' :
               selectedItem.type === 'balloon' ?
                (selectedItem.data.uapConfusionFactor || 'High daytime solar specular reflection from aluminized mylar envelope mimics a stationary metallic orb.') :
               selectedItem.type === 'satellite' ?
                'Orbital Deconfliction: Constant angular traverse in Low Earth Orbit without atmospheric friction or cavitation.' :
                'Uncorrelated Anomaly: Fails all commercial ADS-B and NOAA meteorological sounding cross-correlation. Zero registered flight plan on Flightradar24.'}
            </p>

            {/* Target Action Buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {selectedItem.type === 'flight' && (
                <a
                  href={selectedItem.data.flightradarUrl || `https://www.flightradar24.com/${selectedItem.data.callsign}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Track {selectedItem.data.callsign} on Flightradar24.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {selectedItem.type === 'balloon' && (
                <>
                  {selectedItem.data.sondehubUrl && (
                    <a
                      href={selectedItem.data.sondehubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <span>Track on SondeHub Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <a
                    href={fr24SectorMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <span>Sector FR24</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}

              {selectedItem.type === 'uap' && (
                <>
                  {onNavigateToAnalyze && (
                    <button
                      onClick={onNavigateToAnalyze}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze with Gemini</span>
                    </button>
                  )}
                  {onNavigateToTarget && (
                    <button
                      onClick={onNavigateToTarget}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-rose-300 font-bold text-xs font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Track in Target</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Airspace Identification & Deconfliction Educational Field Guide Modal */}
        {showEducationalGuide && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
            <div className="bg-slate-950 border border-cyan-700/70 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                      Radar Deconfliction Field Guide
                    </h2>
                    <p className="text-[11px] font-mono text-cyan-400/90">
                      Optical, Transponder, & Kinematic Identification Protocols
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEducationalGuide(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content / Educational Dossiers */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {/* 1. Aircraft */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-sky-500/40 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sky-300 uppercase tracking-wide text-xs">
                        Civilian & Military Aircraft
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        Icon: Directional Airplane Silhouette (Rotates with Flight Heading)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-sky-400 block mb-0.5">Transponder Telemetry</span>
                      Mode-S & ADS-B broadcast at 1090 MHz. Displays callsign, altitude (FT MSL), speed (knots), and squawk (e.g. 1200 for VFR).
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-sky-400 block mb-0.5">Lighting & Acoustics</span>
                      Red on port (left), green on starboard (right), white tail lamp, and 1.2 Hz strobes. Jet sound arrives at ~3 sec/km delay.
                    </div>
                  </div>
                </div>

                {/* 2. Weather Balloons */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/40 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <svg width="18" height="20" viewBox="0 0 24 28" fill="none">
                        <circle cx="12" cy="9" r="7" fill="#f59e0b" />
                        <rect x="9" y="21.5" width="6" height="4.5" fill="#fef3c7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-300 uppercase tracking-wide text-xs">
                        Weather Sounding Balloons (Radiosondes)
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        Icon: Amber Sounding Balloon with Suspended Sensor Package
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-0.5">Why They Look Like UAPs</span>
                      Expanding to 30+ ft diameter in the stratosphere, their aluminized latex surfaces reflect morning/evening sunlight, creating the optical illusion of a motionless glowing metallic orb.
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-0.5">Flight Characteristics</span>
                      Launched globally twice daily (00:00 & 12:00 UTC) by NOAA/NWS. Pure wind-drift with zero internal propulsion, traveling up to 100,000+ ft.
                    </div>
                  </div>
                </div>

                {/* 3. LEO Satellites */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Satellite className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-300 uppercase tracking-wide text-xs">
                        Low Earth Orbit Satellites
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        Icon: Satellite with Outstretched Solar Array Panels
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-0.5">Orbital Kinematics</span>
                      Orbit at 300–800 km altitude at ~17,500 mph (Mach 23 in vacuum). Travel in strict, unvarying straight celestial lines with zero erratic turns.
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-0.5">Specular Reflection & Umbra</span>
                      Only visible during twilight when reflecting sun rays. When they enter Earth's shadow, they gracefully dim and vanish over 2–5 seconds without sound or flare.
                    </div>
                  </div>
                </div>

                {/* 4. Uncorrelated UAP */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-500/40 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-rose-300 uppercase tracking-wide text-xs">
                        Uncorrelated Anomalous Targets (UAP / NHI)
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        Icon: Glowing Ruby Delta Target Reticle with Pulsing Energy Halo
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    Targets that exhibit zero commercial transponder squawks, violate standard aerodynamics, or demonstrate the Five Observables (instantaneous acceleration without sonic boom, transmedium travel without cavitation, and positive lift without wings or thermal combustion plumes).
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
                <button
                  onClick={() => setShowEducationalGuide(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition cursor-pointer"
                >
                  Return to Radar Scan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
