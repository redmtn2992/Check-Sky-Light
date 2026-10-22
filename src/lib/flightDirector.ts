import { LocationCoords, FlightTrack } from '../types';

export interface FlightGuideResult {
  hasTarget: boolean;
  flight?: FlightTrack;
  distanceMiles: number;
  bearingDeg: number;
  elevationDeg: number;
  deltaAz: number;     // Offset from phone center (-180 to 180)
  deltaPitch: number;  // Offset from phone pitch (-90 to 90)
  inView: boolean;     // True if roughly within camera field of view
  screenXPct: number;  // 0-100%
  screenYPct: number;  // 0-100%
  guideLabel: string;
}

// Earth radius in nautical miles
const EARTH_RADIUS_NM = 3440.065;

function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function calculateFlightGuide(
  userLoc: LocationCoords,
  phoneAz: number,
  phonePitch: number,
  flights: FlightTrack[]
): FlightGuideResult | null {
  if (!flights || flights.length === 0) return null;

  const validFlights = flights.filter(f => f.latitude && f.longitude);
  if (validFlights.length === 0) return null;

  let bestFlight: FlightTrack | null = null;
  let minAngularDistance = Infinity;
  let bestMetrics = {
    distanceMiles: 0,
    bearingDeg: 0,
    elevationDeg: 0,
    deltaAz: 0,
    deltaPitch: 0,
    inView: false,
    screenXPct: 50,
    screenYPct: 50
  };

  const userLatRad = deg2rad(userLoc.lat);
  const userLngRad = deg2rad(userLoc.lng);

  for (const f of validFlights) {
    const fLatRad = deg2rad(f.latitude);
    const fLngRad = deg2rad(f.longitude);

    // Great circle distance
    const dLat = fLatRad - userLatRad;
    const dLng = fLngRad - userLngRad;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLatRad) * Math.cos(fLatRad) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distMiles = c * 3958.8; // Statute miles

    // Initial bearing
    const y = Math.sin(dLng) * Math.cos(fLatRad);
    const x = 
      Math.cos(userLatRad) * Math.sin(fLatRad) -
      Math.sin(userLatRad) * Math.cos(fLatRad) * Math.cos(dLng);
    let bearing = (rad2deg(Math.atan2(y, x)) + 360) % 360;

    // Approximate elevation angle based on altitude (feet -> miles)
    const altMiles = (f.altitudeFeet || 25000) / 5280;
    const elevation = rad2deg(Math.atan2(altMiles, Math.max(0.5, distMiles)));

    // Angular offset from phone's current point of aim
    const dAz = ((bearing - phoneAz + 540) % 360) - 180;
    const dPitch = elevation - phonePitch;

    // Angular distance from current aim
    const angularDist = Math.hypot(dAz, dPitch);

    // Prioritize flights closest to current aim, or closest in distance if none in front
    const score = angularDist * 0.7 + Math.min(distMiles, 50) * 0.3;

    if (score < minAngularDistance) {
      minAngularDistance = score;
      bestFlight = f;

      // Typical phone camera FOV is ~60° horizontal (±30°) and ~45° vertical (±22°)
      const inView = Math.abs(dAz) <= 25 && Math.abs(dPitch) <= 18;

      // Map to screen percentage (50% = center)
      const screenXPct = Math.max(5, Math.min(95, 50 + (dAz / 25) * 45));
      const screenYPct = Math.max(10, Math.min(90, 50 - (dPitch / 18) * 40));

      bestMetrics = {
        distanceMiles: Math.round(distMiles * 10) / 10,
        bearingDeg: Math.round(bearing),
        elevationDeg: Math.round(elevation),
        deltaAz: Math.round(dAz),
        deltaPitch: Math.round(dPitch),
        inView,
        screenXPct,
        screenYPct
      };
    }
  }

  if (!bestFlight) return null;

  const callsign = bestFlight.callsign?.trim() || bestFlight.airline || 'Airliner';
  const label = `${callsign} • ${bestMetrics.distanceMiles}mi • ${Math.round(bestFlight.altitudeFeet || 20000)}ft`;

  return {
    hasTarget: true,
    flight: bestFlight,
    ...bestMetrics,
    guideLabel: label
  };
}
