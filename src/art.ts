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
