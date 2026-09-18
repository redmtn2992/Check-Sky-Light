export type DisplayDayNightMode =
  | 'day_antiglare'
  | 'night_tactical'
  | 'starlight_boost'
  | 'night_strobe'
  | 'red_light_nvg'
  | 'nvg_green'
  | 'flir_thermal'
  | 'overdrive';

export type TargetLockState = 'SEARCHING' | 'ACQUIRING' | 'LOCKED' | 'TRACKING';

export type TargetLockStrategy = 'hybrid' | 'ai_auto' | 'manual';

export type DeconflictionStatus =
  | 'DECONFLICTED_ZERO_TRANSPONDER'
  | 'MATCHED_ADS_B_TRANSPONDER'
  | 'MATCHED_NORAD_TLE'
  | 'OPTICAL_CORRELATING'
  | 'UNCORRELATED_AIRCRAFT'
  | 'METEOROLOGICAL_AEROSTAT'
  | 'ANOMALOUS_UNIDENTIFIED'
  | 'TERRESTRIAL_STATIC_SOURCE'
  | 'MANUAL_OPTICAL_TRACK';

export interface TargetLockData {
  id: string;
  name: string;
  type: 'UAP' | 'COMMERCIAL_FLIGHT' | 'SATELLITE' | 'WEATHER_BALLOON' | 'PLANET' | 'STAR' | 'ANOMALOUS_TARGET' | 'STATIC_TERRESTRIAL_SOURCE';
  azimuthDeg: number;
  elevationDeg: number;
  azimuthStr: string;
  elevationStr: string;
  distance: string;
  angularVelocityDegPerSec: number;
  estimatedSpeed: string;
  estimatedAltitude: string;
  kinematicGForce: string;
  deconflictionStatus: DeconflictionStatus;
  details: string;
  airline?: string;
  callsign?: string;
  squawk?: string;
  aircraftModel?: string;
  corridorScanActive?: boolean;
  screenX?: number; // 0-100 % of viewport
  screenY?: number; // 0-100 % of viewport
  isOffScreen?: boolean;
  offScreenAzDelta?: number;
  offScreenPitchDelta?: number;
  lockState: TargetLockState;
  confidencePct: number;
  frequency?: string;
  opticalSignature?: string;
  opticalCentroidLocked?: boolean;
  contrastRatio?: number;
  leadX?: number;
  leadY?: number;
  isNonInertial?: boolean;
  timestamp: string;
  targetId?: string;
  rangeKm?: number;
  altitudeM?: number;
  speedMach?: number;
  anomalyScore?: number;
  confidence?: number;
  transponderStatus?: string;
  airspaceDeconfliction?: string;
  lockAcquiredTimestamp?: string;
  geminiLockDetails?: {
    detected: boolean;
    confidencePct: number;
    classicalDeconfliction?: string;
    metricSignature?: string;
    analysisNotes?: string;
    isGeminiAiLocked?: boolean;
  };
}

export interface SyntheticUapPreset {
  name: string;
  code: string;
  type: string;
  speed: string;
  altitude: string;
  gForce: string;
  details: string;
  opticalSig: string;
}

export const SYNTHETIC_UAP_PRESETS: SyntheticUapPreset[] = [
  {
    name: 'Tic-Tac Transmedium Object',
    code: 'UAP-TT-01',
    type: 'CLASS 1: TIC-TAC',
    speed: 'Hovering -> Instant Mach 8.2',
    altitude: 'FL280 (28,000 FT)',
    gForce: '140+ G Instantaneous Vector Shift',
    details: 'Oblong matte-white cylindrical body with zero visible control surfaces, wings, or exhaust plumes. Instantaneous non-inertial acceleration.',
    opticalSig: 'Matte White Non-Reflective, Zero Thermal Plume'
  },
  {
    name: 'Amber Plasma Orb (Fast-Mover)',
    code: 'UAP-ORB-09',
    type: 'CLASS 3: LUMINOUS SPHERE',
    speed: 'Mach 3.8 Hypersonic',
    altitude: '18,500 FT AGL',
    gForce: '65 G Sharp Orthogonal Turn',
    details: 'Self-luminous pulsating amber spheroid emitting high-frequency electromagnetic corona without sound or sonic boom.',
    opticalSig: '589nm Sodium Amber Luminescence, High Scintillation'
  },
  {
    name: 'Silent Black Triangle',
    code: 'UAP-TRI-03',
    type: 'CLASS 2: DELTA TRIANGLE',
    speed: '40 Knots Loitering Silent',
    altitude: '3,200 FT Low Altitude',
    gForce: '0 G Silent Hover Mechanism',
    details: 'Equilateral dark triangular craft with three white/amber perimeter corner lights and pulsing central red beacon. Completely silent.',
    opticalSig: 'Low Radar Cross-Section, Three Corner Beacons'
  },
  {
    name: 'Hypervelocity Zenith Flash',
    code: 'UAP-ZEN-07',
    type: 'CLASS 5: HYPERVELOCITY PHENOMENON',
    speed: 'Mach 22+ Re-entry Trajectory Override',
    altitude: '140 km Upper Stratosphere',
    gForce: '200+ G Angle Deflection',
    details: 'High-altitude point source moving across 90° zenith in 1.4 seconds before right-angle redirection into deep space.',
    opticalSig: 'High-Intensity UV/Blue Flash with Zero Trail'
  }
];

export interface UapObservablesBreakdown {
  instantaneousAcceleration: {
    detected: boolean;
    rating: string;
    details: string;
  };
  hypersonicVelocity: {
    detected: boolean;
    rating: string;
    details: string;
  };
  lowObservability: {
    detected: boolean;
    rating: string;
    details: string;
  };
  transmediumTravel: {
    detected: boolean;
    rating: string;
    details: string;
  };
  positiveLift: {
    detected: boolean;
    rating: string;
    details: string;
  };
}

export interface UapAiAnalysisResult {
  probabilityScore: number; // 0 to 100%
  confidencePct: number; // 0 to 100%
  verdict: 'HIGH_PROBABILITY_UAP' | 'UNCORRELATED_ANOMALY' | 'IDENTIFIED_FLIGHT' | 'IDENTIFIED_SATELLITE' | 'NATURAL_PHENOMENON' | 'IDENTIFIED_TERRESTRIAL_FIXTURE';
  summaryHeading: string;
  aiExplanation: string;
  observables: UapObservablesBreakdown;
  deconflictionResult: string;
  matchedBenchmark: string;
  recommendedAction: string;
  timestamp: string;
}

export interface ArchivedUapIncident {
  id: string;
  title: string;
  timestamp: string;
  mediaUrl: string;
  mediaType: 'photo' | 'burst' | 'video';
  targetLock: TargetLockData | null;
  location: {
    lat: number;
    lng: number;
    city?: string;
    region?: string;
  };
  azimuth: number;
  pitch: number;
  dayNightMode: DisplayDayNightMode;
  analysis: UapAiAnalysisResult;
  userNotes?: string;
  archivedAt: string;
}

export interface HarvestedTelemetryDossier {
  timestamp: string;
  gps: {
    lat: number;
    lng: number;
    altMsl?: number;
    accuracy?: number;
    city?: string;
    region?: string;
  };
  imu: {
    azimuthDeg: number;
    pitchDeg: number;
    rollDeg?: number;
  };
  target?: TargetLockData | null;
  airspaceDeconfliction: {
    adsbTransponderCount: number;
    nearestFlightCallsign?: string;
    nearestFlightDistanceNm?: number;
    matchedTransponder: boolean;
    satellitesInCorridor: number;
    matchedSatellite: boolean;
    weatherBalloonTracked: boolean;
    statusSummary: string;
  };
  kinematics: {
    angularVelocityDegPerSec: number;
    estimatedGForce: string;
    velocityProfile: string;
  };
  opticalFrameDataUrl?: string;
}
