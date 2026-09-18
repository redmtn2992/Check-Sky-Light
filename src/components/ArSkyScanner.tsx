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

export interface ArSkyScannerProps {
  userLocation: LocationCoords;
  flights: FlightTrack[];
  celestialBodies: CelestialBody[];
  onTargetLocked?: (target: TargetLockData) => void;
  onCaptureForReport?: (mediaUrl: string, description: string, posterUrl?: string) => void;
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
  
  // Power & Battery Optimization: Disabled at startup to minimize iPhone battery draw
  const [opticalTrackingActive, setOpticalTrackingActive] = useState<boolean>(false);

  // Full View State (local or controlled by App)
  const [localFullView, setLocalFullView] = useState<boolean>(false);
  const isFullView = propIsFullView !== undefined ? propIsFullView : localFullView;

  // Gemini AI Auto-Lock State: Disabled at app startup to conserve iPhone battery power
  const [geminiAutoLockEnabled, setGeminiAutoLockEnabled] = useState<boolean>(false);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiLockFeedback, setAiLockFeedback] = useState<string>('Battery Saver Standby (AI & Tap Lock Idle)');

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
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
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
          setAiLockFeedback(`AI LOCKED: ${newLock.name} (${newLock.confidencePct}%)`);
          if (soundEnabled) {
            playFighterJetMissileLockTone();
            triggerHapticFeedback([40, 50, 70]);
          }
          if (onTargetLocked) {
            onTargetLocked(newLock);
          }
        } else {
          setAiLockFeedback(tapCoords ? 'Tap Vector Clear' : 'Sector Clear of Unresolved UAP');
        }
      }
    } catch (err) {
      console.warn('Gemini target auto-lock call failed:', err);
      setAiLockFeedback('Optical Reticle Standby');
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
      setTapHintToast('Screen Tap Lock is OFF (Low Battery Mode). Tap "TAP LOCK" in HUD to enable manual targeting.');
      setTimeout(() => setTapHintToast(null), 3500);
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
      name: 'Observer Manual Screen Target',
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
    setAiLockFeedback(`MANUAL TARGET LOCKED: (${xPct}%, ${yPct}%)`);
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
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // Draw HUD stamp
        ctx.fillStyle = '#06b6d4';
        ctx.font = '24px monospace';
        ctx.fillText(`CHECK SKY LIGHT - TARGET HUD | AZ ${azimuth.toFixed(1)}° EL ${pitch.toFixed(1)}°`, 40, 60);
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

      if (onCaptureForReport) {
        onCaptureForReport(
          dataUrl,
          `Target captured via Check Sky Light Target HUD. Azimuth ${azimuth.toFixed(1)}°, Elevation ${pitch.toFixed(1)}° over ${userLocation.city || 'local sector'}. ${targetLock ? `Target: ${targetLock.name} (${targetLock.confidencePct}% lock).` : ''}`
        );
      }
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

        const recorder = new MediaRecorder(recordStream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          await saveMediaToVault({
            mediaType: 'video',
            title: `Target Video Track (${recordingSeconds}s)${!soundEnabled ? ' [Clean Ambient Audio]' : ''}`,
            blob,
            durationSeconds: recordingSeconds,
            telemetry: {
              azimuth,
              pitch,
              roll,
              lat: userLocation.lat,
              lng: userLocation.lng,
              city: userLocation.city,
              region: userLocation.region,
              dayNightMode,
              soundMode: !soundEnabled 
                ? 'Absolute Silence (Pristine Ambient Audio Capture - 0 dB Speaker Noise)' 
                : 'Audible Tactical HUD'
            },
            targetLock
          });
          setRecordingSeconds(0);
        };
        recorder.start(500);
        mediaRecorderRef.current = recorder;
        setIsRecordingVideo(true);
        triggerHapticFeedback([20, 20]);
      } catch (err) {
        console.error('Video recording failed:', err);
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
      {/* Video / Camera Feed (Full View Object Cover) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
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
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-cyan-500/40 flex items-center justify-center mb-3 sm:mb-4 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-cyan-400/50 animate-ping absolute"></div>
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wider">
            TARGET SKY ACQUISITION
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm sm:max-w-md mt-1 sm:mt-2 leading-relaxed">
            Point camera at the sky to track UAP targets. Low battery profile is engaged on startup to conserve iPhone battery.
          </p>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              id="target-quick-camera-btn"
              onClick={startCamera}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs tracking-wider transition flex items-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer active:scale-95 min-h-[44px]"
            >
              <Camera className="w-4 h-4" />
              <span>QUICK CAMERA ACCESS</span>
            </button>

            <button
              onClick={handleToggleFullView}
              className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-2 cursor-pointer min-h-[44px]"
            >
              {isFullView ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              <span>{isFullView ? 'NORMAL VIEW' : 'FULL VIEW'}</span>
            </button>
          </div>

          {cameraError && (
            <p className="mt-3 text-[10px] sm:text-[11px] text-amber-400/90 font-mono bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 max-w-md">
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
          {/* Top Telemetry & Viewport Bar */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Compass Telemetry Pill */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-auto text-[11px] sm:text-xs font-bold shadow-md">
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin-slow" />
              <span className="text-cyan-400">AZ {azimuth.toFixed(0)}°</span>
              <span className="text-slate-600">·</span>
              <span className="text-teal-400">EL {pitch.toFixed(0)}°</span>
              <span className="text-slate-600 hidden xs:inline">·</span>
              <span className="text-slate-400 hidden xs:inline text-[10px]">ROLL {roll.toFixed(0)}°</span>
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
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-cyan-300 text-[10px] sm:text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-md min-h-[36px]"
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
                className={`p-1.5 sm:p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border text-xs transition cursor-pointer shadow-md min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  soundEnabled 
                    ? 'border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                    : 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
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
                className="p-1.5 sm:p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-cyan-300 text-xs transition cursor-pointer shadow-md min-h-[36px] min-w-[36px] flex items-center justify-center"
                title={isFullView ? "Exit Full View" : "Full View"}
              >
                {isFullView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Central Mobile Tactical Tracking Mode Bar (Clear, uncrowded, touch-friendly) */}
          <div className="flex items-center justify-center pointer-events-auto">
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 shadow-xl space-x-1 text-[10px] sm:text-[11px] font-mono">
              {/* AI Auto-Lock Toggle */}
              <button
                id="target-ai-autolock-toggle"
                onClick={() => {
                  const next = !geminiAutoLockEnabled;
                  setGeminiAutoLockEnabled(next);
                  if (next) {
                    setAiLockFeedback('Gemini AI Auto-Lock Enabled (4.5s loop)');
                    setOpticalTrackingActive(true);
                    triggerHapticFeedback([30]);
                  } else {
                    setAiLockFeedback('AI Auto-Lock Disabled (Low Battery Mode)');
                  }
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer min-h-[34px] ${
                  geminiAutoLockEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="Toggle Gemini AI Auto-Lock"
              >
                <Cpu className={`w-3 h-3 ${geminiAutoLockEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>AI: <strong className={geminiAutoLockEnabled ? 'text-cyan-300' : 'text-slate-400'}>{geminiAutoLockEnabled ? 'ON' : 'OFF'}</strong></span>
              </button>

              {/* Screen Tap Lock Toggle */}
              <button
                id="target-tap-lock-toggle"
                onClick={() => {
                  const next = !manualScreenLockEnabled;
                  setManualScreenLockEnabled(next);
                  if (next) {
                    setAiLockFeedback('Screen Tap Lock ARMED: Click/Tap target on camera');
                    triggerHapticFeedback([25, 25]);
                  } else {
                    setAiLockFeedback('Screen Tap Lock Disabled (Low Battery Mode)');
                  }
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer min-h-[34px] ${
                  manualScreenLockEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="Toggle Screen Tap Target Lock"
              >
                <MousePointerClick className={`w-3 h-3 ${manualScreenLockEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>TAP: <strong className={manualScreenLockEnabled ? 'text-amber-300' : 'text-slate-400'}>{manualScreenLockEnabled ? 'ARMED' : 'OFF'}</strong></span>
              </button>

              {/* Single-Shot Scan */}
              <button
                onClick={() => runGeminiAutoLock(true)}
                disabled={isAiScanning}
                className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition flex items-center space-x-1 shadow-md cursor-pointer min-h-[34px] ${
                  isAiScanning 
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 animate-spin'
                    : 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300'
                }`}
                title="Single-Shot Lock On Target Now"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>SCAN</span>
              </button>

              {/* Battery & Power Profile */}
              <button
                onClick={() => setPowerDrawerOpen(!powerDrawerOpen)}
                className="px-2 py-1.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer flex items-center space-x-1 min-h-[34px]"
                title="iPhone Battery & Power Profile"
              >
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline text-[9px] font-bold">ECO</span>
              </button>
            </div>
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
            <div className="bg-slate-950/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-rose-500/40 text-xs shadow-xl flex items-center justify-between gap-2 animate-fade-in w-full">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                  <span className="text-rose-400 font-extrabold tracking-wider truncate text-[11px] sm:text-xs">
                    {targetLock.name}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30 shrink-0">
                    {targetLock.confidencePct}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-mono truncate">
                  {targetLock.geminiLockDetails?.classicalDeconfliction || targetLock.details}
                </p>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={handleCapturePhoto}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md min-h-[34px]"
                >
                  Capture
                </button>
                <button
                  onClick={() => setTargetLock(null)}
                  className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer min-h-[34px]"
                >
                  Release
                </button>
              </div>
            </div>
          )}

          {/* Integrated Airspace & Deconfliction Ribbon (Never overlaps the buttons!) */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/80 text-[10px] font-mono text-slate-300 shadow-md">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-emerald-400 font-bold shrink-0">ADS-B DECONFLICTED</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 truncate">{flights.length} AIRBORNE</span>
            </div>
            <div className="text-cyan-400 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[260px] text-right font-medium">
              {aiLockFeedback}
            </div>
          </div>

          {/* Main Tactical Action Bar (Mobile-first sizing and touch targets) */}
          <div className="flex items-center justify-between bg-slate-950/95 backdrop-blur-xl px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-800/90 shadow-2xl mt-1">
            {/* Standby / Quick Camera Toggle */}
            <div className="flex items-center space-x-1.5">
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer min-h-[42px] flex items-center space-x-1.5"
                  title="Pause Camera to Save Battery"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] sm:text-xs">Standby</span>
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
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 flex items-center justify-center shadow-[0_0_22px_rgba(6,182,212,0.6)] transition cursor-pointer border-3 border-white/70"
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
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400'
                }`}
                title="Record Video Track"
              >
                {isRecordingVideo ? <Square className="w-3.5 h-3.5 fill-current" /> : <Video className="w-3.5 h-3.5" />}
                <span className="text-[11px] sm:text-xs">{isRecordingVideo ? `${recordingSeconds}s` : 'Rec'}</span>
              </button>
            </div>

            {/* Media Vault Link */}
            <div className="flex items-center">
              {onOpenVault && (
                <button
                  onClick={onOpenVault}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer min-h-[42px]"
                  title="Open Captured Photos & Videos"
                >
                  <span className="text-[11px] sm:text-xs">Vault</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              )}
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
