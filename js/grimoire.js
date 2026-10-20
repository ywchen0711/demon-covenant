// DEMON COVENANT — the grimoire style: demons drawn like plates from an occult bestiary. Tall, elegant anatomy; fine ink
// lines that thicken on the shadow side; hard cel shadows softened with airbrush; muted colours with one burning accent;
// a sigil circle behind each figure and paper grain over everything.
const cache = new Map();
const INK = '#140c12';
// ---------------------------------------------------------------- colour
const hx = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const css = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
function tone(hex, f, mute = 0.16) {
  let [r, g, b] = hx(hex); const m = (r + g + b) / 3; r += (m - r) * mute; g += (m - g) * mute; b += (m - b) * mute;
  if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { const k = 1 + f; r *= k; g *= k * 0.97; b = Math.min(255, b * k * 1.06 + 4 * -f); }
  return css([r, g, b]);
}
// ---------------------------------------------------------------- paths
function smooth(pts, closed = true) {
  const p = new Path2D(), n = pts.length, at = (i) => pts[(i + n) % n];
  if (!closed) { p.moveTo(...pts[0]); for (let i = 0; i < n - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)]; p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); } return p; }
  p.moveTo(...at(0));
  for (let i = 0; i < n; i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2); p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
  p.closePath(); return p;
}
const poly = (pts) => { const p = new Path2D(); p.moveTo(...pts[0]); for (const q of pts.slice(1)) p.lineTo(...q); p.closePath(); return p; };
const ell = (x, y, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); return p; };
// a limb from a to b: widths at each end, a swell in the middle (muscle), returned as an outline path
function limbP(ax, ay, bx, by, wa, wb, swell = 0.18, side = 1) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, pts = [];
  const w = (t) => (wa + (wb - wa) * t) * (1 + Math.sin(t * Math.PI) * swell);
  for (let i = 0; i <= 6; i++) { const t = i / 6, k = w(t) * (1 + (side > 0 ? 0.08 : 0) * Math.sin(t * Math.PI)); pts.push([ax + dx * t + nx * k, ay + dy * t + ny * k]); }
  for (let i = 6; i >= 0; i--) { const t = i / 6, k = w(t) * (1 + (side < 0 ? 0.08 : 0) * Math.sin(t * Math.PI)); pts.push([ax + dx * t - nx * k, ay + dy * t - ny * k]); }
  return smooth(pts);
}
// ---------------------------------------------------------------- painting
let G = null;
// flat colour, a hard shadow crescent on the far side, a sliver of light on the near side, an airbrushed glow and a wash,
// then ink: a heavy line offset toward the shadow under a fine line on top
function cel(p, col, o = {}) {
  const g = G, d = o.d ?? 6, h = Math.max(1, d * 0.3), lw = o.lw ?? 1.5;
  const minus = (k) => { const q = new Path2D(); q.addPath(p); q.addPath(p, new DOMMatrix([1, 0, 0, 1, -d * k, -d * k])); return q; };
  if (o.ink !== false) { g.save(); g.translate(lw * 0.7, lw * 0.7); g.lineJoin = 'round'; g.lineWidth = lw * 2.2; g.strokeStyle = INK; g.stroke(p); g.restore(); }
  g.save(); g.clip(p);
  if (o.nolight) { g.fillStyle = tone(col, 0); g.fill(p); } else { g.fillStyle = tone(col, 0.28); g.fill(p); g.save(); g.translate(h, h); g.fillStyle = tone(col, 0); g.fill(p); g.restore(); }
  if (d > 0) { g.fillStyle = tone(col, -0.38); g.fill(minus(1), 'evenodd'); g.fillStyle = tone(col, -0.6); g.fill(minus(0.28), 'evenodd'); }
  if (o.air !== false && o.bx) { const [x, y, r] = o.bx, gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x - r * 0.35, y - r * 0.4, r * 0.9); gr.addColorStop(0, 'rgba(255,248,235,0.22)'); gr.addColorStop(1, 'rgba(255,248,235,0)'); g.fillStyle = gr; g.fillRect(x - r * 2, y - r * 2, r * 4, r * 4); }
  if (o.wash !== false) { const gr = g.createLinearGradient(0, 30, 0, 250); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(14,0,22,0.3)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  g.restore();
  if (o.ink !== false) { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = lw; g.strokeStyle = INK; g.stroke(p); }
}
// a tapered ink stroke along a curve: thin, swelling, thin
function brush(pts, w = 1.6, col = INK, taper = true) {
  const g = G, n = 24, path = [], seg = [];
  const curve = (t) => { const k = t * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(k)), f = k - i; const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; const c = (a0, a1, a2, a3) => 0.5 * ((2 * a1) + (-a0 + a2) * f + (2 * a0 - 5 * a1 + 4 * a2 - a3) * f * f + (-a0 + 3 * a1 - 3 * a2 + a3) * f * f * f); return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]; };
  for (let i = 0; i <= n; i++) seg.push(curve(i / n));
  for (let i = 0; i <= n; i++) { const [x, y] = seg[i], [ax, ay] = seg[Math.max(0, i - 1)], [bx, by] = seg[Math.min(n, i + 1)], L = Math.hypot(bx - ax, by - ay) || 1, k = (taper ? Math.sin((i / n) * Math.PI) * 0.85 + 0.15 : 1) * w / 2; path.push([x - (by - ay) / L * k, y + (bx - ax) / L * k]); }
  for (let i = n; i >= 0; i--) { const [x, y] = seg[i], [ax, ay] = seg[Math.max(0, i - 1)], [bx, by] = seg[Math.min(n, i + 1)], L = Math.hypot(bx - ax, by - ay) || 1, k = (taper ? Math.sin((i / n) * Math.PI) * 0.85 + 0.15 : 1) * w / 2; path.push([x + (by - ay) / L * k, y - (bx - ax) / L * k]); }
  g.fillStyle = col; g.fill(poly(path));
}
function hatch(p, step = 4.5, ang = 0.85, col = 'rgba(20,10,24,0.5)', w = 0.9) {
  const g = G; g.save(); g.clip(p); g.strokeStyle = col; g.lineWidth = w;
  for (let t = -300; t < 400; t += step) { g.beginPath(); g.moveTo(t, -20); g.lineTo(t + Math.cos(ang) * 420, -20 + Math.sin(ang) * 420); g.stroke(); }
  g.restore();
}
function glow(x, y, r, col, a = 0.85) { const g = G, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, css([255, 255, 255], a)); gr.addColorStop(0.22, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
function eyeSlit(x, y, w, h, col, rot = 0) {
  const g = G; g.save(); g.translate(x, y); g.rotate(rot);
  const p = new Path2D(); p.moveTo(-w, h * 0.3); p.quadraticCurveTo(-w * 0.2, -h, w, -h * 0.4); p.quadraticCurveTo(w * 0.1, h * 0.9, -w, h * 0.3); p.closePath();
  g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 7; g.fill(p); g.shadowBlur = 0;
  g.fillStyle = 'rgba(255,255,240,0.95)'; g.beginPath(); g.ellipse(w * 0.15, -h * 0.1, w * 0.28, h * 0.32, 0, 0, 7); g.fill();
  g.lineWidth = 1.1; g.strokeStyle = INK; g.stroke(p); g.restore();
}
function teeth(x0, y0, x1, y1, n, len, col = '#ece2c6', dir = 1) {
  const g = G; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, w = Math.abs(x1 - x0) / n * 0.5, l = len * (0.7 + 0.3 * Math.sin(i * 2.3) ** 2); const p = poly([[x - w, y], [x + w * 0.2, y + l * dir], [x + w, y]]); g.fillStyle = col; g.fill(p); g.lineWidth = 0.8; g.strokeStyle = INK; g.stroke(p); }
}
// ---------------------------------------------------------------- behind every demon
function ground(accent, bare) {
  const g = G;
  if (!bare) { const bg = g.createRadialGradient(128, 110, 10, 128, 130, 200); bg.addColorStop(0, '#2c2432'); bg.addColorStop(0.65, '#130e18'); bg.addColorStop(1, '#060408'); g.fillStyle = bg; g.fillRect(0, 0, 256, 256); }
  g.save(); g.translate(128, 120); g.globalAlpha = bare ? 0.55 : 1; g.strokeStyle = css(hx(accent), 0.2); g.lineWidth = 0.9;
  for (const r of [108, 101, 72]) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); }
  g.beginPath(); for (let k = 0; k <= 7; k++) { const a = -Math.PI / 2 + k * (Math.PI * 2 / 7) * 3; const x = Math.cos(a) * 101, y = Math.sin(a) * 101; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.font = '8px serif'; g.fillStyle = css(hx(accent), 0.32); g.textAlign = 'center';
  const RUNE = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᚠᚢᚦᚨ';
  for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; g.save(); g.rotate(a); g.fillText(RUNE[k], 0, -103); g.restore(); }
  g.restore();
  const sh = g.createRadialGradient(128, 244, 4, 128, 244, 76); sh.addColorStop(0, 'rgba(0,0,0,0.8)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.save(); g.scale(1, 0.18); g.fillStyle = sh; g.beginPath(); g.arc(128, 244 / 0.18, 76, 0, 7); g.fill(); g.restore();
}
function grain(seed, bare) {
  const g = G; let r = seed || 7; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  g.save(); g.globalCompositeOperation = bare ? 'source-atop' : 'overlay';
  for (let i = 0; i < 1400; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,240,220,0.07)' : 'rgba(0,0,0,0.09)'; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 1.5, 1 + rnd() * 1.5); }
  g.restore();
  if (bare) return;
  const v = g.createRadialGradient(128, 128, 90, 128, 128, 182); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = v; g.fillRect(0, 0, 256, 256);
}
const SKIN = '#e6d2bc';
// ---------------------------------------------------------------- the plates
const P = {
  // an empty suit of tall gothic armour; violet smoke where a body should be; a greatsword carried across it
  hollowmail(a, b, e) {
    // a cape torn to strips, blowing to the left
    const cape = smooth([[104, 64], [152, 64], [176, 140], [196, 230], [180, 222], [170, 246], [150, 226], [132, 248], [116, 224], [96, 244], [84, 220], [60, 236], [72, 160], [92, 96]]);
    cel(cape, '#3c1824', { d: 9, bx: [128, 150, 90] }); hatch(cape, 4); for (const x of [96, 120, 150]) brush([[x, 90], [x - 6, 160], [x - 14, 236]], 1.2, 'rgba(10,0,10,0.6)');
    // legs: long greaves, knee cops with spikes, pointed sabatons
    for (const s of [-1, 1]) {
      cel(limbP(128 + s * 14, 150, 128 + s * 20, 196, 11, 8, 0.1), a, { d: 4, bx: [128 + s * 16, 172, 20] });
      cel(limbP(128 + s * 20, 196, 128 + s * 22, 234, 8, 6.5, 0.08), a, { d: 4, bx: [128 + s * 22, 214, 18] });
      cel(smooth([[128 + s * 12, 192], [128 + s * 28, 190], [128 + s * 30, 202], [128 + s * 20, 208], [128 + s * 12, 202]]), b, { d: 2, lw: 1.2 });
      cel(poly([[128 + s * 26, 194], [128 + s * 40, 190], [128 + s * 28, 200]]), b, { d: 1, lw: 1 });
      cel(smooth([[128 + s * 14, 232], [128 + s * 30, 232], [128 + s * 44, 244], [128 + s * 16, 244]]), a, { d: 2, lw: 1.3 });
    }
    // the faulds: lames over the hips, a tabard with a sigil
    cel(smooth([[100, 132], [156, 132], [162, 160], [94, 160]]), a, { d: 4, bx: [128, 146, 30] }); for (let k = 0; k < 3; k++) brush([[98, 140 + k * 7], [128, 138 + k * 7], [158, 140 + k * 7]], 1, INK, false);
    const tab = smooth([[118, 132], [138, 132], [140, 210], [128, 218], [116, 210]]); cel(tab, '#5a1e2c', { d: 3 });
    G.save(); G.translate(128, 176); G.strokeStyle = tone(b, 0.2); G.lineWidth = 1.1; G.beginPath(); G.arc(0, 0, 6, 0, 7); G.moveTo(0, -12); G.lineTo(0, 12); G.moveTo(-6, -6); G.lineTo(6, 6); G.stroke(); G.restore();
    // the breastplate: a narrow waist, a ridge, ribs embossed
    const chest = smooth([[98, 78], [158, 78], [164, 104], [150, 134], [106, 134], [92, 104]]); cel(chest, a, { d: 7, bx: [128, 100, 36] });
    brush([[128, 80], [128, 132]], 1.4); for (let k = 0; k < 3; k++) { brush([[108, 98 + k * 9], [124, 104 + k * 9]], 1); brush([[148, 98 + k * 9], [132, 104 + k * 9]], 1); }
    G.save(); G.translate(128, 96); G.strokeStyle = e; G.shadowColor = e; G.shadowBlur = 9; G.lineWidth = 1.4; G.beginPath(); for (let k = 0; k <= 5; k++) { const t = -Math.PI / 2 + k * Math.PI * 4 / 5; k ? G.lineTo(Math.cos(t) * 8, Math.sin(t) * 8) : G.moveTo(Math.cos(t) * 8, Math.sin(t) * 8); } G.stroke(); G.restore();
    // arms: pauldrons stacked like scales, clawed gauntlets; the sword held across the body
    cel(limbP(96, 84, 82, 120, 9, 7), a, { d: 4, bx: [88, 100, 20] }); cel(limbP(82, 120, 100, 146, 7, 6), a, { d: 4 });
    cel(limbP(160, 84, 176, 118, 9, 7), a, { d: 4, bx: [168, 100, 20] }); cel(limbP(176, 118, 160, 146, 7, 6), a, { d: 4 });
    const blade = poly([[64, 214], [70, 208], [204, 66], [212, 62], [208, 72], [74, 220]]); cel(blade, '#c4c8d4', { d: 2, lw: 1.2 }); brush([[72, 212], [206, 68]], 0.8, '#5a5e6a', false);
    cel(poly([[92, 182], [112, 202], [108, 206], [88, 186]]), b, { d: 1.5, lw: 1.1 }); cel(limbP(96, 196, 82, 210, 3, 3, 0), '#3a2a20', { d: 1, lw: 1 });
    for (const [x, y] of [[100, 146], [160, 146]]) { cel(smooth([[x - 8, y - 6], [x + 8, y - 6], [x + 9, y + 6], [x, y + 10], [x - 9, y + 6]]), a, { d: 2, lw: 1.2 }); for (let k = -1; k <= 1; k++) brush([[x + k * 4, y + 6], [x + k * 5, y + 13]], 1.4); }
    for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) cel(smooth([[128 + s * (24 + k * 3), 72 + k * 9], [128 + s * (54 + k * 2), 70 + k * 9], [128 + s * (60 - k), 82 + k * 9], [128 + s * (30 + k * 2), 86 + k * 9]]), a, { d: 3, lw: 1.3 }); cel(poly([[128 + s * 46, 70], [128 + s * 62, 50], [128 + s * 56, 72]]), b, { d: 1.5, lw: 1.1 }); }
    // the gorget and helm: tall, a crest of two back-swept horns, a cross-shaped visor
    cel(smooth([[114, 64], [142, 64], [146, 78], [110, 78]]), a, { d: 3, lw: 1.3 });
    const helm = smooth([[114, 64], [110, 42], [116, 26], [128, 20], [140, 26], [146, 42], [142, 64], [128, 70]]); cel(helm, a, { d: 5, bx: [128, 44, 22] });
    for (const s of [-1, 1]) brush([[128 + s * 10, 28], [128 + s * 22, 12], [128 + s * 34, 6], [128 + s * 30, 14]], 3.2, tone(b, -0.1));
    G.fillStyle = '#05020a'; G.fillRect(115, 40, 26, 4); G.fillRect(126, 40, 4, 18); glow(120, 42, 6, css(hx(e), 1)); glow(136, 42, 6, css(hx(e), 1));
    G.save(); G.globalCompositeOperation = 'lighter'; for (let k = 0; k < 7; k++) { const x = 120 + Math.sin(k * 1.9) * 12, y = 66 + k * 2 - (k % 3) * 10; const gr = G.createRadialGradient(x, y, 0, x, y, 9); gr.addColorStop(0, css(hx(e), 0.35)); gr.addColorStop(1, 'rgba(0,0,0,0)'); G.fillStyle = gr; G.fillRect(x - 9, y - 9, 18, 18); } G.restore();
  },
  // the ox-headed jailer of hell: tall and muscled, horns bound with paper talismans, chains on the wrists, an iron club
  oxhead(a, b, e) {
    G.save(); for (let k = 0; k < 11; k++) { const x = 18 + k * 22, hgt = 60 + Math.sin(k * 1.7) * 30; const gr = G.createLinearGradient(0, 240, 0, 240 - hgt * 2); gr.addColorStop(0, 'rgba(255,90,30,0.45)'); gr.addColorStop(1, 'rgba(255,90,30,0)'); G.fillStyle = gr; G.beginPath(); G.moveTo(x - 14, 244); G.quadraticCurveTo(x + 6, 244 - hgt, x - 2, 244 - hgt * 1.9); G.quadraticCurveTo(x + 18, 244 - hgt, x + 14, 244); G.fill(); } G.restore();
    // the club over the right shoulder
    const club = smooth([[176, 38], [190, 30], [234, 186], [222, 192]]); cel(club, '#3a3a42', { d: 4, bx: [204, 100, 50] }); for (let k = 0; k < 9; k++) { const t = 0.1 + k / 10, x = 183 + t * 46, y = 34 + t * 156; cel(ell(x - 4, y, 2.6, 2.6), '#a8a8b0', { d: 1, lw: 0.8, wash: false }); cel(ell(x + 4, y + 2, 2.6, 2.6), '#a8a8b0', { d: 1, lw: 0.8, wash: false }); }
    // legs: long, the knees bound, hooves
    for (const s of [-1, 1]) {
      cel(limbP(128 + s * 16, 150, 128 + s * 24, 196, 14, 10, 0.18, s), b, { d: 6, bx: [128 + s * 20, 170, 24] });
      cel(limbP(128 + s * 24, 196, 128 + s * 26, 232, 10, 7, 0.22, s), b, { d: 5, bx: [128 + s * 25, 212, 20] });
      cel(smooth([[128 + s * 16, 230], [128 + s * 36, 230], [128 + s * 38, 244], [128 + s * 14, 244]]), '#2a2018', { d: 2, lw: 1.2 }); brush([[128 + s * 26, 232], [128 + s * 26, 244]], 1.2);
      for (let k = 0; k < 3; k++) brush([[128 + s * 16, 192 + k * 4], [128 + s * 32, 194 + k * 4]], 1.2, '#c8b080', false);
    }
    // a hakama of tattered hide at the hips, a rope belt
    cel(smooth([[94, 138], [162, 138], [176, 176], [160, 170], [150, 184], [136, 170], [128, 186], [118, 170], [106, 184], [96, 170], [80, 176]]), '#5a4a3a', { d: 5 }); hatch(smooth([[94, 138], [162, 138], [176, 176], [80, 176]]), 5);
    brush([[94, 140], [128, 146], [162, 140]], 4, '#c8b080', false); brush([[96, 140], [128, 146], [160, 140]], 1, '#7a6040', false);
    // the torso: wide shoulders, a narrow waist, every muscle inked
    const torso = smooth([[86, 76], [170, 76], [176, 98], [160, 120], [154, 142], [102, 142], [96, 120], [80, 98]]); cel(torso, b, { d: 9, bx: [128, 96, 46] });
    brush([[128, 80], [128, 140]], 1.4); brush([[94, 92], [110, 104], [126, 100]], 1.3); brush([[162, 92], [146, 104], [130, 100]], 1.3);
    for (let k = 0; k < 3; k++) { brush([[112, 114 + k * 9], [126, 112 + k * 9]], 1.1); brush([[144, 114 + k * 9], [130, 112 + k * 9]], 1.1); }
    brush([[100, 120], [106, 138]], 1.1); brush([[156, 120], [150, 138]], 1.1);
    for (let k = 0; k < 11; k++) { const t = k / 10; cel(ell(96 + t * 64, 80 + Math.sin(t * Math.PI) * 30, 3.3, 3.3), '#4a2a22', { d: 1, lw: 0.8, wash: false }); }
    // arms: the left hangs with a broken chain, the right grips the club
    cel(limbP(86, 82, 70, 124, 12, 9, 0.25, -1), b, { d: 6, bx: [78, 100, 22] }); cel(limbP(70, 124, 66, 162, 9, 7, 0.2), b, { d: 5 }); cel(smooth([[58, 160], [74, 160], [78, 174], [70, 184], [58, 178]]), b, { d: 3, lw: 1.3 });
    for (let k = 0; k < 4; k++) cel(ell(66 - k * 3, 186 + k * 9, 4, 5), '#6a6a72', { d: 1.5, lw: 1, wash: false });
    cel(limbP(170, 82, 190, 70, 12, 9, 0.25), b, { d: 6 }); cel(limbP(190, 70, 196, 42, 9, 8, 0.2), b, { d: 5 }); cel(ell(194, 40, 9, 8), b, { d: 3, lw: 1.3 });
    for (const [x, y] of [[66, 150], [192, 56]]) { cel(poly([[x - 8, y - 3], [x + 8, y - 3], [x + 8, y + 3], [x - 8, y + 3]]), '#5a5a62', { d: 1, lw: 1, wash: false }); }
    // the head: a long ox snout, a nose ring, horns bound with paper talismans
    for (const s of [-1, 1]) {
      const horn = smooth([[128 + s * 18, 44], [128 + s * 40, 34], [128 + s * 62, 14], [128 + s * 72, 4], [128 + s * 66, 22], [128 + s * 46, 46], [128 + s * 24, 54]]); cel(horn, '#e2d6b8', { d: 3, lw: 1.3 });
      for (let k = 0; k < 3; k++) brush([[128 + s * (34 + k * 9), 34 - k * 6], [128 + s * (36 + k * 9), 44 - k * 7]], 0.9, '#8a7a5a', false);
      cel(poly([[128 + s * 50, 22], [128 + s * 58, 18], [128 + s * 64, 44], [128 + s * 56, 48]]), '#efe6d0', { d: 1, lw: 0.9, wash: false }); brush([[128 + s * 57, 26], [128 + s * 59, 42]], 1, '#a82a1a', false);
      cel(smooth([[128 + s * 20, 54], [128 + s * 36, 48], [128 + s * 34, 60]]), a, { d: 2, lw: 1.1 });
    }
    const head = smooth([[110, 40], [128, 32], [146, 40], [150, 58], [144, 74], [136, 92], [120, 92], [112, 74], [106, 58]]); cel(head, a, { d: 6, bx: [128, 56, 22] });
    cel(smooth([[114, 72], [142, 72], [144, 86], [128, 96], [112, 86]]), '#b8907a', { d: 3, lw: 1.3 });
    for (const s of [-1, 1]) { G.fillStyle = INK; G.beginPath(); G.ellipse(128 + s * 7, 84, 2.6, 3.6, s * 0.3, 0, 7); G.fill(); }
    G.save(); G.strokeStyle = '#d8b040'; G.lineWidth = 2.2; G.beginPath(); G.arc(128, 90, 6, 0.3, Math.PI - 0.3); G.stroke(); G.restore();
    eyeSlit(117, 58, 6, 3, e, 0.35); eyeSlit(139, 58, 6, 3, e, -0.35); brush([[108, 52], [123, 56]], 2); brush([[148, 52], [133, 56]], 2);
    brush([[124, 40], [128, 52], [132, 40]], 0.9);
  },
  // a tall moth-woman: furred collar, a dress that becomes a segmented abdomen, wings like old curtains, a lantern
  lampmoth(a, b, e) {
    for (const s of [-1, 1]) {
      const W1 = smooth([[128 + s * 12, 70], [128 + s * 48, 24], [128 + s * 104, 14], [128 + s * 120, 50], [128 + s * 106, 98], [128 + s * 60, 112], [128 + s * 22, 98]]);
      const W2 = smooth([[128 + s * 16, 104], [128 + s * 70, 116], [128 + s * 104, 158], [128 + s * 92, 206], [128 + s * 54, 196], [128 + s * 24, 150]]);
      cel(W2, b, { d: 6, bx: [128 + s * 64, 150, 40] }); cel(W1, b, { d: 7, bx: [128 + s * 70, 56, 46] });
      for (const [W, cx, cy, r] of [[W1, 128 + s * 80, 56, 16], [W2, 128 + s * 66, 160, 12]]) { G.save(); G.clip(W); for (let k = 0; k < 5; k++) brush([[128 + s * 20, cy - 10 + k * 8], [cx, cy - 20 + k * 10], [128 + s * 118, cy - 30 + k * 16]], 0.9, tone(b, -0.45), false); G.restore(); cel(ell(cx, cy, r, r * 0.8), a, { d: 3, lw: 1.1 }); cel(ell(cx, cy, r * 0.52, r * 0.42), '#e8d6a4', { d: 1.5, lw: 0.9, wash: false }); G.fillStyle = INK; G.beginPath(); G.arc(cx + s, cy, r * 0.2, 0, 7); G.fill(); }
      brush([[128 + s * 4, 36], [128 + s * 16, 14], [128 + s * 30, 6]], 1.2); for (let k = 0; k < 5; k++) brush([[128 + s * (8 + k * 4), 30 - k * 5], [128 + s * (12 + k * 4), 24 - k * 5]], 0.8);
    }
    // the abdomen-dress: segments tapering to a point above the ground
    const dress = smooth([[112, 110], [144, 110], [150, 150], [146, 190], [136, 220], [128, 238], [120, 220], [110, 190], [106, 150]]); cel(dress, a, { d: 7, bx: [128, 150, 40] });
    for (let k = 0; k < 7; k++) brush([[110 + k * 0.6, 126 + k * 15], [128, 130 + k * 15], [146 - k * 0.6, 126 + k * 15]], 1, INK, false);
    // the body and the fur collar
    cel(smooth([[116, 74], [140, 74], [146, 96], [142, 114], [114, 114], [110, 96]]), SKIN, { d: 4, bx: [128, 92, 20] });
    cel(smooth([[100, 72], [116, 64], [128, 70], [140, 64], [156, 72], [154, 86], [140, 92], [128, 86], [116, 92], [102, 86]]), '#d8ccb4', { d: 4, lw: 1.3 }); for (let k = 0; k < 12; k++) brush([[102 + k * 4.6, 78], [104 + k * 4.6, 90]], 0.8, '#8a7e68');
    // long arms: one raised to the lips, one letting a lantern hang from three fingers
    cel(limbP(114, 84, 96, 116, 4.5, 3.5, 0.2), SKIN, { d: 2, lw: 1.2 }); cel(limbP(96, 116, 74, 140, 3.5, 3, 0.15), SKIN, { d: 2, lw: 1.2 });
    for (let k = 0; k < 3; k++) brush([[74, 140], [68 - k * 2, 150 + k * 1.5]], 1.2, SKIN); brush([[66, 150], [66, 166]], 0.9);
    cel(smooth([[58, 166], [74, 166], [78, 186], [66, 196], [54, 186]]), '#2a2018', { d: 2, lw: 1.1 }); glow(66, 182, 36, css(hx(e), 0.95)); cel(ell(66, 181, 3.5, 6), '#fffbe0', { d: 0, lw: 0.8, wash: false, nolight: true });
    cel(limbP(142, 84, 158, 108, 4.5, 3.5, 0.2), SKIN, { d: 2, lw: 1.2 }); cel(limbP(158, 108, 140, 66, 3.5, 3, 0.15), SKIN, { d: 2, lw: 1.2 });
    // the head: a pale mask of a face, eyes wholly black with a white pupil, hair pinned up in a crest
    cel(smooth([[118, 50], [122, 38], [128, 34], [134, 38], [138, 50], [134, 62], [128, 66], [122, 62]]), '#eee2d4', { d: 3, lw: 1.3, bx: [128, 48, 14] });
    cel(smooth([[116, 50], [114, 32], [122, 22], [134, 20], [144, 30], [142, 50], [138, 40], [128, 34], [120, 40]]), '#1e1824', { d: 3, lw: 1.3 });
    for (const s of [-1, 1]) { G.fillStyle = '#060408'; G.beginPath(); G.ellipse(128 + s * 5, 50, 3.6, 2.6, s * -0.2, 0, 7); G.fill(); G.fillStyle = '#ffffff'; G.beginPath(); G.arc(128 + s * 5, 50, 0.9, 0, 7); G.fill(); }
    brush([[125, 60], [131, 60]], 1, '#7a2a3a'); brush([[124, 42], [126, 46]], 0.7); brush([[132, 42], [130, 46]], 0.7);
    for (let k = 0; k < 6; k++) { const x = 40 + ((k * 53) % 180), y = 30 + ((k * 37) % 190); glow(x, y, 3, css(hx(e), 0.7), 0.6); }
  },
  // a gaunt skeleton priest: a mitre crowned with candles, robes to the ground, a soul caged in the lantern on its staff
  lantern(a, b, e) {
    brush([[192, 30], [186, 240]], 4, '#4a3424', false); brush([[192, 30], [186, 240]], 1.4, '#7a5a3a', false);
    brush([[192, 30], [176, 28], [170, 40]], 2.4, '#7a6a5a', false);
    cel(smooth([[160, 40], [180, 40], [184, 66], [170, 76], [156, 66]]), '#3a2a20', { d: 3, lw: 1.2 }); glow(170, 58, 40, css(hx(e), 0.95));
    G.save(); G.globalAlpha = 0.9; cel(smooth([[164, 52], [170, 46], [176, 52], [174, 64], [170, 70], [166, 64]]), '#e8fff2', { d: 0, lw: 0.8, wash: false, nolight: true }); G.restore();
    G.fillStyle = INK; G.fillRect(167, 54, 1.5, 1.5); G.fillRect(172, 54, 1.5, 1.5);
    for (const x of [160, 166, 174, 180]) brush([[x, 42], [x, 66]], 0.8);
    // robes: long, heavy, the hem rotted to strips; a stole embroidered with eyes
    const robe = smooth([[106, 70], [150, 70], [160, 120], [170, 180], [182, 238], [166, 232], [156, 246], [142, 232], [128, 248], [116, 232], [100, 246], [90, 232], [74, 238], [86, 180], [96, 120]]);
    cel(robe, a, { d: 10, bx: [128, 140, 70] }); hatch(robe, 4.5); for (const x of [102, 120, 140, 156]) brush([[x, 96], [x - 4 + (x - 128) * 0.15, 170], [x - 6 + (x - 128) * 0.3, 236]], 1, 'rgba(10,0,10,0.55)');
    for (const s of [-1, 1]) { const st = smooth([[128 + s * 6, 74], [128 + s * 16, 74], [128 + s * 18, 210], [128 + s * 8, 214]]); cel(st, b, { d: 2, lw: 1.1 }); for (let k = 0; k < 5; k++) { const y = 96 + k * 24; cel(ell(128 + s * 12, y, 3.5, 2.2), '#e8d8a0', { d: 1, lw: 0.7, wash: false }); G.fillStyle = INK; G.beginPath(); G.arc(128 + s * 12, y, 1, 0, 7); G.fill(); } }
    // the open breast: ribs and spine in the dark
    cel(smooth([[116, 80], [140, 80], [142, 118], [114, 118]]), '#0e080e', { d: 0, lw: 1.2, nolight: true, wash: false });
    for (let k = 0; k < 4; k++) brush([[117, 86 + k * 8], [128, 82 + k * 8], [139, 86 + k * 8]], 2, '#e2d8c0', false); brush([[128, 80], [128, 118]], 2.2, '#e2d8c0', false);
    // arms: bone forearms out of wide sleeves; one reaching toward you
    cel(smooth([[106, 78], [86, 98], [74, 126], [92, 132], [102, 110]]), a, { d: 5, lw: 1.3 });
    brush([[80, 128], [70, 146], [60, 154]], 2.4, '#e2d8c0'); for (let k = 0; k < 4; k++) brush([[60, 154], [48 + k * 4, 162 + k * 1.5], [44 + k * 5, 170]], 1.4, '#e2d8c0');
    cel(smooth([[150, 78], [170, 92], [184, 70], [190, 80], [176, 108], [156, 104]]), a, { d: 5, lw: 1.3 }); brush([[184, 74], [192, 66]], 2.2, '#e2d8c0');
    // the skull under a tall mitre with three candles; wax running down
    cel(smooth([[116, 50], [118, 38], [128, 34], [138, 38], [140, 50], [136, 62], [128, 68], [120, 62]]), '#e2d8c0', { d: 3, lw: 1.3, bx: [128, 48, 14] });
    G.fillStyle = INK; for (const s of [-1, 1]) { G.beginPath(); G.ellipse(128 + s * 5.5, 50, 4, 4.6, 0, 0, 7); G.fill(); glow(128 + s * 5.5, 51, 5, css(hx(e), 1)); }
    G.beginPath(); G.moveTo(128, 56); G.lineTo(125.5, 60); G.lineTo(130.5, 60); G.fill(); for (let k = -2; k <= 2; k++) brush([[128 + k * 2.6, 63], [128 + k * 2.6, 67]], 0.9);
    const mitre = smooth([[114, 40], [116, 14], [128, 4], [140, 14], [142, 40], [128, 36]]); cel(mitre, b, { d: 3, lw: 1.3 }); brush([[128, 6], [128, 36]], 1, '#e8d8a0', false); brush([[118, 30], [138, 30]], 1, '#e8d8a0', false);
    for (const [x, y] of [[118, 12], [128, 2], [138, 12]]) { cel(poly([[x - 2.2, y], [x + 2.2, y], [x + 2.2, y - 12], [x - 2.2, y - 12]]), '#efe6cc', { d: 1, lw: 0.8 }); glow(x, y - 16, 9, 'rgba(255,190,90,0.95)'); }
    brush([[121, 40], [119, 52], [120, 58]], 1.6, '#efe6cc', false);
  },
  // a black ooze: a skull dissolving inside, eyes on stalks, a ragged mouth full of needles
  ooze(a, b, e) {
    const body = smooth([[34, 238], [30, 196], [52, 148], [88, 116], [128, 104], [170, 114], [204, 146], [224, 196], [222, 238], [190, 244], [154, 236], [120, 246], [80, 236]]);
    for (const [x0, y0, x1, y1, s] of [[92, 124, 64, 60, 1], [124, 108, 130, 38, 0], [162, 118, 196, 66, -1], [184, 136, 222, 112, -1]]) {
      brush([[x0, y0], [(x0 + x1) / 2 - s * 10, (y0 + y1) / 2], [x1, y1]], 7, INK, false); brush([[x0, y0], [(x0 + x1) / 2 - s * 10, (y0 + y1) / 2], [x1, y1]], 4.6, tone(a, 0.15), false);
      cel(ell(x1, y1, 9, 8), '#e6dcc2', { d: 2, lw: 1.2, wash: false }); eyeSlit(x1, y1, 6.5, 4, e, s * 0.2);
    }
    cel(body, a, { d: 12, bx: [110, 160, 90] });
    G.save(); G.clip(body); G.globalAlpha = 0.45;
    cel(smooth([[100, 164], [106, 142], [128, 134], [150, 142], [156, 164], [148, 186], [138, 198], [118, 198], [106, 186]]), '#d4cbac', { d: 3, lw: 1.3, wash: false });
    G.fillStyle = INK; G.beginPath(); G.ellipse(117, 166, 7, 8, 0, 0, 7); G.ellipse(139, 166, 7, 8, 0, 0, 7); G.fill(); G.beginPath(); G.moveTo(128, 176); G.lineTo(124, 184); G.lineTo(132, 184); G.fill();
    for (let k = 0; k < 4; k++) brush([[92, 204 + k * 8], [128, 198 + k * 8], [164, 204 + k * 8]], 2, '#d4cbac', false);
    G.restore();
    for (let k = 0; k < 9; k++) { const x = 46 + k * 20, y = 236 + Math.sin(k * 1.3) * 4, l = 8 + (k % 3) * 6; cel(smooth([[x - 4, y - 4], [x + 4, y - 4], [x + 2.5, y + l * 0.6], [x, y + l], [x - 2.5, y + l * 0.6]]), a, { d: 2, lw: 1 }); }
    const m = smooth([[80, 214], [128, 204], [176, 214], [154, 228], [128, 232], [102, 228]]); G.fillStyle = '#1c060c'; G.fill(m); teeth(84, 213, 172, 213, 13, 8); teeth(98, 228, 158, 228, 10, -7); G.lineWidth = 1.4; G.strokeStyle = INK; G.stroke(m);
    for (const [x, y, r] of [[62, 176, 6], [190, 186, 5], [170, 144, 4], [84, 196, 3], [146, 128, 3]]) { G.save(); G.strokeStyle = tone(b, 0.25); G.lineWidth = 1.1; G.beginPath(); G.arc(x, y, r, 0, 7); G.stroke(); G.fillStyle = 'rgba(255,255,255,0.85)'; G.fillRect(x - r * 0.5, y - r * 0.5, 1.4, 1.4); G.restore(); }
    brush([[52, 156], [70, 132], [98, 118]], 2.6, tone(b, 0.4));
  },
  // a treasure chest that is a mouth: teeth on both lips, a long tongue, eyes in the dark under the lid, crab legs
  mimic(a, b, e) {
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { brush([[128 + s * (44 + k * 16), 214], [128 + s * (66 + k * 16), 214 - 10 + k * 3], [128 + s * (70 + k * 18), 244]], 3.4, INK); }
    G.fillStyle = '#12040a'; G.fill(smooth([[62, 158], [128, 104], [194, 158], [128, 174]]));
    for (let k = 0; k < 2; k++) eyeSlit(104 + k * 48, 130, 7, 3.6, e, k ? -0.15 : 0.15);
    const tongue = smooth([[112, 162], [128, 150], [144, 162], [170, 196], [186, 228], [176, 236], [164, 212], [150, 198], [130, 204], [110, 196], [96, 204], [88, 186]]); cel(tongue, '#b0364a', { d: 4, lw: 1.3 }); brush([[128, 156], [134, 186], [164, 222]], 1.2, '#5a1424');
    const box = poly([[60, 158], [196, 158], [192, 226], [64, 226]]); cel(box, a, { d: 9, bx: [128, 190, 60] });
    for (let k = 0; k < 6; k++) brush([[64, 168 + k * 10], [192, 168 + k * 10]], 0.8, 'rgba(20,8,0,0.5)', false);
    const lid = smooth([[62, 112], [70, 72], [128, 56], [186, 72], [194, 112], [128, 104]]); cel(lid, a, { d: 8, bx: [128, 80, 60] });
    for (const y of [158, 226]) cel(poly([[58, y - 3], [198, y - 3], [198, y + 3], [58, y + 3]]), b, { d: 1, lw: 1.1, wash: false });
    for (const x of [72, 128, 184]) cel(poly([[x - 4, 158], [x + 4, 158], [x + 4, 226], [x - 4, 226]]), b, { d: 1, lw: 1, wash: false });
    for (const x of [72, 128, 184]) cel(poly([[x - 4, 70 + Math.abs(x - 128) * 0.12], [x + 4, 70 + Math.abs(x - 128) * 0.12], [x + 4, 108], [x - 4, 108]]), b, { d: 1, lw: 1, wash: false });
    cel(poly([[120, 176], [136, 176], [136, 194], [120, 194]]), '#d8b040', { d: 2, lw: 1.1 }); G.fillStyle = INK; G.beginPath(); G.arc(128, 184, 2.4, 0, 7); G.fill(); G.fillRect(127, 184, 2, 6);
    teeth(66, 158, 190, 158, 15, -11); teeth(68, 110, 188, 110, 15, 12);
    for (const [x, y] of [[44, 238], [58, 244], [200, 240], [214, 234], [184, 246], [30, 244]]) cel(ell(x, y, 6, 3), '#d8a838', { d: 1.5, lw: 0.9, wash: false });
  },
};

// plates that need room: [shift x, shift y, scale about the feet]
const FIT = { lantern: [0, 0, 0.9], hollowmail: [0, 0, 0.95] };
// a demon's plate as a 256×256 canvas. art = [plate, main colour, second colour, accent colour]
export function plate(art, bare = false) {
  const key = (bare ? 'b:' : 'g:') + art.join();
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 256; G = c.getContext('2d');
  ground(art[3], bare);
  const fit = FIT[art[0]];
  G.save(); if (fit) { G.translate(128, 244); G.scale(fit[2], fit[2]); G.translate(-128 + fit[0], -244 + fit[1]); }
  (P[art[0]] || P.ooze)(art[1], art[2], art[3]);
  G.restore();
  grain([...key].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 2147483647, 7) || 7, bare);
  cache.set(key, c); return c;
}
export const PLATES = Object.keys(P);
