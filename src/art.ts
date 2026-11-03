// Cow + prop art. Visual language taken from the MOO TO THE MOON mascot exploration
// (palette, 2.5–3px #3a2a30 outlines, head construction & expressions, fart puff).
// The cow body is NEW: an ordinary dairy cow, normal proportions, small udder.

export const PAL = {
  bg: "#1B1E4B", panel: "#262A66", text: "#F3EEFF", pink: "#F4A3B8", pink2: "#E58AA3", lav: "#C9C2EA",
  yellow: "#FFE07A", ink: "#3a2a30", spot: "#2B2228", cream: "#FFF8F2", muzzle: "#F7B9C8", horn: "#EED9A4",
  puff: "#D9CB95", puff2: "#E6DCB0", blush: "#FF8FAE",
};

// --- heads (from the mascot exploration file, unchanged geometry) ---
const HEAD_DEFS = `
<g id="hBase">
<path d="M-16,-14 C-26,-22 -28,-34 -22,-38 C-20,-30 -14,-24 -8,-20 Z" fill="${PAL.horn}" stroke="${PAL.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M16,-14 C26,-22 28,-34 22,-38 C20,-30 14,-24 8,-20 Z" fill="${PAL.horn}" stroke="${PAL.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="-27" cy="-4" rx="11" ry="5.5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="2.5" transform="rotate(18 -27 -4)"/>
<ellipse cx="27" cy="-4" rx="11" ry="5.5" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="2.5" transform="rotate(-18 27 -4)"/>
<ellipse cx="0" cy="0" rx="22" ry="22" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="3"/>
<path d="M4,-21 C14,-20 20,-10 16,-4 C10,0 2,-8 4,-21 Z" fill="${PAL.spot}"/>
<ellipse cx="0" cy="13" rx="20" ry="11" fill="${PAL.muzzle}" stroke="${PAL.ink}" stroke-width="3"/>
<ellipse cx="-7" cy="11" rx="2" ry="3" fill="${PAL.ink}"/>
<ellipse cx="7" cy="11" rx="2" ry="3" fill="${PAL.ink}"/>
</g>
<g id="hUnimp">
<use href="#hBase"/>
<path d="M-8,19 L8,19" stroke="${PAL.ink}" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="-9" cy="-5" r="8.5" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="10" cy="-5" r="8.5" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="-11" cy="-2" r="3" fill="${PAL.ink}"/>
<circle cx="12" cy="-2" r="3" fill="${PAL.ink}"/>
<path d="M-17.5,-4 A8.5,8.5 0 0 1 -0.5,-4 Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M1.5,-4 A8.5,8.5 0 0 1 18.5,-4 Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="2.5" stroke-linejoin="round"/>
</g>
<g id="hStartle">
<use href="#hBase"/>
<circle cx="-9" cy="-5" r="9.5" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="10" cy="-5" r="9.5" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="-9" cy="-5" r="1.8" fill="${PAL.ink}"/>
<circle cx="10" cy="-5" r="1.8" fill="${PAL.ink}"/>
<ellipse cx="0" cy="19" rx="3" ry="4" fill="${PAL.ink}"/>
</g>
<g id="hStrain">
<use href="#hBase"/>
<path d="M-16,-10 L-6,-5 L-16,0 M17,-10 L7,-5 L17,0" stroke="${PAL.ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="-16" cy="4" rx="5" ry="3.5" fill="${PAL.blush}"/>
<ellipse cx="16" cy="4" rx="5" ry="3.5" fill="${PAL.blush}"/>
<path d="M-9,19 q2.25,-3 4.5,0 t4.5,0 t4.5,0 t4.5,0" stroke="${PAL.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>
<g id="hHappy">
<use href="#hBase"/>
<path d="M-16,-3 q7,-9 14,0 M3,-3 q7,-9 14,0" stroke="${PAL.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="-16" cy="4" rx="5" ry="3.5" fill="${PAL.blush}"/>
<ellipse cx="16" cy="4" rx="5" ry="3.5" fill="${PAL.blush}"/>
<path d="M-7,18 q7,6 14,0" stroke="${PAL.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>
<g id="hDizzy">
<use href="#hBase"/>
<path d="M-15,-11 l12,12 M-3,-11 l-12,12 M4,-11 l12,12 M16,-11 l-12,12" stroke="${PAL.ink}" stroke-width="3" stroke-linecap="round"/>
<path d="M-8,19 q4,-4 8,0 t8,0" stroke="${PAL.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>
<g id="hBlink">
<use href="#hBase"/>
<path d="M-17,-4 q8,4 16,0 M2,-4 q8,4 16,0" stroke="${PAL.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M-8,19 L8,19" stroke="${PAL.ink}" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g id="hSmug">
<use href="#hBase"/>
<path d="M-20,-10 h17 q2,0 2,2 v4 q0,8 -9,8 q-10,0 -10,-9 z" fill="${PAL.spot}" stroke="${PAL.ink}" stroke-width="2"/>
<path d="M2,-10 h18 q1,0 1,2 q0,11 -10,11 q-9,0 -9,-8 v-3 q0,-2 0,-2 z" fill="${PAL.spot}" stroke="${PAL.ink}" stroke-width="2"/>
<path d="M-3,-8 h5" stroke="${PAL.spot}" stroke-width="3"/>
<path d="M-15,-7 l5,0 M7,-7 l6,0" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/>
<path d="M2,-19 q8,-5 15,0" stroke="${PAL.ink}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
<path d="M-8,17 q10,6 17,-4" stroke="${PAL.ink}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
</g>
<g id="hCheeky">
<use href="#hBase"/>
<path d="M-17,-9 L-6,-4 L-17,1" stroke="${PAL.ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="10" cy="-5" r="9" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="11" cy="-4" r="3.6" fill="${PAL.ink}"/><circle cx="12.3" cy="-5.4" r="1.2" fill="#fff"/>
<ellipse cx="-15" cy="5" rx="5" ry="3.5" fill="${PAL.blush}"/><ellipse cx="17" cy="5" rx="5" ry="3.5" fill="${PAL.blush}"/>
<path d="M-8,18 q8,4 16,0" stroke="${PAL.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M-1,19.5 q0,10 5,10 q5,0 5,-10 z" fill="${PAL.blush}" stroke="${PAL.ink}" stroke-width="2.3" stroke-linejoin="round"/>
<path d="M4,21 v5" stroke="${PAL.ink}" stroke-width="1.5" stroke-linecap="round"/>
</g>
<g id="hHuh">
<use href="#hBase"/>
<circle cx="-9" cy="-5" r="10" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="11" cy="-3" r="6" fill="#fff" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="-7" cy="-7" r="1.7" fill="${PAL.ink}"/>
<circle cx="10" cy="-2" r="1.5" fill="${PAL.ink}"/>
<path d="M-18,-19 l9,3 M5,-14 l10,-4" stroke="${PAL.ink}" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="1" cy="19" rx="2.6" ry="3.2" fill="${PAL.ink}"/>
<path d="M24,-16 c-3,4 -3,7 0,7 c3,0 3,-3 0,-7 z" fill="#8FD3FF" stroke="${PAL.ink}" stroke-width="1.8"/>
</g>
<g id="puff">
<circle cx="-50" cy="8" r="8" fill="${PAL.puff}" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="-36" cy="-4" r="11" fill="${PAL.puff}" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="-20" cy="7" r="13" fill="${PAL.puff}" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="-14" cy="-12" r="10" fill="${PAL.puff}" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="0" cy="0" r="16" fill="${PAL.puff2}" stroke="${PAL.ink}" stroke-width="2.5"/>
</g>`;

// --- NEW ordinary dairy cow body (side view, faces right). Origin: hooves on y=200. ---
function body(opts: { squash?: number; legs?: "stand" | "bent" | "push" | "splay"; inflate?: number }) {
  const sq = opts.squash ?? 1, inf = opts.inflate ?? 1;
  const legsY0 = 168;
  const leg = (x: number, a: string) => `<path d="M${x},${legsY0} ${a}" stroke="${PAL.ink}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M${x},${legsY0} ${a}" stroke="${PAL.cream}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const L = {
    stand: ["l-2,30", "l2,30", "l-2,30", "l2,30"],
    bent: ["l-10,12 l6,14", "l-8,12 l8,14", "l10,12 l-6,14", "l8,12 l-6,14"],
    push: ["l-6,34", "l-4,36", "l4,36", "l6,34"],
    splay: ["l-18,22", "l-8,28", "l10,26", "l20,20"],
  }[opts.legs ?? "stand"];
  const xs = [70, 92, 140, 162];
  const hooves = (opts.legs ?? "stand") === "stand"
    ? xs.map((x, i) => `<ellipse cx="${x + (i % 2 ? 2 : -2)}" cy="${legsY0 + 31}" rx="7" ry="4" fill="${PAL.spot}"/>`).join("")
    : "";
  return `
<g transform="translate(120,${legsY0}) scale(${inf},${sq * inf}) translate(-120,-${legsY0})">
${xs.map((x, i) => leg(x, L[i])).join("")}${hooves}
<path d="M46,112 C30,118 26,140 32,156" fill="none" stroke="${PAL.ink}" stroke-width="3" stroke-linecap="round"/>
<path d="M32,156 c-7,2 -8,12 0,13 c7,0 7,-10 0,-13 z" fill="${PAL.spot}"/>
<path d="M44,120 C44,96 70,86 118,86 C170,86 196,96 196,124 C196,152 178,170 120,170 C66,170 44,152 44,120 Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="3"/>
<path d="M66,98 c14,-6 30,0 28,14 c-2,16 -26,16 -32,4 c-3,-7 -1,-14 4,-18 z" fill="${PAL.spot}"/>
<path d="M126,118 c10,-10 30,-6 30,8 c0,14 -22,18 -30,8 c-4,-5 -4,-11 0,-16 z" fill="${PAL.spot}"/>
<path d="M164,90 c10,0 22,8 20,20 c-8,4 -20,0 -22,-10 z" fill="${PAL.spot}"/>
<path d="M60,138 c6,-6 16,-2 14,6 c-2,8 -14,6 -14,-6 z" fill="${PAL.spot}"/>
<path d="M98,166 C98,180 110,184 116,184 C124,184 134,180 132,166 Z" fill="${PAL.pink}" stroke="${PAL.ink}" stroke-width="2.5"/>
<path d="M106,182 l0,5 M114,184 l0,5 M122,182 l0,5" stroke="${PAL.pink2}" stroke-width="4" stroke-linecap="round"/>
<path d="M70,100 C80,92 96,90 108,90" stroke="#fff" stroke-opacity="0.7" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>`;
}

export type Pose = "idle" | "blink" | "cheeky" | "squat" | "strain" | "poot" | "fly" | "smug" | "cheekyfly" | "happy" | "dizzy" | "huh";
export const POSES: Pose[] = ["idle", "blink", "cheeky", "squat", "strain", "poot", "fly", "smug", "cheekyfly", "happy", "dizzy", "huh"];

export function cowSVG(pose: Pose): string {
  let inner = "";
  const head = (id: string, x = 194, y = 88, s = 1.4, rot = 0) => `<use href="#${id}" transform="translate(${x},${y}) rotate(${rot}) scale(${s})"/>`;
  const lines = `<path d="M10,96 l14,6 M6,130 h16 M12,166 l14,-8 M230,60 l-12,8 M234,100 h-14" stroke="${PAL.yellow}" stroke-width="3.5" stroke-linecap="round"/>`;
  switch (pose) {
    case "idle": inner = body({}) + head("hUnimp"); break;
    case "squat": inner = body({ squash: 0.84, legs: "bent" }) + head("hUnimp", 194, 108); break;
    case "strain": inner = lines + body({ squash: 0.86, legs: "bent", inflate: 1.06 }) + head("hStrain", 196, 104); break;
    case "poot": inner = `<use href="#puff" transform="translate(70,186) scale(1.15)"/>` + body({ legs: "push" }) + head("hUnimp", 194, 80); break;
    case "fly": inner = body({ legs: "splay" }) + head("hStartle", 196, 86, 1.4, 8); break;
    case "happy": inner = body({}) + head("hHappy"); break;
    case "blink": inner = body({}) + head("hBlink"); break;
    case "cheeky": inner = body({}) + head("hCheeky", 194, 88, 1.4, -8); break;
    case "smug": inner = body({ legs: "push" }) + head("hSmug", 194, 86, 1.4, -6) + `<path d="M150,40 l3,7 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z" fill="${PAL.yellow}" stroke="${PAL.ink}" stroke-width="2"/>`; break;
    case "cheekyfly": inner = body({ legs: "splay" }) + head("hCheeky", 196, 86, 1.4, 6); break;
    case "huh": inner = body({ legs: "bent" }) + head("hHuh", 194, 100, 1.4, 10) + `<text x="210" y="40" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="40" fill="${PAL.yellow}" stroke="${PAL.ink}" stroke-width="2.5" paint-order="stroke">?</text><text x="176" y="30" font-family="Arial, sans-serif" font-weight="900" font-size="26" fill="${PAL.yellow}" stroke="${PAL.ink}" stroke-width="2" paint-order="stroke">?</text>`; break;
    case "dizzy": inner = `<g transform="rotate(14 120 160)">${body({ legs: "splay" })}${head("hDizzy", 196, 92, 1.4, 20)}</g>
<path d="M150,30 l4,8 8,1 -6,6 2,8 -8,-4 -8,4 2,-8 -6,-6 8,-1z M190,44 l3,6 6,1 -4,4 1,6 -6,-3 -6,3 1,-6 -4,-4 6,-1z" fill="${PAL.yellow}" stroke="${PAL.ink}" stroke-width="2"/>`; break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 256 256" width="512" height="512"><defs>${HEAD_DEFS}</defs>${inner}</svg>`;
}

export function puffSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -40 100 70" width="256" height="180"><defs>${HEAD_DEFS}</defs><use href="#puff"/></svg>`;
}
export function splashSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="256" height="170">
<path d="M10,70 C20,40 30,30 36,50 C40,20 52,10 56,44 C62,6 76,10 74,46 C84,24 98,28 92,58 C102,46 112,52 110,70 Z" fill="#8FD3FF" stroke="${PAL.ink}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="24" cy="24" r="5" fill="#8FD3FF" stroke="${PAL.ink}" stroke-width="2.5"/><circle cx="98" cy="18" r="4" fill="#8FD3FF" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="64" cy="8" r="3.5" fill="#8FD3FF" stroke="${PAL.ink}" stroke-width="2.5"/></svg>`;
}
export function barnSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" width="320" height="280">
<path d="M14,60 L80,14 L146,60 L146,134 L14,134 Z" fill="#D9576B" stroke="${PAL.ink}" stroke-width="4" stroke-linejoin="round"/>
<path d="M4,66 L80,10 L156,66" fill="none" stroke="${PAL.cream}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4,66 L80,10 L156,66" fill="none" stroke="${PAL.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,-5)"/>
<rect x="56" y="78" width="48" height="56" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="3.5"/>
<path d="M56,78 L104,134 M104,78 L56,134" stroke="#D9576B" stroke-width="6"/><path d="M56,78 L104,134 M104,78 L56,134" stroke="${PAL.ink}" stroke-width="1.5"/>
<circle cx="80" cy="50" r="10" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="3"/></svg>`;
}
export function haySVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" width="200" height="140">
<rect x="6" y="14" width="88" height="52" rx="14" fill="#F2C95C" stroke="${PAL.ink}" stroke-width="3.5"/>
<path d="M30,16 v48 M70,16 v48" stroke="#C99A2E" stroke-width="5"/><path d="M18,30 l8,-4 M50,40 l10,-3 M78,28 l8,4" stroke="#C99A2E" stroke-width="3" stroke-linecap="round"/></svg>`;
}
export function signSVG(text: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="400" height="300">
<rect x="92" y="60" width="16" height="90" fill="#A86B3C" stroke="${PAL.ink}" stroke-width="3"/>
<path d="M10,14 H170 L192,40 L170,66 H10 Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="4" stroke-linejoin="round"/>
<text x="92" y="50" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="26" fill="${PAL.ink}">${text}</text></svg>`;
}
export function tuftSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="120" height="80">
<path d="M6,38 C10,20 14,14 18,8 C18,20 22,26 26,38 C28,22 32,10 38,4 C38,18 40,28 42,38 C46,26 50,20 56,16 C52,26 52,32 54,38 Z" fill="#5FB36B" stroke="${PAL.ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
}

export function svgToCanvas(svg: string, w: number, h: number): Promise<HTMLCanvasElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d")!.drawImage(img, 0, 0, w, h); res(c); };
    img.onerror = rej;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

// ---------------------------------------------------------------- World Tour props (shared style: 3px ink outlines, flat fills)
const O = `stroke="${PAL.ink}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (vb: string, w: number, h: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${body}</svg>`;
/** Same cow, other coat (friends in the welcome party). */
export function friendCowSVG(pose: Pose, coat: string): string { return cowSVG(pose).split(PAL.spot).join(coat); }
export function gerSVG(): string {
  return svg("0 0 160 110", 320, 220, `<path d="M10,104 V58 Q80,36 150,58 V104 Z" fill="#FFF8F2" ${O}/>
<path d="M4,60 Q80,0 156,60 Q80,40 4,60 Z" fill="#E9D7B8" ${O}/><path d="M66,18 h28 l-4,-10 h-20 z" fill="#D9576B" ${O}/>
<path d="M14,74 H146 M14,88 H146" stroke="#D9576B" stroke-width="5"/><path d="M64,104 V70 h32 v34" fill="#E58AA3" ${O}/>
<path d="M68,76 h24 M68,86 h24 M68,96 h24" stroke="#FFE07A" stroke-width="3"/>`);
}
export function sheepSVG(): string {
  return svg("0 0 100 80", 200, 160, `<path d="M26,58 v16 M40,60 v16 M62,60 v16 M76,58 v16" stroke="${PAL.ink}" stroke-width="7" stroke-linecap="round"/>
<path d="M18,40 c-8,-14 8,-26 18,-20 c4,-12 24,-12 28,0 c12,-6 26,6 18,20 c10,8 2,24 -10,22 c-6,8 -36,8 -42,0 c-14,2 -22,-14 -12,-22 z" fill="#FFFDF8" ${O}/>
<ellipse cx="84" cy="36" rx="11" ry="13" fill="${PAL.spot}" ${O}/><circle cx="87" cy="33" r="2.5" fill="#fff"/>`);
}
export function windmillSVG(): string {
  return svg("0 0 120 200", 240, 400, `<path d="M50,196 L58,70 h4 L70,196 M44,196 L60,70 L76,196 M52,150 h16 M48,176 h24 M55,110 h10" fill="none" ${O}/>
<g transform="translate(60,60)">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0,0 L-4,-40 L4,-40 Z" transform="rotate(${a})" fill="#FFF8F2" ${O}/>`).join("")}<circle r="7" fill="#D9576B" ${O}/></g>
<path d="M66,60 h40 l6,-8 v16 l-6,-8" fill="#C9C2EA" ${O}/>`);
}
export function treeSVG(): string {
  return svg("0 0 120 150", 240, 300, `<path d="M54,146 V90 h12 v56" fill="#A86B3C" ${O}/>
<path d="M60,8 c24,0 40,16 38,34 c16,8 16,34 -4,42 c-6,14 -28,16 -34,8 c-10,8 -32,4 -34,-12 c-18,-6 -18,-32 0,-38 c-2,-18 14,-34 34,-34 z" fill="#5FB36B" ${O}/>
<circle cx="40" cy="50" r="6" fill="#D9576B" ${O}/><circle cx="78" cy="40" r="6" fill="#D9576B" ${O}/><circle cx="70" cy="76" r="6" fill="#D9576B" ${O}/>`);
}
export function alpsSVG(): string {
  return svg("0 0 400 160", 1200, 480, `<path d="M0,160 L60,60 L100,100 L170,10 L230,90 L270,50 L330,110 L370,70 L400,100 V160 Z" fill="#8E9BD6" ${O}/>
<path d="M150,36 L170,10 L192,40 L180,34 L170,44 L160,34 Z M58,64 L60,60 L74,82 L64,76 Z M262,58 L270,50 L282,66 L272,62 Z" fill="#fff" ${O}/>
<path d="M0,160 L40,120 L90,140 L150,110 L220,140 L290,118 L350,140 L400,124 V160 Z" fill="#5FB36B" ${O}/>`);
}
export function vineyardSVG(): string {
  let rows = "";
  for (let i = 0; i < 6; i++) { const y = 70 + i * 16; rows += `<path d="M${10 + i * 6},${y} H${390 - i * 6}" stroke="#3F7D3A" stroke-width="${8 + i}" stroke-linecap="round"/>`; for (let x = 20 + i * 6; x < 390 - i * 6; x += 26) rows += `<circle cx="${x}" cy="${y - 2}" r="${3 + i * 0.4}" fill="#7A3B8F"/>`; }
  return svg("0 0 400 160", 1200, 480, `<path d="M0,160 V70 Q200,40 400,70 V160 Z" fill="#9BD07E" ${O}/>${rows}
<path d="M300,60 v-26 h40 v26 M296,36 l24,-16 l24,16" fill="#FFF8F2" ${O}/>`);
}
export function citySVG(): string {
  const b = [[0, 70, 50, "#C9C2EA"], [46, 40, 54, "#F4A3B8"], [96, 86, 44, "#8FD3FF"], [136, 30, 60, "#FFE07A"], [192, 64, 48, "#C9C2EA"], [236, 20, 56, "#F4A3B8"], [288, 56, 50, "#8FD3FF"], [334, 80, 66, "#FFE07A"]];
  let s = b.map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${160 - (y as number)}" fill="${c}" ${O}/>` + Array.from({ length: 6 }, (_, i) => `<rect x="${(x as number) + 8 + (i % 2) * ((w as number) / 2 - 2)}" y="${(y as number) + 10 + Math.floor(i / 2) * 22}" width="10" height="12" fill="#FFF8F2" stroke="${PAL.ink}" stroke-width="2"/>`).join("")).join("");
  s += `<rect x="0" y="140" width="400" height="20" fill="#5B5F7A"/><path d="M10,150 h30 M70,150 h30 M130,150 h30 M190,150 h30 M250,150 h30 M310,150 h30 M370,150 h20" stroke="#FFE07A" stroke-width="3"/>`;
  return svg("0 0 400 160", 1200, 480, s);
}
export function carSVG(color: string): string {
  return svg("0 0 100 56", 200, 112, `<path d="M6,40 v-14 q0,-6 8,-6 h12 l12,-12 h30 l12,12 h8 q8,0 8,8 v12 z" fill="${color}" ${O}/>
<path d="M42,12 h12 v10 h-22 z M60,12 h8 l10,10 h-18 z" fill="#8FD3FF" stroke="${PAL.ink}" stroke-width="2.5"/>
<circle cx="26" cy="42" r="9" fill="${PAL.spot}" ${O}/><circle cx="76" cy="42" r="9" fill="${PAL.spot}" ${O}/>
<path d="M70,0 l4,-0" /><text x="80" y="14" font-family="Arial" font-weight="900" font-size="14" fill="${PAL.ink}">!</text>`);
}
export function foodSVG(kind: string): string {
  switch (kind) {
    case "milkshake": return svg("0 0 80 120", 160, 240, `<path d="M58,4 L44,40" stroke="#D9576B" stroke-width="6" stroke-linecap="round"/><path d="M14,40 h52 l-8,76 h-36 z" fill="#F7B9C8" ${O}/>
<path d="M10,40 c0,-14 14,-20 20,-12 c4,-12 22,-12 24,0 c8,-6 18,2 16,12 z" fill="#FFF8F2" ${O}/><circle cx="40" cy="18" r="6" fill="#D9576B" ${O}/><path d="M24,60 h32 M26,80 h28" stroke="#fff" stroke-width="3" opacity=".7"/>`);
    case "cheese-picnic": return svg("0 0 140 90", 280, 180, `<path d="M4,70 L30,40 H136 L110,70 Z" fill="#fff" ${O}/>${Array.from({ length: 8 }, (_, i) => `<path d="M${30 + i * 13},40 l-${4 + i * 0},30 h7 l4,-30 z" fill="#D9576B" opacity=".75"/>`).join("")}
<path d="M48,58 L92,30 L106,52 Z" fill="${PAL.yellow}" ${O}/><path d="M48,58 L106,52 L106,64 L48,70 Z" fill="#F2C95C" ${O}/><circle cx="74" cy="50" r="4" fill="#F2C95C"/><circle cx="88" cy="58" r="3" fill="#E2B347"/>`);
    case "croissant": return svg("0 0 140 90", 280, 180, `<path d="M10,60 C20,20 70,10 100,30 C120,40 128,58 122,66 C108,56 92,52 70,56 C46,60 28,70 10,60 Z" fill="#E9A957" ${O}/>
<path d="M40,30 q8,14 2,30 M66,22 q8,18 2,34 M92,30 q6,14 0,26" stroke="${PAL.ink}" stroke-width="2.5" fill="none"/>
<path d="M78,86 L112,62 L124,80 Z" fill="${PAL.yellow}" ${O}/><circle cx="104" cy="76" r="3" fill="#E2B347"/>`);
    case "fondue": return svg("0 0 120 120", 240, 240, `<path d="M60,4 L54,52 M78,10 L64,50" stroke="#C9C2EA" stroke-width="4" stroke-linecap="round"/><circle cx="54" cy="54" r="5" fill="${PAL.yellow}" ${O}/>
<path d="M14,56 h92 c0,30 -16,44 -46,44 c-30,0 -46,-14 -46,-44 z" fill="#D9576B" ${O}/><path d="M18,58 c10,-8 74,-8 84,0" fill="${PAL.yellow}" ${O}/>
<path d="M36,100 l-8,16 M84,100 l8,16 M24,116 h72" stroke="${PAL.ink}" stroke-width="4" stroke-linecap="round"/><path d="M50,112 q4,-10 0,-14 q10,6 4,14 z" fill="#FFB37A"/>`);
    case "bubble-tea": return svg("0 0 80 120", 160, 240, `<path d="M50,0 L42,30" stroke="#D9576B" stroke-width="7" stroke-linecap="round"/><path d="M14,30 h52 l-8,84 h-36 z" fill="#E9C9A0" ${O}/>
<path d="M12,30 h56" stroke="${PAL.ink}" stroke-width="5" stroke-linecap="round"/>${[[28, 100], [40, 104], [52, 100], [34, 92], [46, 92], [30, 82], [50, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${PAL.spot}"/>`).join("")}<path d="M22,46 v20" stroke="#fff" stroke-width="3" opacity=".7"/>`);
    case "wine": return svg("0 0 80 120", 160, 240, `<path d="M16,8 h48 c0,34 -8,48 -24,48 c-16,0 -24,-14 -24,-48 z" fill="#fff" fill-opacity=".6" ${O}/><path d="M18,26 h44 c-2,18 -10,28 -22,28 c-12,0 -20,-10 -22,-28 z" fill="#8E2A4C"/>
<path d="M40,56 v44 M22,112 q18,-12 36,0 z" fill="#fff" ${O}/>`);
  }
  return "";
}

// ---------------------------------------------------------------- Destinations kit (cartoon endings)
export function destFoodSVG(kind: string): string {
  switch (kind) {
    case "cheese": return foodSVG("cheese-picnic");
    case "milkshake": return foodSVG("milkshake");
    case "croissant": return foodSVG("croissant");
    case "matcha": return svg("0 0 80 120", 160, 240, `<path d="M22,58 L40,116 L58,58 Z" fill="#E9A957" ${O}/><path d="M28,70 l20,20 M36,62 l16,16 M26,82 l12,12" stroke="#C98A3E" stroke-width="2.5"/>
<path d="M18,58 c-6,-16 6,-24 14,-20 c-2,-14 18,-22 26,-8 c10,-2 16,10 8,18 c6,4 4,12 -4,12 z" fill="#9CCB6B" ${O}/><path d="M34,30 c2,-10 10,-14 12,-24 c4,8 2,18 -6,24" fill="#9CCB6B" ${O}/><path d="M30,48 q8,-6 18,-2" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/>`);
    case "corn": return svg("0 0 100 100", 200, 200, `<path d="M60,96 L46,62" stroke="#A86B3C" stroke-width="7" stroke-linecap="round"/>
<path d="M30,56 C20,36 30,8 48,6 C66,8 72,34 62,56 C54,70 38,70 30,56 Z" fill="#F2C95C" ${O}/>${[[38, 22], [50, 18], [44, 32], [56, 30], [38, 42], [50, 44], [44, 54], [58, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#C98A3E" opacity=".7"/>`).join("")}
<path d="M40,30 l14,-6 M36,46 l20,-4" stroke="#7A4A2A" stroke-width="3" opacity=".6"/><path d="M30,56 C12,52 6,34 14,22 C22,40 30,46 38,60 Z M62,56 C80,50 86,32 78,22 C70,40 62,48 54,60 Z" fill="#7CC56F" ${O}/>`);
    case "pancakes": return svg("0 0 120 100", 240, 200, `<ellipse cx="60" cy="88" rx="54" ry="9" fill="#fff" ${O}/>
${[74, 62, 50, 38].map((y) => `<path d="M14,${y} q46,-10 92,0 v8 q-46,10 -92,0 z" fill="#E9A957" ${O}/>`).join("")}
<path d="M16,36 q44,-12 88,0 q-8,10 -10,26 q-4,-14 -12,-14 q-6,22 -12,0 q-10,-6 -20,0 q-4,14 -10,-2 q-10,-4 -24,-10 z" fill="#B5652A" stroke="${PAL.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="50" y="22" width="18" height="10" rx="2" fill="#FFE07A" ${O}/>`);
    case "grape": return svg("0 0 80 120", 160, 240, `<path d="M50,0 L42,30" stroke="#F4A3B8" stroke-width="6" stroke-linecap="round"/><path d="M16,30 h48 l-6,82 h-36 z" fill="#B57BD6" fill-opacity=".85" ${O}/>
<path d="M14,30 h52" stroke="${PAL.ink}" stroke-width="4" stroke-linecap="round"/>${[[30, 60], [42, 66], [36, 78], [48, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#7A3B8F" opacity=".7"/>`).join("")}<path d="M24,44 v24" stroke="#fff" stroke-width="3" opacity=".6"/>`);
  }
  return "";
}
export function backdropSVG(kind: string): string {
  switch (kind) {
    case "hills": return svg("0 0 400 160", 1200, 480, `<path d="M0,160 V96 Q70,48 150,90 Q220,40 300,84 Q350,60 400,80 V160 Z" fill="#7CC56F" ${O}/><path d="M0,160 V122 Q90,92 190,118 Q290,96 400,120 V160 Z" fill="#5FB36B" ${O}/>
<path d="M250,84 h28 v-14 l-14,-10 l-14,10 z" fill="#D9576B" ${O}/>${[[60, 104], [84, 110], [120, 100]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="#fff" stroke="${PAL.ink}" stroke-width="2"/>`).join("")}`);
    case "mountain": return svg("0 0 400 160", 1200, 480, `<path d="M70,160 L200,30 L330,160 Z" fill="#8E9BD6" ${O}/><path d="M168,62 L200,30 L232,62 L220,56 L210,66 L200,56 L190,66 L180,56 Z" fill="#fff" ${O}/>
<path d="M0,160 V124 Q100,104 200,126 Q300,104 400,122 V160 Z" fill="#7CC56F" ${O}/>${[[40, 120], [340, 118], [372, 124]].map(([x, y]) => `<path d="M${x},${y + 30} v-18" stroke="#A86B3C" stroke-width="5"/><circle cx="${x}" cy="${y}" r="16" fill="#F7B9C8" ${O}/>`).join("")}`);
    case "vineyard": return vineyardSVG().replace('<path d="M300,60 v-26 h40 v26 M296,36 l24,-16 l24,16" fill="#FFF8F2" stroke="#3a2a30" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>', "");
    case "palms": {
      const palm = (x: number, h: number) => `<path d="M${x},160 q${-8},-${h / 2} ${4},-${h}" stroke="#A86B3C" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        [-70, -35, 0, 35, 70, 110, -110].map((a) => `<path d="M${x + 4},${160 - h} q${Math.sin(a * Math.PI / 180) * 30},${-Math.cos(a * Math.PI / 180) * 10 - 6} ${Math.sin(a * Math.PI / 180) * 44},${Math.abs(Math.sin(a * Math.PI / 180)) * 18 - Math.cos(a * Math.PI / 180) * 26}" stroke="#3F9E52" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("");
      const lights = Array.from({ length: 11 }, (_, i) => `<circle cx="${30 + i * 34}" cy="${46 + Math.sin(i * 0.9) * 8}" r="6" fill="${["#FFE07A", "#F4A3B8", "#8FD3FF", "#B9F18C"][i % 4]}" ${O}/>`).join("");
      return svg("0 0 400 160", 1200, 480, `<path d="M0,160 V130 Q200,112 400,130 V160 Z" fill="#E9C98A" ${O}/>${palm(40, 120)}${palm(360, 130)}${palm(300, 90)}
<path d="M20,40 Q200,70 380,40" stroke="${PAL.ink}" stroke-width="2.5" fill="none"/>${lights}<text x="150" y="105" font-family="Arial" font-weight="900" font-size="34" fill="#FFE07A" stroke="${PAL.ink}" stroke-width="2" paint-order="stroke">♪ ♫ ♪</text>`);
    }
    case "maple": {
      const tree = (x: number, s: number, c: string) => `<path d="M${x},160 v-${40 * s}" stroke="#7A4A2A" stroke-width="${8 * s}"/><circle cx="${x}" cy="${160 - 62 * s}" r="${34 * s}" fill="${c}" ${O}/><circle cx="${x - 22 * s}" cy="${160 - 48 * s}" r="${22 * s}" fill="${c}" ${O}/><circle cx="${x + 24 * s}" cy="${160 - 46 * s}" r="${22 * s}" fill="${c}" ${O}/>`;
      const leaf = (x: number, y: number, r: number) => `<path transform="translate(${x},${y}) rotate(${r}) scale(.5)" d="M0,-20 l5,10 10,-4 -3,11 10,3 -12,8 2,8 -12,-4 0,10 h-0 l0,-10 -12,4 2,-8 -12,-8 10,-3 -3,-11 10,4 z" fill="#E0503A" stroke="${PAL.ink}" stroke-width="3"/>`;
      return svg("0 0 400 160", 1200, 480, `<path d="M0,160 V128 Q200,110 400,128 V160 Z" fill="#8FC46B" ${O}/>${tree(60, 1.2, "#E0503A")}${tree(150, 0.9, "#F08A3A")}${tree(270, 1.1, "#E0503A")}${tree(350, 0.8, "#F2B33D")}${leaf(110, 40, 20)}${leaf(210, 26, -30)}${leaf(320, 54, 50)}${leaf(30, 70, -10)}`);
    }
    case "barn": return svg("0 0 400 160", 1200, 480, `<path d="M0,160 V120 Q200,100 400,120 V160 Z" fill="#7CC56F" ${O}/>`) ;
  }
  return "";
}
