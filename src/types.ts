export interface LocationCoords {
  lat: number;
  lng: number;
  altitude?: number;
  city?: string;
  region?: string;
}

export interface FlightTrack {
  id: string;
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitudeFeet: number;
  velocityKnots: number;
  heading: number;
  verticalRate?: number;
  squawk?: string;
  lastContact?: number;
  uncorrelatedUapProximity?: boolean;
  flightradarUrl?: string;
  flightradarLiveMapUrl?: string;
  airline?: string;
  aircraftType?: string;
  route?: string;
  distanceMiles?: number;
  bearingDeg?: number;
}

export interface WeatherBalloonTrack {
  id: string;
  sondeType: string;
  serial: string;
  agency: string;
  frequencyMHz: number;
  latitude: number;
  longitude: number;
  altitudeFeet: number;
  altitudeKm: number;
  climbRateFpm: number;
  velocityKnots: number;
  heading: number;
  launchStation: string;
  burstPredictedAltFt: number;
  specularReflectivity: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  status: 'ASCENDING' | 'FLOAT' | 'BURST_DESCENT';
  uapConfusionFactor: string;
  sondehubUrl?: string;
  flightradarUrl?: string;
  distanceMiles?: number;
  bearingDeg?: number;
}

export type SatelliteTrack = SatelliteData;

export interface CelestialBody {
  id: string;
  name: string;
  symbol: string;
  azimuth: number;
  elevation: number;
  magnitude: number;
  color: string;
  isAboveHorizon: boolean;
  description: string;
  uapConfusionRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface FlightData {
  id: string;
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  lat: number;
  lng: number;
  altitudeFt: number;
  speedKnots: number;
  heading: number;
  squawk: string;
  distanceKm: number;
  aircraftType: string;
  transponderActive: boolean;
  flightradarUrl?: string;
}

export interface FlightradarDetails {
  flightNumber: string;
  callsign: string;
  airline: string;
  airlineIataIcao: string;
  aircraftType: string;
  registration: string;
  origin: { code: string; name: string; city: string };
  destination: { code: string; name: string; city: string };
  status: string;
  altitudeFt: number;
  speedKnots: number;
  heading: number;
  squawk: string;
  lat: number;
  lng: number;
  flightradarUrl: string;
  flightradarLiveMapUrl: string;
  flightProgressPct: number;
  estimatedArrival: string;
  scheduledDeparture: string;
  transponderActive: boolean;
}

export interface SatelliteData {
  id: string;
  name: string;
  constellation: string;
  lat: number;
  lng: number;
  altitudeKm: number;
  magnitude: number;
  azimuth: number;
  elevation: number;
  passEndTime: string;
  isTrainPass?: boolean;
  inclinationDeg?: number;
}

export interface BalloonData {
  id: string;
  sondeType: string;
  serial: string;
  agency: string;
  frequencyMHz: number;
  lat: number;
  lng: number;
  altitudeFt: number;
  altitudeKm: number;
  climbRateMps?: number;
  speedKnots: number;
  heading: number;
  status: 'ASCENDING' | 'FLOAT' | 'BURST_DESCENT';
  launchSite?: string;
  distanceKm: number;
  tempCelsius?: number;
  sondehubUrl?: string;
}

export interface AtmosphericData {
  cloudCoverPct: number;
  scintillationIndex: number;
  lightPollutionBortle: number;
  temperatureInversion: boolean;
  venusVisibilityPct: number;
}

export interface TelemetryFactor {
  factor: string;
  scoreImpact: number;
  status: 'nominal' | 'anomalous' | 'uncertain';
  detail: string;
}

export interface SkyVerificationResult {
  probabilityScore: number;
  verdict: 'IDENTIFIED_FLIGHT' | 'IDENTIFIED_SATELLITE' | 'IDENTIFIED_BALLOON' | 'NATURAL_PHENOMENON' | 'UNCORRELATED_ANOMALY' | 'HIGH_PROBABILITY_UAP' | 'IDENTIFIED_TERRESTRIAL_FIXTURE';
  matchedFlight?: FlightData;
  matchedSatellite?: SatelliteData;
  matchedBalloon?: BalloonData;
  summary: string;
  aiAnalysisText: string;
  flightMatches: FlightData[];
  satelliteMatches: SatelliteData[];
  balloonMatches: BalloonData[];
  telemetryFactors: TelemetryFactor[];
  timestamp: string;
  userCoords: LocationCoords;
}

export interface OpticalArtifactBreakdown {
  artifact: string;
  likelihoodPct: number;
  explanation: string;
}

export interface MediaProvenance {
  isAiGenerated: boolean;
  accuracyScore: number;
  sourcePlatform?: string;
  aiModelSignature?: string;
  physicalPlausibilityScore: number;
  radarCorrelationScore: number;
  detectionVerdict: string;
}

export interface PhotoAnalysisResult {
  isAnomaly: boolean;
  anomalyScore: number;
  classification: string;
  confidence: number;
  opticalBreakdown: OpticalArtifactBreakdown[];
  detectedObjects: string[];
  detailedAnalysis: string;
  estimatedAltitudeSpeed?: string;
  recommendation: string;
  timestamp: string;
  provenance?: MediaProvenance;
}

export interface VideoKinematicAnalysis {
  accelerationG: string;
  instantaneousTurn: string;
  propulsionPlume: string;
  antiCollisionStrobe: string;
  radarCorrelation: string;
}

export interface VideoAnalysisResult {
  isAnomaly: boolean;
  anomalyScore: number;
  classification: string;
  confidence: number;
  kinematicAnalysis: VideoKinematicAnalysis;
  opticalBreakdown: OpticalArtifactBreakdown[];
  detectedObjects: string[];
  detailedAnalysis: string;
  observerDecisionGuide: string;
  recommendedAction: 'LOG_HIGH_PRIORITY_SIGHTING' | 'MONITOR_FURTHER' | 'DISREGARD_CONVENTIONAL' | string;
  keyObservations: string[];
  timestamp: string;
  extractedFrames?: string[];
  provenance?: MediaProvenance;
}

export interface SightingReport {
  id: string;
  title: string;
  observerName: string;
  observerBadge: string;
  timestamp: string;
  location: LocationCoords;
  locationName: string;
  description: string;
  probabilityScore: number;
  status: 'UNVERIFIED' | 'COMMUNITY_VERIFIED' | 'AI_ANOMALY_CONFIRMED' | 'EXPLAINED_FLIGHT';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaThumbnail?: string;
  upvotes: number;
  upvotedByMe?: boolean;
  commentsCount: number;
  tags: string[];
  matchedTelemetryNote?: string;
}

export interface GeminiForensicAnalysis {
  id: string;
  sourceType: 'photo' | 'video' | 'audio' | 'url';
  sourceTitle: string;
  sourcePreviewUrl?: string;
  timestamp: string;
  authenticityScore: number; // 0 to 100
  fakeProbability: number;   // 0 to 100
  verdict: 'AUTHENTIC_INCIDENT' | 'UNRESOLVED' | 'SYNTHETIC_FAKE' | 'CONVENTIONAL_AIRCRAFT';
  verdictTitle: string;
  verdictSummary: string;
  confidenceScore: number; // 0 to 100
  dualLens: {
    classicalDeconfliction: string;
    metricSignature: string;
    vfxForensics: string;
  };
  fiveObservables: {
    instantaneousAcceleration: boolean;
    hypersonicVelocity: boolean;
    lowObservability: boolean;
    transmediumTravel: boolean;
    positiveLift: boolean;
  };
  kinematics?: {
    estimatedSpeed?: string;
    estimatedAltitude?: string;
    kinematicGForce?: string;
  };
  detectedFeatures: string[];
  dtcCode?: string;
  dtcTitle?: string;
  incidentPlatform?: string;
  corroborationSources?: string[];
  audioAcousticNotes?: string;
  mundaneObjectDetected?: boolean;
  mundaneCategory?: 'pet' | 'furniture' | 'vehicle' | 'selfie_friend' | 'household' | 'other';
  humorousQuirk?: string;
  educationalAeroAstronomyLesson?: {
    topic: string;
    concept: string;
    skyWatcherTip: string;
  };
  databaseCorrelations?: DatabaseCorrelationsGroup;
  deconflictionDetails?: {
    corroboratedAviationPlume?: boolean;
    faaSchedulingConflict?: boolean;
    vfxArtifactFlags?: string[];
  };
}

export interface ScholarArticleRef {
  title: string;
  authors: string;
  year: string;
  citation: string;
  relevance: string;
  url?: string;
}

export interface DatabaseCorrelationsGroup {
  mufon?: {
    caseMatch: string;
    correlationScore: number;
    morphology: string;
    databaseUrl: string;
    notes: string;
  };
  warDeptDoD?: {
    caseMatch: string;
    correlationScore: number;
    fiveObservablesTriggered: string[];
    databaseUrl: string;
    notes: string;
  };
  skywatcher?: {
    caseMatch: string;
    correlationScore: number;
    sensorModality: string;
    databaseUrl: string;
    notes: string;
  };
  scholarArticles?: ScholarArticleRef[];
}

export interface TelemetryAnalysisPayload {
  azimuth?: number;
  pitch?: number;
  roll?: number;
  angularVelocity?: number;
  apparentShape?: string;
  opticalDescription?: string;
  location?: LocationCoords;
  timestamp?: string;
  estimatedAltitude?: string;
  speedCategory?: string;
  flightCharacteristics?: string;
  mediaBase64?: string;
  sourceTitle?: string;
  notes?: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  distanceMiles?: number;
  anomalyScore?: number;
  locationName?: string;
  location?: string;
  sightingId?: string;
  isRead?: boolean;
  read?: boolean;
  severity?: 'info' | 'warning' | 'critical' | 'HIGH' | 'MEDIUM' | 'LOW';
  type?: string;
  priority?: string;
}

export type { TargetLockData } from './components/ar/ArTargetLockTypes';

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: string;
  avatar: string;
  badge: string;
  timestamp: string;
  encryptedText: string;
  decryptedText: string;
  encryptionKey: string;
  isSystem?: boolean;
  sightingAttachment?: {
    id: string;
    title: string;
    probabilityScore: number;
    locationName: string;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  iconName: string;
  activeWatchers: number;
  channelKeyHash: string;
}

export interface NuforcReport {
  id: string;
  date: string;
  city: string;
  state: string;
  country: string;
  shape: string;
  duration: string;
  summary: string;
  lat: number;
  lng: number;
  distanceKm: number;
  nuforcUrl: string;
  similarityScore?: number;
  explanationStatus?: string;
}

export interface NuforcSectorSummary {
  userCity: string;
  totalHistoricReports: number;
  topShapes: { shape: string; count: number; pct: number }[];
  recentIncidentsCount: number;
  closestDistanceKm: number;
  nuforcMapUrl: string;
  nuforcDatabankUrl: string;
}

export type LogoVariantId =
  | 'piston_saucer'
  | 'bovine_abduction'
  | 'spark_incursion'
  | 'annunciator_dash'
  | 'retro_obd2_pixel'
  | 'minimal_saucer_core'
  | 'ai_concept_render';

export type LogoColorTheme =
  | 'amber'
  | 'roswell'
  | 'cyan'
  | 'crimson'
  | 'stealth';

export interface LogoConfig {
  variantId: LogoVariantId;
  colorTheme: LogoColorTheme;
  animationMode: 'solid' | 'pulse' | 'strobe' | 'beam_scan';
  showCowLift: boolean;
  showFaultCodeBadge: boolean;
  glowIntensity: 'subtle' | 'high' | 'off';
  customFaultCode?: string;
}

export interface DtcFaultCode {
  code: string;
  title: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  description: string;
  suggestedAction: string;
}
