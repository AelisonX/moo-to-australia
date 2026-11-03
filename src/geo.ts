// Geography: Australian land test (incl. islands & external territories),
// country lookup, distance to nearest Australian land.
import auData from "./data/au.json";
import worldData from "./data/world.json";
import targetData from "./data/targets.json";
import { gcDist, llToEcef, dot, V3 } from "./physics";

type Ring = number[][]; // [lon, lat][]
type Poly = Ring[]; // outer + holes
interface Region { name: string; polys: Poly[]; bbox: number[][] }

function bboxOf(p: Poly) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const [x, y] of p[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}

function inRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inPoly(lon: number, lat: number, p: Poly, bb: number[]): boolean {
  // longitude wrap: try lon and lon±360 (polygons may extend past ±180)
  for (const L of [lon, lon - 360, lon + 360]) {
    if (L < bb[0] || L > bb[2] || lat < bb[1] || lat > bb[3]) continue;
    if (!inRing(L, lat, p[0])) continue;
    let hole = false;
    for (let k = 1; k < p.length; k++) if (inRing(L, lat, p[k])) { hole = true; break; }
    if (!hole) return true;
  }
  return false;
}

export const AU_REGIONS: Region[] = (auData as any).regions.map((r: any) => ({ name: r.name, polys: r.polys, bbox: r.polys.map(bboxOf) }));
interface Country { n: string; p: Poly[]; bb: number[][] }
export const WORLD: Country[] = (worldData as any[]).map((c) => ({ n: c.n, p: c.p, bb: c.p.map(bboxOf) }));

/** Stable target point for camera framing only (centre of mainland). */
export const AUSTRALIA_CENTRE = { lat: -25.3, lon: 134.0 };
export function australianRegionAt(lat: number, lon: number): string | null {
  for (const r of AU_REGIONS) for (let i = 0; i < r.polys.length; i++) if (inPoly(lon, lat, r.polys[i], r.bbox[i])) return r.name;
  return null;
}
export function countryAt(lat: number, lon: number): string | null {
  for (const c of WORLD) for (let i = 0; i < c.p.length; i++) if (inPoly(lon, lat, c.p[i], c.bb[i])) return c.n;
  return null;
}

/** Australian Antarctic Territory claim sectors (south of 60°S): 44.63°E–136.18°E and 142.03°E–160°E.
 *  NOT counted as success in v0.1 — flagged for Captain's decision. */
export function inAntarcticClaim(lat: number, lon: number): boolean {
  if (lat > -60) return false;
  return (lon >= 44.63 && lon <= 136.18) || (lon >= 142.03 && lon <= 160);
}

// Nearest Australian land: densified vertex set as unit vectors (max dot = min angle)
const AU_PTS: { v: V3; lat: number; lon: number }[] = [];
for (const r of AU_REGIONS) for (const p of r.polys) for (const [lon, lat] of p[0]) {
  const e = llToEcef(lat, lon, 1);
  AU_PTS.push({ v: e, lat, lon });
}
export function distanceToAustralia(lat: number, lon: number): number {
  if (australianRegionAt(lat, lon)) return 0;
  const q = llToEcef(lat, lon, 1);
  let best = -2, bi = 0;
  for (let i = 0; i < AU_PTS.length; i++) { const d = dot(q, AU_PTS[i].v); if (d > best) { best = d; bi = i; } }
  return gcDist(lat, lon, AU_PTS[bi].lat, AU_PTS[bi].lon);
}

export function oceanName(lat: number, lon: number): string {
  if (lat < -60) return "the Southern Ocean";
  if (lat > 66) return "the Arctic Ocean";
  // crude basin split
  if (lon >= 20 && lon < 120 && lat < 30) {
    if (lon > 100 && lat > -5) return "the South China Sea region";
    return "the Indian Ocean";
  }
  if (lon >= 120 && lon < 147 && lat < -5 && lat > -45) return "the Indian Ocean";
  if (lon > -70 && lon < 20) {
    if (lat > 30 && lon > -6 && lon < 37) return "the Mediterranean";
    return "the Atlantic Ocean";
  }
  if (lon >= -100 && lon <= -70 && lat > 9 && lat < 30) return "the Gulf / Caribbean";
  return "the Pacific Ocean";
}



// ---------------------------------------------------------------- level targets
export type TargetKey = "AU" | "NZ" | "FR" | "JP" | "BR" | "CA";
export interface Target { key: TargetKey; name: string; regions: Region[]; centre: { lat: number; lon: number }; pts: { v: V3; lat: number; lon: number }[] }
function mkTarget(key: TargetKey, name: string, regions: Region[]): Target {
  const pts: { v: V3; lat: number; lon: number }[] = [];
  let best: Poly | null = null, bestN = 0;
  for (const r of regions) for (const p of r.polys) { if (p[0].length > bestN) { bestN = p[0].length; best = p; } for (const [lon, lat] of p[0]) pts.push({ v: llToEcef(lat, lon, 1), lat, lon }); }
  let x = 0, y = 0; for (const [lo, la] of best![0]) { x += lo; y += la; }
  return { key, name, regions, centre: { lat: y / best![0].length, lon: x / best![0].length }, pts };
}
// Valid landing land per target. Australia: mainland, Tasmania, islands & external territories (10m map units).
// Others come from tools/build_targets.py (see the bbox filters there: metro France + Corsica, NZ main islands, Japan's home islands + Okinawa).
const TD = targetData as Record<string, { name: string; polys: Poly[] }>;
const fromData = (k: TargetKey) => mkTarget(k, TD[k].name, [{ name: TD[k].name, polys: TD[k].polys, bbox: TD[k].polys.map(bboxOf) }]);
export const TARGETS: Record<TargetKey, Target> = {
  AU: { ...mkTarget("AU", "Australia", AU_REGIONS), centre: AUSTRALIA_CENTRE },
  NZ: fromData("NZ"), FR: fromData("FR"), JP: fromData("JP"), BR: fromData("BR"), CA: fromData("CA"),
};
// framing centres (mainland-ish), used only for camera & the compass hint
TARGETS.JP.centre = { lat: 36.5, lon: 138.5 }; TARGETS.CA.centre = { lat: 56, lon: -100 }; TARGETS.FR.centre = { lat: 46.6, lon: 2.4 };
TARGETS.BR.centre = { lat: -10.5, lon: -52 }; TARGETS.NZ.centre = { lat: -41.5, lon: 173 };
/** Which region of the target (if any) contains this point. */
export function targetRegionAt(t: Target, lat: number, lon: number): string | null {
  for (const r of t.regions) for (let i = 0; i < r.polys.length; i++) if (inPoly(lon, lat, r.polys[i], r.bbox[i])) return r.name;
  return null;
}
export function distanceToTarget(t: Target, lat: number, lon: number): number {
  if (targetRegionAt(t, lat, lon)) return 0;
  const q = llToEcef(lat, lon, 1); let best = -2, bi = 0;
  for (let i = 0; i < t.pts.length; i++) { const d = dot(q, t.pts[i].v); if (d > best) { best = d; bi = i; } }
  return gcDist(lat, lon, t.pts[bi].lat, t.pts[bi].lon);
}
