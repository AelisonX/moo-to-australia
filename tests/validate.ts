// Validation suite. Run: node build/validate.mjs  (bundled by esbuild)
import { simulate, initialState, MU, R_EARTH, OMEGA, dot, norm, cross, ecefToLl, llToEcef, eciToEcef, ecefToEci, gcDist, Launch, V3, sub } from "../src/physics";
import { keplerLanding } from "../src/kepler";
import { australianRegionAt, countryAt, distanceToAustralia, inAntarcticClaim, AU_REGIONS } from "../src/geo";
import { CITIES } from "../src/cities";

let pass = 0, fail = 0;
const lines: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  ok ? pass++ : fail++;
  const s = `${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`;
  lines.push(s); console.log(s);
}
const rnd = (() => { let s = 12345; return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648); })();
const fmt = (x: number, d = 3) => x.toExponential(d);

// ---------- 1. Coordinate frames ----------
{
  let worst = 0;
  for (let i = 0; i < 1000; i++) {
    const p = llToEcef(rnd() * 180 - 90, rnd() * 360 - 180, R_EARTH * (1 + rnd()));
    const t = rnd() * 1e5;
    worst = Math.max(worst, norm(sub(ecefToEci(eciToEcef(p, t), t), p)));
  }
  check("ECEF→ECI→ECEF round trip", worst < 1e-6, `max error ${fmt(worst)} m`);
  let w2 = 0;
  for (let i = 0; i < 1000; i++) {
    const la = rnd() * 178 - 89, lo = rnd() * 358 - 179;
    const ll = ecefToLl(llToEcef(la, lo));
    w2 = Math.max(w2, Math.abs(ll.lat - la), Math.abs(ll.lon - lo));
  }
  check("lat/lon → ECEF → lat/lon round trip", w2 < 1e-9, `max error ${fmt(w2)} deg`);
  // ground velocity from rotation counted once: zero relative-to-ground fart = ground speed
  const s = initialState({ lat: 0, lon: 0, azimuth: 0, elevation: 45, dv: 0 });
  check("Zero fart: inertial speed equals equatorial ground speed (ωR)", Math.abs(norm(s.v) - OMEGA * R_EARTH) < 1e-9, `${norm(s.v).toFixed(3)} m/s vs ${(OMEGA * R_EARTH).toFixed(3)}`);
  const sp = initialState({ lat: 90, lon: 0, azimuth: 0, elevation: 45, dv: 0 });
  check("Zero fart at the pole: inertial speed 0", norm(sp.v) < 1e-9);
  // haversine vs spherical law of cosines (independent formula)
  const lc = (a: number, b: number, c: number, d: number) => { const r = Math.PI / 180; return R_EARTH * Math.acos(Math.sin(a * r) * Math.sin(c * r) + Math.cos(a * r) * Math.cos(c * r) * Math.cos((d - b) * r)); };
  const d1 = gcDist(51.5074, -0.1278, -33.8688, 151.2093), d2 = lc(51.5074, -0.1278, -33.8688, 151.2093);
  check("Great-circle distance London→Sydney (haversine vs law of cosines)", Math.abs(d1 - d2) < 1, `${(d1 / 1000).toFixed(1)} km`);
}

// ---------- 2. Integrator: conservation ----------
{
  const L: Launch = { lat: 25.03, lon: 121.56, azimuth: 160, elevation: 30, dv: 6600 };
  const f = simulate(L);
  const st = initialState(L);
  const E0 = dot(st.v, st.v) / 2 - MU / norm(st.r);
  const H0 = norm(cross(st.r, st.v));
  // reconstruct ECI v at end via finite difference is noisy; instead re-run the integrator
  // and check energy using the last two ECI positions is not exact — so check via Kepler
  const k = keplerLanding(L);
  const dPos = gcDist(f.landing!.lat, f.landing!.lon, k.landing!.lat, k.landing!.lon);
  check("Numeric vs analytic landing point (Taipei sample)", dPos < 50, `${dPos.toFixed(2)} m apart`);
  check("Numeric vs analytic flight time (Taipei sample)", Math.abs(f.flightTime - k.flightTime!) < 0.05, `${f.flightTime.toFixed(3)} s vs ${k.flightTime!.toFixed(3)} s`);
  check("Numeric vs analytic max altitude (Taipei sample)", Math.abs(f.maxAlt - k.apoAlt) < 500, `${(f.maxAlt / 1000).toFixed(2)} km vs ${(k.apoAlt / 1000).toFixed(2)} km (numeric = max over samples)`);
  void E0; void H0;
}
{
  // energy & angular-momentum drift: integrate in ECI directly by re-deriving from samples
  const L: Launch = { lat: 51.5, lon: -0.13, azimuth: 80, elevation: 20, dv: 7600 };
  const f = simulate(L);
  // ECI positions from ECEF samples
  const eci = f.samples.map((s) => ecefToEci(s.ecef, s.t));
  // radius at end equals R (landing) and max altitude matches Kepler apoapsis
  const k = keplerLanding(L);
  check("Long-range (London) numeric vs analytic landing", gcDist(f.landing!.lat, f.landing!.lon, k.landing!.lat, k.landing!.lon) < 200,
    `${gcDist(f.landing!.lat, f.landing!.lon, k.landing!.lat, k.landing!.lon).toFixed(1)} m; flight ${(f.flightTime / 60).toFixed(2)} min`);
  check("Landing radius = R", Math.abs(norm(eci[eci.length - 1]) - R_EARTH) < 1e-3, `${fmt(norm(eci[eci.length - 1]) - R_EARTH)} m`);
}

// ---------- 3. Randomised numeric vs analytic (500 launches) ----------
{
  let worstPos = 0, worstT = 0, worstApo = 0, n = 0, esc = 0, escAgree = 0;
  for (let i = 0; i < 500; i++) {
    const L: Launch = { lat: rnd() * 160 - 80, lon: rnd() * 360 - 180, azimuth: rnd() * 360, elevation: 5 + rnd() * 80, dv: 1000 + rnd() * 11000 };
    const k = keplerLanding(L);
    const f = simulate(L, { escapeStopR: 3 * R_EARTH });
    if (k.escaped || f.outcome === "escaped") { esc++; if (k.escaped && f.outcome === "escaped") escAgree++; continue; }
    if (!k.landing) continue;
    n++;
    worstPos = Math.max(worstPos, gcDist(f.landing!.lat, f.landing!.lon, k.landing.lat, k.landing.lon));
    worstT = Math.max(worstT, Math.abs(f.flightTime - k.flightTime!) / k.flightTime!);
    worstApo = Math.max(worstApo, Math.abs(f.maxAlt - k.apoAlt) / Math.max(1, k.apoAlt));
  }
  check(`Random 500: escape classification agrees`, esc === escAgree, `${escAgree}/${esc} escaped cases agree`);
  check(`Random 500: worst landing difference (${n} landings)`, worstPos < 2000, `${worstPos.toFixed(1)} m`);
  check(`Random 500: worst relative flight-time difference`, worstT < 1e-4, fmt(worstT));
  check(`Random 500: worst relative max-alt difference`, worstApo < 1e-6, fmt(worstApo) + " (refined apex vs exact apoapsis)");
}

// ---------- 4. Step-size convergence ----------
{
  const L: Launch = { lat: -33.92, lon: 18.42, azimuth: 110, elevation: 25, dv: 7500 };
  const a = simulate(L, { k: 0.004 }), b = simulate(L, { k: 0.002 }), c = simulate(L, { k: 0.001 });
  const dab = gcDist(a.landing!.lat, a.landing!.lon, b.landing!.lat, b.landing!.lon);
  const dbc = gcDist(b.landing!.lat, b.landing!.lon, c.landing!.lat, c.landing!.lon);
  check("Step halving converges (game step k=0.002)", dbc < 5 && dbc <= dab, `Δ(k=.004→.002) ${dab.toFixed(3)} m, Δ(.002→.001) ${dbc.toFixed(3)} m`);
}

// ---------- 5. Physical sanity cases ----------
{
  const p = simulate({ lat: 90, lon: 0, azimuth: 0, elevation: 90, dv: 3000 });
  const dp = gcDist(90, 0, p.landing!.lat, p.landing!.lon);
  check("Vertical launch at North Pole lands back on the pole", dp < 1, `${dp.toFixed(4)} m off, flight ${(p.flightTime / 60).toFixed(1)} min`);
  for (const dv of [1000, 3000, 5000]) {
    const e = simulate({ lat: 0, lon: 0, azimuth: 0, elevation: 90, dv });
    check(`Vertical launch at equator (${dv / 1000} km/s) lands WEST, not "Australia comes to you"`, e.landing!.lon < 0 && Math.abs(e.landing!.lat) < 1e-6,
      `${(gcDist(0, 0, e.landing!.lat, e.landing!.lon) / 1000).toFixed(1)} km west after ${(e.flightTime / 60).toFixed(1)} min`);
  }
  const vesc = Math.sqrt(2 * MU / R_EARTH);
  const just = simulate({ lat: 90, lon: 0, azimuth: 0, elevation: 90, dv: vesc * 0.999 }, { maxSteps: 400000 });
  const over = simulate({ lat: 90, lon: 0, azimuth: 0, elevation: 90, dv: vesc * 1.001 });
  check("Escape threshold at √(2μ/R) (pole, vertical)", just.outcome === "landed" && over.outcome === "escaped", `v_esc=${(vesc / 1000).toFixed(3)} km/s; 0.999×→${just.outcome}, 1.001×→${over.outcome}`);
  // horizontal-ish launch at circular speed cannot orbit: it returns (periapsis <= R)
  const circ = simulate({ lat: 0, lon: 0, azimuth: 90, elevation: 3, dv: 7700 });
  check("No 'accidental satellite': near-orbital single fart still lands", circ.outcome === "landed" && !!circ.landing, `flight ${(circ.flightTime / 60).toFixed(1)} min, max alt ${(circ.maxAlt / 1000).toFixed(0)} km`);
  // East vs west: same fart, eastward goes further (rotation boost)
  const east = simulate({ lat: 0, lon: 0, azimuth: 90, elevation: 45, dv: 5000 });
  const west = simulate({ lat: 0, lon: 0, azimuth: 270, elevation: 45, dv: 5000 });
  const de = gcDist(0, 0, east.landing!.lat, east.landing!.lon), dw = gcDist(0, 0, west.landing!.lat, west.landing!.lon);
  check("Eastward fart travels further than westward (rotation boost)", de > dw, `east ${(de / 1000).toFixed(0)} km vs west ${(dw / 1000).toFixed(0)} km`);
  // Determinism / clock independence of stored trajectories
  const L: Launch = { lat: 40.71, lon: -74.01, azimuth: 300, elevation: 40, dv: 7000 };
  const r1 = simulate(L), r2 = simulate(L);
  check("Trajectory is deterministic (history trails stored in ECEF)", r1.samples.length === r2.samples.length && norm(sub(r1.samples[r1.samples.length - 1].ecef, r2.samples[r2.samples.length - 1].ecef)) === 0);
  const last = r1.samples[r1.samples.length - 1], ll = ecefToLl(last.ecef);
  check("Trail endpoint equals reported landing point", gcDist(ll.lat, ll.lon, r1.landing!.lat, r1.landing!.lon) < 1e-3);
}

// ---------- 6. Australia land test ----------
{
  const inside: [string, number, number][] = [["Alice Springs", -23.70, 133.88], ["Hobart", -42.88, 147.33], ["Perth", -31.95, 115.86], ["Brisbane", -27.47, 153.03],
    ["Christmas Island", -10.49, 105.64], ["Norfolk Island", -29.04, 167.95], ["Heard Island", -53.10, 73.51], ["Macquarie Island", -54.62, 158.86],
    ["Kangaroo Island", -35.80, 137.20], ["Lord Howe Island", -31.575, 159.09], ["Lake Eyre (salt lake, mapped as land)", -28.4, 137.3]];
  for (const [n, la, lo] of inside) check(`Inside Australia: ${n}`, !!australianRegionAt(la, lo), australianRegionAt(la, lo) ?? "MISSED");
  const outside: [string, number, number][] = [["Bass Strait (sea)", -39.9, 145.5], ["Port Moresby (PNG)", -9.44, 147.18], ["Auckland (NZ)", -36.85, 174.76],
    ["Jakarta", -6.2, 106.85], ["Great Australian Bight (sea)", -35.5, 130.0], ["Coral Sea (sea)", -18, 152], ["Timor-Leste", -8.56, 125.57]];
  for (const [n, la, lo] of outside) check(`Outside Australia: ${n}`, !australianRegionAt(la, lo), countryAt(la, lo) ?? "sea");
  check("Antarctic claim is separate (not counted)", inAntarcticClaim(-70, 100) && !australianRegionAt(-70, 100) && !inAntarcticClaim(-70, 140));
  const dNZ = distanceToAustralia(-36.85, 174.76) / 1000;
  check("Distance to nearest Australian land from Auckland is plausible", dNZ > 700 && dNZ < 1200, `${dNZ.toFixed(0)} km (Norfolk Island is the nearest Australian land)`);
}

// ---------- 7. Playability sweep (analytic engine, then numeric confirmation) ----------
const sweep: string[] = [];
{
  const HOP = 2 * 3600; // flights up to 2 h count as "normal hops"; longer = high "lob" shots
  for (const c of CITIES) {
    const t0 = Date.now();
    let total = 0, okHop = 0, okLob = 0;
    let best: { L: Launch; tf: number } | null = null, fastest: { L: Launch; tf: number } | null = null;
    const byRegion: Record<string, number> = {};
    for (let az = 0; az < 360; az += 2) for (let el = 3; el <= 87; el += 3) for (let dv = 1000; dv <= 11000; dv += 50) {
      total++;
      const L: Launch = { lat: c.lat, lon: c.lon, azimuth: az, elevation: el, dv };
      const k = keplerLanding(L);
      if (k.escaped || !k.landing) continue;
      const reg = australianRegionAt(k.landing.lat, k.landing.lon);
      if (!reg) continue;
      byRegion[reg] = (byRegion[reg] ?? 0) + 1;
      if (k.flightTime! <= HOP) {
        okHop++;
        if (reg === "Mainland Australia" && (!best || Math.abs(el - 45) < Math.abs(best.L.elevation - 45))) best = { L, tf: k.flightTime! };
        if (!fastest || k.flightTime! < fastest.tf) fastest = { L, tf: k.flightTime! };
      } else okLob++;
    }
    if (!best) { check(`${c.name}: a normal-hop solution exists`, false); continue; }
    const f = simulate(best.L);
    const reg = f.landing ? australianRegionAt(f.landing.lat, f.landing.lon) : null;
    check(`${c.name}: a ≤2 h solution exists and the numeric sim confirms it`, !!reg,
      `az ${best.L.azimuth}°, el ${best.L.elevation}°, ${(best.L.dv / 1000).toFixed(2)} km/s → ${reg ?? "MISS"}, ${(f.flightTime / 60).toFixed(1)} min, apex ${(f.maxAlt / 1000).toFixed(0)} km`);
    let lo = Infinity, hi = -Infinity;
    for (let dv = best.L.dv - 3000; dv <= best.L.dv + 3000; dv += 2) {
      const k = keplerLanding({ ...best.L, dv });
      if (k.landing && !k.escaped && k.flightTime! <= HOP && australianRegionAt(k.landing.lat, k.landing.lon) === "Mainland Australia") { lo = Math.min(lo, dv); hi = Math.max(hi, dv); }
    }
    const regs = Object.entries(byRegion).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(", ");
    const s = `${c.name}: ${okHop + okLob}/${total} grid settings land in Australia (${(100 * (okHop + okLob) / total).toFixed(2)}%) — ${okHop} normal hops (≤2 h), ${okLob} high lobs (>2 h). ` +
      `Example hop: az ${best.L.azimuth}°, el ${best.L.elevation}°, ${(best.L.dv / 1000).toFixed(2)} km/s, ${(best.tf / 60).toFixed(0)} min; mainland power window at that aim ≈ ${((hi - lo) / 1000).toFixed(3)} km/s wide. ` +
      `Fastest hop: ${(fastest!.tf / 60).toFixed(0)} min (az ${fastest!.L.azimuth}°, el ${fastest!.L.elevation}°, ${(fastest!.L.dv / 1000).toFixed(2)} km/s). By region: ${regs}. [${((Date.now() - t0) / 1000).toFixed(1)} s]`;
    sweep.push(s); console.log("  " + s);
  }
}

// ---------- 8. Performance (Node) ----------
{
  const L: Launch = { lat: 51.5, lon: -0.13, azimuth: 80, elevation: 20, dv: 7600 };
  const N = 50, t0 = performance.now();
  let steps = 0;
  for (let i = 0; i < N; i++) steps = simulate(L).steps;
  const ms = (performance.now() - t0) / N;
  check("Perf: one long flight simulates in < 50 ms (Node, this container)", ms < 50, `${ms.toFixed(2)} ms, ${steps} RK4 steps`);
}

console.log(`\n${pass} passed, ${fail} failed`);
import { writeFileSync } from "node:fs";
writeFileSync(process.argv[2] ?? "validation-report.txt", [...lines, "", "Playability sweep:", ...sweep, "", `${pass} passed, ${fail} failed`].join("\n"));
if (fail) process.exit(1);
