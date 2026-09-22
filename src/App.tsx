import React, { useState, useEffect } from 'react';
import { 
  Camera, Crosshair, Radar, ListFilter, Activity, MessageSquare, Bell, 
  HardDrive, Compass, ShieldAlert, Sparkles, Plus, MapPin, 
  Settings, Share2, Info, ChevronRight, ChevronDown, Volume2, VolumeX, Landmark, ScanSearch,
  FileText, Radio
} from 'lucide-react';
import { 
  LocationCoords, SightingReport, FlightTrack, CelestialBody, 
  SatelliteTrack, AlertNotification, TargetLockData, WeatherBalloonTrack 
} from './types';
import { 
  MOCK_SIGHTINGS, MOCK_FLIGHTS, MOCK_CELESTIAL_BODIES, 
  MOCK_ALERTS 
} from './data/mockData';
import { 
  loadSightingsFromStorage, 
  saveSightingsToStorage, 
  loadLocationPreference, 
  saveLocationPreference 
} from './lib/storage';

// Core Components
import { CheckEngineLogo } from './components/CheckEngineLogo';
import conceptOneImg from './assets/images/concept_one_obd_1789670680785.jpg';
import { TargetSkyScanner } from './components/ArSkyScanner';
import { SkyRadarMap } from './components/SkyRadarMap';
import { SightingFeed } from './components/SightingFeed';
import { AnalyzeHub } from './components/AnalyzeHub';
import { ReportCenter } from './components/ReportCenter';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

// Modals
import { CreateReportModal } from './components/CreateReportModal';
import { SightingDetailModal } from './components/SightingDetailModal';
import { EncryptedChatModal } from './components/EncryptedChatModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { MediaVaultModal } from './components/MediaVaultModal';
import { SightlineTriangulationModal } from './components/SightlineTriangulationModal';
import { UapClassesGuideModal } from './components/UapClassesGuideModal';
import { LogoStudioModal } from './components/LogoStudioModal';
import { GpsPermissionModal } from './components/GpsPermissionModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { SoundOptionsModal } from './components/SoundOptionsModal';
import { unlockAudioContext } from './components/ar/ArAudioSynthesizer';
import { loadSoundSettings, subscribeSoundSettings, SoundSettings } from './lib/soundSettings';

type MainTab = 'target' | 'radar' | 'analyze' | 'report';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<MainTab>('target');
  const [isTargetFullView, setIsTargetFullView] = useState<boolean>(false);

  // Location Telemetry
  const [userLocation, setUserLocation] = useState<LocationCoords>(() => {
    return loadLocationPreference() || {
      lat: 35.0844,
      lng: -106.6504,
      city: 'Albuquerque',
      region: 'New Mexico, USA'
    };
  });

  // Data Collections
  const [sightings, setSightings] = useState<SightingReport[]>(() => {
    return loadSightingsFromStorage();
  });
  const [flights, setFlights] = useState<FlightTrack[]>(MOCK_FLIGHTS);
  const [balloons, setBalloons] = useState<WeatherBalloonTrack[]>([]);
  const [satellites, setSatellites] = useState<SatelliteTrack[]>([]);
  const [celestialBodies, setCelestialBodies] = useState<CelestialBody[]>(MOCK_CELESTIAL_BODIES);
  const [alerts, setAlerts] = useState<AlertNotification[]>(MOCK_ALERTS);

  // Active Target Telemetry from AR
  const [currentTargetLock, setCurrentTargetLock] = useState<TargetLockData | null>(null);

  // Modal States
  const [selectedSighting, setSelectedSighting] = useState<SightingReport | null>(null);
  const [isCreateReportOpen, setIsCreateReportOpen] = useState<boolean>(false);
  const [prefilledPhotoUrl, setPrefilledPhotoUrl] = useState<string | undefined>(undefined);
  const [prefilledDescription, setPrefilledDescription] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isTriangulationOpen, setIsTriangulationOpen] = useState<boolean>(false);
  const [isUapGuideOpen, setIsUapGuideOpen] = useState<boolean>(false);
  const [isLogoStudioOpen, setIsLogoStudioOpen] = useState<boolean>(false);

  const [isGpsHelpOpen, setIsGpsHelpOpen] = useState<boolean>(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [isSoundOptionsOpen, setIsSoundOptionsOpen] = useState<boolean>(false);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(loadSoundSettings);

  // Synchronize sound settings across the application
  useEffect(() => {
    const unsubscribe = subscribeSoundSettings((newSettings) => {
      setSoundSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  // Status bar time
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync sightings with local storage
  useEffect(() => {
    saveSightingsToStorage(sightings);
  }, [sightings]);

  // Fetch real-world airspace data around sector (ADS-B flights, NOAA weather balloons, LEO satellites)
  const fetchSectorAirspace = async () => {
    try {
      const [flightsRes, balloonsRes, satsRes] = await Promise.allSettled([
        fetch(`/api/flights?lat=${userLocation.lat}&lng=${userLocation.lng}`),
        fetch(`/api/weather-balloons?lat=${userLocation.lat}&lng=${userLocation.lng}`),
        fetch(`/api/satellites?lat=${userLocation.lat}&lng=${userLocation.lng}`)
      ]);

      if (flightsRes.status === 'fulfilled' && flightsRes.value.ok) {
        const data = await flightsRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          setFlights(data);
        }
      }

      if (balloonsRes.status === 'fulfilled' && balloonsRes.value.ok) {
        const data = await balloonsRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          setBalloons(data);
        }
      }

      if (satsRes.status === 'fulfilled' && satsRes.value.ok) {
        const data = await satsRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          setSatellites(data);
        }
      }
    } catch {
      // Keep existing sector telemetry
    }
  };

  useEffect(() => {
    fetchSectorAirspace();
    const interval = setInterval(fetchSectorAirspace, 20000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // Request HTML5 Geolocation with reverse geocode and gentle fallback
  const requestLiveGps = () => {
    unlockAudioContext();
    if (!navigator.geolocation) {
      setIsGpsHelpOpen(true);
      return;
    }

    const onGpsSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      let city = `Sector (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
      let region = 'Live GPS Sector';

      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.city) city = data.city;
          if (data.region) region = data.region;
        }
      } catch {
        // keep fallback
      }

      const newLoc: LocationCoords = { lat, lng, city, region };
      setUserLocation(newLoc);
      saveLocationPreference(newLoc);
    };

    const onGpsError = (err: GeolocationPositionError) => {
      console.warn('High accuracy GPS error, trying low accuracy fallback:', err);
      navigator.geolocation.getCurrentPosition(
        onGpsSuccess,
        (fallbackErr) => {
          console.warn('Geolocation failed completely:', fallbackErr);
          setIsGpsHelpOpen(true);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(onGpsSuccess, onGpsError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    });
  };

  const handleIpLocationFallback = async () => {
    try {
      const res = await fetch('/api/ip-location');
      if (res.ok) {
        const data = await res.json();
        if (data.lat && data.lng) {
          const newLoc: LocationCoords = {
            lat: data.lat,
            lng: data.lng,
            city: data.city || 'Albuquerque',
            region: data.region || 'New Mexico, USA'
          };
          setUserLocation(newLoc);
          saveLocationPreference(newLoc);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleUpvoteSighting = (id: string) => {
    setSightings((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const upvoted = !s.upvotedByMe;
          return {
            ...s,
            upvotedByMe: upvoted,
            upvotes: upvoted ? s.upvotes + 1 : s.upvotes - 1
          };
        }
        return s;
      })
    );
  };

  const handleAddSighting = (newSighting: SightingReport) => {
    setSightings((prev) => [newSighting, ...prev]);
    // Also create a local alert
    const newAlert: AlertNotification = {
      id: `alert-${Date.now()}`,
      title: 'New Incident Submitted',
      message: `${newSighting.title} reported in ${newSighting.locationName} (${newSighting.probabilityScore}% Anomaly).`,
      timestamp: new Date().toISOString(),
      type: 'ANOMALY_CONFIRMED',
      priority: 'HIGH',
      location: newSighting.locationName,
      read: false
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <OfflineIndicator />

        {/* iOS Dynamic Island & Tactical Status Bar (Mobile-first with safe-area padding) */}
        {!isTargetFullView && (
          <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 pt-safe pb-2 select-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
              {/* Left: Check Engine Logo & DTC code badge */}
              <button
                onClick={() => setIsLogoStudioOpen(true)}
                className="flex items-center space-x-1.5 sm:space-x-2.5 text-left group cursor-pointer focus:outline-none min-h-[44px] py-0.5 shrink-0"
                title="Tap to customize Check Sky Light branding & DTC fault codes"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0 group-hover:scale-105 transition bg-slate-900">
                  <img
                    src={conceptOneImg}
                    alt="Check Sky Light Icon - Candidate 1"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/40 rounded-xl pointer-events-none" />
                </div>
                <div>
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <span className="text-[12px] xs:text-[13px] sm:text-sm font-black tracking-wider text-slate-100 uppercase group-hover:text-amber-400 transition whitespace-nowrap">
                      CHECK SKY LIGHT
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      v1.4
                    </span>
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-mono font-black bg-amber-500 text-slate-950 uppercase tracking-tight">
                      CANDIDATE 1
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono hidden md:block truncate max-w-[190px]">
                    OBD-II DIAGNOSTIC // P1947 LIFT
                  </p>
                </div>
              </button>

              {/* Right: Unified Mobile Action Capsule (Sector + Vault + Comms + Alerts) */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 bg-white/[0.03] border border-white/10 rounded-2xl p-0.5 sm:p-1 backdrop-blur-md shrink-0">
                {/* Sector Selector */}
                <button
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-mono text-cyan-300 transition cursor-pointer min-h-[38px]"
                  title="Change sector / view UAP hotspots"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold truncate max-w-[65px] xs:max-w-[90px] sm:max-w-[120px] text-[11px] sm:text-xs">
                    {userLocation.city || 'Sector'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-cyan-400/70 shrink-0" />
                </button>

                {/* Acoustic & Sound Options (Stealth by Default for Clean Mic Encounter Capture) */}
                <button
                  onClick={() => setIsSoundOptionsOpen(true)}
                  className={`p-2 rounded-xl transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative ${
                    !soundSettings.soundEnabled
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-white/[0.06]'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.06]'
                  }`}
                  title={
                    !soundSettings.soundEnabled
                      ? "Acoustic Silence: ACTIVE (Speaker muted for pure microphone encounter capture). Tap to configure."
                      : "Audible Tactical HUD: ACTIVE (Speaker sound enabled). Tap to configure."
                  }
                  aria-label="Sound and Acoustic Options"
                >
                  {!soundSettings.soundEnabled ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span
                    className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                      !soundSettings.soundEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                </button>

                {/* Offline Media Vault */}
                <button
                  onClick={() => setIsVaultOpen(true)}
                  className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative"
                  title="Open Offline Media Vault"
                >
                  <HardDrive className="w-4 h-4" />
                </button>

                {/* Encrypted Sector Chat */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative"
                  title="Open Encrypted Sector Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                </button>

                {/* Airspace Alerts */}
                <button
                  onClick={() => setIsAlertsOpen(true)}
                  className="p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-white/[0.06] transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative"
                  title="Airspace Anomaly Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white shadow-sm">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>

                {/* UAP Incident Feed Quick Monitor */}
                <button
                  onClick={() => {
                    setActiveTab('analyze');
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative"
                  title="Monitor Live UAP Community Incident Stream"
                >
                  <Radio className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Viewport */}
        <main className={`flex-1 w-full mx-auto flex flex-col ${
          isTargetFullView && activeTab === 'target'
            ? 'p-0 mb-0 max-w-none'
            : activeTab === 'target'
              ? 'p-2 sm:p-3 pb-24 sm:pb-28 max-w-5xl flex-1'
              : 'max-w-7xl p-3 sm:p-5 pb-28 sm:pb-32'
        }`}>
          {activeTab === 'target' && (
            <div className="w-full">
              <TargetSkyScanner
                userLocation={userLocation}
                flights={flights}
                celestialBodies={celestialBodies}
                onTargetLocked={(target) => setCurrentTargetLock(target)}
                onCaptureForReport={(mediaUrl, description) => {
                  setPrefilledPhotoUrl(mediaUrl);
                  setPrefilledDescription(description);
                  setIsCreateReportOpen(true);
                }}
                onOpenVault={() => setIsVaultOpen(true)}
                onOpenSoundOptions={() => setIsSoundOptionsOpen(true)}
                isFullView={isTargetFullView}
                onToggleFullView={(full) => setIsTargetFullView(full)}
              />
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="space-y-4">
              <SkyRadarMap
                userLocation={userLocation}
                flights={flights}
                sightings={sightings}
                satellites={satellites}
                balloons={balloons}
                currentTargetLock={currentTargetLock}
                targetBearing={currentTargetLock?.azimuthDeg}
                onSelectSighting={(s) => setSelectedSighting(s)}
                onRefreshAirspace={fetchSectorAirspace}
                onNavigateToAnalyze={() => setActiveTab('analyze')}
                onNavigateToTarget={() => setActiveTab('target')}
                onOpenTriangulation={() => setIsTriangulationOpen(true)}
              />

              {/* TARGET DUAL-LENS AI SCANNER READY & UAP REFERENCE (Moved from Target page) */}
              <div className="glass-panel border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-slate-100">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>TARGET DUAL-LENS AI SCANNER READY</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">
                    Quick Camera view with Gemini AI auto lock-on using iPhone gyro, compass, and accelerometer sensors. Deconflicts ADS-B civilian flights vs anomalous metric signatures.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsTriangulationOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Compass className="w-4 h-4 text-teal-400" />
                    <span>Triangulate Sightlines</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('target')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    <span>Target Camera</span>
                  </button>
                  <button
                    onClick={() => setIsUapGuideOpen(true)}
                    className="px-3.5 py-2 rounded-xl glass-pill text-slate-300 font-bold hover:text-white transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Landmark className="w-4 h-4 text-cyan-400" />
                    <span>9 Observed UAP Classes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analyze' && (
            <AnalyzeHub
              sightings={sightings}
              userLocation={userLocation}
              onSelectSighting={(s) => setSelectedSighting(s)}
              onUpvote={handleUpvoteSighting}
              onOpenCreateReport={() => {
                setPrefilledPhotoUrl(undefined);
                setPrefilledDescription(undefined);
                setIsCreateReportOpen(true);
              }}
              onOpenUapClassesGuide={() => setIsUapGuideOpen(true)}
              onOpenVault={() => setIsVaultOpen(true)}
              onOpenTriangulation={() => setIsTriangulationOpen(true)}
              onAddAnalyzedSighting={(newSighting) => handleAddSighting(newSighting)}
              onNavigateToReport={() => setActiveTab('report')}
              onNavigateToRadar={() => setActiveTab('radar')}
              onNavigateToTarget={() => setActiveTab('target')}
            />
          )}

          {activeTab === 'report' && (
            <ReportCenter
              sightings={sightings}
              userLocation={userLocation}
              onNavigateToTarget={() => setActiveTab('target')}
              onNavigateToRadar={() => setActiveTab('radar')}
              onNavigateToAnalyze={() => setActiveTab('analyze')}
              onAddSighting={handleAddSighting}
              onOpenFeed={() => setActiveTab('analyze')}
            />
          )}
        </main>

        {/* Bottom iPhone Tactical Navigation Bar (Hidden when in Target Full View) */}
        {!isTargetFullView && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 pt-1.5 px-2 sm:px-4 select-none safe-area-pb pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
            <div className="max-w-md mx-auto flex items-center justify-around">
              <button
                onClick={() => {
                  unlockAudioContext();
                  setActiveTab('target');
                }}
                className={`flex flex-col items-center space-y-1 transition cursor-pointer py-1 px-3 rounded-2xl min-h-[48px] justify-center ${
                  activeTab === 'target' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'target' ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : ''}`}>
                  <Crosshair className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase">Target</span>
              </button>

              <button
                onClick={() => {
                  unlockAudioContext();
                  setActiveTab('radar');
                }}
                className={`flex flex-col items-center space-y-1 transition cursor-pointer py-1 px-3 rounded-2xl min-h-[48px] justify-center ${
                  activeTab === 'radar' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'radar' ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : ''}`}>
                  <Radar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase">Radar</span>
              </button>

              <button
                onClick={() => {
                  unlockAudioContext();
                  setActiveTab('analyze');
                }}
                className={`flex flex-col items-center space-y-1 transition cursor-pointer py-1 px-3 rounded-2xl min-h-[48px] justify-center ${
                  activeTab === 'analyze' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'analyze' ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : ''}`}>
                  <ScanSearch className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase">Analyze</span>
              </button>

              <button
                onClick={() => {
                  unlockAudioContext();
                  setActiveTab('report');
                }}
                className={`flex flex-col items-center space-y-1 transition cursor-pointer py-1 px-3 rounded-2xl min-h-[48px] justify-center ${
                  activeTab === 'report' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'report' ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : ''}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase">Report</span>
              </button>
            </div>
          </nav>
        )}

        {/* --- ALL INTERACTIVE MODALS --- */}
        <CreateReportModal
          isOpen={isCreateReportOpen}
          onClose={() => setIsCreateReportOpen(false)}
          onSubmit={handleAddSighting}
          userLocation={userLocation}
          prefilledPhotoUrl={prefilledPhotoUrl}
          prefilledDescription={prefilledDescription}
        />

        <SightingDetailModal
          sighting={selectedSighting}
          onClose={() => setSelectedSighting(null)}
          onUpvote={handleUpvoteSighting}
          onOpenTriangulation={() => setIsTriangulationOpen(true)}
        />

        <EncryptedChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentSector={userLocation.city || 'Pacific Sector'}
        />

        <AlertsDrawer
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          alerts={alerts}
          userLocation={userLocation}
          onOpenLocationPicker={() => {
            setIsAlertsOpen(false);
            setIsLocationPickerOpen(true);
          }}
          onMarkAllAsRead={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
        />

        <MediaVaultModal
          isOpen={isVaultOpen}
          onClose={() => setIsVaultOpen(false)}
          onSelectForReport={(media) => {
            const dataUrl = media.dataUrl || media.burstFrames?.[0];
            if (dataUrl) {
              setPrefilledPhotoUrl(dataUrl);
              setPrefilledDescription(`Incident capture from local vault: AZ ${media.telemetry.azimuth.toFixed(1)}°, EL ${media.telemetry.pitch.toFixed(1)}°.`);
              setIsCreateReportOpen(true);
            }
          }}
        />

        <SightlineTriangulationModal
          isOpen={isTriangulationOpen}
          onClose={() => setIsTriangulationOpen(false)}
          userLocation={userLocation}
          currentTargetLock={currentTargetLock}
          currentAzimuth={currentTargetLock?.azimuthDeg || 215}
          currentPitch={currentTargetLock?.elevationDeg || 38}
        />

        <UapClassesGuideModal
          isOpen={isUapGuideOpen}
          onClose={() => setIsUapGuideOpen(false)}
        />

        <LogoStudioModal
          isOpen={isLogoStudioOpen}
          onClose={() => setIsLogoStudioOpen(false)}
        />

        <GpsPermissionModal
          isOpen={isGpsHelpOpen}
          onClose={() => setIsGpsHelpOpen(false)}
          onRetryGps={requestLiveGps}
          onIpLocationFallback={handleIpLocationFallback}
          onOpenManualSelector={() => {
            setIsGpsHelpOpen(false);
            setIsLocationPickerOpen(true);
          }}
        />

        <LocationPickerModal
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          currentLocation={userLocation}
          userLocation={userLocation}
          onUseDeviceGPS={requestLiveGps}
          onSelectLocation={(newLoc) => {
            setUserLocation(newLoc);
            saveLocationPreference(newLoc);
          }}
        />

        <SoundOptionsModal
          isOpen={isSoundOptionsOpen}
          onClose={() => setIsSoundOptionsOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
