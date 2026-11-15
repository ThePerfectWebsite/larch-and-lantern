// Generates the original SVG illustrations in public/img (cottages and local scenes),
// plus the favicon, app icons and Open Graph images (PNG via rsvg-convert if available).
// Run: node tools/art.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public", "img");
fs.mkdirSync(IMG, { recursive: true });

const W = 1200, H = 800;
let seed = 1;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const svg = (body, defs = "", w = W, h = H) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;

const C = { ink: "#1f2a22", forest: "#2f5d46", forest2: "#244a37", moss: "#5f7f69", sage: "#9cb8a3", linen: "#f5f1e8", linen2: "#ece5d6", stone: "#cdbb9b", stone2: "#b8a483", oak: "#8a6a48", oakD: "#5e4630", amber: "#d9993b", glow: "#ffcf7a", brick: "#a5563f", brickD: "#87442f", copper: "#b8733f", cream: "#fbf6ec" };

const defsCommon = `
<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34524b"/><stop offset=".55" stop-color="#a7b5a0"/><stop offset="1" stop-color="#efd8ab"/></linearGradient>
<linearGradient id="day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cfd2"/><stop offset=".7" stop-color="#e9e3cf"/><stop offset="1" stop-color="#f4e7c6"/></linearGradient>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14231f"/><stop offset=".7" stop-color="#2c4a44"/><stop offset="1" stop-color="#55705f"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd48c" stop-opacity=".9"/><stop offset=".4" stop-color="#d9993b" stop-opacity=".35"/><stop offset="1" stop-color="#d9993b" stop-opacity="0"/></radialGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe0" stop-opacity="0"/><stop offset=".5" stop-color="#f6efe0" stop-opacity=".7"/><stop offset="1" stop-color="#f6efe0" stop-opacity="0"/></linearGradient>
<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a07b55"/><stop offset="1" stop-color="#7d5d3e"/></linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb9bd"/><stop offset="1" stop-color="#6f8f8f"/></linearGradient>`;

// ---------- primitives ----------
const pine = (x, y, h, col) => `<path d="M${x} ${y}l${h * 0.16} -${h * 0.45} -${h * 0.07} 0 ${h * 0.12} -${h * 0.3} -${h * 0.06} 0 ${-h * 0.15 + h * 0.15} -${h * 0.25} ${-h * 0.15} ${h * 0.25} -${h * 0.06} 0 ${h * 0.12} ${h * 0.3} -${h * 0.07} 0z" fill="${col}"/>`;
const pineSimple = (x, y, h, col) => `<path d="M${(x - h * 0.17).toFixed(0)} ${y}L${x} ${(y - h).toFixed(0)}L${(x + h * 0.17).toFixed(0)} ${y}z" fill="${col}"/>`;
const oakTree = (x, y, r, col, trunk = C.oakD) => `<g><path d="M${x - r * 0.1} ${y}l${r * 0.04} -${r * 0.9} ${r * 0.12} 0 ${r * 0.04} ${r * 0.9}z" fill="${trunk}"/><circle cx="${x}" cy="${y - r * 1.15}" r="${r * 0.7}" fill="${col}"/><circle cx="${x - r * 0.55}" cy="${y - r * 0.85}" r="${r * 0.5}" fill="${col}"/><circle cx="${x + r * 0.55}" cy="${y - r * 0.9}" r="${r * 0.55}" fill="${col}"/></g>`;
const treeline = (y, n, h, col, kind = "mix", s = 3) => {
  seed = s; let out = "";
  for (let i = 0; i < n; i++) {
    const x = (i / n) * (W + 100) - 50 + rnd() * 40, hh = h * (0.7 + rnd() * 0.6);
    out += kind === "pine" || (kind === "mix" && rnd() > 0.5) ? pineSimple(x, y, hh, col) : oakTree(x, y, hh * 0.45, col, col);
  }
  return out;
};
const mistBand = (y, h, o = 1) => `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#mist)" opacity="${o}"/>`;
const windowLit = (x, y, w, h, frame = C.stone) => `<g><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w * 1.4}" fill="url(#glow)" opacity=".55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.glow}"/><path d="M${x} ${y + h / 2}h${w}M${x + w / 2} ${y}v${h}" stroke="${frame}" stroke-width="5"/></g>`;
const lantern = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="20" r="70" fill="url(#glow)"/><path d="M0-22v14" stroke="${C.ink}" stroke-width="4"/><path d="M-16-8h32l-5-10h-22z" fill="${C.ink}"/><rect x="-14" y="-8" width="28" height="44" rx="5" fill="#ffe3a8" stroke="${C.ink}" stroke-width="4"/><path d="M0 4c3 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 2z" fill="#e8962e"/><path d="M-18 36h36v6a3 3 0 0 1-3 3h-30a3 3 0 0 1-3-3z" fill="${C.ink}"/></g>`;
const stars = (n, s = 9) => { seed = s; let o = ""; for (let i = 0; i < n; i++) o += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * 320).toFixed(0)}" r="${(rnd() * 1.8 + 0.6).toFixed(1)}" fill="#fff8e6" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`; return o; };
const grass = (y, col = "#6d8a64") => `<path d="M0 ${y}C300 ${y - 20} 600 ${y + 10} 900 ${y - 10}S1150 ${y} 1200 ${y - 8}V800H0z" fill="${col}"/>`;

// Interior pieces
const room = (wall, floorY = 600, beams = false) => `<rect width="${W}" height="${H}" fill="${wall}"/>${beams ? `<path d="M0 0L600 -40 1200 0V70L600 30 0 70z" fill="${C.oakD}"/><g fill="${C.oak}"><rect x="140" y="0" width="34" height="${floorY}" opacity=".0"/></g><path d="M0 90L600 50 1200 90" stroke="${C.oak}" stroke-width="26" fill="none"/><path d="M300 0v80M900 0v80" stroke="${C.oakD}" stroke-width="22"/>` : ""}<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="url(#floorG)"/><path d="M0 ${floorY}h${W}" stroke="#5e4630" stroke-width="6"/>${[1, 2, 3, 4, 5].map((i) => `<path d="M0 ${floorY + i * 40}h${W}" stroke="#6e5236" stroke-width="2" opacity=".5"/>`).join("")}`;
const windowView = (x, y, w, h, sky = "url(#day)") => `<g><rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" rx="6" fill="${C.cream}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${sky}"/><g clip-path="url(#wclip${x})">${(() => { let o = ""; seed = x; for (let i = 0; i < 7; i++) { const tx = x + (i / 6) * w + rnd() * 20 - 10, th = h * (0.45 + rnd() * 0.35); o += rnd() > 0.5 ? pineSimple(tx, y + h, th, i % 2 ? C.moss : "#76937c") : oakTree(tx, y + h, th * 0.4, i % 2 ? C.moss : "#76937c"); } return o; })()}<rect x="${x}" y="${y + h * 0.7}" width="${w}" height="${h * 0.3}" fill="#88a279"/></g><clipPath id="wclip${x}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="${C.cream}" stroke-width="10"/><rect x="${x - 24}" y="${y + h + 10}" width="${w + 48}" height="16" rx="4" fill="${C.cream}"/></g>`;
const logBurner = (x, y) => `<g><circle cx="${x}" cy="${y - 60}" r="190" fill="url(#glow)" opacity=".8"/><rect x="${x - 120}" y="${y - 250}" width="240" height="250" fill="${C.stone2}"/><rect x="${x - 120}" y="${y - 260}" width="240" height="22" fill="${C.oakD}"/><rect x="${x - 18}" y="${y - 250}" width="36" height="110" fill="#2a2a28"/><rect x="${x - 70}" y="${y - 140}" width="140" height="120" rx="10" fill="#2a2a28"/><rect x="${x - 50}" y="${y - 120}" width="100" height="74" rx="6" fill="#3b2a1e"/><path d="M${x - 30} ${y - 50}c6-30 20-34 18-56 18 16 20 28 22 40 6-10 12-16 12-26 12 16 10 32 8 42z" fill="#f2a33a"/><path d="M${x - 12} ${y - 50}c4-16 12-18 12-30 10 10 10 18 10 30z" fill="#ffd77a"/><rect x="${x - 90}" y="${y - 20}" width="180" height="20" fill="${C.stone}"/><g fill="${C.oak}"><rect x="${x + 140}" y="${y - 70}" width="70" height="20" rx="10"/><rect x="${x + 150}" y="${y - 50}" width="70" height="20" rx="10"/><rect x="${x + 130}" y="${y - 30}" width="70" height="20" rx="10"/></g></g>`;
const sofa = (x, y, col = C.forest) => `<g><rect x="${x}" y="${y - 150}" width="380" height="110" rx="30" fill="${col}"/><rect x="${x - 20}" y="${y - 90}" width="60" height="90" rx="22" fill="${col}"/><rect x="${x + 340}" y="${y - 90}" width="60" height="90" rx="22" fill="${col}"/><rect x="${x + 20}" y="${y - 70}" width="340" height="60" rx="14" fill="${col}" opacity=".85"/><rect x="${x + 40}" y="${y - 140}" width="90" height="70" rx="16" fill="${C.amber}" opacity=".9"/><rect x="${x + 250}" y="${y - 138}" width="90" height="68" rx="16" fill="${C.linen2}"/><rect x="${x}" y="${y - 10}" width="12" height="16" fill="${C.oakD}"/><rect x="${x + 368}" y="${y - 10}" width="12" height="16" fill="${C.oakD}"/></g>`;
const rug = (x, y, w, col = "#c98e54") => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.16}" fill="${col}" opacity=".85"/><ellipse cx="${x}" cy="${y}" rx="${w * 0.8}" ry="${w * 0.12}" fill="none" stroke="${C.cream}" stroke-width="4" opacity=".6"/>`;
const lamp = (x, y, h = 240) => `<g><circle cx="${x}" cy="${y - h}" r="120" fill="url(#glow)" opacity=".75"/><path d="M${x} ${y}v-${h}" stroke="${C.ink}" stroke-width="6"/><path d="M${x - 50} ${y - h + 20}h100l-25-70h-50z" fill="#f2dfb4"/><ellipse cx="${x}" cy="${y}" rx="40" ry="8" fill="${C.ink}"/></g>`;
const bed = (x, y, w = 480, linen = "#fbf6ec", throwCol = C.forest) => `<g><rect x="${x}" y="${y - 260}" width="${w}" height="170" rx="16" fill="${C.oak}"/><rect x="${x + 20}" y="${y - 240}" width="${w - 40}" height="130" rx="12" fill="#9c7a55"/><rect x="${x - 10}" y="${y - 120}" width="${w + 20}" height="100" rx="18" fill="${linen}"/><rect x="${x + 30}" y="${y - 160}" width="${w / 2 - 50}" height="60" rx="20" fill="#fff"/><rect x="${x + w / 2 + 20}" y="${y - 160}" width="${w / 2 - 50}" height="60" rx="20" fill="#fff"/><rect x="${x - 10}" y="${y - 70}" width="${w + 20}" height="50" rx="12" fill="${throwCol}"/><rect x="${x}" y="${y - 20}" width="14" height="20" fill="${C.oakD}"/><rect x="${x + w - 14}" y="${y - 20}" width="14" height="20" fill="${C.oakD}"/></g>`;
const sideTable = (x, y) => `<g><rect x="${x}" y="${y - 110}" width="90" height="110" rx="6" fill="${C.oak}"/><rect x="${x + 10}" y="${y - 80}" width="70" height="8" fill="${C.oakD}"/>${lamp(x + 45, y - 110, 70).replace(/r="120"/, 'r="90"')}</g>`;
const plant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0h60l-8-60h-44z" fill="${C.brick}"/><path d="M0-60c-10-40-40-60-60-60 10 30 30 50 60 60zM0-60c10-50 30-70 60-80-5 40-30 70-60 80zM0-60c0-50 5-80 0-110-10 40-10 80 0 110z" fill="${C.moss}"/></g>`;
const dog = (x, y) => `<g><ellipse cx="${x}" cy="${y}" rx="110" ry="18" fill="#000" opacity=".12"/><ellipse cx="${x}" cy="${y - 30}" rx="90" ry="36" fill="#7a5233"/><circle cx="${x + 80}" cy="${y - 44}" r="30" fill="#7a5233"/><path d="M${x + 68} ${y - 66}c-14 4-20 22-12 36 10-6 14-20 12-36z" fill="#5a3a22"/><path d="M${x - 88} ${y - 26}c-30 0-40 20-30 26 14 0 26-10 30-26z" fill="#7a5233"/><path d="M${x + 86} ${y - 40}h14" stroke="#2a1a10" stroke-width="3" stroke-linecap="round"/></g>`;
const tub = (x, y, col = C.copper) => `<g><path d="M${x - 230} ${y - 170}h460c0 120-60 160-120 160h-220c-60 0-120-40-120-160z" fill="${col}"/><path d="M${x - 240} ${y - 175}h480" stroke="#d99a62" stroke-width="16" stroke-linecap="round"/><path d="M${x - 200} ${y - 10}l-20 20M${x + 200} ${y - 10}l20 20" stroke="#8a5530" stroke-width="12" stroke-linecap="round"/><path d="M${x + 170} ${y - 175}v-100q0-30 30-30h20" stroke="#8a8478" stroke-width="10" fill="none"/><path d="M${x - 120} ${y - 200}c10-30-10-40 0-70M${x - 40} ${y - 205}c10-30-10-40 0-70M${x + 40} ${y - 200}c10-30-10-40 0-70" stroke="#fff" stroke-width="8" fill="none" opacity=".5" stroke-linecap="round"/></g>`;
const candles = (x, y) => `<g><circle cx="${x + 20}" cy="${y - 50}" r="70" fill="url(#glow)" opacity=".6"/><rect x="${x}" y="${y - 40}" width="16" height="40" fill="#fbf2dd"/><rect x="${x + 26}" y="${y - 56}" width="16" height="56" fill="#fbf2dd"/><path d="M${x + 8} ${y - 52}c3 4 3 8 0 10-3-2-3-6 0-10zM${x + 34} ${y - 68}c3 4 3 8 0 10-3-2-3-6 0-10z" fill="#f2a33a"/></g>`;
const table = (x, y, w = 420) => `<g><rect x="${x}" y="${y - 150}" width="${w}" height="24" rx="6" fill="${C.oak}"/><rect x="${x + 20}" y="${y - 126}" width="18" height="126" fill="${C.oakD}"/><rect x="${x + w - 38}" y="${y - 126}" width="18" height="126" fill="${C.oakD}"/></g>`;
const chair = (x, y, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M0 0v-90h60v90M0-90v-80" stroke="${C.oakD}" stroke-width="12" fill="none"/><rect x="-4" y="-100" width="68" height="14" rx="4" fill="${C.oak}"/><path d="M0-170v-0" stroke="${C.oakD}"/><rect x="-6" y="-176" width="12" height="80" fill="${C.oakD}"/><rect x="-6" y="-170" width="40" height="10" fill="${C.oak}"/><rect x="-6" y="-140" width="40" height="10" fill="${C.oak}"/></g>`;
const range = (x, y, col = "#2f5d46") => `<g><rect x="${x}" y="${y - 260}" width="300" height="260" rx="10" fill="${col}"/><rect x="${x - 10}" y="${y - 280}" width="320" height="26" rx="6" fill="#d8d3c6"/><rect x="${x + 30}" y="${y - 200}" width="110" height="150" rx="8" fill="#244a37"/><rect x="${x + 160}" y="${y - 200}" width="110" height="150" rx="8" fill="#244a37"/><path d="M${x + 50} ${y - 210}h70M${x + 180} ${y - 210}h70" stroke="#d8d3c6" stroke-width="8" stroke-linecap="round"/><rect x="${x + 40}" y="${y - 520}" width="220" height="200" fill="${C.stone}"/><path d="M${x + 20} ${y - 320}h260" stroke="${C.oakD}" stroke-width="20"/><g>${[0, 1, 2, 3].map((i) => `<rect x="${x + 60 + i * 50}" y="${y - 380}" width="30" height="${40 + (i % 2) * 14}" rx="6" fill="${i % 2 ? C.copper : "#d8d3c6"}"/>`).join("")}</g></g>`;
const shelves = (x, y) => `<g><path d="M${x} ${y}h260M${x} ${y + 90}h260" stroke="${C.oak}" stroke-width="14"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 14 + i * 48}" y="${y - 50 - (i % 3) * 8}" width="34" height="${50 + (i % 3) * 8}" rx="${i % 2 ? 16 : 4}" fill="${["#c98e54", "#fbf6ec", C.forest, "#e7c58d", "#9cb8a3"][i]}"/>`).join("")}${[0, 1, 2].map((i) => `<rect x="${x + 20 + i * 80}" y="${y + 40}" width="60" height="50" rx="6" fill="${["#e7c58d", "#b8733f", "#fbf6ec"][i]}"/>`).join("")}</g>`;

// Exteriors
function exteriorBase(sky = "url(#dusk)", s = 5) {
  return `<rect width="${W}" height="${H}" fill="${sky}"/>${sky === "url(#night)" ? stars(70, s) : ""}<circle cx="900" cy="300" r="260" fill="url(#glow)" opacity="${sky === "url(#night)" ? 0.15 : 0.35}"/>
<g>${treeline(470, 30, 260, "#7f998a", "mix", s)}</g>${mistBand(380, 160, 0.9)}<g>${treeline(560, 18, 340, "#5c7a68", "mix", s + 7)}</g>`;
}
function hayloftExterior() {
  return svg(`${exteriorBase("url(#dusk)", 4)}
${grass(640, "#6f8b62")}
<g transform="translate(330 250)">
  <path d="M0 400V150L270 10 540 150v250z" fill="${C.stone}"/>
  <path d="M-20 160L270 0 560 160" fill="none" stroke="#3d4a40" stroke-width="30" stroke-linejoin="round"/>
  ${[...Array(9)].map((_, i) => `<path d="M${30 + i * 58} ${170 + (i % 2) * 6}h40" stroke="${C.stone2}" stroke-width="3"/>`).join("")}
  <rect x="210" y="120" width="120" height="110" rx="4" fill="${C.oakD}"/>${windowLit(225, 132, 90, 86, C.oakD)}
  <path d="M60 400h170v-160H60z" fill="${C.oakD}"/><path d="M145 240v160" stroke="${C.oak}" stroke-width="5"/>
  <path d="M330 400L500 240" stroke="${C.stone2}" stroke-width="0"/>
  <g fill="#b39f7e">${[...Array(7)].map((_, i) => `<rect x="${330 + i * 26}" y="${380 - i * 24}" width="60" height="22"/>`).join("")}</g>
  <path d="M330 360L520 196" stroke="${C.ink}" stroke-width="5"/>
  <rect x="420" y="250" width="70" height="70" fill="${C.stone2}"/>${windowLit(430, 258, 50, 54)}
</g>
${lantern(880, 560, 1.1)}
${mistBand(600, 140, 0.6)}
${oakTree(140, 760, 260, "#3d5a49")}`, defsCommon);
}
function keepersExterior() {
  return svg(`${exteriorBase("url(#day)", 12)}
${grass(640, "#7d9a6c")}
<g transform="translate(360 260)">
  <rect x="0" y="130" width="480" height="270" fill="${C.brick}"/>
  ${[...Array(12)].map((_, r) => `<path d="M0 ${150 + r * 22}h480" stroke="${C.brickD}" stroke-width="2" opacity=".5"/>`).join("")}
  <path d="M-30 140L240 0l270 140z" fill="#4a3f38"/>
  <rect x="80" y="30" width="40" height="80" fill="${C.brickD}"/><rect x="360" y="40" width="40" height="70" fill="${C.brickD}"/>
  ${windowLit(60, 180, 90, 80, C.cream)}${windowLit(330, 180, 90, 80, C.cream)}${windowLit(60, 300, 90, 70, C.cream)}
  <path d="M190 400v-130h100v130" fill="${C.forest}"/><circle cx="275" cy="340" r="5" fill="${C.amber}"/>
  <path d="M170 280h140l-20-40h-100z" fill="#4a3f38"/>
  <path d="M330 300h90v70h-90z" fill="${C.glow}"/><path d="M375 300v70M330 335h90" stroke="${C.cream}" stroke-width="5"/>
</g>
<g stroke="${C.oakD}" stroke-width="8">${[...Array(16)].map((_, i) => `<path d="M${40 + i * 74} 700v-70"/>`).join("")}<path d="M20 650h1160M20 680h1160"/></g>
${plant(330, 690, 0.8)}${plant(880, 690, 0.7)}
${pineSimple(1100, 700, 520, "#3d5a49")}${oakTree(120, 720, 230, "#4a6858")}`, defsCommon);
}
function granaryExterior() {
  return svg(`${exteriorBase("url(#night)", 21)}
${grass(650, "#3e5649")}
<g transform="translate(140 300)">
  <rect x="0" y="100" width="900" height="270" fill="${C.stone}"/>
  ${[...Array(10)].map((_, r) => `<path d="M0 ${118 + r * 26}h900" stroke="${C.stone2}" stroke-width="3" opacity=".7"/>`).join("")}
  <path d="M-30 110L80 0h740l110 110z" fill="#3a3f3a"/>
  ${[0, 1, 2, 3].map((i) => windowLit(80 + i * 200, 160, 80, 90, C.oakD)).join("")}
  <path d="M600 370V260a60 60 0 0 1 120 0v110z" fill="${C.glow}"/><path d="M660 200v170M600 300h120" stroke="${C.oakD}" stroke-width="6"/>
  <circle cx="660" cy="300" r="170" fill="url(#glow)" opacity=".5"/>
  <rect x="380" y="270" width="80" height="100" fill="${C.oakD}"/>
</g>
${lantern(1080, 600, 1)}
${mistBand(620, 140, 0.35)}
${pineSimple(80, 720, 560, "#1f3229")}`, defsCommon);
}

// Interiors
function hayloftLiving() {
  return svg(`${room("#efe4cf", 600, true)}${windowView(780, 180, 280, 240, "url(#dusk)")}${logBurner(330, 600)}${rug(680, 680, 340)}${sofa(560, 640, C.forest)}${lamp(1110, 600)}${plant(90, 600, 1)}`, defsCommon);
}
function hayloftBath() {
  return svg(`${room("#e9e0cc", 620, true)}${windowView(420, 160, 360, 280, "url(#dusk)")}${tub(600, 640)}${candles(890, 560)}${plant(1050, 620, 1.1)}<rect x="120" y="360" width="16" height="260" fill="${C.oak}"/><path d="M110 380h120" stroke="${C.oak}" stroke-width="10"/><rect x="140" y="390" width="70" height="120" rx="6" fill="#fff"/>`, defsCommon);
}
function hayloftBedroom() {
  return svg(`${room("#ebe1cb", 620, true)}${windowView(860, 200, 200, 220, "url(#dusk)")}${bed(260, 640, 520, "#fbf6ec", C.amber)}${sideTable(130, 640)}${sideTable(820, 640)}${rug(520, 700, 360, "#9cb8a3")}`, defsCommon);
}
function hayloftPatio() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#dusk)"/>${treeline(470, 30, 240, "#7f998a", "mix", 33)}${mistBand(400, 140)}
<rect y="560" width="${W}" height="240" fill="#c9b796"/>${[...Array(8)].map((_, i) => `<path d="M0 ${580 + i * 30}h${W}" stroke="#b5a17e" stroke-width="2"/>`).join("")}${[...Array(10)].map((_, i) => `<path d="M${i * 130} 560l-60 240" stroke="#b5a17e" stroke-width="2"/>`).join("")}
<rect x="0" y="120" width="210" height="440" fill="${C.stone}"/>${windowLit(40, 260, 110, 130, C.oakD)}
<g transform="translate(560 640)"><ellipse cx="0" cy="0" rx="120" ry="20" fill="#000" opacity=".12"/><path d="M0 0v-150" stroke="${C.ink}" stroke-width="10"/><ellipse cx="0" cy="-150" rx="110" ry="22" fill="${C.ink}"/>${candles(-20, -170)}</g>
${chair(380, 650)}${chair(740, 650, true)}
<path d="M0 90c300 20 600 40 1200 0" stroke="${C.ink}" stroke-width="2" fill="none"/>${[...Array(12)].map((_, i) => `<circle cx="${50 + i * 100}" cy="${96 + Math.sin(i / 2) * 10 + i * 1.5}" r="9" fill="${C.glow}"/><circle cx="${50 + i * 100}" cy="${96 + Math.sin(i / 2) * 10 + i * 1.5}" r="26" fill="url(#glow)"/>`).join("")}
${plant(1000, 640, 1.2)}`, defsCommon);
}
function keepersLiving() {
  return svg(`${room("#e8dcc4", 610)}${windowView(140, 170, 300, 250)}<rect x="110" y="440" width="360" height="40" rx="8" fill="${C.forest}"/>${logBurner(830, 610)}${rug(560, 690, 380, "#c98e54")}${dog(560, 700)}<g transform="translate(620 0)">${sofa(-560, 640, "#7b8f74").replace(/<rect x="-560" y="490"/, "")}</g>${lamp(1110, 610)}`, defsCommon);
}
function keepersKitchen() {
  return svg(`${room("#efe6d3", 620)}${range(120, 620)}${shelves(560, 260)}${table(560, 700, 480)}${chair(600, 700)}${chair(1000, 700, true)}<path d="M760 540c0-20 50-20 50 0z" fill="#fbf6ec"/><rect x="740" y="540" width="90" height="10" fill="#e9dcc2"/>${plant(1100, 620, 0.9)}<circle cx="980" cy="120" r="60" fill="url(#glow)"/><path d="M980 0v90" stroke="${C.ink}" stroke-width="4"/><path d="M950 120h60l-12-30h-36z" fill="${C.ink}"/>`, defsCommon);
}
function keepersBedroom() {
  return svg(`${room("#e3e6dc", 620)}${windowView(500, 170, 220, 230)}${bed(110, 640, 300, "#fbf6ec", C.forest)}${bed(790, 640, 300, "#fbf6ec", C.amber)}${sideTable(555, 640)}${rug(600, 700, 280, "#c98e54")}`, defsCommon);
}
function keepersGarden() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#dusk)"/>${treeline(470, 26, 300, "#6f8a79", "mix", 41)}${mistBand(420, 120)}${grass(560, "#7d9a6c")}
<g stroke="${C.oakD}" stroke-width="9">${[...Array(16)].map((_, i) => `<path d="M${30 + i * 76} 600v-80"/>`).join("")}<path d="M10 540h1180M10 575h1180"/></g>
<g transform="translate(360 650)"><ellipse cx="0" cy="40" rx="140" ry="22" fill="#000" opacity=".15"/><circle cx="0" cy="-30" r="200" fill="url(#glow)" opacity=".8"/><ellipse cx="0" cy="20" rx="110" ry="30" fill="#3a3a36"/><path d="M-40 10c10-50 30-60 30-90 30 30 30 50 34 70 10-20 22-30 22-48 22 30 18 56 14 68z" fill="#f2a33a"/><path d="M-12 10c6-26 20-30 18-50 16 18 16 34 16 50z" fill="#ffd77a"/></g>
<g transform="translate(760 700)"><rect x="0" y="-120" width="320" height="22" fill="${C.oak}"/><rect x="-30" y="-60" width="380" height="18" fill="${C.oak}"/><path d="M20-98l-30 98M300-98l30 98M60-98l-20 98M260-98l20 98" stroke="${C.oakD}" stroke-width="12"/></g>
${dog(980, 760)}${pineSimple(1140, 760, 520, "#3d5a49")}`, defsCommon);
}
function granaryLiving() {
  return svg(`<rect width="${W}" height="${H}" fill="#efe5d0"/><path d="M0 120L600 0l600 120" stroke="${C.oakD}" stroke-width="30" fill="none"/><path d="M150 60v560M450 20v600M750 20v600M1050 60v560" stroke="${C.oak}" stroke-width="18" opacity=".55"/><rect y="620" width="${W}" height="180" fill="url(#floorG)"/>
<path d="M440 620V330a120 120 0 0 1 240 0v290z" fill="url(#night)"/>${stars(20, 7).replace(/cx="(\d+)"/g, (m, x) => `cx="${440 + (+x % 240)}"`).replace(/cy="(\d+)"/g, (m, y) => `cy="${240 + (+y % 200)}"`)}<path d="M560 210v410M440 460h240" stroke="${C.cream}" stroke-width="10"/>
${table(100, 720, 380)}${chair(130, 720)}${chair(450, 720, true)}<g transform="translate(270 560)">${candles(-20, 0)}</g>
${logBurner(950, 620)}${rug(880, 700, 300, "#c98e54")}<circle cx="290" cy="210" r="70" fill="url(#glow)"/><path d="M290 60v120" stroke="${C.ink}" stroke-width="4"/><path d="M255 210h70l-14-34h-42z" fill="${C.ink}"/>`, defsCommon);
}
function granaryHottub() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#night)"/>${stars(120, 3)}<circle cx="980" cy="120" r="46" fill="#fbf2d6"/><circle cx="1000" cy="110" r="42" fill="#203530" opacity=".0"/>
${treeline(520, 28, 300, "#2c443a", "pine", 51)}${mistBand(470, 120, 0.4)}
<rect y="560" width="${W}" height="240" fill="#3b4f43"/><rect x="200" y="600" width="800" height="200" fill="#6b5a46"/>${[...Array(10)].map((_, i) => `<path d="M${200 + i * 80} 600v200" stroke="#5a4a38" stroke-width="3"/>`).join("")}
<g transform="translate(600 660)"><ellipse cx="0" cy="0" rx="300" ry="80" fill="${C.oakD}"/><ellipse cx="0" cy="-20" rx="270" ry="64" fill="#7fb2b3"/><ellipse cx="0" cy="-20" rx="270" ry="64" fill="url(#glow)" opacity=".5"/><path d="M-160-80c20-40-20-60 0-110M-40-90c20-40-20-60 0-110M90-80c20-40-20-60 0-110M200-70c20-40-20-60 0-100" stroke="#e8f0ec" stroke-width="12" fill="none" opacity=".35" stroke-linecap="round"/></g>
${lantern(1060, 600, 1)}${lantern(140, 610, 0.9)}`, defsCommon);
}
function granaryBedroom() {
  return svg(`${room("#ece3cf", 620)}<path d="M0 0h1200v40H0z" fill="${C.oakD}"/>${windowView(880, 180, 220, 240, "url(#night)")}${bed(250, 640, 560, "#fbf6ec", "#7b8f74")}${sideTable(130, 640)}${sideTable(850, 640)}${rug(530, 700, 380, "#e7c58d")}<path d="M60 620V300h80v320" fill="${C.cream}" opacity=".7"/><rect x="40" y="590" width="120" height="30" fill="${C.oak}"/>`, defsCommon);
}
function granaryGarden() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#dusk)"/>${treeline(470, 26, 280, "#6f8a79", "mix", 61)}${mistBand(420, 120)}${grass(560, "#7d9a6c")}
<rect x="0" y="470" width="${W}" height="90" fill="#9cb8a3" opacity=".0"/><g fill="${C.oakD}">${[...Array(30)].map((_, i) => `<rect x="${i * 42}" y="520" width="34" height="80" rx="3"/>`).join("")}</g>
<path d="M0 110c300 30 700 30 1200-10" stroke="${C.ink}" stroke-width="2" fill="none"/>${[...Array(10)].map((_, i) => `<circle cx="${80 + i * 115}" cy="${118 + Math.sin(i / 1.5) * 8 + 10}" r="9" fill="${C.glow}"/><circle cx="${80 + i * 115}" cy="${128 + Math.sin(i / 1.5) * 8}" r="28" fill="url(#glow)"/>`).join("")}
${table(330, 720, 520)}${chair(370, 720)}${chair(810, 720, true)}<g transform="translate(560 570)">${candles(0, 0)}</g><path d="M480 560c0-26 60-26 60 0zM640 560c0-20 40-20 40 0z" fill="#fbf6ec"/>
<g transform="translate(150 700)"><circle cx="0" cy="-40" r="150" fill="url(#glow)" opacity=".7"/><ellipse cx="0" cy="0" rx="90" ry="24" fill="#3a3a36"/><path d="M-30-6c8-40 24-48 24-72 24 24 24 40 28 56 8-16 18-24 18-38 18 24 14 44 10 54z" fill="#f2a33a"/></g>
${plant(1080, 700, 1.1)}`, defsCommon);
}

// Local scenes (illustrative)
function guideOak() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#day)"/>${treeline(520, 30, 280, "#8aa596", "mix", 71)}${mistBand(440, 140)}${grass(600, "#7f9b6e")}
<g transform="translate(600 640)"><path d="M-70 0c10-120 0-200-40-280M70 0c-10-120 10-200 50-260M-30 0c0-160 10-260-10-340M30 0c10-160 0-240 30-320" stroke="#5e4630" stroke-width="44" fill="none" stroke-linecap="round"/><path d="M-110-280c-90-40-170-30-230 10M-10-330c-40-90-140-120-220-100M60-320c80-80 200-80 270-30M120-260c100 0 180 40 220 90" stroke="#5e4630" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M-150-160l-60 20M180-180l70 30" stroke="#8a8478" stroke-width="8"/><path d="M-210-140v140M250-150v150" stroke="#8a8478" stroke-width="8"/>
${[[-300, -330, 150], [-150, -450, 170], [40, -490, 190], [220, -440, 170], [340, -320, 140], [-60, -360, 150], [140, -360, 150]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4f6d5d" opacity=".95"/>`).join("")}${[[-240, -380, 90], [60, -520, 100], [260, -420, 90]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5f7f69"/>`).join("")}
<ellipse cx="0" cy="10" rx="280" ry="30" fill="#5e7a52" opacity=".5"/></g>
<path d="M0 760c200-30 420-40 620-60s400 0 580 30" stroke="#d9c79e" stroke-width="30" fill="none" opacity=".8"/>`, defsCommon);
}
function guideLake() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#dusk)"/>${treeline(470, 34, 220, "#7f998a", "mix", 81)}
<g transform="translate(760 470)"><path d="M0 0v-130h80V0" fill="${C.stone}"/><path d="M40-130l-6-170h12z" fill="${C.stone2}"/><path d="M0-130h80l-40-60z" fill="${C.stone2}"/><path d="M-120 0v-80h120V0" fill="${C.stone}"/><path d="M-130-80l70-50 70 50" fill="#6f6a60"/><path d="M-90-10v-40a14 14 0 0 1 28 0v40M20-60v-40a12 12 0 0 1 24 0v40" fill="#5a5148"/></g>
${mistBand(400, 120, 0.8)}<rect y="480" width="${W}" height="320" fill="url(#water)"/>${[...Array(8)].map((_, i) => `<path d="M${100 + i * 140} ${540 + (i % 3) * 50}h${60 + (i % 2) * 40}" stroke="#d6e2df" stroke-width="3" opacity=".6"/>`).join("")}
<g transform="translate(800 480) scale(1 -0.5)" opacity=".25"><path d="M0 0v-130h80V0" fill="${C.stone}"/><path d="M40-130l-6-170h12z" fill="${C.stone2}"/></g>
<path d="M0 700c200-30 300-20 420 10s200 40 360 10" fill="none"/><path d="M-20 800c120-110 300-120 420-100s160 100 160 100z" fill="#5c7a68"/>${oakTree(140, 700, 200, "#3d5a49")}
<g transform="translate(520 600)"><path d="M0 0c10-10 30-10 40 0" stroke="#fbf6ec" stroke-width="6" fill="none"/><circle cx="46" cy="-8" r="6" fill="#fbf6ec"/></g>`, defsCommon);
}
function guideGorge() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#day)"/>
<path d="M0 160c80 20 160-10 260 20s120 120 140 240 40 200 40 380H0z" fill="#d8ccb0"/><path d="M1200 140c-90 30-180 0-280 40s-130 120-150 230-30 220-30 390h460z" fill="#d2c4a6"/>
${[[90, 380, 70, 90], [250, 300, 50, 70], [200, 520, 80, 60], [960, 320, 90, 110], [1060, 480, 60, 70], [880, 520, 50, 50]].map(([x, y, w, h]) => `<path d="M${x - w / 2} ${y + h / 2}a${w / 2} ${h / 1.4} 0 0 1 ${w} 0z" fill="#3e3a33"/>`).join("")}
${[...Array(12)].map((_, i) => `<path d="M${20 + i * 30} ${200 + i * 30}h${60}" stroke="#bfb193" stroke-width="3"/>`).join("")}${[...Array(12)].map((_, i) => `<path d="M${1150 - i * 30} ${190 + i * 32}h-60" stroke="#bfb193" stroke-width="3"/>`).join("")}
${treeline(170, 16, 120, "#6f8a79", "mix", 91)}
<rect x="380" y="560" width="440" height="240" fill="url(#water)"/><path d="M380 560c80 20 360 20 440 0" stroke="#e6ece9" stroke-width="4" fill="none" opacity=".6"/>
<path d="M300 800c40-60 80-90 120-100M900 800c-40-60-80-90-120-100" stroke="#7f9b6e" stroke-width="40" fill="none"/>
${oakTree(560, 560, 70, "#5f7f69")}${oakTree(680, 560, 60, "#4f6d5d")}`, defsCommon);
}
function guideAbbey() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#day)"/>${treeline(500, 30, 240, "#8aa596", "mix", 101)}${grass(520, "#86a275")}
<g transform="translate(260 520)" fill="${C.stone}"><rect x="0" y="-260" width="560" height="260"/><g fill="#7a6e5c">${[0, 1, 2, 3].map((i) => `<path d="M${40 + i * 130} 0v-150a45 45 0 0 1 90 0v150z"/>`).join("")}${[0, 1, 2, 3].map((i) => `<path d="M${55 + i * 130} -190v-40a30 30 0 0 1 60 0v40z"/>`).join("")}</g><path d="M0-260l40-40 40 30 60-50 50 40 70-30 60 50 80-40 60 30 60-20 40 30v0H0z" fill="#f4e7c6"/><rect x="560" y="-180" width="160" height="180" fill="${C.stone2}"/><path d="M590 0v-100a35 35 0 0 1 70 0v100z" fill="#7a6e5c"/></g>
<rect y="600" width="${W}" height="200" fill="url(#water)"/><g opacity=".22" transform="translate(260 600) scale(1 -.4)"><rect x="0" y="-260" width="560" height="260" fill="${C.stone}"/></g>
${[0, 1, 2].map((i) => `<g transform="translate(${420 + i * 160} ${680 + (i % 2) * 30})"><ellipse cx="0" cy="0" rx="24" ry="10" fill="#6b5a46"/><circle cx="18" cy="-10" r="8" fill="#2f5d46"/><path d="M24-10l10 2" stroke="${C.amber}" stroke-width="4"/></g>`).join("")}
${oakTree(1060, 600, 210, "#4f6d5d")}`, defsCommon);
}
function guideTown() {
  return svg(`<rect width="${W}" height="${H}" fill="url(#day)"/>${treeline(470, 30, 180, "#9ab1a2", "mix", 111)}
<g transform="translate(700 520)"><rect x="0" y="-320" width="140" height="320" fill="${C.stone}"/><path d="M-10-320h160v-24H-10z" fill="${C.stone2}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${-10 + i * 36}" y="-370" width="18" height="26" fill="${C.stone2}"/>`).join("")}<path d="M50-120v-60a20 20 0 0 1 40 0v60z" fill="#5a5148"/><path d="M140 0v-180l240-60V0z" fill="${C.stone}"/><path d="M140-180l120-90 120 30" fill="#6f6a60"/></g>
${[[0, 520, 180, 200, C.brick], [180, 520, 150, 170, "#c2a27a"], [330, 520, 170, 220, C.brickD], [500, 520, 180, 190, "#d7c3a0"], [1080, 520, 140, 200, C.brick]].map(([x, y, w, h, col]) => `<g><rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${col}"/><path d="M${x - 10} ${y - h}L${x + w / 2} ${y - h - 70}L${x + w + 10} ${y - h}z" fill="#4a3f38"/>${windowLit(x + 26, y - h + 40, 40, 40, C.cream)}${windowLit(x + w - 70, y - h + 40, 40, 40, C.cream)}<rect x="${x + w / 2 - 20}" y="${y - 70}" width="40" height="70" fill="${C.forest}"/></g>`).join("")}
<rect y="520" width="${W}" height="280" fill="#c9bea7"/>${[...Array(10)].map((_, i) => `<path d="M0 ${540 + i * 26}h${W}" stroke="#b7ab92" stroke-width="2"/>`).join("")}
<path d="M0 700c300-30 600-20 1200 10V800H0z" fill="url(#water)"/><path d="M200 720h160M640 730h120" stroke="#e6ece9" stroke-width="4" opacity=".6"/>
<g transform="translate(860 690)"><rect x="0" y="-26" width="220" height="26" rx="8" fill="${C.forest}"/><rect x="40" y="-60" width="120" height="34" rx="6" fill="${C.amber}"/></g>`, defsCommon);
}

const files = {
  "hayloft-exterior": hayloftExterior, "hayloft-living": hayloftLiving, "hayloft-bath": hayloftBath, "hayloft-bedroom": hayloftBedroom, "hayloft-patio": hayloftPatio,
  "keepers-exterior": keepersExterior, "keepers-living": keepersLiving, "keepers-kitchen": keepersKitchen, "keepers-bedroom": keepersBedroom, "keepers-garden": keepersGarden,
  "granary-exterior": granaryExterior, "granary-living": granaryLiving, "granary-hottub": granaryHottub, "granary-bedroom": granaryBedroom, "granary-garden": granaryGarden,
  "guide-oak": guideOak, "guide-lake": guideLake, "guide-gorge": guideGorge, "guide-abbey": guideAbbey, "guide-town": guideTown
};
const minify = (s) => s.replace(/\n\s*/g, "").replace(/(\d+\.\d{2})\d+/g, "$1");
for (const [name, fn] of Object.entries(files)) fs.writeFileSync(path.join(IMG, name + ".svg"), minify(fn()));

// Favicon (SVG) and PNG icons
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2f5d46"/><path d="M26 12h12M32 6v6" stroke="#f5f1e8" stroke-width="3" stroke-linecap="round"/><path d="M22 20h20l-3-6H25z" fill="#f5f1e8"/><rect x="22" y="20" width="20" height="28" rx="4" fill="#f6e3c2"/><path d="M32 27c2 3 4 4.5 4 8a4 4 0 0 1-8 0c0-2 1.5-3 2-4.5.6 1.4 1.4 1.7 2 1.5z" fill="#d9993b"/><path d="M20 48h24v4a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2z" fill="#f5f1e8"/></svg>`;
fs.writeFileSync(path.join(ROOT, "public", "favicon.svg"), fav);

// Open Graph images
function ogSvg(title, sub, art) {
  const inner = art.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630"><svg x="0" y="0" width="1200" height="630" viewBox="0 85 1200 630" preserveAspectRatio="xMidYMid slice">${inner}</svg><rect width="1200" height="630" fill="url(#ogfade)"/><defs><linearGradient id="ogfade" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#14201a" stop-opacity="0"/><stop offset="1" stop-color="#14201a" stop-opacity=".85"/></linearGradient></defs><text x="60" y="500" font-family="DM Serif Display, Georgia, serif" font-size="68" fill="#fffaf0">${title}</text><text x="62" y="560" font-family="Inter, DejaVu Sans, sans-serif" font-size="28" fill="#f3d49b">${sub}</text></svg>`;
}
const ogs = {
  "og-image": ["Wake up on the edge of Sherwood.", "Larch &amp; Lantern Cottages · concept site", hayloftExterior()],
  "og-hayloft": ["The Hayloft", "Sleeps 2 · log burner · freestanding bath", hayloftExterior()],
  "og-keepers": ["Keeper's Cottage", "Sleeps 4 · 1 dog welcome · woodland view", keepersExterior()],
  "og-granary": ["The Old Granary", "Sleeps 6 · hot tub · up to 2 dogs", granaryExterior()]
};
const tmp = fs.mkdtempSync("/tmp/llart-");
let havePng = true;
try { execSync("which rsvg-convert", { stdio: "ignore" }); } catch { havePng = false; }
if (havePng) {
  for (const [name, [t, s, art]] of Object.entries(ogs)) {
    const f = path.join(tmp, name + ".svg");
    fs.writeFileSync(f, ogSvg(t, s, art));
    execSync(`rsvg-convert -w 1200 -h 630 "${f}" -o "${path.join(IMG, name + ".png")}"`);
  }
  const ff = path.join(tmp, "fav.svg");
  fs.writeFileSync(ff, fav);
  execSync(`rsvg-convert -w 180 -h 180 "${ff}" -o "${path.join(ROOT, "public", "apple-touch-icon.png")}"`);
  execSync(`rsvg-convert -w 32 -h 32 "${ff}" -o "${path.join(ROOT, "public", "favicon-32.png")}"`);
  execSync(`rsvg-convert -w 192 -h 192 "${ff}" -o "${path.join(IMG, "icon-192.png")}"`);
  execSync(`rsvg-convert -w 512 -h 512 "${ff}" -o "${path.join(IMG, "icon-512.png")}"`);
}
console.log("Art written" + (havePng ? " (with PNGs)." : " (SVG only; install rsvg-convert for PNGs)."));
