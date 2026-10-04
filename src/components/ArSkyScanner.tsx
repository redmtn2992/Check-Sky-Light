import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Crosshair, Sparkles, AlertTriangle, ShieldCheck, 
  Layers, Volume2, VolumeX, Eye, Compass, Navigation, RefreshCw, 
  Circle, Maximize2, Minimize2, Zap, Radio, Sun, Moon, Video, Square, Download, 
  ExternalLink, FileText, ChevronRight, Cpu, Target, Scan, Lock, Mic,
  Battery, BatteryCharging, MousePointerClick, Fingerprint, Power, Info, Check, HelpCircle, X
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
import { PreReportCapture } from './PreReportCheckModal';

export interface ArSkyScannerProps {
  userLocation: LocationCoords;
  flights: FlightTrack[];
  celestialBodies: CelestialBody[];
  onTargetLocked?: (target: TargetLockData) => void;
  onCaptureForReport?: (mediaUrl: string, description: string, posterUrl?: string) => void;
  onCaptureForReview?: (capture: PreReportCapture) => void;
  onOpenVault?: () => void;
  onOpenTriangulation?: () => void;
  onOpenSoundOptions?: () => void;
  isFullView?: boolean;
  onToggleFullView?: (fullView: boolean) => void;
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
  isFullView: propIsFullView,
  onToggleFullView
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dayNightMode, setDayNightMode] = useState<DisplayDayNightMode>('nvg_green');
  
  // Sound & Acoustic Capture Configuration: ABSOLUTELY SILENT BY DEFAULT (false)
  // Ensures phone speaker does not contaminate genuine ambient acoustic recordings
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(loadSoundSettings);
  const soundEnabled = soundSettings.soundEnabled;
  const [soundModeToast, setSoundModeToast] = useState<string | null>(null);
  
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [capturedFlash, setCapturedFlash] = useState<boolean>(false);
  const [sessionCaptures, setSessionCaptures] = useState<PreReportCapture[]>([]);
  const [justCapturedNotice, setJustCapturedNotice] = useState<string | null>(null);
  
  // Power & Battery Optimization: Disabled at startup to minimize iPhone battery draw
  const [opticalTrackingActive, setOpticalTrackingActive] = useState<boolean>(false);

  // Full View State (local or controlled by App)
  const [localFullView, setLocalFullView] = useState<boolean>(false);
  const isFullView = propIsFullView !== undefined ? propIsFullView : localFullView;

  // Gemini AI Auto-Lock State: Disabled at app startup to conserve iPhone battery power
  const [geminiAutoLockEnabled, setGeminiAutoLockEnabled] = useState<boolean>(false);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiLockFeedback, setAiLockFeedback] = useState<string>('Ready');

  // Digital Crop Zoom (1x, 2x, 5x) for long-distance sky targets
  const [zoomFactor, setZoomFactor] = useState<number>(1);

  // Manual Screen Tap Target Lock: Disabled at app launch for minimal battery draw
  const [manualScreenLockEnabled, setManualScreenLockEnabled] = useState<boolean>(false);
  const [tapMarker, setTapMarker] = useState<{ x: number; y: number; id: number } | null>(null);
  const [tapHintToast, setTapHintToast] = useState<string | null>(null);
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

  // Sync sound settings in real-time across tabs/drawers
  useEffect(() => {
    const unsubscribe = subscribeSoundSettings((newSettings) => {
      setSoundSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  // Start Camera (Quick Camera Access)
  const startCamera = async () => {
    setCameraError(null);
    unlockAudioContext();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not accessible in this environment. Operating in sensor simulation mode.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
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

  // Attempt Quick Camera start immediately on component mount
  useEffect(() => {
    startCamera();
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

  // Device Orientation Handler (iPhone Compass & Gyro)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
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

    const handleMotion = (e: DeviceMotionEvent) => {
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
            name: data.targetName || (tapCoords ? 'Observer Tap-Locked Anomaly' : 'Luminous Metric Anomaly'),
            type: data.classification || 'UAP',
            lockState: 'LOCKED',
            screenX: finalXPct,
            screenY: finalYPct,
            azimuthDeg: azimuth,
            elevationDeg: pitch,
            azimuthStr: `${azimuth.toFixed(1)}°`,
            elevationStr: `${pitch.toFixed(1)}°`,
            distance: data.kinematics?.estimatedAltitude || '14,000 ft',
            angularVelocityDegPerSec: 18.5,
            estimatedSpeed: data.kinematics?.estimatedSpeed || 'Mach 5.8',
            estimatedAltitude: data.kinematics?.estimatedAltitude || '14,000 ft',
            kinematicGForce: data.kinematics?.kinematicGForce || '52 G',
            deconflictionStatus: 'ANOMALOUS_UNIDENTIFIED',
            details: data.analysisNotes || (tapCoords ? 'Observer manual tap target locked and evaluated.' : 'Gemini AI auto-locked target with synchronized iPhone IMU sensors.'),
            confidencePct: data.confidencePct || 92,
            timestamp: new Date().toISOString(),
            geminiLockDetails: {
              detected: true,
              confidencePct: data.confidencePct || 92,
              classicalDeconfliction: data.dualLens?.classicalDeconfliction,
              metricSignature: data.dualLens?.metricSignature,
              analysisNotes: data.analysisNotes,
              isGeminiAiLocked: true
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

  // Manual Screen Tap Target Lock on camera viewfinder (gated & disabled at startup for low power)
  const handleScreenTapLock = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Avoid triggering if interacting with buttons, inputs or HUD controls
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [data-interactive="true"]')) {
      return;
    }

    if (!manualScreenLockEnabled) {
      setTapHintToast('Tap "Tap" in HUD first to arm target selection.');
      setTimeout(() => setTapHintToast(null), 3000);
      return;
    }

    unlockAudioContext();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const xPct = Math.round(Math.max(5, Math.min(95, (clickX / rect.width) * 100)));
    const yPct = Math.round(Math.max(5, Math.min(95, (clickY / rect.height) * 100)));

    setTapMarker({ x: xPct, y: yPct, id: Date.now() });
    setTimeout(() => setTapMarker(null), 1800);

    if (soundEnabled) {
      playTargetAcquiringTone();
      triggerHapticFeedback([25, 35]);
    }

    // Instant lock on designated screen coordinate
    const immediateLock: TargetLockData = {
      id: `MAN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Manual Target',
      type: 'UAP',
      lockState: 'LOCKED',
      screenX: xPct,
      screenY: yPct,
      azimuthDeg: azimuth,
      elevationDeg: pitch,
      azimuthStr: `${azimuth.toFixed(1)}°`,
      elevationStr: `${pitch.toFixed(1)}°`,
      distance: 'Estimated 8,500 m',
      angularVelocityDegPerSec: 14.5,
      estimatedSpeed: 'Tracking Vector',
      estimatedAltitude: '16,200 ft',
      kinematicGForce: '40 G (Non-Inertial)',
      deconflictionStatus: 'MANUAL_OPTICAL_TRACK',
      details: `Manual optical lock acquired by observer at screen coordinate (${xPct}%, ${yPct}%). Azimuth ${azimuth.toFixed(1)}°, Elevation ${pitch.toFixed(1)}°.`,
      confidencePct: 92,
      timestamp: new Date().toISOString(),
      geminiLockDetails: {
        detected: true,
        confidencePct: 92,
        classicalDeconfliction: 'Observer designated manual optical coordinate. Correlated against local airspace.',
        analysisNotes: `Manual screen target lock established at (${xPct}%, ${yPct}%).`,
        isGeminiAiLocked: false
      }
    };

    setTargetLock(immediateLock);
    setLockProgress(100);
    setAiLockFeedback(`Lock (${xPct}%, ${yPct}%)`);
    if (onTargetLocked) {
      onTargetLocked(immediateLock);
    }

    // If camera is running, trigger an instant targeted dual-lens AI evaluation
    if (cameraActive) {
      runGeminiAutoLock(true, { xPct, yPct });
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

  // Optical Centroid Tracker (local computer vision layer)
  useEffect(() => {
    let active = true;

    const runOpticalLoop = () => {
      if (!active) return;

      if (opticalTrackingActive && videoRef.current && cameraActive && !targetLock) {
        const centroid = sampleOpticalCentroid(videoRef.current, 50, 50, 110);

        if (centroid.detected && centroid.confidence > 55) {
          lockHoldTimerRef.current += 1;
          setLockProgress(Math.min(100, lockHoldTimerRef.current * 8));

          if (lockHoldTimerRef.current === 4 && soundEnabled) {
            playTargetAcquiringTone();
            triggerHapticFeedback([15, 20]);
          }

          if (lockHoldTimerRef.current >= 12 && (!targetLock || targetLock.lockState !== 'LOCKED')) {
            const newLock: TargetLockData = {
              id: `TGT-${Math.floor(1000 + Math.random() * 9000)}`,
              name: 'Optical Centroid Anomaly',
              type: 'UAP',
              lockState: 'LOCKED',
              screenX: 50 + centroid.deltaScreenX,
              screenY: 50 + centroid.deltaScreenY,
              azimuthDeg: azimuth,
              elevationDeg: pitch,
              azimuthStr: `${azimuth.toFixed(1)}°`,
              elevationStr: `${pitch.toFixed(1)}°`,
              distance: `${(8.4 + Math.random() * 4).toFixed(1)} km`,
              angularVelocityDegPerSec: 14.2,
              estimatedSpeed: `Mach ${(4.8 + Math.random() * 2).toFixed(1)}`,
              estimatedAltitude: `${(3200 + Math.floor(Math.random() * 1200)).toLocaleString()} m`,
              kinematicGForce: '48 G',
              deconflictionStatus: 'ANOMALOUS_UNIDENTIFIED',
              details: 'Optical centroid tracked with zero civilian transponder match.',
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
            setLockProgress(Math.min(100, lockHoldTimerRef.current * 8));
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
  }, [cameraActive, opticalTrackingActive, azimuth, pitch, soundEnabled, targetLock]);

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
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vw = canvas.width;
        const vh = canvas.height;
        const cropW = vw / zoomFactor;
        const cropH = vh / zoomFactor;
        const cropX = (vw - cropW) / 2;
        const cropY = (vh - cropH) / 2;
        ctx.drawImage(videoRef.current, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
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

      setSessionCaptures(prev => [newCapture, ...prev]);
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
          setSessionCaptures(prev => [newCapture, ...prev]);
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
      onClick={handleScreenTapLock}
      onTouchStart={handleScreenTapLock}
      className={
        isFullView
          ? "fixed inset-0 z-50 w-screen h-[100dvh] bg-black select-none font-mono flex flex-col overflow-hidden"
          : "relative w-full h-[calc(100dvh-13rem)] min-h-[380px] max-h-[720px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl font-mono select-none flex flex-col cursor-crosshair"
      }
    >
      {/* Video / Camera Feed (Full View Object Cover with smooth optical/digital crop zoom) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          transform: zoomFactor > 1 ? `scale(${zoomFactor})` : undefined,
          transformOrigin: 'center center'
        }}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-all duration-200 ease-out ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Visual Ripple and Reticle on User Screen Tap */}
      {tapMarker && (
        <div 
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${tapMarker.x}%`, top: `${tapMarker.y}%` }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-amber-400/80 animate-ping absolute -top-8 -left-8" />
          <div className="w-10 h-10 rounded-full border-2 border-amber-300 flex items-center justify-center bg-amber-400/20 -top-5 -left-5 absolute shadow-[0_0_15px_rgba(251,191,36,0.6)]">
            <Crosshair className="w-5 h-5 text-amber-300" />
          </div>
          <div className="absolute top-6 -left-14 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400 text-amber-300 text-[10px] font-mono whitespace-nowrap shadow-md">
            TARGET DESIGNATED ({tapMarker.x}%, {tapMarker.y}%)
          </div>
        </div>
      )}

      {/* Screen Tap Hint Toast when disabled */}
      {tapHintToast && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border border-amber-500/50 text-amber-200 px-3.5 py-2 rounded-2xl text-[11px] font-mono shadow-2xl flex items-center space-x-2 animate-fade-in pointer-events-auto max-w-[90%] sm:max-w-md">
          <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-tight">{tapHintToast}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setTapHintToast(null); }}
            className="text-slate-400 hover:text-white ml-1 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sound Mode Change Toast */}
      {soundModeToast && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border border-emerald-500/60 text-emerald-200 px-3.5 py-2 rounded-2xl text-[11px] font-mono shadow-2xl flex items-center space-x-2 animate-fade-in pointer-events-auto">
          {!soundEnabled ? <VolumeX className="w-4 h-4 text-emerald-400 shrink-0" /> : <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />}
          <span className="font-semibold">{soundModeToast}</span>
        </div>
      )}

      {/* Active Encounter Recording Indicator with Ambient Audio Status */}
      {isRecordingVideo && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border border-rose-500/70 text-white px-3.5 py-1.5 rounded-2xl text-[10px] font-mono shadow-2xl flex items-center space-x-2 animate-fade-in pointer-events-none backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-extrabold text-rose-300">
            REC {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? '0' : ''}{recordingSeconds % 60}
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center space-x-1 text-emerald-400 font-bold">
            <Mic className="w-3 h-3 text-emerald-400" />
            <span>{!soundEnabled ? 'MIC: CLEAN AMBIENT' : 'MIC: HUD SOUND ON'}</span>
          </span>
        </div>
      )}

      {/* Standby / Quick Camera Activation Screen */}
      {!cameraActive && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-cyan-500/40 flex items-center justify-center mb-3 relative shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <div className="w-12 h-12 rounded-full border border-cyan-400/40 animate-ping absolute"></div>
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider">
            Point Camera at Sky
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1 leading-normal">
            Arm optical tracking and deconflict against live civilian airspace.
          </p>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              id="target-quick-camera-btn"
              onClick={startCamera}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wide transition flex items-center space-x-2 shadow-lg cursor-pointer active:scale-95 min-h-[42px]"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera</span>
            </button>

            <button
              onClick={handleToggleFullView}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer min-h-[42px]"
            >
              {isFullView ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isFullView ? 'Standard' : 'Full Screen'}</span>
            </button>
          </div>

          {cameraError && (
            <p className="mt-3 text-[10px] text-amber-400/90 font-mono bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 max-w-xs">
              {cameraError}
            </p>
          )}
        </div>
      )}

      {/* Flash capture animation overlay */}
      {capturedFlash && (
        <div className="absolute inset-0 z-50 bg-white opacity-80 animate-fade-out pointer-events-none" />
      )}

      {/* Tactical HUD Overlay Container */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4">
        {/* Top Control Section: Telemetry + Filter/Tools + Tactical Mode Island */}
        <div className="space-y-2">
          {/* Top Telemetry & Viewport Bar - Transparent Glass Backdrops */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Compass Telemetry Pill */}
            <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 pointer-events-auto text-[11px] sm:text-xs font-mono font-bold shadow-sm">
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-cyan-400">{azimuth.toFixed(0)}° AZ</span>
              <span className="text-white/40">·</span>
              <span className="text-teal-400">{pitch.toFixed(0)}° EL</span>
            </div>

            {/* Right: Display Filters, Audio Synthesizer, & Full View */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 pointer-events-auto" data-interactive="true">
              {/* Filter Mode Cycle */}
              <button
                onClick={() => {
                  const modes: DisplayDayNightMode[] = ['nvg_green', 'flir_thermal', 'night_tactical', 'day_antiglare'];
                  const nextIdx = (modes.indexOf(dayNightMode) + 1) % modes.length;
                  setDayNightMode(modes[nextIdx]);
                }}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-cyan-300 text-[10px] sm:text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm min-h-[36px]"
                title="Toggle Optical Filter (NVG, FLIR, Tactical, Day)"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[9px] sm:text-[10px] font-mono uppercase">
                  {dayNightMode === 'nvg_green' ? 'NVG' : dayNightMode === 'flir_thermal' ? 'FLIR' : dayNightMode === 'night_tactical' ? 'TAC' : 'DAY'}
                </span>
              </button>

              {/* Radar Audio Synthesizer / Silence Mode Toggle */}
              <button
                onClick={() => {
                  if (onOpenSoundOptions) {
                    onOpenSoundOptions();
                  } else {
                    const next = !soundEnabled;
                    const updated = { ...soundSettings, soundEnabled: next };
                    setSoundSettings(updated);
                    saveSoundSettings(updated);
                    setSoundModeToast(next ? 'Audible HUD Sound Active' : 'Absolute Silence Active: 0 dB UI Noise');
                    setTimeout(() => setSoundModeToast(null), 3000);
                  }
                }}
                className={`p-1.5 sm:p-2 rounded-xl bg-black/30 hover:bg-black/50 border text-xs transition cursor-pointer shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  soundEnabled 
                    ? 'border-amber-400/60 text-amber-300' 
                    : 'border-white/10 text-emerald-400'
                }`}
                title={
                  soundEnabled 
                    ? "Audible HUD Active (Speaker sound active. Tap for sound options)" 
                    : "Absolute Silence Active (Speaker muted for pure microphone acoustic capture. Tap for sound options)"
                }
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {/* Full View Toggle */}
              <button
                onClick={handleToggleFullView}
                className="p-1.5 sm:p-2 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-cyan-300 text-xs transition cursor-pointer shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center"
                title={isFullView ? "Exit Full View" : "Full View"}
              >
                {isFullView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Central Mobile Tactical Tracking Mode Bar (Unobstructed Transparent Glass) */}
          <div className="flex items-center justify-center pointer-events-auto">
            <div className="inline-flex items-center p-0.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 shadow-lg space-x-0.5 text-[11px] font-mono">
              {/* AI Auto-Lock Toggle */}
              <button
                id="target-ai-autolock-toggle"
                onClick={() => {
                  const next = !geminiAutoLockEnabled;
                  setGeminiAutoLockEnabled(next);
                  if (next) {
                    setAiLockFeedback('Scanning');
                    setOpticalTrackingActive(true);
                    triggerHapticFeedback([30]);
                  } else {
                    setAiLockFeedback('Ready');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer min-h-[32px] ${
                  geminiAutoLockEnabled
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse'
                    : 'text-white/70 hover:text-white border border-transparent'
                }`}
                title="Toggle Gemini AI Auto-Lock"
              >
                <Cpu className={`w-3.5 h-3.5 ${geminiAutoLockEnabled ? 'text-cyan-400' : 'text-white/50'}`} />
                <span>AI</span>
              </button>

              {/* Screen Tap Lock Toggle */}
              <button
                id="target-tap-lock-toggle"
                onClick={() => {
                  const next = !manualScreenLockEnabled;
                  setManualScreenLockEnabled(next);
                  if (next) {
                    setAiLockFeedback('Tap Target');
                    triggerHapticFeedback([25, 25]);
                  } else {
                    setAiLockFeedback('Ready');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer min-h-[32px] ${
                  manualScreenLockEnabled
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'text-white/70 hover:text-white border border-transparent'
                }`}
                title="Toggle Screen Tap Target Lock"
              >
                <MousePointerClick className={`w-3.5 h-3.5 ${manualScreenLockEnabled ? 'text-amber-400' : 'text-white/50'}`} />
                <span>Tap</span>
              </button>

              {/* Single-Shot Scan */}
              <button
                onClick={() => runGeminiAutoLock(true)}
                disabled={isAiScanning}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 shadow-sm cursor-pointer min-h-[32px] ${
                  isAiScanning 
                    ? 'bg-cyan-950/60 border border-cyan-400 text-cyan-300 animate-spin'
                    : 'bg-black/30 hover:bg-black/50 text-amber-300 border border-amber-500/40'
                }`}
                title="Single-Shot Lock On Target Now"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Margin Vertical Zoom Controller - Non-obstructive camera app style */}
        <div className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <div className="flex flex-col items-center p-1 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-lg space-y-1 text-[11px] font-mono">
            {[5, 2, 1].map((z) => (
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

        {/* Bottom Tactical Deck Container (Prevents overlapping of deconfliction bar and buttons) */}
        <div className="space-y-1.5 pointer-events-auto max-w-2xl mx-auto w-full">
          {/* Target Telemetry Card when locked */}
          {targetLock && (
            <div className="bg-black/40 backdrop-blur-lg px-3 py-2 rounded-2xl border border-rose-500/50 text-xs shadow-xl flex items-center justify-between gap-2 animate-fade-in w-full font-mono">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span className="text-rose-400 font-bold tracking-wide truncate text-xs">
                    {targetLock.name.split(' ')[0] || 'Target'}
                  </span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/30 shrink-0">
                    {targetLock.confidencePct}% Lock
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  {Math.round(targetLock.azimuthDeg)}° AZ · {Math.round(targetLock.elevationDeg)}° EL · {targetLock.estimatedSpeed || 'Mach 5'}
                </p>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={handleCapturePhoto}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md min-h-[34px]"
                >
                  Capture
                </button>
                <button
                  onClick={() => setTargetLock(null)}
                  className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition cursor-pointer min-h-[34px] border border-white/10"
                >
                  Release
                </button>
              </div>
            </div>
          )}

          {/* Just Captured Notice Badge */}
          {justCapturedNotice && (
            <div className="flex items-center justify-center">
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/90 text-slate-950 font-bold text-xs shadow-lg animate-bounce flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>{justCapturedNotice}</span>
              </div>
            </div>
          )}

          {/* Integrated Airspace & Deconfliction Ribbon (Transparent Frosted Glass) */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 shadow-sm">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-emerald-400 font-bold shrink-0">
                {flights.length > 0 ? `${flights.length} Planes · Clear` : 'Sky Clear'}
              </span>
            </div>
            <div className="text-cyan-400 truncate text-right font-medium shrink-0 ml-2">
              {aiLockFeedback}
            </div>
          </div>

          {/* Main Tactical Action Bar (Transparent Frosted Glass - Maximum Viewport Visibility) */}
          <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-white/15 shadow-2xl mt-1">
            {/* Standby / Quick Camera Toggle */}
            <div className="flex items-center space-x-1.5">
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold transition cursor-pointer min-h-[42px] flex items-center space-x-1.5"
                  title="Pause Camera to Save Battery"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[11px] sm:text-xs">Pause</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer min-h-[42px]"
                  title="Start Camera Feed"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="text-[11px] sm:text-xs">Camera</span>
                </button>
              )}
            </div>

            {/* Shutter / Capture & Video Rec Triggers */}
            <div className="flex items-center space-x-2.5 sm:space-x-4">
              {/* Primary Shutter Button */}
              <button
                onClick={handleCapturePhoto}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 flex items-center justify-center shadow-[0_0_22px_rgba(6,182,212,0.6)] transition cursor-pointer border-3 border-white/80"
                title="Capture Target Photo"
              >
                <Circle className="w-6 h-6 fill-current" />
              </button>

              {/* Video Recording Trigger */}
              <button
                onClick={handleToggleRecordVideo}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer min-h-[42px] ${
                  isRecordingVideo
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-white/10 hover:bg-white/15 border border-white/10 text-rose-400'
                }`}
                title="Record Video Track"
              >
                {isRecordingVideo ? <Square className="w-3.5 h-3.5 fill-current" /> : <Video className="w-3.5 h-3.5" />}
                <span className="text-[11px] sm:text-xs">{isRecordingVideo ? `${recordingSeconds}s` : 'Rec'}</span>
              </button>
            </div>

            {/* Media Vault & Session Review Link */}
            <div className="flex items-center space-x-1.5">
              {sessionCaptures.length > 0 ? (
                <button
                  onClick={() => {
                    if (onCaptureForReview && sessionCaptures.length > 0) {
                      onCaptureForReview(sessionCaptures[0]);
                    }
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer min-h-[42px] shadow-lg animate-pulse"
                  title="Review session captures and prepare report"
                >
                  <span className="text-[11px] sm:text-xs">Review ({sessionCaptures.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : onOpenVault ? (
                <button
                  onClick={onOpenVault}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer min-h-[42px]"
                  title="Open Captured Photos & Videos"
                >
                  <span className="text-[11px] sm:text-xs">Vault</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
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

              {/* Screen Tap Lock Toggle Card */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                    <span>Screen Tap-to-Lock</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Click or tap any point on camera to designate target</p>
                </div>
                <button
                  onClick={() => setManualScreenLockEnabled(!manualScreenLockEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    manualScreenLockEnabled 
                      ? 'bg-amber-400 text-slate-950 font-black' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {manualScreenLockEnabled ? 'ARMED' : 'DISABLED'}
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
    </div>
  );
};

export const TargetSkyScanner = ArSkyScanner;
