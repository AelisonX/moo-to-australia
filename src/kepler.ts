// Independent closed-form two-body solution (no time stepping).
// Used (1) to validate the numerical integrator and (2) for fast parameter sweeps.
import { Launch, initialState, MU, R_EARTH, V3, add, cross, dot, ecefToLl, eciToEcef, mul, norm, unit } from "./physics";

export interface KeplerResult {
  escaped: boolean;
  ecc: number;
  apoAlt: number; // m (Infinity if escaped)
  flightTime?: number; // s
  landing?: { lat: number; lon: number };
}

export function keplerLanding(L: Launch): KeplerResult {
  const { r, v } = initialState(L);
  const rn = norm(r);
  const energy = dot(v, v) / 2 - MU / rn;
  const h = cross(r, v);
  const hn = norm(h);
  const evec: V3 = add(mul(cross(v, h), 1 / MU), mul(r, -1 / rn));
  const ecc = norm(evec);
  if (energy >= 0) return { escaped: true, ecc, apoAlt: Infinity };
  const a = -MU / (2 * energy);
  const apoAlt = a * (1 + ecc) - R_EARTH;
  if (dot(r, v) <= 0 || hn === 0 && false) return { escaped: false, ecc, apoAlt, flightTime: 0 };
  // Radial (vertical, h=0) degenerate case: handle via radial Kepler is overkill; treat separately.
  if (hn < 1e-6 * rn * norm(v)) return { escaped: false, ecc, apoAlt }; // not supported analytically
  const eh = unit(evec), hh = unit(h), qh = cross(hh, eh);
  const rh = unit(r);
  const f0 = Math.atan2(dot(rh, qh), dot(rh, eh)); // in (0, pi) on the way up
  const E0 = 2 * Math.atan(Math.sqrt((1 - ecc) / (1 + ecc)) * Math.tan(f0 / 2));
  const M0 = E0 - ecc * Math.sin(E0);
  const n = Math.sqrt(MU / (a * a * a));
  const tf = (2 * Math.PI - 2 * M0) / n; // symmetric descent to r = R at f = -f0
  const f1 = -f0;
  const pos: V3 = add(mul(eh, rn * Math.cos(f1)), mul(qh, rn * Math.sin(f1)));
  const ll = ecefToLl(eciToEcef(pos, tf));
  return { escaped: false, ecc, apoAlt, flightTime: tf, landing: { lat: ll.lat, lon: ll.lon } };
}
