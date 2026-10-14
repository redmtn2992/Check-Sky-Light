/**
 * Dual-Observer 3D Skew-Line Triangulation Engine (WGS84 / ECEF)
 * 
 * Rigorous Scientific Implementation:
 * 1. Converts Local ENU bearing rays (azimuth, elevation) to 3D Earth-Centered, Earth-Fixed (ECEF) unit vectors d1, d2.
 * 2. Evaluates the Epipolar Coplanarity Angle (epsilon) as an O(1) candidate pre-filter.
 * 3. Computes the Point of Closest Approach (POCA) between skew lines using double-precision float64.
 * 4. Applies exact directional Jacobian covariance projection along the common normal n_hat
 *    accounting for anisotropic (sigma_az, sigma_el) and cos(el) tangent-plane scaling.
 * 5. Evaluates the true 1-DOF chi-square statistic: chi^2 = delta^2 / Var(delta).
 */

export interface EcefVector3 {
  x: number;
  y: number;
  z: number;
}

export interface GeodeticCoords {
  lat: number;
  lng: number;
  altMeters?: number;
}

export interface ObserverSightline {
  coords: GeodeticCoords;
  azimuthDeg: number;
  elevationDeg: number;
  sigmaAzDeg?: number;
  sigmaElDeg?: number;
}

export interface EcefTriangulationResult {
  valid: boolean;
  pocaECEF?: EcefVector3;
  geodeticIntersection?: GeodeticCoords;
  rangeWitness1Km: number;
  rangeWitness2Km: number;
  baselineDistanceKm: number;
  convergenceAngleDeg: number;
  missDistanceMeters: number;
  rangeScaledSigmaMeters: number;
  epipolarResidualDeg: number;
  chiSquareResidual: number;
  isStatisticallyConsistent: boolean;
  rejectionReason?: string;
  notes?: string;
}

// WGS84 Constants (double precision)
const WGS84_A = 6378137.0; // Semi-major axis in meters
const WGS84_F = 1.0 / 298.257223563; // Flattening
const WGS84_E2 = WGS84_F * (2.0 - WGS84_F); // Square of eccentricity

const deg2rad = (deg: number): number => (deg * Math.PI) / 180.0;
const rad2deg = (rad: number): number => (rad * 180.0) / Math.PI;

export function geodeticToECEF(coords: GeodeticCoords): EcefVector3 {
  const phi = deg2rad(coords.lat);
  const lambda = deg2rad(coords.lng);
  const h = coords.altMeters ?? 0.0;

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinLambda = Math.sin(lambda);
  const cosLambda = Math.cos(lambda);

  const N = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sinPhi * sinPhi);

  return {
    x: (N + h) * cosPhi * cosLambda,
    y: (N + h) * cosPhi * sinLambda,
    z: (N * (1.0 - WGS84_E2) + h) * sinPhi
  };
}

export function ecefToGeodetic(p: EcefVector3): GeodeticCoords {
  const x = p.x;
  const y = p.y;
  const z = p.z;

  const pDistance = Math.sqrt(x * x + y * y);
  const b = WGS84_A * (1.0 - WGS84_F);
  const ePrime2 = (WGS84_A * WGS84_A - b * b) / (b * b);

  const theta = Math.atan2(z * WGS84_A, pDistance * b);
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  const phi = Math.atan2(
    z + ePrime2 * b * sinTheta * sinTheta * sinTheta,
    pDistance - WGS84_E2 * WGS84_A * cosTheta * cosTheta * cosTheta
  );
  const lambda = Math.atan2(y, x);

  const sinPhi = Math.sin(phi);
  const N = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sinPhi * sinPhi);
  const h = pDistance / Math.cos(phi) - N;

  return {
    lat: rad2deg(phi),
    lng: (rad2deg(lambda) + 540.0) % 360.0 - 180.0,
    altMeters: Math.round(h)
  };
}

interface EnuBasis {
  E: EcefVector3;
  N: EcefVector3;
  U: EcefVector3;
}

function getEnuBasis(latDeg: number, lngDeg: number): EnuBasis {
  const phi = deg2rad(latDeg);
  const lambda = deg2rad(lngDeg);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinLambda = Math.sin(lambda);
  const cosLambda = Math.cos(lambda);

  return {
    E: { x: -sinLambda, y: cosLambda, z: 0 },
    N: { x: -sinPhi * cosLambda, y: -sinPhi * sinLambda, z: cosPhi },
    U: { x: cosPhi * cosLambda, y: cosPhi * sinLambda, z: sinPhi }
  };
}

export function bearingToEcefLOS(
  lat: number,
  lng: number,
  azimuthDeg: number,
  elevationDeg: number
): EcefVector3 {
  const az = deg2rad(azimuthDeg);
  const el = deg2rad(elevationDeg);
  const b = getEnuBasis(lat, lng);

  const ce = Math.cos(el);
  const uE = ce * Math.sin(az);
  const uN = ce * Math.cos(az);
  const uU = Math.sin(el);

  const dx = uE * b.E.x + uN * b.N.x + uU * b.U.x;
  const dy = uE * b.E.y + uN * b.N.y + uU * b.U.y;
  const dz = uE * b.E.z + uN * b.N.z + uU * b.U.z;

  const m = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return { x: dx / m, y: dy / m, z: dz / m };
}

function dot(a: EcefVector3, b: EcefVector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: EcefVector3, b: EcefVector3): EcefVector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function sub(a: EcefVector3, b: EcefVector3): EcefVector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function add(a: EcefVector3, b: EcefVector3): EcefVector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function mul(a: EcefVector3, k: number): EcefVector3 {
  return { x: a.x * k, y: a.y * k, z: a.z * k };
}

function norm(v: EcefVector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function getAzElPartials(azRad: number, elRad: number, basis: EnuBasis): { dAz: EcefVector3; dEl: EcefVector3 } {
  const ce = Math.cos(elRad);
  const se = Math.sin(elRad);
  const ca = Math.cos(azRad);
  const sa = Math.sin(azRad);

  const dAz: EcefVector3 = {
    x: ce * ca * basis.E.x - ce * sa * basis.N.x,
    y: ce * ca * basis.E.y - ce * sa * basis.N.y,
    z: ce * ca * basis.E.z - ce * sa * basis.N.z
  };

  const dEl: EcefVector3 = {
    x: -se * sa * basis.E.x - se * ca * basis.N.x + ce * basis.U.x,
    y: -se * sa * basis.E.y - se * ca * basis.N.y + ce * basis.U.y,
    z: -se * sa * basis.E.z - se * ca * basis.N.z + ce * basis.U.z
  };

  return { dAz, dEl };
}

/**
 * Primary Triangulation Routine:
 * Computes 3D Skew-line Point of Closest Approach (POCA) with exact normal-projected Jacobian covariance.
 */
export function computeEcefSkewLineTriangulation(
  obs1: ObserverSightline,
  obs2: ObserverSightline
): EcefTriangulationResult {
  const p1 = geodeticToECEF(obs1.coords);
  const p2 = geodeticToECEF(obs2.coords);

  const d1 = bearingToEcefLOS(obs1.coords.lat, obs1.coords.lng, obs1.azimuthDeg, obs1.elevationDeg);
  const d2 = bearingToEcefLOS(obs2.coords.lat, obs2.coords.lng, obs2.azimuthDeg, obs2.elevationDeg);

  const w0 = sub(p1, p2);
  const baselineDistMeters = norm(w0);
  const baselineKm = baselineDistMeters / 1000.0;

  if (baselineDistMeters < 50.0) {
    const rejectionReason = 'Observers baseline < 50 meters (insufficient parallax baseline).';
    return {
      valid: false,
      rangeWitness1Km: 0,
      rangeWitness2Km: 0,
      baselineDistanceKm: baselineKm,
      convergenceAngleDeg: 0,
      missDistanceMeters: 0,
      rangeScaledSigmaMeters: 0,
      epipolarResidualDeg: 0,
      chiSquareResidual: 0,
      isStatisticallyConsistent: false,
      rejectionReason,
      notes: rejectionReason
    };
  }

  // Cross product of sightlines
  const c = cross(d1, d2);
  const cn = norm(c);

  if (cn < 1e-12) {
    const rejectionReason = 'Sightlines are collinear or parallel (zero convergence normal).';
    return {
      valid: false,
      rangeWitness1Km: 0,
      rangeWitness2Km: 0,
      baselineDistanceKm: baselineKm,
      convergenceAngleDeg: 0,
      missDistanceMeters: 0,
      rangeScaledSigmaMeters: 0,
      epipolarResidualDeg: 0,
      chiSquareResidual: 999,
      isStatisticallyConsistent: false,
      rejectionReason,
      notes: rejectionReason
    };
  }

  const nh = mul(c, 1.0 / cn);
  const delta = dot(w0, nh); // Signed miss distance along common normal
  const missDistanceMeters = Math.abs(delta);

  // Convergence Angle
  const b = dot(d1, d2);
  const d = dot(d1, w0);
  const e = dot(d2, w0);
  const denom = 1.0 - b * b;

  const convergenceAngleRad = Math.acos(Math.min(1.0, Math.max(-1.0, b)));
  const convergenceAngleDeg = rad2deg(convergenceAngleRad);

  // Epipolar coplanarity check
  const bUnit = mul(w0, 1.0 / baselineDistMeters);
  const normalPlane = cross(bUnit, d1);
  const normalMag = norm(normalPlane);
  let epipolarResidualDeg = 0.0;

  if (normalMag > 1e-6) {
    const planeHat = mul(normalPlane, 1.0 / normalMag);
    epipolarResidualDeg = rad2deg(Math.asin(Math.min(1.0, Math.abs(dot(d2, planeHat)))));
  }

  if (convergenceAngleDeg < 8.0) {
    const rejectionReason = `Convergence angle ${convergenceAngleDeg.toFixed(1)}° < 8.0° (sightlines near-parallel; range mathematically ill-conditioned).`;
    return {
      valid: false,
      rangeWitness1Km: 0,
      rangeWitness2Km: 0,
      baselineDistanceKm: baselineKm,
      convergenceAngleDeg,
      missDistanceMeters,
      rangeScaledSigmaMeters: 0,
      epipolarResidualDeg,
      chiSquareResidual: 999,
      isStatisticallyConsistent: false,
      rejectionReason,
      notes: rejectionReason
    };
  }

  // Ray parameters along each ray to POCA
  const s = (b * e - d) / denom;
  const t = (e - b * d) / denom;

  if (s <= 0 || t <= 0) {
    const rejectionReason = 'Sightlines diverge or point of intersection lies behind observer horizon (s ≤ 0 or t ≤ 0).';
    return {
      valid: false,
      rangeWitness1Km: Math.max(0, s / 1000.0),
      rangeWitness2Km: Math.max(0, t / 1000.0),
      baselineDistanceKm: baselineKm,
      convergenceAngleDeg,
      missDistanceMeters,
      rangeScaledSigmaMeters: 0,
      epipolarResidualDeg,
      chiSquareResidual: 999,
      isStatisticallyConsistent: false,
      rejectionReason,
      notes: rejectionReason
    };
  }

  // Exact Directional Jacobian Variance Propagation along the Common Normal
  // g = w0 - nh * delta
  const g = sub(w0, mul(nh, delta));
  const g1 = mul(cross(d2, g), 1.0 / cn); // d(delta)/d(u1)
  const g2 = mul(cross(g, d1), 1.0 / cn); // d(delta)/d(u2)

  const sAz1 = deg2rad(obs1.sigmaAzDeg ?? 1.5);
  const sEl1 = deg2rad(obs1.sigmaElDeg ?? 0.8);
  const sAz2 = deg2rad(obs2.sigmaAzDeg ?? 1.5);
  const sEl2 = deg2rad(obs2.sigmaElDeg ?? 0.8);

  const basis1 = getEnuBasis(obs1.coords.lat, obs1.coords.lng);
  const basis2 = getEnuBasis(obs2.coords.lat, obs2.coords.lng);

  const part1 = getAzElPartials(deg2rad(obs1.azimuthDeg), deg2rad(obs1.elevationDeg), basis1);
  const part2 = getAzElPartials(deg2rad(obs2.azimuthDeg), deg2rad(obs2.elevationDeg), basis2);

  const a1 = dot(g1, part1.dAz);
  const e1 = dot(g1, part1.dEl);
  const var1 = sAz1 * sAz1 * a1 * a1 + sEl1 * sEl1 * e1 * e1;

  const a2 = dot(g2, part2.dAz);
  const e2 = dot(g2, part2.dEl);
  const var2 = sAz2 * sAz2 * a2 * a2 + sEl2 * sEl2 * e2 * e2;

  const totalVariance = var1 + var2;
  const sigmaMissMeters = Math.sqrt(Math.max(1e-12, totalVariance));

  // 1-DOF Chi-Square
  const chiSquare = totalVariance > 0 ? (delta * delta) / totalVariance : 999;
  const isStatisticallyConsistent = chiSquare <= 6.63; // 99% confidence interval

  // 3D Midpoint POCA
  const q1 = add(p1, mul(d1, s));
  const q2 = add(p2, mul(d2, t));
  const X_poca = mul(add(q1, q2), 0.5);

  const geodetic = ecefToGeodetic(X_poca);

  if ((geodetic.altMeters ?? 0) < -100) {
    const rejectionReason = 'Computed intersection lies below the WGS84 terrestrial ellipsoid.';
    return {
      valid: false,
      pocaECEF: X_poca,
      geodeticIntersection: geodetic,
      rangeWitness1Km: s / 1000.0,
      rangeWitness2Km: t / 1000.0,
      baselineDistanceKm: baselineKm,
      convergenceAngleDeg,
      missDistanceMeters,
      rangeScaledSigmaMeters: Math.round(sigmaMissMeters),
      epipolarResidualDeg,
      chiSquareResidual: chiSquare,
      isStatisticallyConsistent: false,
      rejectionReason,
      notes: rejectionReason
    };
  }

  const valid = isStatisticallyConsistent && epipolarResidualDeg < 6.0;

  return {
    valid,
    pocaECEF: X_poca,
    geodeticIntersection: geodetic,
    rangeWitness1Km: Math.round((s / 1000.0) * 10.0) / 10.0,
    rangeWitness2Km: Math.round((t / 1000.0) * 10.0) / 10.0,
    baselineDistanceKm: Math.round(baselineKm * 10.0) / 10.0,
    convergenceAngleDeg: Math.round(convergenceAngleDeg * 10.0) / 10.0,
    missDistanceMeters: Math.round(missDistanceMeters),
    rangeScaledSigmaMeters: Math.round(sigmaMissMeters),
    epipolarResidualDeg: Math.round(epipolarResidualDeg * 10.0) / 10.0,
    chiSquareResidual: Math.round(chiSquare * 100.0) / 100.0,
    isStatisticallyConsistent,
    notes: valid
      ? `3D POCA intersection verified at ${geodetic.altMeters?.toLocaleString()} m MSL. Baseline: ${baselineKm.toFixed(1)} km, convergence: ${convergenceAngleDeg.toFixed(1)}°, χ²: ${chiSquare.toFixed(2)} (within 99% gate).`
      : `Pairing rejected: miss distance ${Math.round(missDistanceMeters)} m exceeds projected covariance (χ² = ${chiSquare.toFixed(1)} > 6.63 threshold).`
  };
}
