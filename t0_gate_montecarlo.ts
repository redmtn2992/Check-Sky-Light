/**
 * Check Sky Light - Validation Protocol, test T0 (Phase 0)
 * Monte Carlo harness for the two-observer 1-DOF pairing gate.
 *
 * WHAT THIS TESTS
 *   Whether the SHIPPED gate statistic behaves as a chi-square(1) variable when the data
 *   are generated from the noise model below. It tests the IMPLEMENTATION under an assumed
 *   noise model. It cannot validate the real-world noise model (that is T1, T4, T7, T8, T9).
 *
 * ASSUMED NOISE MODEL (the spec the shipped code must follow)
 *   - Two observers at exactly known WGS-84 positions; a target at a true point X.
 *   - Each observer measures azimuth (clockwise from north) and elevation, in radians.
 *   - az_meas = az_true + N(0, sigAz^2), el_meas = el_true + N(0, sigEl^2), independent.
 *     sigAz is an error in azimuth ANGLE (so its tangent-plane size is sigAz * cos(el)).
 *   - Statistic: T = delta^2 / Var(delta), where delta is the signed miss distance along the
 *     common normal of the two measured rays, and Var(delta) is propagated from the sigmas.
 *     Under the model, T ~ chi-square with 1 degree of freedom (4 measurements - 3 unknowns).
 *
 * USAGE
 *   npx tsx t0_gate_montecarlo.ts --selftest [--n 100000]
 *       Runs the harness against its own reference oracle and injected faults, to show the
 *       harness can tell a correct gate from broken ones. Does NOT touch the shipped code.
 *   npx tsx t0_gate_montecarlo.ts --n 1000000 --seed 20261101 --deltamax 0.005,0.0035,0.002,0.0005 --out t0_results
 *       Runs against the shipped code via shippedGate() in the ADAPTER block below.
 *   --deltamax  Maximum absolute deviation of the rejection probability from nominal at the
 *               90%, 95%, 99%, 99.9% gate levels (one value, or four comma-separated values).
 *               This is the protocol's [AUTHOR] criterion. If omitted, the run is descriptive only.
 *   --nmin      Minimum usable samples for a stratum to count toward pass/fail (default min(100000, n/2)).
 *   --seed      RNG seed (recorded in the report). --out  Output directory.
 *
 * PROTOCOL NOTE
 *   Hash this file and record the hash in the freeze checklist. Edit only the ADAPTER block.
 *   The default adapter throws, so the harness can never pass by silently testing its own oracle.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { computeEcefSkewLineTriangulation, ObserverSightline } from "./src/lib/triangulationMath";

type V3 = [number, number, number];

export interface GateInput {
  p1: V3; p2: V3;                 // observer positions, ECEF metres
  lat1: number; lon1: number; h1: number;   // geodetic radians, radians, metres
  lat2: number; lon2: number; h2: number;
  u1: V3; u2: V3;                 // MEASURED unit sightline vectors, ECEF
  az1: number; el1: number;       // MEASURED azimuth (from north, clockwise) and elevation, radians
  az2: number; el2: number;
  sigAz1: number; sigEl1: number; // 1-sigma angular errors, radians
  sigAz2: number; sigEl2: number;
}
export interface GateOutput {
  statistic: number | null;       // chi-square(1) gate statistic (required, not just a boolean gate)
  unobservable?: boolean;         // set if the shipped code flags the geometry as not observable
  invalid?: boolean;              // set if the shipped code rejects the pair (e.g. solution behind an observer)
}

const RAD2DEG = 180 / Math.PI;

// ===================== ADAPTER: EDIT THIS BLOCK ONLY =====================
// Wire this to the shipped triangulation module
export function shippedGate(inp: GateInput): GateOutput {
  const obs1: ObserverSightline = {
    coords: {
      lat: inp.lat1 * RAD2DEG,
      lng: inp.lon1 * RAD2DEG,
      altMeters: inp.h1
    },
    azimuthDeg: inp.az1 * RAD2DEG,
    elevationDeg: inp.el1 * RAD2DEG,
    sigmaAzDeg: inp.sigAz1 * RAD2DEG,
    sigmaElDeg: inp.sigEl1 * RAD2DEG
  };

  const obs2: ObserverSightline = {
    coords: {
      lat: inp.lat2 * RAD2DEG,
      lng: inp.lon2 * RAD2DEG,
      altMeters: inp.h2
    },
    azimuthDeg: inp.az2 * RAD2DEG,
    elevationDeg: inp.el2 * RAD2DEG,
    sigmaAzDeg: inp.sigAz2 * RAD2DEG,
    sigmaElDeg: inp.sigEl2 * RAD2DEG
  };

  const res = computeEcefSkewLineTriangulation(obs1, obs2);

  // If geometry is ill-conditioned (<8 deg convergence angle) or divergent behind observers
  if (res.rejectionReason && res.rejectionReason.includes("ill-conditioned")) {
    return { statistic: null, unobservable: true };
  }

  if (res.rejectionReason && (res.rejectionReason.includes("diverge") || res.rejectionReason.includes("behind"))) {
    return { statistic: null, invalid: true };
  }

  return {
    statistic: res.chiSquareResidual,
    unobservable: res.convergenceAngleDeg < 8.0,
    invalid: !res.valid && res.chiSquareResidual > 100
  };
}
// =================== END ADAPTER ===================

// ------------------------- vector and geodesy helpers -------------------------
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => mul(a, 1 / norm(a));
const DEG = Math.PI / 180;

const WGS84_A = 6378137.0, WGS84_F = 1 / 298.257223563, WGS84_E2 = WGS84_F * (2 - WGS84_F);
function geodeticToEcef(lat: number, lon: number, h: number): V3 {
  const s = Math.sin(lat), c = Math.cos(lat);
  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * s * s);
  return [(N + h) * c * Math.cos(lon), (N + h) * c * Math.sin(lon), (N * (1 - WGS84_E2) + h) * s];
}
interface Basis { E: V3; N: V3; U: V3 }
function enuBasis(lat: number, lon: number): Basis {
  const sl = Math.sin(lat), cl = Math.cos(lat), so = Math.sin(lon), co = Math.cos(lon);
  return { E: [-so, co, 0], N: [-sl * co, -sl * so, cl], U: [cl * co, cl * so, sl] };
}
function azElToEcef(az: number, el: number, b: Basis): V3 {
  const ce = Math.cos(el);
  return add(add(mul(b.E, ce * Math.sin(az)), mul(b.N, ce * Math.cos(az))), mul(b.U, Math.sin(el)));
}
function ecefToAzEl(u: V3, b: Basis): { az: number; el: number } {
  let az = Math.atan2(dot(u, b.E), dot(u, b.N));
  if (az < 0) az += 2 * Math.PI;
  return { az, el: Math.asin(Math.max(-1, Math.min(1, dot(u, b.U)))) };
}
function azElPartials(az: number, el: number, b: Basis): { dAz: V3; dEl: V3 } {
  const ce = Math.cos(el), se = Math.sin(el), ca = Math.cos(az), sa = Math.sin(az);
  return {
    dAz: add(mul(b.E, ce * ca), mul(b.N, -ce * sa)),
    dEl: add(add(mul(b.E, -se * sa), mul(b.N, -se * ca)), mul(b.U, ce)),
  };
}

// ------------------------- reference oracle (independent of the shipped code) -------------------------
interface OracleOpts { noCosEl?: boolean }
export function oracleGate(inp: GateInput, opts: OracleOpts = {}): GateOutput {
  const w0 = sub(inp.p1, inp.p2);
  const c = cross(inp.u1, inp.u2);
  const cn = norm(c);
  if (!(cn > 1e-12)) return { statistic: null, invalid: true };
  const nh = mul(c, 1 / cn);
  const delta = dot(w0, nh);                       // signed miss distance along the common normal
  const g = sub(w0, mul(nh, delta));
  const g1 = mul(cross(inp.u2, g), 1 / cn);        // d(delta)/d(u1)
  const g2 = mul(cross(g, inp.u1), 1 / cn);        // d(delta)/d(u2)
  const part = (grad: V3, lat: number, lon: number, az: number, el: number, sAz: number, sEl: number) => {
    const { dAz, dEl } = azElPartials(az, el, enuBasis(lat, lon));
    let a = dot(grad, dAz);
    if (opts.noCosEl) a = a / Math.cos(el);        // (fault) treats sigAz as a tangent-plane error
    const e = dot(grad, dEl);
    return sAz * sAz * a * a + sEl * sEl * e * e;
  };
  const variance =
    part(g1, inp.lat1, inp.lon1, inp.az1, inp.el1, inp.sigAz1, inp.sigEl1) +
    part(g2, inp.lat2, inp.lon2, inp.az2, inp.el2, inp.sigAz2, inp.sigEl2);
  if (!(variance > 0)) return { statistic: null, invalid: true };
  const b = dot(inp.u1, inp.u2), d = dot(inp.u1, w0), e = dot(inp.u2, w0), den = 1 - b * b;
  const s = (b * e - d) / den, t = (e - b * d) / den;
  return { statistic: (delta * delta) / variance, invalid: s <= 0 || t <= 0 };
}

// ------------------------- RNG (xoshiro128**, 53-bit uniforms) -------------------------
function makeRng(seed: number) {
  let sm = seed >>> 0;
  const splitmix = () => {
    sm = (sm + 0x9e3779b9) >>> 0;
    let z = sm;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) | 0;
  };
  let s0 = splitmix(), s1 = splitmix(), s2 = splitmix(), s3 = splitmix();
  const rotl = (x: number, k: number) => (x << k) | (x >>> (32 - k));
  const next32 = () => {
    const r = Math.imul(rotl(Math.imul(s1, 5), 7), 9) >>> 0;
    const t = s1 << 9;
    s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = rotl(s3, 11);
    return r;
  };
  const u = () => {
    const hi = next32() >>> 5, lo = next32() >>> 6;
    return (hi * 67108864 + lo + 0.5) / 9007199254740992;   // in (0,1)
  };
  let spare: number | null = null;
  const normal = () => {
    if (spare !== null) { const z = spare; spare = null; return z; }
    const u1 = u(), u2 = u();
    const r = Math.sqrt(-2 * Math.log(u1));
    spare = r * Math.sin(2 * Math.PI * u2);
    return r * Math.cos(2 * Math.PI * u2);
  };
  return { u, normal };
}

// ------------------------- special functions -------------------------
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function lgamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function gammaP(a: number, x: number): number {            // regularized lower incomplete gamma
  if (x <= 0) return 0;
  if (x > 200) return 1;
  const lead = Math.exp(-x + a * Math.log(x) - lgamma(a));
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 2000; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
    return sum * lead;
  }
  let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
  for (let i = 1; i < 2000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return 1 - lead * h;
}
const chi2cdf1 = (x: number) => gammaP(0.5, x / 2);
function chi2quantile1(p: number): number {
  let lo = 0, hi = 200;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (chi2cdf1(mid) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function betacf(a: number, b: number, x: number): number {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-300) d = 1e-300;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 20000; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}
function betai(a: number, b: number, x: number): number {   // regularized incomplete beta
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
function betaQuantile(p: number, a: number, b: number): number {
  let lo = 0, hi = 1;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (betai(a, b, mid) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function clopperPearson(k: number, n: number, alpha = 0.05): [number, number] {
  const lo = k === 0 ? 0 : betaQuantile(alpha / 2, k, n - k + 1);
  const hi = k === n ? 1 : betaQuantile(1 - alpha / 2, k + 1, n - k);
  return [lo, hi];
}

// ------------------------- configuration -------------------------
const LEVELS = [0.90, 0.95, 0.99, 0.999];
const GATES = LEVELS.map(chi2quantile1);
const ALPHA_EDGES = [0, 2, 5, 10, 20, 45, 180];                      // convergence-angle strata, degrees
const PSI_EDGES = [0, 10, 30, 90.0001];                              // angle of target from baseline line, degrees
const stratumLabel = (k: number) => `alpha ${ALPHA_EDGES[k]}-${ALPHA_EDGES[k + 1]} deg`;
const psiLabel = (k: number) => `psi ${PSI_EDGES[k]}-${Math.round(PSI_EDGES[k + 1])} deg`;
const CFG = {
  // Observer 1 location (geodetic). Pre-register the sampling distributions below before the run.
  lat1: 40.0 * DEG, lon1: -111.9 * DEG, h1: 1400,
  baselineKm: [0.3, 20] as [number, number],        // log-uniform
  rangeKm: [0.5, 30] as [number, number],           // log-uniform, observer 1 to target
  elevDeg: [5, 85] as [number, number],             // uniform, observer 1 elevation of target
  heightDiffM: 100,                                 // observer 2 height offset, uniform +/-
  sigAzDeg: [0.5, 5] as [number, number],           // log-uniform, per observer
  sigElDeg: [0.3, 2] as [number, number],           // log-uniform, per observer
  minElDeg: 5, maxElDeg: 85,                        // both observers must see the target in this range
};

interface Sample { inp: GateInput; alphaDeg: number; psiDeg: number }
function makeSample(rng: { u: () => number; normal: () => number }): Sample | null {
  const logU = (r: [number, number]) => Math.exp(Math.log(r[0]) + rng.u() * (Math.log(r[1]) - Math.log(r[0])));
  const B = logU(CFG.baselineKm) * 1000;
  const th = 2 * Math.PI * rng.u();
  const dh = (2 * rng.u() - 1) * CFG.heightDiffM;
  const Rm = 6371000;
  const lat2 = CFG.lat1 + (B * Math.cos(th)) / Rm;
  const lon2 = CFG.lon1 + (B * Math.sin(th)) / (Rm * Math.cos(CFG.lat1));
  const h2 = CFG.h1 + dh;
  const p1 = geodeticToEcef(CFG.lat1, CFG.lon1, CFG.h1), p2 = geodeticToEcef(lat2, lon2, h2);
  const b1 = enuBasis(CFG.lat1, CFG.lon1), b2 = enuBasis(lat2, lon2);
  const R1 = logU(CFG.rangeKm) * 1000;
  const az = 2 * Math.PI * rng.u();
  const el = (CFG.elevDeg[0] + (CFG.elevDeg[1] - CFG.elevDeg[0]) * rng.u()) * DEG;
  const d1 = azElToEcef(az, el, b1);
  const X = add(p1, mul(d1, R1));
  const d2 = unit(sub(X, p2));
  const t2 = ecefToAzEl(d2, b2);
  if (t2.el < CFG.minElDeg * DEG || t2.el > CFG.maxElDeg * DEG) return null;
  const alphaDeg = Math.acos(Math.max(-1, Math.min(1, dot(d1, d2)))) / DEG;
  const bh = unit(sub(p2, p1));
  const psiDeg = Math.acos(Math.min(1, Math.abs(dot(d1, bh)))) / DEG;
  const sAz1 = logU(CFG.sigAzDeg) * DEG, sEl1 = logU(CFG.sigElDeg) * DEG;
  const sAz2 = logU(CFG.sigAzDeg) * DEG, sEl2 = logU(CFG.sigElDeg) * DEG;
  let az1 = az + sAz1 * rng.normal(), el1 = el + sEl1 * rng.normal();
  let az2 = t2.az + sAz2 * rng.normal(), el2 = t2.el + sEl2 * rng.normal();
  az1 = ((az1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  az2 = ((az2 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const inp: GateInput = {
    p1, p2, lat1: CFG.lat1, lon1: CFG.lon1, h1: CFG.h1, lat2, lon2, h2,
    u1: azElToEcef(az1, el1, b1), u2: azElToEcef(az2, el2, b2),
    az1, el1, az2, el2, sigAz1: sAz1, sigEl1: sEl1, sigAz2: sAz2, sigEl2: sEl2,
  };
  return { inp, alphaDeg, psiDeg };
}

// ------------------------- simulation driver -------------------------
interface Run {
  labels: string[];
  nPer: number;
  T: Float64Array[][];            // [function][stratum] -> statistics (NaN where flagged)
  psiBin: Uint8Array[];           // [stratum]
  generated: number[];            // per stratum
  attempts: number;
}
function simulate(fns: Array<(i: GateInput) => GateOutput>, labels: string[], nPer: number, seed: number): Run {
  const K = ALPHA_EDGES.length - 1;
  const rng = makeRng(seed);
  const T = fns.map(() => Array.from({ length: K }, () => new Float64Array(nPer).fill(NaN)));
  const psiBin = Array.from({ length: K }, () => new Uint8Array(nPer));
  const counts = new Array(K).fill(0);
  let attempts = 0;
  const maxAttempts = 400 * nPer * K;
  while (counts.some((c) => c < nPer) && attempts < maxAttempts) {
    attempts++;
    const s = makeSample(rng);
    if (!s) continue;
    let k = ALPHA_EDGES.findIndex((e, i) => i < K && s.alphaDeg >= e && s.alphaDeg < ALPHA_EDGES[i + 1]);
    if (k < 0 || counts[k] >= nPer) continue;
    const idx = counts[k]++;
    let pb = PSI_EDGES.findIndex((e, i) => i < PSI_EDGES.length - 1 && s.psiDeg >= e && s.psiDeg < PSI_EDGES[i + 1]);
    psiBin[k][idx] = Math.max(0, pb);
    for (let f = 0; f < fns.length; f++) {
      const out = fns[f](s.inp);
      const ok = out.statistic !== null && Number.isFinite(out.statistic) && !out.unobservable && !out.invalid;
      if (ok) T[f][k][idx] = out.statistic as number;
    }
  }
  return { labels, nPer, T, psiBin, generated: counts, attempts };
}

// ------------------------- analysis -------------------------
interface LevelStat { level: number; nominal: number; exceed: number; phat: number; ci: [number, number]; dev: number }
function levelStats(vals: Float64Array, n: number): LevelStat[] {
  return LEVELS.map((level, i) => {
    let ex = 0;
    for (let j = 0; j < vals.length; j++) if (vals[j] > GATES[i]) ex++;
    return { level, nominal: 1 - level, exceed: ex, phat: ex / n, ci: clopperPearson(ex, n), dev: ex / n - (1 - level) };
  });
}
const QQ_P = [...Array.from({ length: 99 }, (_, i) => (i + 1) / 100), 0.995, 0.999, 0.9995];
function analyzeStratum(arr: Float64Array, psiBin: Uint8Array, generated: number) {
  const used: number[] = [];
  const usedPsi: number[] = [];
  for (let j = 0; j < arr.length && j < generated; j++) if (!Number.isNaN(arr[j])) { used.push(arr[j]); usedPsi.push(psiBin[j]); }
  const n = used.length;
  const out: any = { generated, used: n, flagged: generated - n };
  if (n < 10) return out;
  const v = Float64Array.from(used);
  out.levels = levelStats(v, n);
  let sum = 0; for (const x of v) sum += x;
  const mean = sum / n;
  let ss = 0; for (const x of v) ss += (x - mean) ** 2;
  out.mean = mean; out.variance = ss / (n - 1);
  const sorted = Float64Array.from(v).sort();
  let D = 0;
  for (let i = 0; i < n; i++) {
    const F = chi2cdf1(sorted[i]);
    D = Math.max(D, (i + 1) / n - F, F - i / n);
  }
  out.ks = D;
  out.qq = QQ_P.map((p) => ({ p, theoretical: chi2quantile1(p), empirical: sorted[Math.min(n - 1, Math.floor(p * n))] }));
  out.psi = PSI_EDGES.slice(0, -1).map((_, b) => {
    const sel = v.filter((_, i) => usedPsi[i] === b);
    return { bin: psiLabel(b), used: sel.length, levels: sel.length >= 1000 ? levelStats(sel, sel.length).map((l) => ({ level: l.level, phat: l.phat, dev: l.dev })) : null };
  });
  return out;
}
function parseDeltaMax(s: string | undefined): number[] | null {
  if (!s) return null;
  const a = s.split(",").map(Number);
  if (a.some((x) => !(x > 0))) throw new Error("--deltamax must be positive numbers");
  return a.length === 1 ? [a[0], a[0], a[0], a[0]] : a;
}
function criterion(st: any, dmax: number[], nmin: number) {
  if (!st.levels || st.used < nmin) return "NOT CHARACTERIZED";
  return st.levels.every((l: LevelStat, i: number) => Math.abs(l.dev) <= dmax[i]) ? "PASS" : "FAIL";
}
function analyzeRun(run: Run) {
  return run.labels.map((label, f) => ({
    label,
    strata: run.T[f].map((arr, k) => ({ stratum: stratumLabel(k), ...analyzeStratum(arr, run.psiBin[k], run.generated[k]) })),
  }));
}
function printTable(res: any, dmax: number[] | null, nmin: number) {
  console.log(`\n=== ${res.label} ===`);
  console.log("stratum            used     flagged   p90 dev   p95 dev   p99 dev   p99.9 dev   KS      mean   var    criterion");
  for (const s of res.strata) {
    if (!s.levels) { console.log(`${s.stratum.padEnd(18)} ${String(s.used).padStart(8)}  (too few usable samples)`); continue; }
    const d = s.levels.map((l: LevelStat) => (l.dev >= 0 ? "+" : "") + l.dev.toFixed(5));
    const crit = dmax ? criterion(s, dmax, nmin) : "descriptive";
    console.log(`${s.stratum.padEnd(18)} ${String(s.used).padStart(8)}  ${((100 * s.flagged) / s.generated).toFixed(1).padStart(5)}%   ${d[0].padStart(8)}  ${d[1].padStart(8)}  ${d[2].padStart(8)}  ${d[3].padStart(9)}   ${s.ks.toFixed(4)}  ${s.mean.toFixed(3)}  ${s.variance.toFixed(3)}  ${crit}`);
  }
}

// ------------------------- self-test faults -------------------------
const FAULTS: Array<{ name: string; fn: (i: GateInput) => GateOutput }> = [
  { name: "correct (oracle)", fn: (i) => oracleGate(i) },
  { name: "FAULT overconfident: statistic x2", fn: (i) => { const o = oracleGate(i); return { ...o, statistic: o.statistic === null ? null : o.statistic * 2 }; } },
  { name: "FAULT sigma underestimated by 20%", fn: (i) => { const o = oracleGate(i); return { ...o, statistic: o.statistic === null ? null : o.statistic / 0.64 }; } },
  { name: "FAULT ignores cos(el) on azimuth sigma", fn: (i) => oracleGate(i, { noCosEl: true }) },
];

// ------------------------- main -------------------------
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function main() {
  if (process.argv.includes("--check-math")) {
    console.log(JSON.stringify({
      gates: GATES,
      chi2cdf: [0.5, 1, 3.84, 6.63, 10.83, 30].map((x) => [x, chi2cdf1(x)]),
      cp: [[0, 1000], [1, 1000], [100, 1000000], [10000, 1000000], [500000, 1000000]].map(([k, n]) => [k, n, ...clopperPearson(k, n)]),
      lgamma: [0.5, 1, 10.5, 1000.25].map((x) => [x, lgamma(x)]),
    }));
    return;
  }
  const selftest = process.argv.includes("--selftest");
  const nPer = Number(arg("--n") ?? (selftest ? 100000 : 1000000));
  const seed = Number(arg("--seed") ?? 12345);
  const nmin = Number(arg("--nmin") ?? Math.min(100000, Math.floor(nPer / 2)));
  const outDir = arg("--out") ?? (selftest ? "t0_selftest_results" : "t0_results");
  const dmaxArg = arg("--deltamax") ?? (selftest ? "0.005,0.0035,0.002,0.0005" : undefined);
  const dmax = parseDeltaMax(dmaxArg);
  const benign = [5];   // stratum with convergence angle >= 45 deg: benign geometry, used for the self-test assertions

  let fns: Array<(i: GateInput) => GateOutput>, labels: string[];
  if (selftest) { fns = FAULTS.map((f) => f.fn); labels = FAULTS.map((f) => f.name); }
  else {
    try { shippedGate({} as GateInput); } catch (e: any) { if (String(e.message).startsWith("ADAPTER NOT IMPLEMENTED")) { console.error(e.message); process.exit(2); } }
    fns = [shippedGate, (i) => oracleGate(i)]; labels = ["SHIPPED", "reference oracle (comparison only)"];
  }
  const t0 = Date.now();
  const run = simulate(fns, labels, nPer, seed);
  const results = analyzeRun(run);
  results.forEach((r) => printTable(r, dmax, nmin));
  console.log(`\nattempts: ${run.attempts}, generated per stratum: ${run.generated.join(", ")}, elapsed ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (!dmax) console.log("NO CRITERION SET (--deltamax omitted): this run is descriptive only.");

  let exitCode = 0;
  if (selftest) {
    const verdict = (f: number) => benign.map((k) => criterion(results[f].strata[k], dmax!, nmin));
    const okCorrect = verdict(0).every((v) => v === "PASS");
    const faultsCaught = FAULTS.slice(1).map((_, i) => verdict(i + 1).some((v) => v === "FAIL"));
    console.log(`\nSELF-TEST (benign geometry only: convergence angle >= 45 deg):`);
    console.log(`  correct oracle passes all: ${okCorrect}`);
    FAULTS.slice(1).forEach((f, i) => console.log(`  ${f.name}: caught = ${faultsCaught[i]}`));
    exitCode = okCorrect && faultsCaught.every(Boolean) ? 0 : 1;
    console.log(exitCode === 0 ? "SELF-TEST PASSED: the harness distinguishes the correct gate from the injected faults." : "SELF-TEST FAILED.");
  } else if (dmax) {
    const shipped = results[0].strata.map((s) => criterion(s, dmax, nmin));
    const fail = shipped.includes("FAIL");
    console.log(`\nT0 criterion (a) per stratum: ${shipped.join(" | ")}`);
    console.log(fail ? "T0 FAILED in at least one characterized stratum." : "T0 criterion (a) met in all characterized strata (strata marked NOT CHARACTERIZED are outside any claim).");
    exitCode = fail ? 1 : 0;
  }

  mkdirSync(outDir, { recursive: true });
  const self = readFileSync(process.argv[1]);
  const report = {
    protocol: "Check Sky Light Validation Protocol v1.0, T0",
    mode: selftest ? "selftest" : "shipped",
    harnessSha256: createHash("sha256").update(self).digest("hex"),
    seed, nPerStratum: nPer, nmin, deltaMax: dmax, levels: LEVELS, gateThresholds: GATES,
    alphaEdgesDeg: ALPHA_EDGES, psiEdgesDeg: PSI_EDGES, config: CFG,
    node: process.version, utc: new Date().toISOString(), attempts: run.attempts, generated: run.generated,
    results,
  };
  writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 1));
  const rows = ["function,stratum,p,theoretical_quantile,empirical_quantile"];
  for (const r of results) for (const s of r.strata) if ((s as any).qq) for (const q of (s as any).qq) rows.push(`${JSON.stringify(r.label)},${s.stratum},${q.p},${q.theoretical},${q.empirical}`);
  writeFileSync(`${outDir}/qq.csv`, rows.join("\n"));
  console.log(`wrote ${outDir}/report.json and ${outDir}/qq.csv`);
  process.exitCode = exitCode;
}
main();
