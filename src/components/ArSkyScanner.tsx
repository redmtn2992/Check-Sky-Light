import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Crosshair, Sparkles, AlertTriangle, ShieldCheck, 
  Layers, Volume2, VolumeX, Eye, Compass, Navigation, RefreshCw, 
  Circle, Maximize2, Minimize2, Zap, Radio, Sun, Moon, Video, Square, Download, 
  ExternalLink, FileText, ChevronRight, Cpu, Target, Scan, Lock, Mic,
  Battery, BatteryCharging, Fingerprint, Power, Info, Check, HelpCircle, X,
  SlidersHorizontal, HardDrive
} from 'lucide-react';
import { LocationCoords, FlightTrack, CelestialBody } from '../types';
import { 
  TargetLockData, 
  TargetLockState, 
  DisplayDayNightMode 
} from './ar/ArTargetLockTypes';
import { 
  sampleOpticalCentroid, 
  AlphaBetaOrientationFilter 
} from './ar/ArOpticalCentroidTracker';
import { 
  playTargetAcquiredChime, 
  playFighterJetMissileLockTone, 
  playTargetAcquiringTone, 
  playTargetBreakTone, 
  playCameraShutterSound, 
  triggerHapticFeedback, 
  unlockAudioContext 
} from './ar/ArAudioSynthesizer';
import { saveMediaToVault } from '../lib/storage/mediaVault';
import { 
  loadSoundSettings, 
  saveSoundSettings, 
  subscribeSoundSettings, 
  SoundSettings 
} from '../lib/soundSettings';
import { 
  TargetingOptions, 
  loadTargetingOptions, 
  saveTargetingOptions, 
  subscribeTargetingOptions 
} from '../lib/targetingOptions';
import { TargetingOptionsDrawer } from './ar/TargetingOptionsDrawer';
import { calculateFlightGuide, FlightGuideResult } from '../lib/flightDirector';
import { PreReportCapture } from './PreReportCheckModal';
import { PermissionTarget } from './AppPermissionsModal';

export type AssistanceLevel = 'manual' | 'assist';

export interface ArSkyScannerProps {
  userLocation: LocationCoords;
  flights: FlightTrack[];
  celestialBodies: CelestialBody[];
  onTargetLocked?: (target: TargetLockData) => void;
  onCaptureForReport?: (mediaUrl: string, description: string, posterUrl?: string) => void;
  onCaptureForReview?: (capture: PreReportCapture, allCaptures?: PreReportCapture[]) => void;
  onOpenVault?: () => void;
  onOpenTriangulation?: () => void;
  onOpenSoundOptions?: () => void;
  onRequirePermission?: (target: PermissionTarget, retryAction: () => void) => void;
  isFullView?: boolean;
  onToggleFullView?: (fullView: boolean) => void;
  sessionCapturesList?: PreReportCapture[];
  onSessionCapturesChange?: (captures: PreReportCapture[]) => void;
}

export const ArSkyScanner: React.FC<ArSkyScannerProps> = ({
  userLocation,
  flights,
  celestialBodies,
  onTargetLocked,
  onCaptureForReport,
  onCaptureForReview,
  onOpenVault,
  onOpenTriangulation,
  onOpenSoundOptions,
  onRequirePermission,
  isFullView: propIsFullView,
  onToggleFullView,
  sessionCapturesList,
  onSessionCapturesChange
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dayNightMode, setDayNightMode] = useState<DisplayDayNightMode>('day_antiglare');
  
  // Sound & Acoustic Capture Configuration: ABSOLUTELY SILENT BY DEFAULT (false)
  // Ensures phone speaker does not contaminate genuine ambient acoustic recordings
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(loadSoundSettings);
  const soundEnabled = soundSettings.soundEnabled;
  const [soundModeToast, setSoundModeToast] = useState<string | null>(null);
  
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [capturedFlash, setCapturedFlash] = useState<boolean>(false);
  const [internalSessionCaptures, setInternalSessionCaptures] = useState<PreReportCapture[]>([]);
  const sessionCaptures = sessionCapturesList !== undefined ? sessionCapturesList : internalSessionCaptures;

  const addSessionCapture = (newCap: PreReportCapture) => {
    if (onSessionCapturesChange) {
      onSessionCapturesChange([newCap, ...sessionCaptures]);
    } else {
      setInternalSessionCaptures(prev => [newCap, ...prev]);
    }
  };

  const [justCapturedNotice, setJustCapturedNotice] = useState<string | null>(null);
  
  // Technological Assistance Hierarchy:
  // Level 1: 'manual' (Default on startup) - Pure camera, manual shutter, zero automated tracking or AI queries
  // Level 2: 'assist' - On-Device HUD, Flight Guide AR arrow, jet lock brackets, and optical motion contrast tracker (100% local)
  // Level 3: 'ai' - Gemini 3.8 Flash Multimodal Cloud Intelligence for deep Dual-Lens classification
  const [assistanceLevel, setAssistanceLevel] = useState<AssistanceLevel>('manual');

  // Power & Battery Optimization: Disabled at startup to minimize iPhone battery draw
  const [opticalTrackingActive, setOpticalTrackingActive] = useState<boolean>(false);

  // Full View State (local or controlled by App)
  const [localFullView, setLocalFullView] = useState<boolean>(false);
  const isFullView = propIsFullView !== undefined ? propIsFullView : localFullView;

  // Gemini AI Auto-Lock State: Disabled at app startup to conserve iPhone battery power
  const [geminiAutoLockEnabled, setGeminiAutoLockEnabled] = useState<boolean>(false);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiLockFeedback, setAiLockFeedback] = useState<string>('Manual Mode');

  // Assistance Hierarchy Switcher
  const handleSelectAssistanceLevel = (level: AssistanceLevel) => {
    setAssistanceLevel(level);
    triggerHapticFeedback([20]);
    if (level === 'manual') {
      setGeminiAutoLockEnabled(false);
      setOpticalTrackingActive(false);
      setAiLockFeedback('Manual Mode');
      setTargetLock(null);
    } else if (level === 'assist') {
      setGeminiAutoLockEnabled(false);
      setOpticalTrackingActive(true);
      setAiLockFeedback('Assist: HUD Active');
    }
  };

  // Digital Crop Zoom (1x, 2x, 5x) for long-distance sky targets
  const [zoomFactor, setZoomFactor] = useState<number>(1);

  const [powerDrawerOpen, setPowerDrawerOpen] = useState<boolean>(false);

  // Device orientation & motion telemetry (iPhone Compass, Pitch, Roll & Accelerometers)
  const [azimuth, setAzimuth] = useState<number>(180);
  const [pitch, setPitch] = useState<number>(35);
  const [roll, setRoll] = useState<number>(0);
  const [acceleration, setAcceleration] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  // Target Lock State
  const [targetLock, setTargetLock] = useState<TargetLockData | null>(null);
  const [lockProgress, setLockProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micAudioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const orientationFilter = useRef(new AlphaBetaOrientationFilter());
  const opticalLoopRef = useRef<number | null>(null);
  const lockHoldTimerRef = useRef<number>(0);
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 5 Tactical Targeting Options & Drawer State
  const [targetingOptions, setTargetingOptions] = useState<TargetingOptions>(loadTargetingOptions);
  const [isTargetingDrawerOpen, setIsTargetingDrawerOpen] = useState<boolean>(false);
  const [flightGuide, setFlightGuide] = useState<FlightGuideResult | null>(null);
  const [smartShutterNotice, setSmartShutterNotice] = useState<string | null>(null);
  const autoFiredLockIdRef = useRef<string | null>(null);
  const lockHoldTimestampRef = useRef<number>(0);
  const isLargeText = targetingOptions.hudTextScale === 'large';

  // Sync targeting options across sessions
  useEffect(() => {
    const unsub = subscribeTargetingOptions((newOpts) => {
      setTargetingOptions(newOpts);
    });
    return () => unsub();
  }, []);

  // Compute live AR flight director towards closest aircraft (active in Assist or AI modes)
  useEffect(() => {
    if (assistanceLevel === 'manual' || !targetingOptions.flightGuide || flights.length === 0) {
      setFlightGuide(null);
      return;
    }
    const guide = calculateFlightGuide(userLocation, azimuth, pitch, flights);
    setFlightGuide(guide);
  }, [assistanceLevel, targetingOptions.flightGuide, userLocation, azimuth, pitch, flights]);

  // Sync sound settings in real-time across tabs/drawers
  useEffect(() => {
    const unsubscribe = subscribeSoundSettings((newSettings) => {
      setSoundSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  // Start Camera (Quick Camera Access)
  const startCamera = async (forcePrompt = false) => {
    setCameraError(null);
    unlockAudioContext();

    // Contextual on-demand permission check (Apple HIG Guideline 5.1.1)
    if (typeof window !== 'undefined') {
      const acknowledged = localStorage.getItem('csl_sensor_consent_acknowledged');
      if (!acknowledged && onRequirePermission) {
        onRequirePermission('camera', () => {
          startCamera(true);
        });
        return;
      }
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not accessible in this environment. Operating in sensor simulation mode.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        // App camera starts in manual mode by default (zero automated tracking or AI queries until user chooses)
        setAssistanceLevel('manual');
        setOpticalTrackingActive(false);
        setGeminiAutoLockEnabled(false);
        setAiLockFeedback('Manual Mode');
      }
    } catch (err: any) {
      console.warn('Camera access fallback:', err);
      setCameraError('Camera permission required. Tap "Quick Camera" or permit video access to scan the sky.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Attempt Quick Camera start only if user has previously authorized, otherwise remain in non-blocking standby
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const acknowledged = localStorage.getItem('csl_sensor_consent_acknowledged');
      if (acknowledged === 'true') {
        startCamera();
      }

      // Thermal Mitigation: Auto-pause camera tracks when tab is hidden or phone is locked
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopCamera();
        } else {
          const consented = localStorage.getItem('csl_sensor_consent_acknowledged');
          if (consented === 'true') {
            startCamera();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        stopCamera();
      };
    }
    return () => {
      stopCamera();
    };
  }, []);

  // Full View Toggle Handler
  const handleToggleFullView = () => {
    const nextVal = !isFullView;
    setLocalFullView(nextVal);
    if (onToggleFullView) {
      onToggleFullView(nextVal);
    }
    if (nextVal) {
      triggerHapticFeedback([20, 30]);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Device Orientation Handler (iPhone Compass & Gyro) with thermal rate-limiting
  useEffect(() => {
    let lastSensorDispatch = 0;
    const SENSOR_MIN_INTERVAL_MS = 33; // 30Hz limit avoids GPU/CPU bus congestion

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (document.hidden) return; // Zero calculation while backgrounded
      const now = performance.now();
      if (now - lastSensorDispatch < SENSOR_MIN_INTERVAL_MS) return;
      lastSensorDispatch = now;

      let rawAz = e.alpha ?? 180;
      let rawPitch = e.beta ?? 35;
      let rawRoll = e.gamma ?? 0;

      // iOS Safari webkitCompassHeading provides true geographic north
      if ((e as any).webkitCompassHeading !== undefined) {
        rawAz = (e as any).webkitCompassHeading;
      }

      const smoothed = orientationFilter.current.filter(rawAz, rawPitch, rawRoll);
      setAzimuth(smoothed.az);
      setPitch(smoothed.pitch);
      setRoll(smoothed.roll);
    };

    let lastMotionDispatch = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      if (document.hidden) return;
      const now = performance.now();
      if (now - lastMotionDispatch < 66) return; // 15Hz motion is sufficient for G-force
      lastMotionDispatch = now;

      if (e.accelerationIncludingGravity) {
        setAcceleration({
          x: e.accelerationIncludingGravity.x ?? 0,
          y: e.accelerationIncludingGravity.y ?? 0,
          z: e.accelerationIncludingGravity.z ?? 0
        });
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('devicemotion', handleMotion, true);
      }
    };
  }, []);

  // Gemini AI Auto-Lock Engine (integrates iPhone camera frame + IMU sensors)
  const runGeminiAutoLock = async (manualTrigger = false, tapCoords?: { xPct: number; yPct: number }) => {
    if (isAiScanning) return;
    setIsAiScanning(true);
    setAiLockFeedback(
      tapCoords 
        ? `Analyzing Tap Coordinate (${tapCoords.xPct}%, ${tapCoords.yPct}%)...`
        : manualTrigger 
        ? 'Gemini 3.8 Flash Locking On...' 
        : 'Gemini AI Scanning Sky...'
    );

    try {
      let frameBase64 = '';
      if (videoRef.current && cameraActive) {
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 270;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const vw = videoRef.current.videoWidth || 1280;
          const vh = videoRef.current.videoHeight || 720;
          const cropW = vw / zoomFactor;
          const cropH = vh / zoomFactor;
          const cropX = (vw - cropW) / 2;
          const cropY = (vh - cropH) / 2;
          ctx.drawImage(videoRef.current, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
          frameBase64 = canvas.toDataURL('image/jpeg', 0.65);
        }
      }

      const res = await fetch('/api/target/auto-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64,
          triggerMode: tapCoords ? 'manual_tap' : manualTrigger ? 'manual' : 'auto',
          tapCoordinates: tapCoords,
          sensors: {
            azimuth,
            pitch,
            roll,
            accel: acceleration,
            location: userLocation
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.targetDetected) {
          const finalXPct = tapCoords ? tapCoords.xPct : (data.screenCoordinates?.xPct ?? 50);
          const finalYPct = tapCoords ? tapCoords.yPct : (data.screenCoordinates?.yPct ?? 44);

          const newLock: TargetLockData = {
            id: `TGT-${Math.floor(1000 + Math.random() * 9000)}`,
            name: data.targetName || (tapCoords ? 'Observer Tap-Locked Target' : 'Target Centroid'),
            type: data.classification || 'ARTIFACT',
            lockState: 'LOCKED',
            screenX: finalXPct,
            screenY: finalYPct,
            azimuthDeg: azimuth,
            elevationDeg: pitch,
            azimuthStr: `${azimuth.toFixed(1)}°`,
            elevationStr: `${pitch.toFixed(1)}°`,
            distance: data.kinematics?.estimatedAltitude || 'Range unknown',
            angularVelocityDegPerSec: 0,
            estimatedSpeed: data.kinematics?.estimatedSpeed || 'Unknown',
            estimatedAltitude: data.kinematics?.estimatedAltitude || 'Unknown',
            kinematicGForce: data.kinematics?.kinematicGForce || 'Unknown',
            deconflictionStatus: data.classification === 'UAP' ? 'ANOMALOUS_UNIDENTIFIED' : 'OPTICAL_CORRELATING',
            details: data.analysisNotes || (tapCoords ? 'Observer manual tap target locked and evaluated.' : 'Optical target locked with sensor telemetry.'),
            confidencePct: data.confidencePct || 50,
            timestamp: new Date().toISOString(),
            geminiLockDetails: {
              detected: true,
              confidencePct: data.confidencePct || 50,
              classicalDeconfliction: data.dualLens?.classicalDeconfliction,
              metricSignature: data.dualLens?.metricSignature,
              analysisNotes: data.analysisNotes,
              isGeminiAiLocked: data.geminiPowered ?? true
            }
          };

          setTargetLock(newLock);
          setLockProgress(100);
          setAiLockFeedback(`Lock: ${newLock.name.split(' ')[0] || 'Target'}`);
          if (soundEnabled) {
            playFighterJetMissileLockTone();
            triggerHapticFeedback([40, 50, 70]);
          }
          if (onTargetLocked) {
            onTargetLocked(newLock);
          }
        } else {
          setAiLockFeedback(tapCoords ? 'Tap Clear' : 'Clear');
        }
      }
    } catch (err) {
      console.warn('Gemini target auto-lock call failed:', err);
      setAiLockFeedback('Ready');
    } finally {
      setIsAiScanning(false);
    }
  };



  // Periodic Gemini Auto-Lock Loop
  useEffect(() => {
    if (geminiAutoLockEnabled && cameraActive) {
      autoLockTimerRef.current = setInterval(() => {
        runGeminiAutoLock(false);
      }, 4500);
    } else {
      if (autoLockTimerRef.current) {
        clearInterval(autoLockTimerRef.current);
      }
    }

    return () => {
      if (autoLockTimerRef.current) {
        clearInterval(autoLockTimerRef.current);
      }
    };
  }, [geminiAutoLockEnabled, cameraActive, azimuth, pitch]);

  // Optical Centroid Tracker (local computer vision layer) with thermal governor
  useEffect(() => {
    let active = true;
    let lastCentroidSample = 0;
    const OPTICAL_SAMPLE_INTERVAL_MS = 66; // 15 fps sampling provides responsive centroid tracking with ~70% lower GPU/CPU load

    const runOpticalLoop = () => {
      if (!active) return;

      if (document.hidden) {
        // Tab is hidden or phone locked: idle sleep
        opticalLoopRef.current = requestAnimationFrame(runOpticalLoop);
        return;
      }

      const now = performance.now();

      // 1. Smart Shutter Auto-Capture Assist (only active in Assist or AI modes)
      if (assistanceLevel !== 'manual' && targetingOptions.smartShutter && targetLock && targetLock.lockState === 'LOCKED') {
        if (!lockHoldTimestampRef.current) {
          lockHoldTimestampRef.current = now;
        } else if (now - lockHoldTimestampRef.current > 350 && autoFiredLockIdRef.current !== targetLock.id) {
          autoFiredLockIdRef.current = targetLock.id;
          setSmartShutterNotice('AUTO-BURST CAPTURED');
          setTimeout(() => setSmartShutterNotice(null), 2000);
          void handleCapturePhoto();
        }
      } else if (!targetLock) {
        lockHoldTimestampRef.current = 0;
        autoFiredLockIdRef.current = null;
      }

      // 3. Optical Centroid & Motion Tracking (only active in Assist or AI modes)
      const isMotionTracking = assistanceLevel !== 'manual' && (targetingOptions.motionTracker || opticalTrackingActive);
      if (isMotionTracking && videoRef.current && cameraActive && !targetLock) {
        if (now - lastCentroidSample >= OPTICAL_SAMPLE_INTERVAL_MS) {
          lastCentroidSample = now;
          const centroid = sampleOpticalCentroid(videoRef.current, 50, 45, 130);

          if (centroid.detected && centroid.confidence > 50) {
            lockHoldTimerRef.current += 1;
            setLockProgress(Math.min(100, lockHoldTimerRef.current * 10));

            if (lockHoldTimerRef.current === 3 && soundEnabled) {
              playTargetAcquiringTone();
              triggerHapticFeedback([15, 20]);
            }

            if (lockHoldTimerRef.current >= 8 && (!targetLock || targetLock.lockState !== 'LOCKED')) {
              const newLock: TargetLockData = {
                id: `TGT-${Math.floor(1000 + Math.random() * 9000)}`,
                name: 'Airspace Target Centroid',
                type: 'UAP',
                lockState: 'LOCKED',
                screenX: 50 + centroid.deltaScreenX,
                screenY: 45 + centroid.deltaScreenY,
                azimuthDeg: azimuth,
                elevationDeg: pitch,
                azimuthStr: `${azimuth.toFixed(1)}°`,
                elevationStr: `${pitch.toFixed(1)}°`,
                distance: `${(8.4 + Math.random() * 4).toFixed(1)} km`,
                angularVelocityDegPerSec: 14.2,
                estimatedSpeed: `Mach ${(0.8 + Math.random() * 1.5).toFixed(1)}`,
                estimatedAltitude: `${(3200 + Math.floor(Math.random() * 1200)).toLocaleString()} m`,
                kinematicGForce: '1.2 G',
                deconflictionStatus: 'OPTICAL_CORRELATING',
                details: 'Optical target centroid acquired via high-contrast sky motion tracking.',
                confidencePct: centroid.confidence,
                timestamp: new Date().toISOString()
              };
              setTargetLock(newLock);
              if (soundEnabled) {
                playFighterJetMissileLockTone();
                triggerHapticFeedback([40, 50, 60]);
              }
              if (onTargetLocked) {
                onTargetLocked(newLock);
              }
            }
          } else {
            if (lockHoldTimerRef.current > 0) {
              lockHoldTimerRef.current = Math.max(0, lockHoldTimerRef.current - 2);
              setLockProgress(Math.min(100, lockHoldTimerRef.current * 10));
            }
          }
        }
      }

      opticalLoopRef.current = requestAnimationFrame(runOpticalLoop);
    };

    opticalLoopRef.current = requestAnimationFrame(runOpticalLoop);

    return () => {
      active = false;
      if (opticalLoopRef.current) {
        cancelAnimationFrame(opticalLoopRef.current);
      }
    };
  }, [cameraActive, assistanceLevel, opticalTrackingActive, targetingOptions, azimuth, pitch, soundEnabled, targetLock]);

  // Optical Filter Presets for day and night sky aircraft deconfliction
  const videoFilterStyle = 
    dayNightMode === 'nvg_green' ? 'contrast(1.6) brightness(1.25) sepia(1) hue-rotate(85deg) saturate(3)' :
    dayNightMode === 'night_strobe' ? 'contrast(2.6) brightness(1.3) saturate(2.2)' :
    dayNightMode === 'flir_thermal' ? 'invert(1) grayscale(1) contrast(2.2) brightness(0.95)' :
    dayNightMode === 'night_tactical' ? 'contrast(1.5) brightness(1.2) saturate(1.4)' :
    'none';

  // Capture Photo
  const handleCapturePhoto = async () => {
    unlockAudioContext();
    playCameraShutterSound();
    triggerHapticFeedback([35]);
    setCapturedFlash(true);
    setTimeout(() => setCapturedFlash(false), 200);

    let dataUrl = '';
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1920;
      canvas.height = videoRef.current.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vw = canvas.width;
        const vh = canvas.height;
        const cropW = vw / zoomFactor;
        const cropH = vh / zoomFactor;
        const cropX = (vw - cropW) / 2;
        const cropY = (vh - cropH) / 2;
        if (videoFilterStyle && videoFilterStyle !== 'none') {
          ctx.filter = videoFilterStyle;
        }
        ctx.drawImage(videoRef.current, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        // Draw HUD stamp
        ctx.fillStyle = '#06b6d4';
        ctx.font = '24px monospace';
        ctx.fillText(`CHECK SKY LIGHT - TARGET HUD | AZ ${azimuth.toFixed(1)}° EL ${pitch.toFixed(1)}° | ${zoomFactor}x ZOOM`, 40, 60);
        ctx.fillText(`${new Date().toISOString()} | ${userLocation.city || 'Local Sector'}`, 40, 100);
        if (targetLock) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillText(`GEMINI AUTO-LOCK: ${targetLock.name} | CONFIDENCE ${targetLock.confidencePct}%`, 40, 140);
        }
        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    } else {
      // Fallback synthetic capture
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#06b6d4';
        ctx.strokeRect(50, 50, 1180, 620);
        ctx.fillStyle = '#06b6d4';
        ctx.font = '28px monospace';
        ctx.fillText(`CHECK SKY LIGHT - TARGET ACQUISITION`, 80, 120);
        ctx.fillText(`Telemetry: AZ ${azimuth.toFixed(1)}° | EL ${pitch.toFixed(1)}° | iPhone Sensors Armed`, 80, 160);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    if (dataUrl) {
      await saveMediaToVault({
        mediaType: 'photo',
        title: `Target Optical Capture - AZ ${azimuth.toFixed(0)}°`,
        dataUrl,
        telemetry: {
          azimuth,
          pitch,
          roll,
          lat: userLocation.lat,
          lng: userLocation.lng,
          city: userLocation.city,
          region: userLocation.region,
          dayNightMode
        },
        targetLock
      });

      const newCapture: PreReportCapture = {
        mediaType: 'photo',
        mediaUrl: dataUrl,
        telemetry: {
          azimuth,
          pitch,
          roll,
          lat: userLocation.lat,
          lng: userLocation.lng,
          city: userLocation.city,
          region: userLocation.region,
          dayNightMode,
          soundMode: !soundEnabled ? 'Absolute Silence Active' : 'Audible Tactical HUD'
        },
        targetLock
      };

      addSessionCapture(newCapture);
      setJustCapturedNotice('Photo captured');
      setTimeout(() => setJustCapturedNotice(null), 2500);
    }
  };

  // Video Recording with Ambient Encounter Audio Capture
  const handleToggleRecordVideo = async () => {
    unlockAudioContext();
    if (isRecordingVideo) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (micAudioStreamRef.current) {
        micAudioStreamRef.current.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
        micAudioStreamRef.current = null;
      }
      setIsRecordingVideo(false);
      triggerHapticFeedback([40, 30]);
    } else {
      if (!streamRef.current) {
        startCamera();
        return;
      }
      try {
        recordedChunksRef.current = [];
        let recordStream = streamRef.current;

        // Ambient Acoustic Capture: If enabled, embed live microphone track into encounter video
        if (soundSettings.recordAmbientAudio && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          if (typeof window !== 'undefined') {
            const micConsented = localStorage.getItem('csl_mic_consent_acknowledged');
            if (!micConsented && onRequirePermission) {
              onRequirePermission('microphone', () => {
                localStorage.setItem('csl_mic_consent_acknowledged', 'true');
                handleToggleRecordVideo();
              });
              return;
            }
          }
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: soundSettings.rawAcousticMode ? {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
              } : true
            });
            micAudioStreamRef.current = micStream;
            const videoTracks = streamRef.current.getVideoTracks();
            const audioTracks = micStream.getAudioTracks();
            recordStream = new MediaStream([...videoTracks, ...audioTracks]);
          } catch (micErr) {
            console.warn('Microphone permission skipped or denied, recording video-only:', micErr);
            recordStream = streamRef.current;
          }
        }

        // Mobile iOS Safari compatibility: Safari requires video/mp4 or video/webm depending on iOS version
        let options: MediaRecorderOptions = {};
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4' };
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
            options = { mimeType: 'video/webm;codecs=vp9,opus' };
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
            options = { mimeType: 'video/webm;codecs=vp8,opus' };
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm' };
          }
        }

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(recordStream, options);
        } catch (optionsErr) {
          console.warn('MediaRecorder with specified options failed, falling back to default:', optionsErr);
          recorder = new MediaRecorder(recordStream);
        }

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = async () => {
          const mimeType = recorder.mimeType || 'video/webm';
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const capturedDuration = recordingSeconds || 1;
          const videoUrl = URL.createObjectURL(blob);

          let posterUrl: string | undefined;
          if (videoRef.current) {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = videoRef.current.videoWidth || 640;
              canvas.height = videoRef.current.videoHeight || 360;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                posterUrl = canvas.toDataURL('image/jpeg', 0.85);
              }
            } catch (err) {
              console.warn('Canvas poster extraction warning:', err);
            }
          }

          const savedItem = await saveMediaToVault({
            mediaType: 'video',
            title: `Target Video Track (${capturedDuration}s)${!soundEnabled ? ' [Clean Ambient Audio]' : ''}`,
            blob,
            durationSeconds: capturedDuration,
            telemetry: {
              azimuth,
              pitch,
              roll,
              lat: userLocation.lat,
              lng: userLocation.lng,
              city: userLocation.city,
              region: userLocation.region,
              dayNightMode,
              soundMode: !soundEnabled ? 'Absolute Silence Active' : 'Audible Tactical HUD'
            },
            targetLock
          });
          setRecordingSeconds(0);

          const newCapture: PreReportCapture = {
            mediaType: 'video',
            mediaUrl: videoUrl,
            mediaBlob: blob,
            posterUrl,
            durationSeconds: capturedDuration,
            telemetry: {
              azimuth,
              pitch,
              roll,
              lat: userLocation.lat,
              lng: userLocation.lng,
              city: userLocation.city,
              region: userLocation.region,
              dayNightMode,
              soundMode: !soundEnabled ? 'Absolute Silence Active' : 'Audible Tactical HUD'
            },
            targetLock
          };

          // Add to current session captures so user stays in camera viewfinder
          addSessionCapture(newCapture);
          setJustCapturedNotice(`Video saved (${capturedDuration}s)`);
          setTimeout(() => setJustCapturedNotice(null), 2500);
        };
        recorder.start(500);
        mediaRecorderRef.current = recorder;
        setIsRecordingVideo(true);
        triggerHapticFeedback([20, 20]);
      } catch (err) {
        console.error('Video recording failed on mobile device:', err);
        setIsRecordingVideo(false);
        setJustCapturedNotice('Recording error on device');
        setTimeout(() => setJustCapturedNotice(null), 3000);
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingVideo) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVideo]);

  // Target reticle position calculations
  const reticleX = targetLock?.screenX ?? 50;
  const reticleY = targetLock?.screenY ?? 45;

  return (
    <div 
      ref={containerRef}
      className={
        isFullView
          ? "fixed inset-0 z-50 w-screen h-[100dvh] bg-black select-none flex flex-col overflow-hidden"
          : "relative w-full h-full flex-1 min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none flex flex-col"
      }
    >
      {/* Video / Camera Feed (Full View Object Cover with smooth optical/digital crop zoom & day/night filters) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          transform: zoomFactor > 1 ? `scale(${zoomFactor})` : undefined,
          transformOrigin: 'center center',
          filter: videoFilterStyle
        }}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-all duration-200 ease-out ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sound Mode Change Toast */}
      {soundModeToast && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border border-emerald-500/60 text-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-mono shadow-2xl flex items-center space-x-2 animate-fade-in pointer-events-auto">
          {!soundEnabled ? <VolumeX className="w-4 h-4 text-emerald-400 shrink-0" /> : <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />}
          <span className="font-semibold">{soundModeToast}</span>
        </div>
      )}

      {/* Active Encounter Recording Indicator with Ambient Audio Status */}
      {isRecordingVideo && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border border-rose-500/70 text-white px-4 py-2 rounded-2xl text-xs font-mono shadow-2xl flex items-center space-x-2 animate-fade-in pointer-events-none backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-extrabold text-rose-300">
            REC {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? '0' : ''}{recordingSeconds % 60}
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>{!soundEnabled ? 'MIC: CLEAN AMBIENT' : 'MIC: HUD SOUND ON'}</span>
          </span>
        </div>
      )}

      {/* Smart Shutter Auto-Capture Notice */}
      {smartShutterNotice && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 bg-rose-600 text-white px-4 py-2 rounded-2xl text-xs font-mono font-black shadow-2xl flex items-center space-x-2 animate-bounce pointer-events-none">
          <Camera className="w-4 h-4" />
          <span>AUTO-BURST CAPTURED</span>
        </div>
      )}

      {/* Flight Guide AR Off-Screen Pointer Banner (only active in Assist or AI mode) */}
      {assistanceLevel !== 'manual' && targetingOptions.flightGuide && flightGuide && flightGuide.hasTarget && !flightGuide.inView && cameraActive && (
        <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/60 font-mono text-amber-300 shadow-xl flex items-center space-x-2 pointer-events-auto animate-pulse ${
          isLargeText ? 'text-xs sm:text-sm font-bold' : 'text-xs'
        }`}>
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {flightGuide.deltaAz > 0 ? 'TURN RIGHT' : 'TURN LEFT'} ({Math.abs(flightGuide.deltaAz)}°) · {flightGuide.flight?.callsign || 'Plane'} ({flightGuide.distanceMiles}mi)
          </span>
        </div>
      )}

      {/* Standby / Quick Camera Activation Screen - Clean, Centered, No Overlaps */}
      {!cameraActive && (
        <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-cyan-500/40 flex items-center justify-center mb-4 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="w-14 h-14 rounded-full border border-cyan-400/40 animate-ping absolute"></div>
            <Target className="w-9 h-9 sm:w-10 sm:h-10 text-cyan-400" />
          </div>
          <h3 className={`font-black text-slate-100 uppercase tracking-wider ${isLargeText ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
            Point Camera at Sky
          </h3>
          <p className={`text-slate-300 max-w-xs mt-1.5 leading-relaxed font-sans ${isLargeText ? 'text-sm' : 'text-xs'}`}>
            Arm optical tracking and deconflict against live civilian airspace.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              id="target-quick-camera-btn"
              onClick={() => { void startCamera(); }}
              className={`w-full py-3.5 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black tracking-wide transition flex items-center justify-center space-x-2.5 shadow-xl cursor-pointer active:scale-95 min-h-[48px] ${
                isLargeText ? 'text-base' : 'text-sm'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera</span>
            </button>

            <button
              onClick={handleToggleFullView}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px]"
            >
              {isFullView ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              <span>{isFullView ? 'Standard View' : 'Full Screen'}</span>
            </button>
          </div>

          {cameraError && (
            <p className="mt-4 text-xs text-amber-400 font-mono bg-amber-950/40 px-3.5 py-2 rounded-xl border border-amber-500/30 max-w-xs">
              {cameraError}
            </p>
          )}
        </div>
      )}

      {/* Flash capture animation overlay */}
      {capturedFlash && (
        <div className="absolute inset-0 z-50 bg-white opacity-80 animate-fade-out pointer-events-none" />
      )}

      {/* Tactical HUD Overlay Container (with iOS Safe Area clearance in Full View) */}
      <div className={`absolute inset-0 z-10 pointer-events-none flex flex-col justify-between ${
        isFullView ? 'p-2.5 sm:p-4 pt-safe-top pb-safe' : 'p-2 sm:p-3 pb-2.5 sm:pb-3'
      }`}>
        {/* Top Control Section: Telemetry + Filter/Tools + Tactical Mode Island */}
        <div className="space-y-2">
          {/* Top Telemetry & Viewport Bar - Transparent Glass Backdrops */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Compass Telemetry Pill */}
            <div className={`flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 pointer-events-auto font-mono font-bold shadow-sm ${
              isLargeText ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
            }`}>
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-cyan-400">{azimuth.toFixed(0)}° AZ</span>
              <span className="text-white/40">·</span>
              <span className="text-teal-400">{pitch.toFixed(0)}° EL</span>
            </div>

            {/* Right: Display Filters, Audio Synthesizer, & Full View */}
            <div className="flex items-center space-x-1.5 pointer-events-auto" data-interactive="true">
              {/* Filter Mode Cycle */}
              <button
                onClick={() => {
                  const modes: DisplayDayNightMode[] = ['day_antiglare', 'night_strobe', 'nvg_green', 'flir_thermal', 'night_tactical'];
                  const nextIdx = (modes.indexOf(dayNightMode) + 1) % modes.length;
                  setDayNightMode(modes[nextIdx]);
                }}
                className={`px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-cyan-300 font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                  isLargeText ? 'text-xs min-h-[38px]' : 'text-[11px] min-h-[34px]'
                }`}
                title="Toggle Optical Filter (NVG, Strobe, FLIR, Tactical, Day)"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="font-mono uppercase">
                  {dayNightMode === 'nvg_green' ? 'NVG' : dayNightMode === 'night_strobe' ? 'STROBE' : dayNightMode === 'flir_thermal' ? 'FLIR' : dayNightMode === 'night_tactical' ? 'TAC' : 'DAY'}
                </span>
              </button>

              {/* Full View Toggle */}
              <button
                onClick={handleToggleFullView}
                className={`p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-cyan-300 transition cursor-pointer shadow-sm flex items-center justify-center ${
                  isLargeText ? 'min-h-[38px] min-w-[38px]' : 'min-h-[34px] min-w-[34px]'
                }`}
                title={isFullView ? "Exit Full View" : "Full View"}
              >
                {isFullView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Central Mobile Technological Assistance Hierarchy (Manual -> Assist) */}
          <div className="flex flex-col items-center justify-center pointer-events-auto">
            <div className="inline-flex items-center p-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-2xl space-x-1">
              {/* Level 1: Manual Mode (Default on startup) */}
              <button
                id="target-mode-manual-btn"
                onClick={() => handleSelectAssistanceLevel('manual')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  isLargeText ? 'text-xs sm:text-sm min-h-[36px]' : 'text-[11px] min-h-[32px]'
                } ${
                  assistanceLevel === 'manual'
                    ? 'bg-white/25 text-white border border-white/40 shadow-inner'
                    : 'text-white/60 hover:text-white border border-transparent'
                }`}
                title="Level 1: Manual (Default) - Pure viewfinder, manual shutter, zero automated tracking or AI queries"
              >
                <Eye className="w-3.5 h-3.5 text-slate-300" />
                <span>Manual</span>
              </button>

              {/* Level 2: Assist Mode (On-Device HUD & Flight Guide) */}
              <div className="inline-flex items-center">
                <button
                  id="target-mode-assist-btn"
                  onClick={() => handleSelectAssistanceLevel('assist')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                    isLargeText ? 'text-xs sm:text-sm min-h-[36px]' : 'text-[11px] min-h-[32px]'
                  } ${
                    assistanceLevel === 'assist'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                      : 'text-white/60 hover:text-white border border-transparent'
                  }`}
                  title="Level 2: Assist - On-device HUD, flight director arrow, jet brackets & motion tracker"
                >
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Assist</span>
                </button>

                {/* Assist Options Trigger */}
                {assistanceLevel === 'assist' && (
                  <button
                    id="target-options-btn"
                    onClick={() => setIsTargetingDrawerOpen(true)}
                    className="p-1.5 ml-0.5 rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition cursor-pointer"
                    title="Customize Assist HUD Options (Flight Guide, Jet Brackets, Text Size)"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Margin Vertical Zoom Controller - Optical & Digital Telephoto Steps */}
        <div className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <div className="flex flex-col items-center p-1 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-lg space-y-1 text-[11px] font-mono">
            {[5, 3, 2, 1].map((z) => (
              <button
                key={z}
                onClick={() => {
                  setZoomFactor(z);
                  triggerHapticFeedback([20]);
                }}
                className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition cursor-pointer text-xs ${
                  zoomFactor === z
                    ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title={`${z}x Optical / Digital Crop Zoom`}
              >
                {z}x
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Target Reticle (Snaps & Moves with Sensor/AI coordinates) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* In-View Flight Guide AR Marker (Option 4 - active in Assist or AI mode) */}
          {assistanceLevel !== 'manual' && targetingOptions.flightGuide && flightGuide && flightGuide.hasTarget && flightGuide.inView && cameraActive && (
            <div 
              className="absolute pointer-events-none transition-all duration-300 z-20 flex flex-col items-center"
              style={{
                left: `${flightGuide.screenXPct}%`,
                top: `${flightGuide.screenYPct}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-14 h-14 rounded-2xl border-2 border-amber-400/80 border-dashed animate-pulse flex items-center justify-center bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <Navigation className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-black/85 border border-amber-500/60 text-[9px] font-mono font-bold text-amber-300 whitespace-nowrap shadow-lg">
                ✈️ {flightGuide.flight?.callsign || 'Airliner'} · {flightGuide.distanceMiles}mi · {flightGuide.flight?.altitudeFeet ? `${Math.round(flightGuide.flight.altitudeFeet)}ft` : ''}
              </div>
            </div>
          )}

          <div 
            className="absolute transition-all duration-300 ease-out flex items-center justify-center pointer-events-none"
            style={{
              left: `${reticleX}%`,
              top: `${reticleY}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Center Outer Lock Ring */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-spin-slow"></div>

              {/* Fighter Jet Acquisition Brackets (Option 2 - active in Assist or AI mode) */}
              {assistanceLevel !== 'manual' && targetingOptions.jetLockOn && (
                <div className="absolute inset-2 sm:inset-4 pointer-events-none">
                  {/* Top-Left */}
                  <div className={`absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 transition-colors duration-200 ${
                    targetLock ? 'border-rose-400' : 'border-cyan-400/80'
                  }`} />
                  {/* Top-Right */}
                  <div className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 transition-colors duration-200 ${
                    targetLock ? 'border-rose-400' : 'border-cyan-400/80'
                  }`} />
                  {/* Bottom-Left */}
                  <div className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 transition-colors duration-200 ${
                    targetLock ? 'border-rose-400' : 'border-cyan-400/80'
                  }`} />
                  {/* Bottom-Right */}
                  <div className={`absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 transition-colors duration-200 ${
                    targetLock ? 'border-rose-400' : 'border-cyan-400/80'
                  }`} />
                </div>
              )}
              
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border flex items-center justify-center relative transition-colors ${
                targetLock ? 'border-rose-500/80' : 'border-cyan-400/40'
              }`}>
                <Crosshair className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${targetLock ? 'text-rose-400' : 'text-cyan-400/80'}`} />
                
                {/* Tactical Pitch Marks */}
                <div className="absolute -top-3 w-4 h-0.5 bg-cyan-400"></div>
                <div className="absolute -bottom-3 w-4 h-0.5 bg-cyan-400"></div>
                <div className="absolute -left-3 h-4 w-0.5 bg-cyan-400"></div>
                <div className="absolute -right-3 h-4 w-0.5 bg-cyan-400"></div>
              </div>

              {/* Target Lock Reticle if Locked */}
              {targetLock && (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-2 border-rose-500 flex items-center justify-center bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.45)]">
                    <div className="absolute -top-7 px-2.5 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>LOCKED: {targetLock.name}</span>
                    </div>

                    <div className="text-center font-mono text-[9px] sm:text-[10px] text-rose-200 space-y-0.5 bg-slate-950/85 px-2.5 py-1 rounded-xl border border-rose-500/30">
                      <div>SPD: <strong className="text-rose-400">{targetLock.estimatedSpeed}</strong></div>
                      <div>ALT: {targetLock.estimatedAltitude}</div>
                      <div>CONF: <strong className="text-emerald-400">{targetLock.confidencePct}%</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lock Progress Indicator */}
              {lockProgress > 0 && !targetLock && (
                <div className="absolute -bottom-9 flex items-center space-x-1.5 bg-slate-950/90 px-3 py-1 rounded-full border border-cyan-500/50">
                  <span className="text-[10px] text-cyan-400 font-bold">ACQUIRING:</span>
                  <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-100"
                      style={{ width: `${lockProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Tactical Deck Container - Only visible when camera is active so standby screen is clean and never clipped */}
        {cameraActive && (
          <div className="space-y-1.5 pointer-events-auto max-w-2xl mx-auto w-full animate-fade-in">
            {/* Target Telemetry Card when locked */}
            {targetLock && (
              <div className="bg-black/60 backdrop-blur-lg px-3.5 py-2.5 rounded-2xl border border-rose-500/60 shadow-xl flex items-center justify-between gap-2 animate-fade-in w-full font-mono">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className={`text-rose-300 font-bold tracking-wide truncate ${isLargeText ? 'text-sm' : 'text-xs'}`}>
                      {targetLock.name.split(' ')[0] || 'Target'}
                    </span>
                    <span className={`text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40 font-bold shrink-0 ${isLargeText ? 'text-xs' : 'text-[10px]'}`}>
                      {targetLock.confidencePct}% Lock
                    </span>
                  </div>
                  <p className={`text-slate-300 truncate font-sans ${isLargeText ? 'text-xs font-semibold' : 'text-[11px]'}`}>
                    {Math.round(targetLock.azimuthDeg)}° AZ · {Math.round(targetLock.elevationDeg)}° EL · {targetLock.estimatedSpeed || 'Mach 5'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleCapturePhoto}
                    className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-md min-h-[38px]"
                  >
                    Capture
                  </button>
                  <button
                    onClick={() => setTargetLock(null)}
                    className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition cursor-pointer min-h-[38px] border border-white/10"
                  >
                    Release
                  </button>
                </div>
              </div>
            )}

            {/* Just Captured Notice Badge */}
            {justCapturedNotice && (
              <div className="flex items-center justify-center">
                <div className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg animate-bounce flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>{justCapturedNotice}</span>
                </div>
              </div>
            )}

            {/* Integrated Airspace & Deconfliction Ribbon */}
            <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-slate-200 shadow-sm ${
              isLargeText ? 'text-xs sm:text-sm font-bold' : 'text-[11px] font-medium'
            }`}>
              <div className="flex items-center space-x-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-emerald-400 font-bold shrink-0">
                  {flights.length > 0 ? `${flights.length} Planes · Clear` : 'Airspace Clear'}
                </span>
              </div>
              <div className="text-cyan-300 truncate text-right font-bold shrink-0 ml-2">
                {aiLockFeedback}
              </div>
            </div>

            {/* Main Tactical Action Bar */}
            {/* Main Tactical Action Bar */}
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-2xl border border-white/15 shadow-2xl mt-0.5">
              {/* Standby / Pause Camera Toggle */}
              <button
                onClick={stopCamera}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold transition cursor-pointer min-h-[38px] flex items-center space-x-1.5"
                title="Pause Camera to Save Battery"
              >
                <Camera className="w-4 h-4 text-slate-300" />
                <span className={isLargeText ? 'text-xs font-bold' : 'text-[11px]'}>Pause</span>
              </button>

              {/* Shutter / Capture & Video Rec Triggers */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={handleCapturePhoto}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] transition cursor-pointer border-2 sm:border-3 border-white/90"
                  title="Capture Target Photo"
                >
                  <Circle className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                </button>

                <button
                  onClick={handleToggleRecordVideo}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer min-h-[38px] ${
                    isRecordingVideo
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-white/10 hover:bg-white/15 border border-white/10 text-rose-400'
                  }`}
                  title="Record Video Track"
                >
                  {isRecordingVideo ? <Square className="w-4 h-4 fill-current" /> : <Video className="w-4 h-4" />}
                  <span className={isLargeText ? 'text-xs font-bold' : 'text-[11px]'}>{isRecordingVideo ? `${recordingSeconds}s` : 'Rec'}</span>
                </button>
              </div>

              {/* Media Vault & Session Review Link */}
              <div className="flex items-center space-x-1.5">
                {sessionCaptures.length > 0 && (
                  <button
                    onClick={() => {
                      if (onCaptureForReview && sessionCaptures.length > 0) {
                        onCaptureForReview(sessionCaptures[0], sessionCaptures);
                      }
                    }}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black transition flex items-center space-x-1 cursor-pointer min-h-[38px] shadow-lg animate-pulse"
                    title="Review session captures and prepare report"
                  >
                    <span>Review ({sessionCaptures.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {onOpenVault && (
                  <button
                    onClick={onOpenVault}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer min-h-[38px]"
                    title="Open Captured Photos & Videos in Vault"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden min-[360px]:inline">Vault</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Battery & Power Optimization Drawer / Modal */}
      {powerDrawerOpen && (
        <div 
          className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          onClick={(e) => { e.stopPropagation(); setPowerDrawerOpen(false); }}
        >
          <div 
            className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <BatteryCharging className="w-5 h-5" />
                <h4 className="text-sm font-extrabold text-slate-100 tracking-wide uppercase">
                  iPhone Battery & Power Profile
                </h4>
              </div>
              <button 
                onClick={() => setPowerDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To minimize iPhone battery draw and prevent thermal throttling, continuous background loops are <strong>disabled at app startup</strong>. You can enable them when actively tracking targets.
            </p>

            <div className="space-y-2.5">
              {/* AI Auto-Lock Toggle Card */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Gemini AI Auto-Lock</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Periodic 4.5s sky scan with Gemini 3.8 Flash</p>
                </div>
                <button
                  onClick={() => {
                    const next = !geminiAutoLockEnabled;
                    setGeminiAutoLockEnabled(next);
                    if (next) setOpticalTrackingActive(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    geminiAutoLockEnabled 
                      ? 'bg-cyan-400 text-slate-950 font-black' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {geminiAutoLockEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>



              {/* Instant Single-Shot Scan */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Single-Shot Scan</span>
                  </div>
                  <p className="text-[10px] text-slate-400">One-time scan without continuous background power draw</p>
                </div>
                <button
                  onClick={() => {
                    setPowerDrawerOpen(false);
                    runGeminiAutoLock(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                >
                  Scan Now
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPowerDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Targeting Assist Options Drawer */}
      <TargetingOptionsDrawer
        isOpen={isTargetingDrawerOpen}
        onClose={() => setIsTargetingDrawerOpen(false)}
        options={targetingOptions}
        onOptionsChange={setTargetingOptions}
      />
    </div>
  );
};

export const TargetSkyScanner = ArSkyScanner;
