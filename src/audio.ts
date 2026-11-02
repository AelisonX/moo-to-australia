// All sound is synthesised live with Web Audio: no audio files, nothing licensed.
// Starts on the first tap (browsers block audio before a user gesture).
// Note: on iPhone the ring/silent switch mutes Web Audio.

let ctx: AudioContext | null = null;
let master: GainNode, musicBus: GainNode, sfxBus: GainNode;
let muted = false;
try { muted = localStorage.getItem("moo2aus.muted") === "1"; } catch { /* ignore */ }

function ensure(): AudioContext | null {
  if (ctx) { if (ctx.state === "suspended") ctx.resume().catch(() => {}); return ctx; }
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC() as AudioContext;
  master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
  musicBus = ctx.createGain(); musicBus.gain.value = 0.22; musicBus.connect(comp);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.85; sfxBus.connect(comp);
  return ctx;
}
let noiseBuf: AudioBuffer | null = null;
function noise(): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const c = ctx!, b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return (noiseBuf = b);
}
function env(g: GainNode, t: number, a: number, peak: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function tone(type: OscillatorType, f: number, t: number, dur: number, peak: number, bus: AudioNode, f2?: number) {
  const c = ctx!, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  env(g, t, 0.008, peak, dur); o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
}

// ---------------------------------------------------------------- music: cute travel loop
// C major, bouncy marimba + soft bass + shaker. 16 bars, ~112 bpm.
const BPM = 112, STEP = 60 / BPM / 2; // eighth notes
const N = (s: string) => { const m: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }; const o = +s.slice(-1); return 440 * Math.pow(2, (m[s[0]] + (s.includes("#") ? 1 : 0) + (o - 4) * 12 - 9) / 12); };
const CHORDS = ["C", "A", "F", "G", "C", "A", "D", "G", "E", "A", "F", "C", "F", "G", "C", "G"];
const ROOT: Record<string, string> = { C: "C3", A: "A2", F: "F2", G: "G2", D: "D3", E: "E3" };
const TRIAD: Record<string, string[]> = { C: ["C5", "E5", "G5"], A: ["A4", "C5", "E5"], F: ["F4", "A4", "C5"], G: ["G4", "B4", "D5"], D: ["D5", "F#5", "A5"], E: ["E5", "G#5", "B5"] };
// melody: per bar, 8 eighth-note slots, index into chord tones (-1 = rest, 3 = octave up root)
const RHYTHM = [[0, -1, 1, 2, -1, 1, 0, -1], [2, -1, 1, -1, 0, 1, 2, -1], [1, 2, 3, -1, 2, -1, 1, -1], [0, -1, -1, 2, 1, 0, -1, -1]];
let musicOn = false, nextT = 0, step = 0, timer: number | undefined;
function marimba(f: number, t: number, peak: number) {
  tone("sine", f, t, 0.35, peak, musicBus); tone("triangle", f * 4, t, 0.06, peak * 0.25, musicBus);
}
function scheduleMusic() {
  if (!ctx || !musicOn) return;
  while (nextT < ctx.currentTime + 0.25) {
    const bar = Math.floor(step / 8) % 16, s = step % 8, ch = CHORDS[bar];
    const r = RHYTHM[bar % 4][s];
    if (r >= 0) { const tones = TRIAD[ch]; const f = r === 3 ? N(tones[0]) * 2 : N(tones[r]); marimba(f, nextT + (s % 2 ? 0.012 : 0), 0.5); }
    if (s === 0 || s === 4) tone("triangle", N(ROOT[ch]), nextT, 0.32, 0.55, musicBus);
    if (s === 6) tone("triangle", N(ROOT[ch]) * 1.5, nextT, 0.18, 0.35, musicBus);
    if (s % 2 === 1) { // shaker
      const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noise(); hp.type = "highpass"; hp.frequency.value = 7000; env(g, nextT, 0.003, 0.12, 0.05);
      src.connect(hp); hp.connect(g); g.connect(musicBus); src.start(nextT, Math.random()); src.stop(nextT + 0.07);
    }
    nextT += STEP; step++;
  }
}
export function startMusic() {
  const c = ensure(); if (!c || musicOn) return;
  musicOn = true; nextT = c.currentTime + 0.1; step = 0;
  timer = window.setInterval(scheduleMusic, 60);
}
/** Lower music under big moments. */
export function duck(amount: number, secs: number) {
  if (!ctx) return; const t = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(t); musicBus.gain.setTargetAtTime(0.22 * amount, t, 0.05); musicBus.gain.setTargetAtTime(0.22, t + secs, 0.4);
}

// ---------------------------------------------------------------- sound effects
/** Squeaky strain while the cow builds pressure. */
export function strain(dur = 0.7) {
  const c = ensure(); if (!c) return; const t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
  o.type = "square"; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(820, t + dur);
  lfo.frequency.value = 14; lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency);
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
  env(g, t, 0.05, 0.12, dur); o.connect(lp); lp.connect(g); g.connect(sfxBus);
  o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
}
/** The fart. Longer and deeper with more power (km/s). Flappy buzz + breathy noise + a little "pft". */
export function fart(powerKmS: number) {
  const c = ensure(); if (!c) return; const t = c.currentTime;
  duck(0.35, 1.4);
  const k = Math.min(1, Math.max(0, (powerKmS - 0.5) / 11));
  const dur = 0.45 + k * 0.75, f0 = 150 - k * 55, f1 = 55 - k * 15;
  // buzzy "lips": sawtooth with a fast wobble on pitch and amplitude
  const o = c.createOscillator(), g = c.createGain(), am = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), lfo2 = c.createOscillator(), lg2 = c.createGain();
  o.type = "sawtooth"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  lfo.type = "square"; lfo.frequency.setValueAtTime(34, t); lfo.frequency.linearRampToValueAtTime(22, t + dur); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain); am.gain.value = 0.5;
  lfo2.frequency.value = 9; lg2.gain.value = f0 * 0.12; lfo2.connect(lg2); lg2.connect(o.frequency);
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(260, t + dur); lp.Q.value = 6;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.02); g.gain.setValueAtTime(0.85, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(am); am.connect(lp); lp.connect(g); g.connect(sfxBus);
  // breathy rush
  const n = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain();
  n.buffer = noise(); bp.type = "bandpass"; bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(180, t + dur); bp.Q.value = 1.2;
  env(ng, t, 0.02, 0.35 + k * 0.3, dur + 0.15); n.connect(bp); bp.connect(ng); ng.connect(sfxBus);
  for (const x of [o, lfo, lfo2]) { x.start(t); x.stop(t + dur + 0.1); }
  n.start(t, Math.random()); n.stop(t + dur + 0.2);
  // the comedic "pft!" at the end
  tone("square", 520, t + dur + 0.02, 0.07, 0.18, sfxBus, 260);
  // whoosh up
  const w = c.createBufferSource(), wf = c.createBiquadFilter(), wg = c.createGain();
  w.buffer = noise(); wf.type = "bandpass"; wf.Q.value = 3; wf.frequency.setValueAtTime(400, t + 0.1); wf.frequency.exponentialRampToValueAtTime(3200, t + 1.4);
  env(wg, t + 0.1, 0.3, 0.18, 1.4); w.connect(wf); wf.connect(wg); wg.connect(sfxBus); w.start(t + 0.1, Math.random()); w.stop(t + 1.6);
}
/** Springy cartoon landing: boing-boing-boing, each bounce smaller. */
export function boing() {
  const c = ensure(); if (!c) return; const t0 = c.currentTime;
  tone("sine", 90, t0, 0.18, 0.7, sfxBus, 45); // thump
  [0, 0.26, 0.44, 0.56].forEach((dt, i) => {
    const t = t0 + dt, a = 0.55 * Math.pow(0.55, i), d = 0.32 - i * 0.05;
    const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(260 - i * 20, t); o.frequency.exponentialRampToValueAtTime(620 - i * 60, t + d * 0.35); o.frequency.exponentialRampToValueAtTime(330 - i * 30, t + d);
    lfo.frequency.value = 18; lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency);
    env(g, t, 0.006, a, d); o.connect(g); g.connect(sfxBus); o.start(t); lfo.start(t); o.stop(t + d + 0.05); lfo.stop(t + d + 0.05);
  });
}
export function splash() {
  const c = ensure(); if (!c) return; const t = c.currentTime;
  const n = c.createBufferSource(), lp = c.createBiquadFilter(), g = c.createGain();
  n.buffer = noise(); lp.type = "lowpass"; lp.frequency.setValueAtTime(5000, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.8);
  env(g, t, 0.01, 0.8, 0.9); n.connect(lp); lp.connect(g); g.connect(sfxBus); n.start(t, Math.random()); n.stop(t + 1);
  for (let i = 0; i < 5; i++) tone("sine", 700 + Math.random() * 900, t + 0.15 + i * 0.09, 0.08, 0.12, sfxBus, 1400 + Math.random() * 600); // bloops
}
export function whistleAway() {
  const c = ensure(); if (!c) return; const t = c.currentTime;
  tone("sine", 600, t, 1.2, 0.3, sfxBus, 2400);
}
/** Little victory jingle. */
export function jingle() {
  const c = ensure(); if (!c) return; const t = c.currentTime + 0.05; duck(0.2, 1.6);
  ["C5", "E5", "G5", "C6"].forEach((n, i) => marimba(N(n), t + i * 0.11, 0.7));
  [N("E5"), N("G5"), N("C6")].forEach((f) => tone("triangle", f, t + 0.5, 0.7, 0.25, sfxBus));
}
/** Sad trombone, kept short. */
export function wahwah() {
  const c = ensure(); if (!c) return; const t = c.currentTime + 0.05; duck(0.3, 1.8);
  ["G3", "F#3", "F3", "E3"].forEach((n, i) => {
    const d = i === 3 ? 0.8 : 0.3, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(N(n), t + i * 0.32); if (i === 3) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6; lg.gain.value = 6; l.connect(lg); lg.connect(o.frequency); l.start(t + i * 0.32); l.stop(t + i * 0.32 + d); }
    lp.type = "lowpass"; lp.frequency.value = 900; env(g, t + i * 0.32, 0.04, 0.22, d); o.connect(lp); lp.connect(g); g.connect(sfxBus); o.start(t + i * 0.32); o.stop(t + i * 0.32 + d + 0.05);
  });
}
export function blip() { const c = ensure(); if (!c) return; tone("sine", 880, c.currentTime, 0.06, 0.15, sfxBus, 1320); }

export function isMuted() { return muted; }
export function setMuted(m: boolean) {
  muted = m; try { localStorage.setItem("moo2aus.muted", m ? "1" : "0"); } catch { /* ignore */ }
  if (ctx) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05);
}
/** Call on any user gesture: unlocks audio (iOS) and starts the music. */
export function unlock() { if (ensure()) startMusic(); }
