import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { simulate, sampleAt, FlightResult, Launch, V3, R_EARTH, OMEGA, llToEcef, enu, ecefToLl, gcDist, bearing } from "./physics";
import { countryAt, inAntarcticClaim, oceanName, WORLD, TARGETS, targetRegionAt, distanceToTarget, Target } from "./geo";
import { CITIES, TOUR, CLASSIC, City } from "./cities";
import { cowSVG, puffSVG, splashSVG, barnSVG, haySVG, signSVG, tuftSVG, svgToCanvas, Pose, PAL, POSES, friendCowSVG, gerSVG, sheepSVG, windmillSVG, treeSVG, alpsSVG, vineyardSVG, citySVG, carSVG, foodSVG } from "./art";

// ===================================================================================
// Units in the scene: kilometres. Physics in metres. Scene axes: physics ECEF (x,y,z)
// maps to three (x, z, -y) — a proper rotation, so Earth's axis is three's +Y.
// The scene is EARTH-FIXED: trails & landing marks are stored in ECEF and never move
// with the playback clock. Stars are drawn in the inertial frame (rotated by -ωt).
// ===================================================================================
const RK = R_EARTH / 1000;
const T = (p: V3) => new THREE.Vector3(p[0] / 1000, p[2] / 1000, -p[1] / 1000);
const llT = (lat: number, lon: number, rKm = RK) => T(llToEcef(lat, lon, rKm * 1000));
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const $ = (id: string) => document.getElementById(id)!;

// ---------------------------------------------------------------- renderer & scene
const canvas = $("c") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.0004, 5e6);
const SKY_GROUND = new THREE.Color("#8ED0F0"), SKY_MID = new THREE.Color("#4A5BB0"), SKY_SPACE = new THREE.Color(PAL.bg);
scene.background = SKY_GROUND.clone();

// ---------------------------------------------------------------- Earth texture
let earthCanvas: HTMLCanvasElement | null = null;
function earthColorAt(lat: number, lon: number): THREE.Color {
  const c = earthCanvas!; const x = Math.floor(((lon + 180) / 360) * c.width) % c.width, y = Math.min(c.height - 1, Math.floor(((90 - lat) / 180) * c.height));
  const d = c.getContext("2d")!.getImageData(x, y, 1, 1).data;
  return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace);
}
function buildEarthTexture(T: Target): THREE.CanvasTexture {
  const max = renderer.capabilities.maxTextureSize;
  const W = max >= 8192 && window.innerWidth > 900 ? 8192 : 4096, H = W / 2;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const X = (lon: number) => ((lon + 180) / 360) * W, Y = (lat: number) => ((90 - lat) / 180) * H;
  g.fillStyle = "#2E3F9E"; g.fillRect(0, 0, W, H);
  // soft depth shading toward poles
  const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, "rgba(27,30,75,.25)"); grd.addColorStop(.5, "rgba(0,0,0,0)"); grd.addColorStop(1, "rgba(27,30,75,.25)");
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(201,194,234,.16)"; g.lineWidth = W / 4096;
  for (let lon = -180; lon <= 180; lon += 30) { g.beginPath(); g.moveTo(X(lon), 0); g.lineTo(X(lon), H); g.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(W, Y(lat)); g.stroke(); }
  const path = (polys: number[][][][]) => {
    g.beginPath();
    for (const p of polys) for (const ring of p) { ring.forEach(([lo, la], i) => (i ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la)))); g.closePath(); }
  };
  g.lineJoin = "round";
  for (const cn of WORLD) {
    path(cn.p as any);
    g.fillStyle = cn.n === "Antarctica" ? "#E9EEFF" : "#8FD6A8"; g.fill("evenodd");
    g.strokeStyle = "rgba(58,42,48,.55)"; g.lineWidth = W / 4096 * 1.1; g.stroke();
  }
  // the current target — every region in its success set, highlighted
  for (const r of T.regions) {
    path(r.polys as any);
    g.fillStyle = PAL.yellow; g.fill("evenodd");
    g.strokeStyle = "#E58AA3"; g.lineWidth = W / 4096 * 1.6; g.stroke();
  }
  // tiny Australian islands are sub-pixel: ring markers so a lucky hit is legible (hit test uses real polygons)
  for (const r of T.key === "AU" ? T.regions : []) {
    if (r.name === "Mainland Australia" || r.name === "Tasmania" || r.name === "Other Australian islands") continue;
    const p0 = r.polys[0][0]; let x = 0, y = 0; for (const [lo, la] of p0) { x += lo; y += la; } x /= p0.length; y /= p0.length;
    g.beginPath(); g.arc(X(x), Y(y), W / 4096 * 5, 0, Math.PI * 2); g.strokeStyle = PAL.yellow; g.lineWidth = W / 4096 * 1.6; g.stroke();
  }
  earthCanvas = c;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const earth = new THREE.Mesh(new THREE.SphereGeometry(RK, 512, 256), new THREE.MeshBasicMaterial({ color: 0xffffff }));
scene.add(earth);

// atmosphere rim (fades in with camera altitude)
const atmoMat = new THREE.ShaderMaterial({
  uniforms: { uOpacity: { value: 0 } },
  vertexShader: `#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,
  fragmentShader: `#include <logdepthbuf_pars_fragment>
uniform float uOpacity; varying vec3 vN; varying vec3 vV;
void main(){
#include <logdepthbuf_fragment>
float f = pow(1.0 - max(dot(vN,vV),0.0), 2.5); gl_FragColor = vec4(0.56,0.82,0.94, f*uOpacity); }`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
});
const atmo = new THREE.Mesh(new THREE.SphereGeometry(RK * 1.018, 128, 64), atmoMat);
scene.add(atmo);

// stars (inertial frame)
const stars = (() => {
  const n = 1800, pos = new Float32Array(n * 3); let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * Math.PI * 2, k = Math.sqrt(1 - u * u); pos.set([k * Math.cos(th) * 3e6, u * 3e6, k * Math.sin(th) * 3e6], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0 });
  const p = new THREE.Points(geo, m); scene.add(p); return p;
})();

// ---------------------------------------------------------------- sprites
const texCache: Record<string, THREE.Texture> = {};
async function tex(key: string, svg: string, w: number, h: number) {
  const c = await svgToCanvas(svg, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; texCache[key] = t; return t;
}
function sprite(t: THREE.Texture, wKm: number, aspect: number, cx = 0.5, cy = 0) {
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
  const s = new THREE.Sprite(m); s.center.set(cx, cy); s.scale.set(wKm, wKm * aspect, 1); s.userData.base = wKm; s.userData.aspect = aspect; return s;
}
function labelSprite(text: string, color: string) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 128; const g = c.getContext("2d")!;
  g.font = "700 54px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = 12; g.strokeStyle = PAL.ink; g.strokeText(text, 256, 64); g.fillStyle = color; g.fillText(text, 256, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, sizeAttenuation: false }));
  s.center.set(0.5, -0.15); s.scale.set(0.18, 0.045, 1); s.renderOrder = 10; (s.material as THREE.SpriteMaterial).depthTest = true; return s;
}
function dotSprite(color: string, size = 0.018) {
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!;
  g.beginPath(); g.arc(32, 32, 22, 0, Math.PI * 2); g.fillStyle = color; g.fill(); g.lineWidth = 8; g.strokeStyle = PAL.ink; g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, sizeAttenuation: false, depthWrite: false }));
  s.scale.set(size, size, 1); s.renderOrder = 9; return s;
}

// ---------------------------------------------------------------- lines
const lineMats: LineMaterial[] = [];
function lineMat(color: string, width: number, opacity = 1, dashed = false) {
  const m = new LineMaterial({ color: new THREE.Color(color).getHex(), linewidth: width, transparent: true, opacity, dashed, dashSize: 60, gapSize: 40, depthWrite: false });
  lineMats.push(m); return m;
}
function makeLine(pts: THREE.Vector3[], mat: LineMaterial) {
  const g = new LineGeometry(); const a: number[] = []; for (const p of pts) a.push(p.x, p.y, p.z);
  if (a.length < 6) a.push(...a.slice(0, 3));
  g.setPositions(a); const l = new Line2(g, mat); l.computeLineDistances(); l.frustumCulled = false; l.renderOrder = 6; return l;
}

// ---------------------------------------------------------------- state
type Mode = "setup" | "charge" | "flight" | "landed" | "results";
type View = "cow" | "globe";
interface Trail { samples: THREE.Vector3[]; land?: { lat: number; lon: number }; outcome: string; label: string }
const HIST_MAX = 6;
const TRAIL_COLORS = ["#FFE07A", "#8FD3FF", "#B9F18C", "#FFB37A", "#C9C2EA", "#FF9ECF"];

const st = {
  mode: "setup" as Mode, view: "cow" as View,
  city: CITIES[0] as City,
  az: 0, el: 45, pw: 6,
  flight: null as FlightResult | null,
  simT: 0, realT: 0, rate: 1,
  attempts: {} as Record<string, number>,
  done: {} as Record<string, boolean>,
  history: {} as Record<string, Trail[]>,
  lastFwd: new THREE.Vector3(),
};

// persisted conveniences (one viewer's browser only)
function save() { try { localStorage.setItem("moo2aus.v1", JSON.stringify({ city: st.city.id, settings: settings, history: serialHist(), attempts: st.attempts, done: st.done })); } catch { /* ignore */ } }
const settings: Record<string, { az: number; el: number; pw: number }> = {};
function serialHist() { const o: any = {}; for (const k in st.history) o[k] = st.history[k].map((t) => ({ s: t.samples.map((v) => [+v.x.toFixed(1), +v.y.toFixed(1), +v.z.toFixed(1)]), land: t.land, outcome: t.outcome, label: t.label })); return o; }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem("moo2aus.v1") || "null"); if (!d) return;
    Object.assign(settings, d.settings || {}); Object.assign(st.attempts, d.attempts || {}); Object.assign(st.done, d.done || {});
    for (const k in d.history || {}) st.history[k] = d.history[k].map((t: any) => ({ samples: t.s.map((a: number[]) => new THREE.Vector3(a[0], a[1], a[2])), land: t.land, outcome: t.outcome, label: t.label }));
    const c = CITIES.find((c) => c.id === d.city); if (c) st.city = c;
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------- launch site
const site = new THREE.Group(); scene.add(site); // positioned at launch point, local props in km
let siteFrame = { up: new THREE.Vector3(), e: new THREE.Vector3(), n: new THREE.Vector3(), pos: new THREE.Vector3() };
let farm: THREE.Mesh | null = null;
let cow!: THREE.Sprite, sign!: THREE.Sprite;
const props: THREE.Sprite[] = [];
const puffs: { s: THREE.Sprite; t0: number }[] = [];
let aimArrow!: THREE.Group;

function enuT(lat: number, lon: number) {
  const f = enu(lat, lon);
  const v = (a: V3) => new THREE.Vector3(a[0], a[2], -a[1]);
  return { e: v(f.e), n: v(f.n), up: v(f.u) };
}
function localDir(az: number, el: number) {
  const a = az * Math.PI / 180, e = el * Math.PI / 180, F = siteFrame;
  return F.e.clone().multiplyScalar(Math.cos(e) * Math.sin(a)).addScaledVector(F.n, Math.cos(e) * Math.cos(a)).addScaledVector(F.up, Math.sin(e));
}
const SCENE_GROUND: Record<string, [string, string]> = { farm: ["#7CC56F", "#8FD6A8"], "tw-farm": ["#6FC26A", "#8FD6A8"], steppe: ["#B9CF6E", "#CBD98F"], "au-farm": ["#A9C56A", "#C2CF7E"], "fr-farm": ["#78C36C", "#93D3A0"], "nz-farm": ["#68BE6E", "#8FD6A8"] };
function buildFarm(F = siteFrame, tint?: THREE.Color): THREE.Mesh {
  const gc = SCENE_GROUND[st.city.scene] ?? SCENE_GROUND.farm;
  const RINGS = 70, SEG = 72, MAXD = 140; // km
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const cNear = tint ? tint.clone() : new THREE.Color(gc[0]), cFar = tint ? tint.clone() : new THREE.Color(gc[1]), cDirt = tint ? tint.clone().offsetHSL(0, 0, -0.05) : new THREE.Color("#C9A66B");
  pos.push(0, 0, 0); col.push(cDirt.r, cDirt.g, cDirt.b, 1);
  for (let i = 1; i <= RINGS; i++) {
    const d = MAXD * Math.pow(i / RINGS, 2.6); const s = d / RK;
    for (let j = 0; j < SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      const dir = F.up.clone().multiplyScalar(Math.cos(s)).addScaledVector(F.e.clone().multiplyScalar(Math.cos(th)).addScaledVector(F.n, Math.sin(th)), Math.sin(s));
      const p = dir.multiplyScalar(RK).sub(F.pos);
      pos.push(p.x, p.y, p.z);
      const c = cNear.clone().lerp(cFar, smooth(0.3, 20, d)); void cDirt;
      if (d > 0.006 && d < 2) c.offsetHSL(0, 0, ((Math.sin(th * 9 + d * 7) > 0.6) ? -0.04 : 0));
      col.push(c.r, c.g, c.b, 1 - smooth(25, MAXD, d));
    }
  }
  for (let j = 0; j < SEG; j++) idx.push(0, 1 + j, 1 + ((j + 1) % SEG));
  for (let i = 1; i < RINGS; i++) for (let j = 0; j < SEG; j++) {
    const a = 1 + (i - 1) * SEG + j, b = 1 + (i - 1) * SEG + ((j + 1) % SEG), c = a + SEG, d = b + SEG;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4));
  g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: true, side: THREE.DoubleSide }));
  m.renderOrder = 1; return m;
}
/** Crisp local map (orthographic around a point) so close-ups never show a blurry globe texture. */
function localMapTexture(lat: number, lon: number, R_ORTHO: number, kind: string): THREE.CanvasTexture {
  const N = 1024, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d")!;
  const f = enu(lat, lon); const P = (lo: number, la: number) => { const v = llToEcef(la, lo, 1); return [(v[0] * f.e[0] + v[1] * f.e[1] + v[2] * f.e[2]) * RK, (v[0] * f.n[0] + v[1] * f.n[1] + v[2] * f.n[2]) * RK, v[0] * f.u[0] + v[1] * f.u[1] + v[2] * f.u[2]]; };
  const S = (x: number, y: number) => [N / 2 + (x / R_ORTHO) * (N / 2), N / 2 - (y / R_ORTHO) * (N / 2)];
  g.fillStyle = "#3B56C4"; g.fillRect(0, 0, N, N);
  const dLat = 3, dLon = 3 / Math.max(0.15, Math.cos(lat * Math.PI / 180));
  const draw = (polys: number[][][][], fill: string, stroke: string) => {
    g.beginPath(); let any = false;
    for (const poly of polys) {
      const r0 = poly[0]; let near = false;
      for (let i = 0; i < r0.length; i += 4) { if (Math.abs(r0[i][1] - lat) < dLat && Math.abs(((r0[i][0] - lon + 540) % 360) - 180) < dLon) { near = true; break; } }
      if (!near) continue; any = true;
      for (const ring of poly) { ring.forEach(([lo, la], i) => { const q = P(lo, la); const [x, y] = S(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); }
    }
    if (any) { g.fillStyle = fill; g.fill("evenodd"); g.strokeStyle = stroke; g.lineWidth = 3; g.stroke(); }
  };
  for (const cn of WORLD) draw(cn.p as any, cn.n === "Antarctica" ? "#E9EEFF" : "#8FD6A8", "rgba(58,42,48,.5)");
  for (const r of TGT().regions) draw(r.polys as any, kind === "aus" ? (TGT().key === "AU" ? "#F0B860" : "#9BD88A") : PAL.yellow, kind === "aus" ? "rgba(58,42,48,.5)" : "#E58AA3");
  // cartoon ground speckles
  let sd = 11; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  g.globalAlpha = 0.18; for (let i = 0; i < 2600; i++) { const x = rr() * N, y = rr() * N, r = 1 + rr() * 3; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = rr() > .5 ? "#ffffff" : "#3a2a30"; g.fill(); }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t;
}
function buildMapPatch(lat: number, lon: number, kind: string): THREE.Mesh {
  const f = enuT(lat, lon), F = { up: f.up, e: f.e, n: f.n, pos: llT(lat, lon) };
  const RINGS = 60, SEG = 72, MAXD = 160, RO = RK * Math.sin(MAXD / RK);
  const pos: number[] = [], uv: number[] = [], col: number[] = [], idx: number[] = [];
  pos.push(0, 0, 0); uv.push(0.5, 0.5); col.push(1, 1, 1, 1);
  for (let i = 1; i <= RINGS; i++) {
    const d = MAXD * Math.pow(i / RINGS, 2.4), s = d / RK;
    for (let j = 0; j < SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      const p = F.up.clone().multiplyScalar(Math.cos(s)).addScaledVector(F.e.clone().multiplyScalar(Math.cos(th)).addScaledVector(F.n, Math.sin(th)), Math.sin(s)).multiplyScalar(RK).sub(F.pos);
      pos.push(p.x, p.y, p.z);
      uv.push(0.5 + (RK * Math.sin(s) * Math.cos(th)) / RO / 2, 0.5 + (RK * Math.sin(s) * Math.sin(th)) / RO / 2);
      col.push(1, 1, 1, 1 - smooth(40, MAXD, d));
    }
  }
  for (let j = 0; j < SEG; j++) idx.push(0, 1 + j, 1 + ((j + 1) % SEG));
  for (let i = 1; i < RINGS; i++) for (let j = 0; j < SEG; j++) { const a = 1 + (i - 1) * SEG + j, b = 1 + (i - 1) * SEG + ((j + 1) % SEG); idx.push(a, a + SEG, b, b, a + SEG, b + SEG); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: localMapTexture(lat, lon, RO, kind), vertexColors: true, transparent: true, side: THREE.DoubleSide }));
  m.position.copy(F.pos); m.renderOrder = 1; return m;
}
function placeLocal(s: THREE.Object3D, eastM: number, northM: number, upM = 0) {
  const F = siteFrame; s.position.copy(F.e).multiplyScalar(eastM / 1000).addScaledVector(F.n, northM / 1000).addScaledVector(F.up, upM / 1000);
}
function buildArrow() {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: PAL.yellow, transparent: true, opacity: 0.9, depthWrite: false });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.00012, 0.00012, 0.004, 12), m); shaft.position.y = 0.002;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.00035, 0.0009, 16), m); head.position.y = 0.0044;
  const outlineM = new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide });
  const so = new THREE.Mesh(new THREE.CylinderGeometry(0.00018, 0.00018, 0.004, 12), outlineM); so.position.y = 0.002;
  const ho = new THREE.Mesh(new THREE.ConeGeometry(0.00045, 0.00105, 16), outlineM); ho.position.y = 0.0044;
  g.add(shaft, head, so, ho); g.renderOrder = 5; return g;
}

function setupSite() {
  const c = st.city;
  const f = enuT(c.lat, c.lon);
  siteFrame = { up: f.up, e: f.e, n: f.n, pos: llT(c.lat, c.lon) };
  site.position.copy(siteFrame.pos);
  if (farm) { site.remove(farm); farm.geometry.dispose(); }
  farm = buildFarm(); site.add(farm);
  // props (fixed geography around the farm)
  for (const p of props) site.remove(p);
  props.length = 0;
  const add = (s: THREE.Sprite, e: number, n: number) => { placeLocal(s, e, n); site.add(s); props.push(s); };
  const sc = c.scene;
  if (sc === "steppe") {
    add(sprite(texCache.ger, 0.011, 220 / 320), -30, 26); add(sprite(texCache.ger, 0.008, 220 / 320), 24, 40);
    for (let i = 0; i < 3; i++) add(sprite(texCache.sheep, 0.0016, 0.8), 14 + i * 3, -12 + i * 2);
  } else {
    add(sprite(texCache.barn, 0.016, 280 / 320), -38, 30);
    add(sprite(texCache.hay, 0.0024, 0.7), 9, -7);
    add(sprite(texCache.hay, 0.0024, 0.7), 11, -4.5);
    if (sc === "au-farm") add(sprite(texCache.windmill, 0.007, 400 / 240), 30, 34);
    if (sc === "fr-farm" || sc === "tw-farm") { add(sprite(texCache.tree, 0.007, 300 / 240), 26, 30); add(sprite(texCache.tree, 0.006, 300 / 240), -12, 46); }
    if (sc === "nz-farm") for (let i = 0; i < 5; i++) add(sprite(texCache.sheep, 0.0016, 0.8), 12 + i * 3.2, 14 - i * 4);
  }
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) { const d = 4 + r() * 70, a = r() * Math.PI * 2; add(sprite(texCache.tuft, 0.0009 + r() * 0.0007, 80 / 120), Math.cos(a) * d, Math.sin(a) * d); }
  if (sign) site.remove(sign);
  sign = sprite(texCache["sign_" + c.id], 0.0028, 0.75); site.add(sign);
  if (aimArrow) site.remove(aimArrow);
  aimArrow = buildArrow(); site.add(aimArrow);
  resetCow();
  startLabel.position.copy(llT(c.lat, c.lon, RK + 1));
  (startLabel.material as THREE.SpriteMaterial).map = labelTex(c.name.toUpperCase(), PAL.pink);
  startDot.position.copy(llT(c.lat, c.lon, RK + 0.5));
  rebuildTrails(); updateAim();
}
function resetCow() {
  cow.center.set(0.5, 0.19); cow.position.set(0, 0, 0); cow.material.rotation = 0; setPose("idle"); cow.visible = true; setCowFlip(false);
  cow.scale.set(0.0034, 0.0034, 1);
  if (cow.parent !== site) site.add(cow);
}
const labelTexCache: Record<string, THREE.Texture> = {};
function labelTex(text: string, color: string) {
  const k = text + color; if (labelTexCache[k]) return labelTexCache[k];
  const s = labelSprite(text, color); labelTexCache[k] = (s.material as THREE.SpriteMaterial).map!; return labelTexCache[k];
}
let poseNow: Pose = "idle";
function setPoseIf(p: Pose) { if (poseNow !== p) { const flip = cow.material.map?.repeat.x === -1; setPose(p); setCowFlip(flip); } }
function setPose(p: Pose) { poseNow = p; cow.material.map = texCache["cow_" + p]; cow.material.needsUpdate = true; setCowFlip(false); }
function setCowFlip(f: boolean) { const t = cow.material.map!; t.wrapS = THREE.RepeatWrapping; t.repeat.x = f ? -1 : 1; t.offset.x = f ? 1 : 0; }

const TGT = () => TARGETS[st.city.target];
let earthTarget = "";
function refreshTarget() {
  const T = TGT();
  if (earthTarget !== T.key) {
    const m = earth.material as THREE.MeshBasicMaterial; m.map?.dispose(); m.map = buildEarthTexture(T); m.needsUpdate = true; earthTarget = T.key;
  }
  (ausLabel.material as THREE.SpriteMaterial).map = labelTex(T.name.toUpperCase(), PAL.yellow);
  ausLabel.position.copy(llT(T.centre.lat, T.centre.lon, RK + 1));
}
// markers
let startLabel!: THREE.Sprite, startDot!: THREE.Sprite, ausLabel!: THREE.Sprite;

// ---------------------------------------------------------------- trails
const trailGroup = new THREE.Group(); scene.add(trailGroup);
let headingLine: Line2 | null = null;
let curLine: Line2 | null = null, tipLine: Line2 | null = null, curPts: THREE.Vector3[] = [];
const curMat = lineMat(PAL.pink, 4.5, 1), tipMat = lineMat(PAL.pink, 4.5, 1), headMat = lineMat(PAL.yellow, 3, 0.95, true);

function rebuildTrails() {
  for (const ch of [...trailGroup.children]) { trailGroup.remove(ch); (ch as any).geometry?.dispose?.(); }
  const H = st.history[st.city.id] ?? [];
  const legend = $("legend"); legend.innerHTML = "";
  H.forEach((t, i) => {
    const age = H.length - 1 - i; // 0 = newest
    const color = age === 0 ? PAL.pink : TRAIL_COLORS[i % TRAIL_COLORS.length];
    const m = lineMat(color, age === 0 ? 4 : 2.6, age === 0 ? 1 : Math.max(0.3, 0.85 - age * 0.12));
    trailGroup.add(makeLine(t.samples, m));
    if (t.land) { const d = dotSprite(color, age === 0 ? 0.02 : 0.014); d.position.copy(llT(t.land.lat, t.land.lon, RK + 0.3)); trailGroup.add(d); }
    const row = document.createElement("div"); row.innerHTML = `<i style="background:${color};opacity:${age === 0 ? 1 : Math.max(0.3, 0.85 - age * 0.12)}"></i>${t.label}`; legend.prepend(row);
  });
  resizeLines();
}
function downsample(f: FlightResult): THREE.Vector3[] {
  const s = f.samples, n = s.length, step = Math.max(1, Math.ceil(n / 900)), out: THREE.Vector3[] = [];
  for (let i = 0; i < n; i += step) out.push(T(s[i].ecef));
  if ((n - 1) % step) out.push(T(s[n - 1].ecef));
  return out;
}
function updateHeadingLine() {
  if (headingLine) { scene.remove(headingLine); headingLine.geometry.dispose(); headingLine = null; }
  // compass heading only (a short great-circle stub along the chosen direction) — NOT a trajectory prediction
  const c = st.city, pts: THREE.Vector3[] = [];
  const a0 = llToEcef(c.lat, c.lon, 1), f = enu(c.lat, c.lon), az = st.az * Math.PI / 180;
  const dir: V3 = [f.e[0] * Math.sin(az) + f.n[0] * Math.cos(az), f.e[1] * Math.sin(az) + f.n[1] * Math.cos(az), f.e[2] * Math.sin(az) + f.n[2] * Math.cos(az)];
  for (let i = 0; i <= 24; i++) { const s = (900 / RK) * i / 24; pts.push(T([(a0[0] * Math.cos(s) + dir[0] * Math.sin(s)) * (RK + 2) * 1000, (a0[1] * Math.cos(s) + dir[1] * Math.sin(s)) * (RK + 2) * 1000, (a0[2] * Math.cos(s) + dir[2] * Math.sin(s)) * (RK + 2) * 1000])); }
  headingLine = makeLine(pts, headMat); scene.add(headingLine);
}

// ---------------------------------------------------------------- camera rig
interface Pose3 { pos: THREE.Vector3; tgt: THREE.Vector3; up: THREE.Vector3 }
let tween: { from: Pose3; to: () => Pose3; t0: number; dur: number; done?: () => void } | null = null;
let camPose: Pose3 = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) };

function cowViewPose(): Pose3 {
  const F = siteFrame, a = localDir(st.az, 0), u = F.up;
  const perp = u.clone().cross(a).normalize(); // camera looks along perp, so aim points screen-right
  const base = F.pos;
  const pos = base.clone().addScaledVector(perp, -0.0115).addScaledVector(u, 0.0026).addScaledVector(a, -0.0016);
  const tgt = base.clone().addScaledVector(u, 0.0021).addScaledVector(a, 0.0012);
  return { pos, tgt, up: u.clone() };
}
function globePose(): Pose3 {
  const sDir = siteFrame.up.clone(), aDir = llT(TGT().centre.lat, TGT().centre.lon).normalize();
  const ang = sDir.angleTo(aDir);
  const mid = slerpDir(sDir, aDir, 0.5);
  const toAus = aDir.clone().sub(mid.clone().multiplyScalar(mid.dot(aDir))).normalize();
  const back = toAus.clone().negate();
  const dist = RK * (1.25 + ang * 1.15);
  const camDir = mid.clone().multiplyScalar(Math.cos(0.42)).addScaledVector(back, Math.sin(0.42)).normalize();
  return { pos: camDir.multiplyScalar(RK + dist), tgt: mid.clone().multiplyScalar(RK * 0.92), up: isFinite(toAus.x) ? toAus : new THREE.Vector3(0, 1, 0) };
}
function slerpDir(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  const A = a.clone().normalize(), B = b.clone().normalize(); const d = clamp(A.dot(B), -1, 1), om = Math.acos(d);
  if (om < 1e-6) return A;
  if (Math.PI - om < 1e-3) { const ax = Math.abs(A.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0); return A.clone().applyAxisAngle(ax.cross(A).normalize(), om * t); }
  const s = Math.sin(om); return A.multiplyScalar(Math.sin((1 - t) * om) / s).add(B.multiplyScalar(Math.sin(t * om) / s)).normalize();
}
/** Blend two camera poses: direction slerp around Earth's centre, altitude in log space. */
function blendPose(a: Pose3, b: Pose3, t: number): Pose3 {
  const ra = a.pos.length(), rb = b.pos.length();
  const ha = Math.max(1e-4, ra - RK), hb = Math.max(1e-4, rb - RK);
  const h = Math.exp(Math.log(ha) * (1 - t) + Math.log(hb) * t);
  const pos = slerpDir(a.pos, b.pos, t).multiplyScalar(RK + h);
  const tgt = a.tgt.clone().lerp(b.tgt, hb < ha ? 1 - Math.pow(1 - t, 3) : t * t * t);
  const up = a.up.clone().lerp(b.up, t); if (up.lengthSq() < 1e-6) up.copy(b.up); up.normalize();
  return { pos, tgt, up };
}
function flyTo(to: () => Pose3, dur = 1, done?: () => void) { tween = { from: { pos: camPose.pos.clone(), tgt: camPose.tgt.clone(), up: camPose.up.clone() }, to, t0: performance.now(), dur: dur * 1000, done }; }

// ---------------------------------------------------------------- free globe orbit (drag / pinch / wheel)
let free: { pos: THREE.Vector3; up: THREE.Vector3; tgt: THREE.Vector3 } | null = null;
const ptrs = new Map<number, { x: number; y: number }>();
let pinch0 = 0;
const canOrbit = () => st.mode === "setup" && st.view === "globe" && !tween;
function ensureFree() {
  if (!free) free = { pos: camPose.pos.clone(), up: camPose.up.clone(), tgt: camPose.tgt.clone() };
  $("hint").style.opacity = "0";
}
function orbit(dx: number, dy: number) {
  ensureFree(); const f = free!;
  const dist = f.pos.length(), k = 0.0045 * Math.min(1.6, (dist - RK) / (RK * 1.6) + 0.15);
  const fwd = f.pos.clone().negate().normalize(), right = fwd.clone().cross(f.up).normalize();
  const up = right.clone().cross(fwd).normalize();
  const q = new THREE.Quaternion().setFromAxisAngle(up, -dx * k).multiply(new THREE.Quaternion().setFromAxisAngle(right, -dy * k));
  f.pos.applyQuaternion(q); f.up.copy(up).applyQuaternion(q);
}
function zoom(factor: number) {
  ensureFree(); const f = free!; const h = clamp((f.pos.length() - RK) * factor, RK * 0.12, RK * 14); f.pos.setLength(RK + h);
}
canvas.addEventListener("pointerdown", (e) => { if (!canOrbit()) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); } });
canvas.addEventListener("pointermove", (e) => {
  const p = ptrs.get(e.pointerId); if (!p || !canOrbit()) return;
  if (ptrs.size === 1) orbit(e.clientX - p.x, e.clientY - p.y);
  p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0 > 0) zoom(pinch0 / d); pinch0 = d; }
});
const ptrUp = (e: PointerEvent) => { ptrs.delete(e.pointerId); pinch0 = 0; };
canvas.addEventListener("pointerup", ptrUp); canvas.addEventListener("pointercancel", ptrUp);
canvas.addEventListener("wheel", (e) => { if (!canOrbit()) return; e.preventDefault(); zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });

// ---------------------------------------------------------------- flight camera
function flightPose(simT: number): { pose: Pose3; alt: number; cowPos: THREE.Vector3; vel: THREE.Vector3 } {
  const f = st.flight!;
  const s = sampleAt(f, simT); const cowPos = T(s.ecef); const alt = s.alt / 1000;
  const dt = Math.max(0.2, Math.min(5, st.rate * 0.03));
  const s2 = sampleAt(f, Math.min(f.flightTime, simT + dt)), s1 = sampleAt(f, Math.max(0, simT - dt));
  const vel = T(s2.ecef).sub(T(s1.ecef));
  const up = cowPos.clone().normalize();
  const hv = vel.clone().addScaledVector(up, -vel.dot(up));
  if (hv.length() > 1e-3 * Math.max(1, dt)) st.lastFwd.copy(hv.normalize());
  const fwd = st.lastFwd.clone();
  const perp = up.clone().cross(fwd).normalize();
  // chase camera: same composition as the ground view, distance grows with altitude
  const d = 0.0118 + alt * (0.2 + 0.65 * smooth(1.5, 60, alt));
  const chase: Pose3 = {
    pos: cowPos.clone().addScaledVector(perp, -d).addScaledVector(up, 0.0026 + d * 0.22).addScaledVector(fwd, -0.0016 - d * 0.25),
    tgt: cowPos.clone().addScaledVector(up, 0.0004),
    up,
  };
  // "seat-back GPS map": oblique view over the cow toward Australia
  const aDir = llT(TGT().centre.lat, TGT().centre.lon).normalize();
  const cDir = up.clone();
  const ang = cDir.angleTo(aDir);
  const mid = slerpDir(cDir, aDir, 0.45);
  let toAus = aDir.clone().sub(mid.clone().multiplyScalar(mid.dot(aDir)));
  if (toAus.lengthSq() < 1e-8) toAus = fwd.clone();
  toAus.normalize();
  const tgtG = mid.clone().multiplyScalar(RK);
  const need = cowPos.distanceTo(tgtG) * 2.1;
  const dist = Math.max(RK * (1.2 + ang * 0.9), need);
  const camDir = mid.clone().multiplyScalar(Math.cos(0.5)).addScaledVector(toAus, -Math.sin(0.5)).normalize();
  const gps: Pose3 = { pos: camDir.multiplyScalar(RK + dist), tgt: tgtG.lerp(cowPos, 0.25), up: toAus };
  const g = smooth(50, 900, alt);
  return { pose: blendPose(chase, gps, g), alt, cowPos, vel };
}

// ---------------------------------------------------------------- UI
const elIn = $("el") as HTMLInputElement, pwIn = $("pw") as HTMLInputElement, dial = $("dial") as unknown as SVGSVGElement;
const fmtNum = (x: number, d = 0) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const CARD = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
function drawDial() {
  // a horizontal "tape" compass: drag left/right
  const W = 200, cx = 100, ppd = 1.6; let s = `<rect x="1" y="16" width="198" height="52" rx="14" fill="#30357a" stroke="${PAL.ink}" stroke-width="2.5"/>`;
  const ausB = bearing(st.city.lat, st.city.lon, TGT().centre.lat, TGT().centre.lon), TK = TGT().key;
  for (let d = -70; d <= 70; d++) {
    const deg = ((Math.round(st.az) + d) % 360 + 360) % 360, x = cx + (deg - st.az + (deg - st.az > 180 ? -360 : deg - st.az < -180 ? 360 : 0)) * ppd;
    if (x < 6 || x > W - 6) continue;
    if (deg % 45 === 0) s += `<text x="${x}" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="${PAL.text}">${CARD[deg / 22.5]}</text><line x1="${x}" y1="20" x2="${x}" y2="40" stroke="${PAL.text}" stroke-width="2.5"/>`;
    else if (deg % 15 === 0) s += `<line x1="${x}" y1="20" x2="${x}" y2="34" stroke="${PAL.lav}" stroke-width="2"/>`;
    else if (deg % 5 === 0) s += `<line x1="${x}" y1="20" x2="${x}" y2="28" stroke="${PAL.lav}" stroke-width="1.2" opacity=".7"/>`;
  }
  let dA = ausB - st.az; dA = ((dA + 540) % 360) - 180; const xa = cx + dA * ppd;
  if (xa > 10 && xa < W - 10) s += `<g transform="translate(${xa},12)"><rect x="-13" y="-10" width="26" height="15" rx="5" fill="${PAL.yellow}" stroke="${PAL.ink}" stroke-width="2"/><text y="1.5" text-anchor="middle" font-size="10" font-weight="700" fill="${PAL.ink}">${TK}</text></g>`;
  else s += `<text x="${dA < 0 ? 8 : W - 8}" y="10" text-anchor="${dA < 0 ? "start" : "end"}" font-size="10" font-weight="700" fill="${PAL.yellow}">${dA < 0 ? "◀ " + TK : TK + " ▶"}</text>`;
  s += `<path d="M${cx - 9},74 L${cx},62 L${cx + 9},74 Z" fill="${PAL.pink}" stroke="${PAL.ink}" stroke-width="2.5"/><line x1="${cx}" y1="18" x2="${cx}" y2="64" stroke="${PAL.pink}" stroke-width="3.5"/>`;
  dial.innerHTML = s;
}
let dialDrag: { x: number; az: number } | null = null;
dial.addEventListener("pointerdown", (e) => { dialDrag = { x: e.clientX, az: st.az }; dial.setPointerCapture(e.pointerId); });
dial.addEventListener("pointermove", (e) => {
  if (!dialDrag) return; const scale = 200 / dial.getBoundingClientRect().width;
  setAz(dialDrag.az - (e.clientX - dialDrag.x) * scale / 1.6);
});
dial.addEventListener("pointerup", () => { dialDrag = null; });
function setAz(v: number) { st.az = Math.round((((v % 360) + 360) % 360) * 2) / 2; updateAim(); }
function updateAim() {
  $("azv").textContent = `${st.az.toFixed(st.az % 1 ? 1 : 0)}° ${CARD[Math.round(st.az / 22.5) % 16]}`;
  $("elv").textContent = `${st.el.toFixed(1).replace(/\.0$/, "")}°`;
  $("pwv").textContent = st.pw.toFixed(3);
  elIn.value = String(st.el); pwIn.value = String(st.pw);
  drawDial(); updateHeadingLine();
  // ground aim arrow: shows the fart direction at the cow (not a trajectory)
  if (aimArrow) {
    const d = localDir(st.az, st.el);
    aimArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    aimArrow.position.copy(siteFrame.up).multiplyScalar(0.0016);
  }
  if (sign) { const a = localDir(st.az, 0), perp = siteFrame.up.clone().cross(a).normalize(); sign.position.copy(a).multiplyScalar(-0.0042).addScaledVector(perp, 0.0018); }
  settings[st.city.id] = { az: st.az, el: st.el, pw: st.pw };
}
elIn.addEventListener("input", () => { st.el = +elIn.value; updateAim(); });
pwIn.addEventListener("input", () => { st.pw = +pwIn.value; updateAim(); });
document.querySelectorAll<HTMLButtonElement>(".fine button").forEach((b) => {
  let timer: number | undefined, rep: number | undefined;
  const step = () => {
    const k = b.dataset.k!, d = +b.dataset.d!;
    if (k === "az") setAz(st.az + d);
    if (k === "el") { st.el = clamp(Math.round((st.el + d) * 2) / 2, 2, 88); updateAim(); }
    if (k === "pw") { st.pw = clamp(Math.round((st.pw + d) * 1000) / 1000, 0.5, 11.5); updateAim(); }
  };
  b.addEventListener("pointerdown", (e) => { e.preventDefault(); step(); timer = window.setTimeout(() => { rep = window.setInterval(step, 70); }, 380); });
  const stop = () => { clearTimeout(timer); clearInterval(rep); };
  b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop); b.addEventListener("pointercancel", stop);
});

function setView(v: View, dur = 1.1) {
  free = null; st.view = v; $("hint").style.opacity = v === "globe" ? "1" : "0"; $("viewBtn").textContent = v === "cow" ? "🌏 Globe" : "🐄 Cow";
  flyTo(v === "cow" ? cowViewPose : globePose, dur);
}
$("viewBtn").onclick = () => { if (st.mode === "setup") setView(st.view === "cow" ? "globe" : "cow"); };
$("infoBtn").onclick = () => $("infoM").classList.add("on");
$("infoClose").onclick = () => $("infoM").classList.remove("on");
$("clearBtn").onclick = () => { st.history[st.city.id] = []; st.attempts[st.city.id] = 0; rebuildTrails(); updateAttempt(); save(); };
$("cityBtn").onclick = () => { if (st.mode !== "setup") return; renderCityList(); $("cityM").classList.add("on"); };
$("cityM").addEventListener("click", (e) => { if (e.target === $("cityM")) $("cityM").classList.remove("on"); });
$("infoM").addEventListener("click", (e) => { if (e.target === $("infoM")) $("infoM").classList.remove("on"); });
const STARS: Record<string, number> = { t1: 1, t2: 3, t3: 3, t4: 1, t5: 2 };
function renderCityList() {
  const L = $("cityList"); L.innerHTML = "";
  const head = (t: string) => { const h = document.createElement("div"); h.className = "lhead"; h.textContent = t; L.appendChild(h); };
  const row = (c: City) => {
    const b = document.createElement("button"); b.className = "city" + (c.id === st.city.id ? " cur" : "");
    const n = (st.history[c.id] ?? []).length, T = TARGETS[c.target];
    const title = c.kind === "tour" ? `${c.level}. ${c.country} → ${T.name}` : `${c.name} → ${T.name}`;
    const right = (st.done[c.id] ? `<span class="ok">✓</span>` : "") + (c.kind === "tour" ? `<span class="st">${"★".repeat(STARS[c.id] ?? 1)}</span>` : "") + (n ? `<span>${n} trail${n > 1 ? "s" : ""}</span>` : "");
    b.innerHTML = `<div><b>${title}</b><span>${c.blurb}</span></div><div class="n">${right}</div>`;
    b.onclick = () => { $("cityM").classList.remove("on"); chooseCity(c); };
    L.appendChild(b);
  };
  const doneN = TOUR.filter((c) => st.done[c.id]).length;
  head(`🌍 WORLD TOUR · ${doneN}/${TOUR.length}`); TOUR.forEach(row);
  head("🐄 CLASSIC · ANY FARM → AUSTRALIA"); CLASSIC.forEach(row);
}
function ballpark(c: City) {
  const T = TARGETS[c.target], psi = gcDist(c.lat, c.lon, T.centre.lat, T.centre.lon) / R_EARTH, sn = Math.sin(psi / 2);
  const v = Math.sqrt(3.986004418e14 / R_EARTH * 2 * sn / (1 + sn)) / 1000;
  return Math.max(1, Math.floor(v * 2) / 2 - 0.5);
}
function chooseCity(c: City) {
  st.city = c; const T = TARGETS[c.target];
  $("cityBtn").textContent = c.kind === "tour" ? `Lv${c.level}: ${c.country} → ${T.name} ▾` : `${c.name} → ${T.name} ▾`;
  const sset = settings[c.id];
  if (sset) { st.az = sset.az; st.el = sset.el; st.pw = sset.pw; }
  else { st.az = Math.round(bearing(c.lat, c.lon, T.centre.lat, T.centre.lon)); st.el = 45; st.pw = ballpark(c); }
  refreshTarget(); setupSite(); updateAttempt();
  setView((st.history[c.id] ?? []).length ? "globe" : "cow", 1.4);
  save();
}
function updateAttempt() { $("att").textContent = `Attempt ${(st.attempts[st.city.id] ?? 0) + 1}`; }

// ---------------------------------------------------------------- launch sequence
const pootEl = $("poot");
let chargeT0 = 0;
$("fart").onclick = () => {
  if (st.mode !== "setup") return;
  st.mode = "charge"; free = null; $("hint").style.opacity = "0"; $("panel").classList.add("hide"); $("legend").style.display = "none";
  const go = () => { chargeT0 = performance.now(); };
  if (st.view !== "cow" || tween) { st.view = "cow"; $("viewBtn").textContent = "🌏 Globe"; flyTo(cowViewPose, 0.9, go); chargeT0 = Infinity; }
  else go();
};
function launchNow() {
  const L: Launch = { lat: st.city.lat, lon: st.city.lon, azimuth: st.az, elevation: st.el, dv: st.pw * 1000 };
  st.flight = simulate(L);
  st.simT = 0; st.realT = 0; st.mode = "flight";
  st.lastFwd.copy(localDir(st.az, 0));
  // move cow into world space (out of the farm group) for flight
  site.remove(cow); scene.add(cow); cow.center.set(0.5, 0.5); setPose("fly");
  for (let i = 0; i < 4; i++) { const p = sprite(texCache.puff, 0.004, 180 / 256, 0.5, 0.3); placeLocal(p, (Math.random() - .5) * 2, (Math.random() - .5) * 2, 0.2); site.add(p); puffs.push({ s: p, t0: performance.now() + i * 60 }); }
  if (landPatch) { scene.remove(landPatch); landPatch.geometry.dispose(); landPatch = null; }
  if (st.flight.landing && gcDist(st.city.lat, st.city.lon, st.flight.landing.lat, st.flight.landing.lon) > 30000) {
    const k = targetRegionAt(TGT(), st.flight.landing.lat, st.flight.landing.lon) ? "aus" : "other";
    landPatch = buildMapPatch(st.flight.landing.lat, st.flight.landing.lon, k); landPatch.visible = false; scene.add(landPatch);
  }
  curPts = downsampleFull(st.flight);
  if (curLine) { scene.remove(curLine); curLine.geometry.dispose(); }
  curLine = makeLine(curPts, curMat); curLine.geometry.instanceCount = 0; scene.add(curLine);
  if (tipLine) { scene.remove(tipLine); tipLine.geometry.dispose(); }
  tipLine = makeLine([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)], tipMat); scene.add(tipLine);
  $("hud").style.display = "block"; $("skip").style.display = "block";
  if (headingLine) headingLine.visible = false; aimArrow.visible = false;
}
function downsampleFull(f: FlightResult) { return f.samples.map((s) => T(s.ecef)); }
$("skip").onclick = () => { if (st.mode === "flight") { st.simT = st.flight!.flightTime; } };

// ---------------------------------------------------------------- landing & results
interface Verdict { kind: "aus" | "home" | "ocean" | "country" | "antarctic" | "escaped"; title: string; tag: string; place: string; region?: string; ending?: string }
const ENDINGS: Record<string, [string, string]> = {
  milkshake: ["G'DAY, MATE!", "Welcome party! The local herd brought milkshakes."],
  "cheese-picnic": ["KIA ORA!", "Dropped right into the herd. Cheese picnic time."],
  croissant: ["BONJOUR!", "Cheese and croissants. Very civilised."],
  vineyard: ["OOH LA LA", "Somewhere among the vines. One glass of red, cow-sized."],
  fondue: ["GRÜEZI!", "Alps behind, fondue in front. Toasty."],
  "bubble-tea": ["HOME SWEET HOME!", "World tour complete. Bubble tea for the whole herd."],
  city: ["RUSH HOUR MOO", "Landed somewhere in town and stopped all the traffic."],
};
function pickEnding(c: City) {
  const r = Math.random();
  if (r < 0.18) return "city";
  if (c.celebrate === "croissant" && r < 0.5) return "vineyard";
  return c.celebrate;
}
function judge(f: FlightResult): Verdict {
  if (f.outcome === "escaped") return { kind: "escaped", title: "BYE, EARTH", tag: "Too much fart. Escape velocity reached — this cow is now somebody else's problem.", place: "Outer space" };
  const { lat, lon } = f.landing!;
  const T = TGT(), reg = targetRegionAt(T, lat, lon);
  if (reg) {
    const ending = pickEnding(st.city), [title, tag0] = ENDINGS[ending] ?? ENDINGS.milkshake;
    const lucky = T.key === "AU" && reg !== "Mainland Australia" ? ` Lucky: ${reg} counts as Australia!` : "";
    return { kind: "aus", title, tag: tag0 + lucky, place: reg, region: reg, ending };
  }
  if (gcDist(lat, lon, st.city.lat, st.city.lon) < 30000) return { kind: "home", title: "BACK ON THE FARM", tag: "That was more of a hiccup. The cow is unimpressed.", place: st.city.name };
  if (inAntarcticClaim(lat, lon)) return { kind: "antarctic", title: "TECHNICALLY…?", tag: "Australian Antarctic claim. Doesn't count. Nice try though.", place: "Antarctica (Australian claim)" };
  const c = countryAt(lat, lon);
  if (c && c === T.name) return { kind: "country", title: "TECHNICALLY…?", tag: `That's ${c}, but not the part this level is about. Close-ish!`, place: c };
  if (c) return { kind: "country", title: c === "Antarctica" ? "BRRRR." : "WRONG COUNTRY", tag: c === "Antarctica" ? "Penguins 1, Cow 0." : `Landed in ${c}. Right attitude, wrong passport stamp.`, place: c };
  return { kind: "ocean", title: "SPLASH!", tag: `Landed in ${oceanName(lat, lon)}. Moo-ving swim ahead.`, place: oceanName(lat, lon).replace(/^the /, "The ") };
}
const hms = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60); return h ? `${h}h ${String(m).padStart(2, "0")}m ${String(x).padStart(2, "0")}s` : `${m}m ${String(x).padStart(2, "0")}s`; };
let lastVerdict: Verdict | null = null, landedAt = 0, landPatch: THREE.Mesh | null = null, landSign: THREE.Sprite | null = null;
function onLanded() {
  const f = st.flight!; st.mode = "landed"; landedAt = performance.now();
  const v = judge(f); lastVerdict = v;
  $("skip").style.display = "none";
  if (f.outcome === "landed") {
    // cow back to "ground" anchoring at the landing point
    cow.center.set(0.5, v.kind === "ocean" ? 0.42 : 0.19); cow.material.rotation = 0; setCowFlip(false);
    setPose(v.kind === "aus" ? "smug" : v.kind === "home" ? "idle" : v.kind === "country" ? "dizzy" : "huh");
    const lp = llT(f.landing!.lat, f.landing!.lon);
    cow.position.copy(lp);
    if (landPatch) landPatch.visible = true;
    if (v.kind !== "ocean" && v.kind !== "home") {
      if (v.kind === "aus") {
      celebrate(lp, v.ending ?? "milkshake");
      // ease into a level, wider shot so the welcome party and backdrop read
      const up = lp.clone().normalize(), fwd = st.lastFwd.clone().addScaledVector(up, -st.lastFwd.dot(up)).normalize(), away = up.clone().cross(fwd).normalize();
      flyTo(() => ({ pos: lp.clone().addScaledVector(away, -0.012).addScaledVector(up, 0.0016), tgt: lp.clone().addScaledVector(up, 0.0013).addScaledVector(away, 0.003), up: up.clone() }), 0.9);
    }
    const txt = v.kind === "aus" ? ({ AU: "G'DAY!", NZ: "KIA ORA!", FR: "BONJOUR!", CH: "GRÜEZI!", TW: "HOME!" } as any)[TGT().key] : v.kind === "antarctic" ? "BRRR?" : (v.place.length > 9 ? "NOPE." : v.place.toUpperCase());
      tex("land_sign", signSVG(txt), 400, 300).then((t) => { const sg = sprite(t, 0.0028, 0.75); const fr = enuT(f.landing!.lat, f.landing!.lon); const pp = fr.up.clone().cross(st.lastFwd).normalize(); sg.position.copy(lp).addScaledVector(st.lastFwd, 0.0021).addScaledVector(pp, 0.0032); scene.add(sg); puffs.push({ s: sg, t0: 1e15 }); landSign = sg; });
    }
    const fx = sprite(v.kind === "ocean" ? texCache.splash : texCache.puff, v.kind === "ocean" ? 0.0055 : 0.005, v.kind === "ocean" ? 170 / 256 : 180 / 256, 0.5, 0.15);
    fx.position.copy(lp).addScaledVector(camera.position.clone().sub(lp).normalize(), -0.0015); fx.renderOrder = 7; fx.userData.grow = 0.5; scene.add(fx); puffs.push({ s: fx, t0: performance.now() });
  }
  if (v.kind === "aus") st.done[st.city.id] = true;
  // record trail
  const key = st.city.id; st.history[key] = st.history[key] ?? [];
  st.attempts[key] = (st.attempts[key] ?? 0) + 1;
  const label = `#${st.attempts[key]} ${f.launch.azimuth}°/${f.launch.elevation}°/${(f.launch.dv / 1000).toFixed(3)}`;
  st.history[key].push({ samples: downsample(f), land: f.landing, outcome: v.kind, label });
  while (st.history[key].length > HIST_MAX) st.history[key].shift();
  save();
}
/** Cartoon welcome party. Scenery is a random comedy ending, not the real landing spot. */
function celebrate(lp: THREE.Vector3, ending: string) {
  const up = lp.clone().normalize(), fwd = st.lastFwd.clone().addScaledVector(up, -st.lastFwd.dot(up)).normalize(), away = up.clone().cross(fwd).normalize();
  const put = (t: THREE.Texture, wM: number, aspect: number, rightM: number, awayM: number, order = 7) => {
    const sp = sprite(t, wM / 1000, aspect); sp.position.copy(lp).addScaledVector(fwd, rightM / 1000).addScaledVector(away, awayM / 1000); sp.renderOrder = order; scene.add(sp); puffs.push({ s: sp, t0: 1e15 }); return sp;
  };
  if (ending === "fondue") put(texCache.alps, 520, 0.4, 40, 700, 2);
  else if (ending === "vineyard") put(texCache.vineyard, 160, 0.4, 10, 90, 2);
  else if (ending === "city") { put(texCache.city, 220, 0.4, 0, 130, 2); put(texCache.car_a, 4.2, 0.56, -5.5, 7); put(texCache.car_b, 4.2, 0.56, 5.5, 8); put(texCache.car_c, 4.2, 0.56, 0.5, 14); }
  else { put(texCache.barn, 16, 280 / 320, -30, 45, 3); put(texCache.hay, 2.4, 0.7, 4.5, 10); }
  put(texCache.friend_a, 3.2, 1, -2.7, 4.5).center.y = 0.19; put(texCache.friend_b, 3.2, 1, 2.9, 5.5).center.y = 0.19;
  const food = ending === "vineyard" ? "wine" : ending === "city" ? "milkshake" : ending === "croissant" ? "croissant" : ending;
  const fx = texCache["food_" + food]; if (fx) put(fx, food === "cheese-picnic" || food === "croissant" ? 1.9 : 1.1, food === "cheese-picnic" || food === "croissant" ? 0.64 : (food === "fondue" ? 1 : 1.5), 1.3, -1.6, 9);
  if (ending === "city") put(texCache.food_milkshake, 1.0, 1.5, -2.6, -1.2, 9);
}
/** Along/cross-track miss relative to the great circle from launch site to the target centre. */
function missReport(f: FlightResult): string {
  if (!f.landing) return "";
  const T = TGT(), R = R_EARTH / 1000, c = st.city;
  const dSL = gcDist(c.lat, c.lon, f.landing.lat, f.landing.lon) / 1000, dSC = gcDist(c.lat, c.lon, T.centre.lat, T.centre.lon) / 1000;
  const dTh = (bearing(c.lat, c.lon, f.landing.lat, f.landing.lon) - bearing(c.lat, c.lon, T.centre.lat, T.centre.lon)) * Math.PI / 180;
  const xt = Math.asin(clamp(Math.sin(dSL / R) * Math.sin(dTh), -1, 1)) * R;
  const at = Math.acos(clamp(Math.cos(dSL / R) / Math.cos(xt / R), -1, 1)) * R * (Math.cos(dTh) < 0 ? -1 : 1);
  const lng = at - dSC;
  const p1 = Math.abs(lng) < 50 ? "about the right distance" : `${fmtNum(Math.abs(lng))} km too ${lng > 0 ? "far" : "short"}`;
  const p2 = Math.abs(xt) < 50 ? "right on the line" : `${fmtNum(Math.abs(xt))} km ${xt > 0 ? "right" : "left"} of the line`;
  return `${p1} · ${p2} to ${T.name}`;
}
function showResults() {
  const f = st.flight!, v = lastVerdict!; st.mode = "results";
  const watched = st.realT;
  const dAus = f.landing ? distanceToTarget(TGT(), f.landing.lat, f.landing.lon) / 1000 : NaN;
  const miss = v.kind !== "aus" && v.kind !== "escaped" ? missReport(f) : "";
  const idx = TOUR.findIndex((c) => c.id === st.city.id), next = v.kind === "aus" && idx >= 0 ? TOUR[idx + 1] : undefined;
  const tourDone = st.city.kind === "tour" && TOUR.every((c) => st.done[c.id]);
  const traveled = f.landing ? gcDist(f.launch.lat, f.launch.lon, f.landing.lat, f.landing.lon) / 1000 : NaN;
  const ll = f.landing ? `${Math.abs(f.landing.lat).toFixed(2)}°${f.landing.lat >= 0 ? "N" : "S"}, ${Math.abs(f.landing.lon).toFixed(2)}°${f.landing.lon >= 0 ? "E" : "W"}` : "—";
  $("resC").innerHTML = `<h2>${v.title}</h2><div class="tagline">${v.tag}</div>
  <div class="stats">
   <div class="stat"><div class="k">MAX ALTITUDE</div><div class="v">${f.outcome === "escaped" ? "∞ (escaped)" : fmtNum(f.maxAlt / 1000) + " km"}</div></div>
   <div class="stat"><div class="k">SIMULATED FLIGHT TIME</div><div class="v">${f.outcome === "escaped" ? "never lands" : hms(f.flightTime)}</div></div>
   <div class="stat wide"><div class="k">LANDED AT</div><div class="v">${v.place}${f.landing ? ` · <span style="font-weight:500;font-size:14px">${ll}</span>` : ""}</div></div>
   <div class="stat"><div class="k">TO NEAREST ${TGT().name.toUpperCase()} LAND</div><div class="v">${v.kind === "aus" ? "0 km 🎉" : isNaN(dAus) ? "—" : fmtNum(dAus) + " km"}</div></div>
   <div class="stat"><div class="k">GROUND DISTANCE FLOWN</div><div class="v">${isNaN(traveled) ? "—" : fmtNum(traveled) + " km"}</div></div>
   ${miss ? `<div class="stat wide"><div class="k">MISS REPORT</div><div class="v" style="font-size:15px">${miss}</div></div>` : ""}
   <div class="stat wide"><div class="k">THIS FART</div><div class="v" style="font-size:15px">${f.launch.azimuth}° · ${f.launch.elevation}° up · ${(f.launch.dv / 1000).toFixed(3)} km/s <span style="color:${PAL.lav};font-weight:500">(you watched ${watched.toFixed(1)} s)</span></div></div>
  </div>
  ${tourDone && v.kind === "aus" ? `<div class="tagline" style="color:${PAL.yellow}">🌍 World Tour complete! All five routes flown.</div>` : ""}
  <div class="btns"><button class="b-pink" id="again">TRY AGAIN</button><button class="b-dark" id="cmp">COMPARE 🌏</button>${next ? `<button class="b-pink" id="nextLv">NEXT ▶</button>` : ""}</div>
  <div class="note">${v.kind === "aus" ? "Ending scenery is a cartoon, not the real landing spot. " : ""}Simplified model: round Earth, central gravity, Earth rotation, no air. Flight time is model time; playback was sped up.</div>`;
  $("resM").classList.add("on"); $("hud").style.display = "none";
  $("again").onclick = () => backToSetup("cow");
  $("cmp").onclick = () => backToSetup("globe");
  if (next) $("nextLv").onclick = () => { backToSetup("cow"); chooseCity(next); };
}
function backToSetup(view: View) {
  $("resM").classList.remove("on"); $("hud").style.display = "none";
  if (curLine) curLine.visible = false; if (tipLine) tipLine.visible = false;
  for (const p of puffs) p.s.parent?.remove(p.s); puffs.length = 0;
  if (landPatch) { scene.remove(landPatch); landPatch.geometry.dispose(); landPatch = null; }
  if (landSign) { scene.remove(landSign); landSign = null; }
  scene.remove(cow); resetCow(); aimArrow.visible = true; if (headingLine) headingLine.visible = true;
  rebuildTrails(); updateAttempt();
  st.mode = "setup"; $("panel").classList.remove("hide"); $("legend").style.display = "block";
  setView(view, view === "cow" ? 1.6 : 1.3);
}

// ---------------------------------------------------------------- main loop
function resizeLines() {
  const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
  for (const m of lineMats) m.resolution.set(w, h);
}
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 58 : 46; camera.updateProjectionMatrix(); resizeLines();
}
window.addEventListener("resize", onResize);

let last = performance.now(), fpsAcc = 0, fpsN = 0, viewShift = 0, viewShiftX = 0;
(window as any).__perf = { fps: 0, frames: 0 };
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 1) { (window as any).__perf.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  (window as any).__perf.frames++;

  let shake = 0;
  // --- charge (provisional control): squat → strain → POOT
  if (st.mode === "charge" && now >= chargeT0) {
    const t = (now - chargeT0) / 1000;
    if (t < 0.35) setPose("squat");
    else if (t < 1.05) { if (poseNow !== "strain") setPose("strain"); shake = 0.00006 * Math.min(1, (t - 0.35) * 2); }
    else { setPose("poot"); pootEl.classList.add("on"); setTimeout(() => pootEl.classList.remove("on"), 650); launchNow(); }
  }
  // --- flight playback
  let altKm = 0;
  if (st.mode === "flight") {
    const f = st.flight!;
    const cur = sampleAt(f, st.simT); altKm = cur.alt / 1000;
    const rMax = Math.max(240, f.flightTime / 4);
    // slow-motion near the ground (launch & landing), fast in space; scaled by fart speed
    st.rate = Math.min(rMax, (0.2 + altKm * 0.9) * 4.6 / Math.max(1.2, f.launch.dv / 1000 * (0.3 + 0.7 * Math.sin(f.launch.elevation * Math.PI / 180))));
    st.simT = Math.min(f.flightTime, st.simT + st.rate * dt); st.realT += dt;
    const fp = flightPose(st.simT); altKm = fp.alt;
    camPose = fp.pose;
    cow.position.copy(fp.cowPos);
    // cow orientation: head along the on-screen velocity, slight tumble
    const p0 = fp.cowPos.clone().project(camera), p1 = fp.cowPos.clone().add(fp.vel.clone().setLength(Math.max(0.001, fp.cowPos.distanceTo(camera.position) * 0.05))).project(camera);
    const ang = Math.atan2((p1.y - p0.y) / camera.aspect, p1.x - p0.x);
    const left = Math.cos(ang) < 0; setCowFlip(left);
    cow.material.rotation = (left ? ang - Math.PI : ang) + Math.sin(st.realT * 5) * 0.12;
    // reveal flown trajectory only
    const idx = cur.idx; curLine!.geometry.instanceCount = Math.max(0, idx);
    // live segment from the last stored sample to the cow (unit segment, transformed: precise & cheap)
    const seg = fp.cowPos.clone().sub(curPts[idx]); const L = seg.length();
    tipLine!.position.copy(curPts[idx]); tipLine!.visible = L > 1e-7;
    if (L > 1e-7) { tipLine!.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), seg.divideScalar(L)); tipLine!.scale.set(1, 1, L); }
    const H = `<b>${fmtNum(altKm, altKm < 10 ? 2 : 0)} km</b> up<div class="s">sim time ${hms(st.simT)} · playback ×${fmtNum(st.rate, st.rate < 10 ? 1 : 0)} · watched ${st.realT.toFixed(1)} s</div>`;
    $("hud").innerHTML = H;
    if (st.simT >= f.flightTime) onLanded();
  } else if (st.mode === "landed") {
    if (now - landedAt > 1100) showResults();
  }
  // --- expression director (setup idle life + in-flight moods)
  if (st.mode === "setup") {
    const k = (now / 1000) % 7.5;
    setPoseIf(k < 0.14 || (k > 3.2 && k < 3.34) ? "blink" : k > 5.2 && k < 6.6 ? "cheeky" : "idle");
  } else if (st.mode === "flight") {
    const f = st.flight!, apexPast = st.simT > f.flightTime * 0.55;
    const ph = Math.floor(st.realT / 1.4) % 3;
    if (st.realT < 1.3) setPoseIf("fly");
    else if (apexPast && altKm < 150 && f.outcome === "landed") setPoseIf("fly");
    else setPoseIf(ph === 0 ? "cheekyfly" : ph === 1 ? "smug" : "fly");
  }
  // --- camera tween / pose
  if (tween) {
    const t = Math.min(1, (now - tween.t0) / tween.dur), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camPose = blendPose(tween.from, tween.to(), e);
    if (t >= 1) { const d = tween.done; tween = null; d?.(); }
  } else if (st.mode === "setup" || st.mode === "charge") {
    if (st.view === "globe" && free) {
      free.tgt.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 5));
      camPose = { pos: free.pos.clone(), tgt: free.tgt.clone(), up: free.up.clone() };
    } else camPose = st.view === "cow" ? cowViewPose() : globePose();
  }
  camera.position.copy(camPose.pos); camera.up.copy(camPose.up); camera.lookAt(camPose.tgt);
  // keep the subject centred in the part of the screen the bottom panel doesn't cover
  const wide = window.innerWidth >= 900, panelOn = st.mode === "setup";
  const wantY = panelOn && !wide ? $("panel").offsetHeight * 0.42 : 0;
  const wantX = panelOn && wide ? -($("panel").offsetWidth + 16) * 0.45 : 0;
  viewShift += (wantY - viewShift) * Math.min(1, dt * 6); viewShiftX += (wantX - viewShiftX) * Math.min(1, dt * 6);
  if (Math.abs(viewShift) > 0.5 || Math.abs(viewShiftX) > 0.5) camera.setViewOffset(window.innerWidth, window.innerHeight, viewShiftX, viewShift, window.innerWidth, window.innerHeight); else camera.clearViewOffset();
  if (shake) camera.position.add(new THREE.Vector3((Math.random() - .5) * shake, (Math.random() - .5) * shake, (Math.random() - .5) * shake));

  // --- environment by camera altitude
  const camAlt = camera.position.length() - RK;
  const bg = scene.background as THREE.Color;
  if (camAlt < 12) bg.copy(SKY_GROUND).lerp(SKY_MID, smooth(0.5, 12, camAlt)); else bg.copy(SKY_MID).lerp(SKY_SPACE, smooth(12, 70, camAlt));
  atmoMat.uniforms.uOpacity.value = smooth(30, 400, camAlt) * 0.9;
  (stars.material as THREE.PointsMaterial).opacity = smooth(25, 120, camAlt);
  stars.rotation.y = -OMEGA * (st.mode === "flight" || st.mode === "landed" || st.mode === "results" ? st.simT : 0);
  if (farm) farm.visible = camAlt < 600;
  if (landPatch) landPatch.visible = (st.mode === "flight" ? (st.simT > st.flight!.flightTime * 0.5 && altKm < 400) : st.mode !== "setup") && camAlt < 900;
  for (const p of props) p.visible = camAlt < 40;
  sign.visible = camAlt < 5;
  const showLabels = camAlt > 250;
  startLabel.visible = startDot.visible = ausLabel.visible = showLabels;
  // cow: never smaller than ~46 px on screen (cartoon readability), true size up close
  const dCam = camera.position.distanceTo(cow.getWorldPosition(new THREE.Vector3()));
  const pxWorld = 2 * Math.tan(camera.fov * Math.PI / 360) * dCam / renderer.domElement.clientHeight;
  const cs = Math.max(0.0034, pxWorld * (st.mode === "flight" ? 54 : 46));
  cow.scale.set(cs, cs, 1);
  // puffs
  for (let i = puffs.length - 1; i >= 0; i--) {
    const p = puffs[i], a = (now - p.t0) / 1000; if (p.t0 > 1e14) continue; if (a < 0) { p.s.visible = false; continue; }
    p.s.visible = true;
    const b = p.s.userData.base * (1 + a * (p.s.userData.grow ?? 1.6)); p.s.scale.set(b, b * p.s.userData.aspect, 1);
    (p.s.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - a / 2.4);
    if (a > 2.5 && st.mode !== "landed" && st.mode !== "results") { p.s.parent?.remove(p.s); puffs.splice(i, 1); }
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- boot
async function boot() {
  try { await (document as any).fonts?.load?.("700 20px Fredoka"); } catch { /* ignore */ }
  const poses: Pose[] = POSES;
  await Promise.all([
    ...poses.map((p) => tex("cow_" + p, cowSVG(p), 512, 512)),
    tex("puff", puffSVG(), 256, 180), tex("splash", splashSVG(), 256, 170), tex("barn", barnSVG(), 320, 280), tex("hay", haySVG(), 200, 140), tex("tuft", tuftSVG(), 120, 80),
    ...CITIES.map((c) => tex("sign_" + c.id, signSVG(c.signText), 400, 300)),
    tex("ger", gerSVG(), 320, 220), tex("sheep", sheepSVG(), 200, 160), tex("windmill", windmillSVG(), 240, 400), tex("tree", treeSVG(), 240, 300),
    tex("alps", alpsSVG(), 1200, 480), tex("vineyard", vineyardSVG(), 1200, 480), tex("city", citySVG(), 1200, 480),
    tex("car_a", carSVG("#F4A3B8"), 200, 112), tex("car_b", carSVG("#8FD3FF"), 200, 112), tex("car_c", carSVG("#FFE07A"), 200, 112),
    tex("friend_a", friendCowSVG("happy", "#8B5A3C"), 512, 512), tex("friend_b", friendCowSVG("cheeky", "#C77D4A"), 512, 512),
    ...["milkshake", "cheese-picnic", "croissant", "fondue", "bubble-tea", "wine"].map((k) => tex("food_" + k, foodSVG(k), 240, 240)),
  ]);
  cow = sprite(texCache.cow_idle, 0.0034, 1, 0.5, 0.19); cow.renderOrder = 8;
  startLabel = labelSprite("", PAL.pink); scene.add(startLabel);
  startDot = dotSprite(PAL.pink, 0.016); scene.add(startDot);
  ausLabel = labelSprite("AUSTRALIA", PAL.yellow); scene.add(ausLabel);
  load();
  onResize();
  chooseCity(st.city);
  tween = null; st.view = (st.history[st.city.id] ?? []).length ? "globe" : "cow"; $("viewBtn").textContent = st.view === "cow" ? "🌏 Globe" : "🐄 Cow";
  camPose = st.view === "cow" ? cowViewPose() : globePose();
  $("legend").style.display = "block";
  $("loading").remove();
  requestAnimationFrame(frame);
  (window as any).__game = { st, pick(id: string) { const c = CITIES.find((x) => x.id === id); if (c) chooseCity(c); }, setAim(a: number, e: number, p: number) { st.az = a; st.el = e; st.pw = p; updateAim(); } };
}
boot();
