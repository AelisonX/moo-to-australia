// MOO TO AUSTRALIA — physics core (no rendering dependencies)
//
// Model (deliberately simplified, stated in-game):
//  - Spherical Earth, radius R.
//  - Point-mass gravity toward Earth's centre, a = -MU r / |r|^3.
//  - Earth rotates about +z at the sidereal rate OMEGA.
//  - NO atmosphere / drag.
//  - The fart is one instantaneous velocity change (impulse) at the surface.
//
// Frames — ONE integration frame only:
//  - ECI (Earth-centred inertial) is the integration frame. Only gravity acts.
//    No Coriolis / centrifugal terms are ever added (those belong to the rotating
//    frame, which we never integrate in).
//  - ECEF (Earth-fixed) coincides with ECI at t = 0. A point fixed in ECI at time t
//    has ECEF coords = Rz(-OMEGA t) * r_eci.
//  - Initial ECI velocity = OMEGA x r0 (ground already moves with Earth) + dv,
//    where dv is given in the local East-North-Up frame, i.e. relative to the ground.
//    Earth rotation therefore enters exactly once at launch, and once more when
//    the landing point is rotated back into ECEF.

export const MU = 3.986004418e14; // m^3/s^2
export const R_EARTH = 6371000; // m (mean radius)
export const OMEGA = 7.2921159e-5; // rad/s, sidereal

export type V3 = [number, number, number];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a: V3): V3 => mul(a, 1 / norm(a));

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/** Geocentric lat/lon (deg) -> ECEF position at radius r. */
export function llToEcef(latDeg: number, lonDeg: number, r = R_EARTH): V3 {
  const la = latDeg * D2R, lo = lonDeg * D2R;
  return [r * Math.cos(la) * Math.cos(lo), r * Math.cos(la) * Math.sin(lo), r * Math.sin(la)];
}
/** ECEF -> geocentric lat/lon (deg), altitude above sphere (m). */
export function ecefToLl(p: V3): { lat: number; lon: number; alt: number } {
  const r = norm(p);
  return { lat: Math.asin(p[2] / r) * R2D, lon: Math.atan2(p[1], p[0]) * R2D, alt: r - R_EARTH };
}
/** Rotate about z by angle (rad). */
export function rotZ(p: V3, ang: number): V3 {
  const c = Math.cos(ang), s = Math.sin(ang);
  return [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
}
export const eciToEcef = (p: V3, t: number): V3 => rotZ(p, -OMEGA * t);
export const ecefToEci = (p: V3, t: number): V3 => rotZ(p, OMEGA * t);

/** Local East/North/Up unit vectors at a geocentric lat/lon. */
export function enu(latDeg: number, lonDeg: number) {
  const la = latDeg * D2R, lo = lonDeg * D2R;
  const e: V3 = [-Math.sin(lo), Math.cos(lo), 0];
  const n: V3 = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];
  const u: V3 = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  return { e, n, u };
}

/** Great-circle surface distance (m) between two lat/lon (haversine). */
export function gcDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * D2R, p2 = lat2 * D2R, dp = p2 - p1, dl = (lon2 - lon1) * D2R;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** Initial great-circle bearing (deg from north, clockwise). */
export function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * D2R, p2 = lat2 * D2R, dl = (lon2 - lon1) * D2R;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * R2D) + 360) % 360;
}

export interface Launch {
  lat: number; // deg, geocentric
  lon: number; // deg
  azimuth: number; // deg from north, clockwise
  elevation: number; // deg above local horizon
  dv: number; // m/s, fart speed RELATIVE TO THE GROUND
}

/** Initial ECI state at t = 0 (ECI == ECEF at t = 0). */
export function initialState(L: Launch): { r: V3; v: V3 } {
  const r = llToEcef(L.lat, L.lon);
  const { e, n, u } = enu(L.lat, L.lon);
  const az = L.azimuth * D2R, el = L.elevation * D2R;
  const dir = add(add(mul(e, Math.cos(el) * Math.sin(az)), mul(n, Math.cos(el) * Math.cos(az))), mul(u, Math.sin(el)));
  const vGround = cross([0, 0, OMEGA], r); // Earth rotation, counted ONCE, here
  return { r, v: add(vGround, mul(dir, L.dv)) };
}

const accel = (r: V3): V3 => {
  const d = norm(r);
  return mul(r, -MU / (d * d * d));
};

function rk4(r: V3, v: V3, h: number): { r: V3; v: V3 } {
  const k1r = v, k1v = accel(r);
  const r2 = add(r, mul(k1r, h / 2)), v2 = add(v, mul(k1v, h / 2));
  const k2r = v2, k2v = accel(r2);
  const r3 = add(r, mul(k2r, h / 2)), v3 = add(v, mul(k2v, h / 2));
  const k3r = v3, k3v = accel(r3);
  const r4 = add(r, mul(k3r, h)), v4 = add(v, mul(k3v, h));
  const k4r = v4, k4v = accel(r4);
  return {
    r: add(r, mul(add(add(k1r, mul(k2r, 2)), add(mul(k3r, 2), k4r)), h / 6)),
    v: add(v, mul(add(add(k1v, mul(k2v, 2)), add(mul(k3v, 2), k4v)), h / 6)),
  };
}

export type Outcome = "landed" | "escaped";

export interface Sample {
  t: number; // s since launch
  ecef: V3; // Earth-fixed position (m) — geographic, clock-independent
  alt: number; // m
}

export interface FlightResult {
  launch: Launch;
  outcome: Outcome;
  energy: number; // specific orbital energy at launch (J/kg)
  samples: Sample[]; // full trajectory, ECEF
  flightTime: number; // s (landing time, or time simulated for escape)
  maxAlt: number; // m (max over the integrated trajectory)
  landing?: { lat: number; lon: number; t: number };
  vInertial: number; // |v| at launch in ECI (m/s)
  steps: number;
}

export interface SimOptions {
  k?: number; // step = k * sqrt(r^3/MU)
  escapeStopR?: number; // stop escaped trajectories at this radius (m)
  maxSteps?: number;
}

/**
 * Integrate one fart. Outcome classification is from orbital energy:
 *   energy >= 0  -> escaped (never returns)
 *   energy <  0  -> bound; because the trajectory starts ON the surface the
 *                   periapsis radius is <= R, so it MUST come back down. There is
 *                   no "accidentally in orbit" branch for a single ground impulse.
 * The landing point / time / max altitude all come from this one integration.
 */
export function simulate(L: Launch, opt: SimOptions = {}): FlightResult {
  const k = opt.k ?? 0.002;
  const escapeStopR = opt.escapeStopR ?? 8 * R_EARTH;
  const maxSteps = opt.maxSteps ?? 2_000_000;
  let { r, v } = initialState(L);
  const energy = dot(v, v) / 2 - MU / norm(r);
  const outcome: Outcome = energy >= 0 ? "escaped" : "landed";
  const vInertial = norm(v);
  const samples: Sample[] = [{ t: 0, ecef: r, alt: 0 }];
  let t = 0, maxAlt = 0, steps = 0;
  // A launch with no upward component cannot leave the ground.
  if (dot(v, r) <= 0) {
    const ll = ecefToLl(r);
    return { launch: L, outcome: "landed", energy, samples, flightTime: 0, maxAlt: 0, landing: { lat: ll.lat, lon: ll.lon, t: 0 }, vInertial, steps };
  }
  while (steps < maxSteps) {
    const rn = norm(r);
    const h = k * Math.sqrt((rn * rn * rn) / MU);
    const nxt = rk4(r, v, h);
    steps++;
    const nr = norm(nxt.r);
    if (nr < R_EARTH && t > 0) {
      // bisection on the sub-step for the exact surface crossing
      let lo = 0, hi = h;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (norm(rk4(r, v, mid).r) < R_EARTH) hi = mid; else lo = mid;
      }
      const hit = rk4(r, v, (lo + hi) / 2);
      t += (lo + hi) / 2;
      const ecef = eciToEcef(hit.r, t);
      const ll = ecefToLl(ecef);
      samples.push({ t, ecef, alt: 0 });
      return { launch: L, outcome, energy, samples, flightTime: t, maxAlt, landing: { lat: ll.lat, lon: ll.lon, t }, vInertial, steps };
    }
    // apex inside this step? (radial velocity changes sign) -> refine max altitude
    if (dot(r, v) > 0 && dot(nxt.r, nxt.v) <= 0) {
      let lo = 0, hi = h;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2, s = rk4(r, v, mid);
        if (dot(s.r, s.v) > 0) lo = mid; else hi = mid;
      }
      const apex = norm(rk4(r, v, (lo + hi) / 2).r) - R_EARTH;
      if (apex > maxAlt) maxAlt = apex;
    }
    r = nxt.r; v = nxt.v; t += h;
    const alt = nr - R_EARTH;
    if (alt > maxAlt) maxAlt = alt;
    samples.push({ t, ecef: eciToEcef(r, t), alt });
    if (outcome === "escaped" && nr > escapeStopR) break;
  }
  return { launch: L, outcome, energy, samples, flightTime: t, maxAlt, vInertial, steps };
}

/** Interpolate the flight at time t (s): ECEF position. Uses linear interp between samples. */
export function sampleAt(f: FlightResult, t: number): { ecef: V3; alt: number; idx: number } {
  const s = f.samples;
  if (t <= 0) return { ecef: s[0].ecef, alt: s[0].alt, idx: 0 };
  if (t >= s[s.length - 1].t) return { ecef: s[s.length - 1].ecef, alt: s[s.length - 1].alt, idx: s.length - 1 };
  let lo = 0, hi = s.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s[m].t <= t) lo = m; else hi = m; }
  const a = s[lo], b = s[hi], u = (t - a.t) / (b.t - a.t);
  const p = add(a.ecef, mul(sub(b.ecef, a.ecef), u));
  return { ecef: p, alt: a.alt + (b.alt - a.alt) * u, idx: lo };
}
