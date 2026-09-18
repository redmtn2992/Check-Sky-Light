export interface SightlinePoint {
  lat: number;
  lng: number;
  azimuth: number;
  elevation: number;
  label: string;
}

export interface TriangulationResult {
  intersectionLat: number;
  intersectionLng: number;
  distWitness1Miles: number;
  distWitness2Miles: number;
  calculatedAltitudeFt: number;
  calculatedAltitudeMeters: number;
  elevation1Deg: number;
  elevation2Deg: number;
  valid: boolean;
  notes: string;
}

export interface TrajectoryResult {
  distanceMiles: number;
  distanceKm: number;
  groundSpeedMph: number;
  groundSpeedKnots: number;
  machNumber: number;
  heading: number;
  flightCategory: 'Subsonic' | 'Transonic' | 'Supersonic' | 'Hypersonic' | 'Instantaneous Extreme Acceleration';
  accelerationG: number;
}

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

export interface MilitaryAirspace {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  radiusKm: number;
  type: string;
  color: string;
  description: string;
  controllingAgency: string;
  alertLevel: 'ACTIVE' | 'HOT_RANGE' | 'RESTRICTED' | 'STANDBY';
}

export const deg2rad = (deg: number): number => (deg * Math.PI) / 180;
export const rad2deg = (rad: number): number => (rad * 180) / Math.PI;

export const calculateDistanceMiles = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const phi1 = deg2rad(lat1);
  const phi2 = deg2rad(lat2);
  const deltaLambda = deg2rad(lon2 - lon1);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return Math.round((rad2deg(theta) + 360) % 360);
};

export const calculateDestinationPoint = (
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceMiles: number
): { lat: number; lng: number } => {
  const R = 3958.8;
  const delta = distanceMiles / R;
  const theta = deg2rad(bearingDeg);
  const phi1 = deg2rad(lat);
  const lambda1 = deg2rad(lng);
  const phi2 = Math.asin(Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta));
  const lambda2 = lambda1 + Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(phi1), Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2));
  return {
    lat: Math.round(rad2deg(phi2) * 10000) / 10000,
    lng: Math.round(rad2deg(lambda2) * 10000) / 10000
  };
};

export const calculateSightlineIntersection = (
  lat1: number,
  lon1: number,
  brg1: number,
  lat2: number,
  lon2: number,
  brg2: number,
  elev1Deg: number = 25,
  elev2Deg: number = 25
): TriangulationResult => {
  const phi1 = deg2rad(lat1);
  const lambda1 = deg2rad(lon1);
  const phi2 = deg2rad(lat2);
  const lambda2 = deg2rad(lon2);
  const theta13 = deg2rad(brg1);
  const theta23 = deg2rad(brg2);
  const deltaPhi = phi2 - phi1;
  const deltaLambda = lambda2 - lambda1;

  const delta12 = 2 * Math.asin(Math.sqrt(Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)));
  if (delta12 === 0) {
    return {
      intersectionLat: lat1,
      intersectionLng: lon1,
      distWitness1Miles: 0,
      distWitness2Miles: 0,
      calculatedAltitudeFt: 0,
      calculatedAltitudeMeters: 0,
      elevation1Deg: elev1Deg,
      elevation2Deg: elev2Deg,
      valid: false,
      notes: 'Witness 1 and Witness 2 are at identical coordinates.'
    };
  }

  const cosThetaA = (Math.sin(phi2) - Math.sin(phi1) * Math.cos(delta12)) / (Math.sin(delta12) * Math.cos(phi1));
  const cosThetaB = (Math.sin(phi1) - Math.sin(phi2) * Math.cos(delta12)) / (Math.sin(delta12) * Math.cos(phi2));
  const thetaA = Math.acos(Math.min(Math.max(cosThetaA, -1), 1));
  const thetaB = Math.acos(Math.min(Math.max(cosThetaB, -1), 1));

  const theta12 = Math.sin(deltaLambda) > 0 ? thetaA : 2 * Math.PI - thetaA;
  const theta21 = Math.sin(deltaLambda) > 0 ? 2 * Math.PI - thetaB : thetaB;

  const alpha1 = (theta13 - theta12 + Math.PI) % (2 * Math.PI) - Math.PI;
  const alpha2 = (theta21 - theta23 + Math.PI) % (2 * Math.PI) - Math.PI;

  if (Math.sin(alpha1) === 0 && Math.sin(alpha2) === 0) {
    return {
      intersectionLat: (lat1 + lat2) / 2,
      intersectionLng: (lon1 + lon2) / 2,
      distWitness1Miles: 0,
      distWitness2Miles: 0,
      calculatedAltitudeFt: 0,
      calculatedAltitudeMeters: 0,
      elevation1Deg: elev1Deg,
      elevation2Deg: elev2Deg,
      valid: false,
      notes: 'Sightline vectors are parallel (infinite intersection distance).'
    };
  }

  const cosAlpha3 = -Math.cos(alpha1) * Math.cos(alpha2) + Math.sin(alpha1) * Math.sin(alpha2) * Math.cos(delta12);
  const delta13 = Math.atan2(Math.sin(delta12) * Math.sin(alpha1) * Math.sin(alpha2), Math.cos(alpha2) + Math.cos(alpha1) * cosAlpha3);
  const phi3 = Math.asin(Math.sin(phi1) * Math.cos(delta13) + Math.cos(phi1) * Math.sin(delta13) * Math.cos(theta13));
  const deltaLambda13 = Math.atan2(Math.sin(theta13) * Math.sin(delta13) * Math.cos(phi1), Math.cos(delta13) - Math.sin(phi1) * Math.sin(phi3));
  const lambda3 = lambda1 + deltaLambda13;

  const iLat = rad2deg(phi3);
  const iLng = (rad2deg(lambda3) + 540) % 360 - 180;

  const d1 = calculateDistanceMiles(lat1, lon1, iLat, iLng);
  const d2 = calculateDistanceMiles(lat2, lon2, iLat, iLng);

  const altFeet1 = d1 * 5280 * Math.tan(deg2rad(Math.max(1, elev1Deg)));
  const altFeet2 = d2 * 5280 * Math.tan(deg2rad(Math.max(1, elev2Deg)));
  const avgAltFeet = Math.round((altFeet1 + altFeet2) / 2);
  const avgAltMeters = Math.round(avgAltFeet * 0.3048);
  const valid = !isNaN(iLat) && !isNaN(iLng) && d1 < 500 && d2 < 500;

  return {
    intersectionLat: Math.round(iLat * 10000) / 10000,
    intersectionLng: Math.round(iLng * 10000) / 10000,
    distWitness1Miles: d1,
    distWitness2Miles: d2,
    calculatedAltitudeFt: avgAltFeet,
    calculatedAltitudeMeters: avgAltMeters,
    elevation1Deg: elev1Deg,
    elevation2Deg: elev2Deg,
    valid,
    notes: valid
      ? `Geometric intersection confirmed at ${d1} mi from Witness 1 (${elev1Deg}° elev) & ${d2} mi from Witness 2 (${elev2Deg}° elev). Estimated Object Altitude: ${avgAltFeet.toLocaleString()} ft MSL.`
      : 'Vectors diverge or exceed local horizon calculation limit.'
  };
};

export const calculateTrajectorySpeed = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  durationSeconds: number = 4
): TrajectoryResult => {
  const distMiles = calculateDistanceMiles(lat1, lon1, lat2, lon2);
  const distKm = Math.round(distMiles * 1.60934 * 10) / 10;
  const sec = Math.max(0.5, durationSeconds);
  const groundSpeedMph = Math.round((distMiles / sec) * 3600);
  const groundSpeedKnots = Math.round(groundSpeedMph * 0.868976);
  const machNumber = Math.round((groundSpeedMph / 767.2) * 10) / 10;
  const heading = calculateBearing(lat1, lon1, lat2, lon2);
  let flightCategory: TrajectoryResult['flightCategory'] = 'Subsonic';
  if (machNumber >= 5) flightCategory = 'Hypersonic';
  else if (machNumber > 1.2) flightCategory = 'Supersonic';
  else if (machNumber >= 0.8) flightCategory = 'Transonic';
  if (machNumber > 15 || groundSpeedMph > 12000) flightCategory = 'Instantaneous Extreme Acceleration';

  const vMps = (distMiles * 1609.34) / sec;
  const accelG = Math.round((vMps / sec / 9.80665) * 10) / 10;

  return {
    distanceMiles: distMiles,
    distanceKm: distKm,
    groundSpeedMph,
    groundSpeedKnots,
    machNumber,
    heading,
    flightCategory,
    accelerationG: accelG
  };
};

export const calculateCelestialEphemeris = (lat: number, lng: number, date: Date = new Date()): CelestialBody[] => {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const solarDec = 23.44 * Math.sin(deg2rad((360 / 365) * (dayOfYear - 81)));
  const hourAngle = (hours - 12) * 15 + lng;
  const sunElevRad = Math.asin(
    Math.sin(deg2rad(lat)) * Math.sin(deg2rad(solarDec)) +
      Math.cos(deg2rad(lat)) * Math.cos(deg2rad(solarDec)) * Math.cos(deg2rad(hourAngle))
  );
  const sunElevation = Math.round(rad2deg(sunElevRad));
  const sunAzimuth = Math.round((rad2deg(Math.atan2(-Math.sin(deg2rad(hourAngle)), Math.tan(deg2rad(solarDec)) * Math.cos(deg2rad(lat)) - Math.sin(deg2rad(lat)) * Math.cos(deg2rad(hourAngle)))) + 360) % 360);

  const venusAzimuth = (sunAzimuth + 48) % 360;
  const venusElevation = Math.max(-15, Math.min(42, Math.round(sunElevation + 18)));

  const jupiterAzimuth = (sunAzimuth + 155) % 360;
  const jupiterElevation = Math.max(-20, Math.min(68, Math.round(35 + 20 * Math.sin(deg2rad(hourAngle + 45)))));

  const marsAzimuth = (sunAzimuth + 210) % 360;
  const marsElevation = Math.max(-25, Math.min(55, Math.round(28 + 15 * Math.cos(deg2rad(hourAngle - 30)))));

  const moonAzimuth = (sunAzimuth + 180 + dayOfYear * 12.2) % 360;
  const moonElevation = Math.max(-30, Math.min(75, Math.round(40 + 25 * Math.sin(deg2rad(hourAngle + 90)))));

  return [
    {
      id: 'cel-venus',
      name: 'Venus (Evening/Morning Star)',
      symbol: '♀',
      azimuth: Math.round(venusAzimuth),
      elevation: venusElevation,
      magnitude: -4.4,
      color: '#fef08a',
      isAboveHorizon: venusElevation > 0,
      description: 'Brightest natural celestial object after the Moon. Scintillates heavily near horizon causing high rate of UAP false alarms.',
      uapConfusionRisk: venusElevation > 0 && venusElevation < 35 ? 'CRITICAL' : 'MODERATE'
    },
    {
      id: 'cel-jupiter',
      name: 'Jupiter (Gas Giant)',
      symbol: '♃',
      azimuth: Math.round(jupiterAzimuth),
      elevation: jupiterElevation,
      magnitude: -2.6,
      color: '#fed7aa',
      isAboveHorizon: jupiterElevation > 0,
      description: 'Brilliant steady yellowish-white beacon in clear night skies.',
      uapConfusionRisk: jupiterElevation > 0 ? 'HIGH' : 'LOW'
    },
    {
      id: 'cel-mars',
      name: 'Mars (Red Planet)',
      symbol: '♂',
      azimuth: Math.round(marsAzimuth),
      elevation: marsElevation,
      magnitude: -0.5,
      color: '#f87171',
      isAboveHorizon: marsElevation > 0,
      description: 'Noticeable reddish hue, steady non-blinking illumination.',
      uapConfusionRisk: marsElevation > 0 ? 'MODERATE' : 'LOW'
    },
    {
      id: 'cel-moon',
      name: 'Moon',
      symbol: '☾',
      azimuth: Math.round(moonAzimuth),
      elevation: moonElevation,
      magnitude: -12.7,
      color: '#e2e8f0',
      isAboveHorizon: moonElevation > 0,
      description: 'Primary astronomical body, causes optical halo & cloud back-illumination.',
      uapConfusionRisk: 'LOW'
    },
    {
      id: 'cel-sun',
      name: 'Sun',
      symbol: '☉',
      azimuth: Math.round(sunAzimuth),
      elevation: sunElevation,
      magnitude: -26.7,
      color: '#fbbf24',
      isAboveHorizon: sunElevation > 0,
      description: 'Solar transit position. Sun glint off high-altitude satellites and mylar balloons occurs at twilight.',
      uapConfusionRisk: sunElevation < 0 && sunElevation > -18 ? 'HIGH' : 'LOW'
    }
  ];
};

export const SPECIAL_USE_AIRSPACES: MilitaryAirspace[] = [
  {
    id: 'moa-r4808n',
    name: 'Restricted Airspace R-4808N (Groom Lake / Area 51)',
    code: 'R-4808N',
    lat: 37.235,
    lng: -115.811,
    radiusKm: 75,
    type: 'Prohibited Airspace / Surface to Unlimited',
    color: '#ef4444',
    description: 'Premier classified defense aerospace testing ground & sensor testing corridor.',
    controllingAgency: 'Nellis AFB / ACC',
    alertLevel: 'HOT_RANGE'
  },
  {
    id: 'moa-w291',
    name: 'Warning Area W-291 (Southern California Offshore)',
    code: 'W-291',
    lat: 32.715,
    lng: -117.85,
    radiusKm: 120,
    type: 'Warning Area / Surface to FL600',
    color: '#06b6d4',
    description: 'Carrier Strike Group Sensor Range (USS Nimitz 2004 Tic-Tac encounter sector).',
    controllingAgency: 'FACSFAC San Diego',
    alertLevel: 'ACTIVE'
  },
  {
    id: 'moa-wsmr',
    name: 'White Sands Missile Range (WSMR / R-5107)',
    code: 'R-5107',
    lat: 33.24,
    lng: -106.35,
    radiusKm: 90,
    type: 'Restricted Airspace / Joint Defense Range',
    color: '#f59e0b',
    description: 'US Army Space & Missile Defense, High-Energy Laser & Directed Energy Testing.',
    controllingAgency: 'White Sands Range Control',
    alertLevel: 'RESTRICTED'
  },
  {
    id: 'moa-fallon',
    name: 'Fallon Range Training Complex (FRTC / NAWDC)',
    code: 'FALLON-MOA',
    lat: 39.418,
    lng: -118.7,
    radiusKm: 85,
    type: 'Military Operations Area (MOA)',
    color: '#8b5cf6',
    description: 'Naval Aviation Strike Warfare Center, Advanced Electronic Warfare & Combat Maneuvers.',
    controllingAgency: 'NAS Fallon Air Operations',
    alertLevel: 'ACTIVE'
  },
  {
    id: 'moa-eglin',
    name: 'Eglin Water Warning Area W-151 / Gulf MOA',
    code: 'W-151',
    lat: 30.2,
    lng: -86.5,
    radiusKm: 95,
    type: 'Warning Area / Multi-Domain Sensor Zone',
    color: '#10b981',
    description: 'AARO UAP Sensor Zone, 96th Test Wing Advanced Munitions & Sensor Testing.',
    controllingAgency: 'Eglin Range Control',
    alertLevel: 'ACTIVE'
  },
  {
    id: 'moa-edwards',
    name: 'R-2508 Complex (Edwards AFB / China Lake)',
    code: 'R-2508',
    lat: 35.0,
    lng: -117.5,
    radiusKm: 110,
    type: 'Restricted Airspace / Flight Test Center',
    color: '#ec4899',
    description: 'Air Force Test Center, Hypersonic Experimental Vehicles & Advanced Avionics.',
    controllingAgency: 'Edwards Flight Test Center',
    alertLevel: 'HOT_RANGE'
  }
];

export interface FlightSightline {
  azimuth: number;
  elevation: number;
  distanceKm: number;
  distanceNm: number;
  slantRangeMiles: number;
}

export function calculateFlightSightline(
  userLat: number,
  userLng: number,
  flightLat: number,
  flightLng: number,
  flightAltFt: number,
  userAltFt: number = 5000
): FlightSightline {
  const distMiles = calculateDistanceMiles(userLat, userLng, flightLat, flightLng);
  const distKm = distMiles * 1.60934;
  const distNm = distMiles * 0.868976;
  const bearing = calculateBearing(userLat, userLng, flightLat, flightLng);
  const deltaAltMiles = Math.max(0, (flightAltFt - userAltFt) / 5280);
  const slantRangeMiles = Math.sqrt(distMiles * distMiles + deltaAltMiles * deltaAltMiles);
  const elevRad = Math.atan2(deltaAltMiles, Math.max(0.08, distMiles));
  const elevation = Math.round(rad2deg(elevRad) * 10) / 10;
  return {
    azimuth: bearing,
    elevation: Math.min(90, Math.max(0, elevation)),
    distanceKm: Math.round(distKm * 10) / 10,
    distanceNm: Math.round(distNm * 10) / 10,
    slantRangeMiles: Math.round(slantRangeMiles * 10) / 10
  };
}
