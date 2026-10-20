// DEMON COVENANT — the rest of the bestiary, in the grimoire style of js/grimoire.js. Most demons are people of a kind,
// so one figure builder draws them all from a description (build, head, outfit, wings, horns, weapon …); the rest are
// beasts, birds, serpents, dragons and stranger things with plates of their own.
import { P, FIT, G as _G, cel, brush, smooth, poly, ell, limbP, glow, eyeSlit, teeth, hatch, tone, css, hx, INK, SKIN } from './grimoire.js?v=7';
import * as GR from './grimoire.js?v=7';
const g = () => GR.G;
void _G;
const S2 = [-1, 1];
const X = (dx) => 128 + dx;
// ---------------------------------------------------------------- bits shared by many plates
const darker = (h, f) => '#' + hx(h).map((v) => Math.max(0, Math.round(v * (1 - f))).toString(16).padStart(2, '0')).join('');
function featherWing(s, x0, y0, span, lift, col, rows = 3) {
  for (let r = rows - 1; r >= 0; r--) {
    const k = 1 - r * 0.22, pts = [[x0, y0 + r * 10]];
    for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([x0 + s * span * k * (0.3 + t * 0.7), y0 - lift * k * Math.sin(t * Math.PI * 0.85) + r * 16 + t * 30 * (1 - k * 0.6)]); }
    for (let i = 6; i >= 0; i--) { const t = i / 6; pts.push([x0 + s * span * k * (0.25 + t * 0.72) - s * 4, y0 + r * 16 + 26 + t * 34 + (i % 2) * 8]); }
    const p = smooth(pts); cel(p, r ? darker(col, 0.12 * r) : col, { d: 5, lw: 1.2 });
    for (let i = 1; i < 6; i++) { const t = i / 6; brush([[x0 + s * span * k * (0.3 + t * 0.7) - s * 2, y0 - lift * k * Math.sin(t * Math.PI * 0.85) + r * 16 + t * 30 * (1 - k * 0.6) + 6], [x0 + s * span * k * (0.25 + t * 0.72) - s * 4, y0 + r * 16 + 22 + t * 34]], 0.8, 'rgba(20,10,20,0.45)', false); }
  }
}
function batWing(s, x0, y0, span, col, bone) {
  const tips = [[x0 + s * span, y0 - 50], [x0 + s * span * 1.05, y0 + 10], [x0 + s * span * 0.85, y0 + 66]], el = [x0 + s * span * 0.45, y0 - 30];
  cel(smooth([[x0, y0 + 6], el, tips[0], [x0 + s * span * 0.8, y0 - 8], tips[1], [x0 + s * span * 0.78, y0 + 40], tips[2], [x0 + s * span * 0.5, y0 + 50], [x0 + s * span * 0.25, y0 + 64]]), col, { d: 7, lw: 1.2 });
  brush([[x0, y0], el], 3.2, bone); for (const t of tips) brush([el, t], 2, bone);
  brush([[el[0], el[1] - 2], [el[0] - s * 4, el[1] - 12]], 2.4, bone);
}
function mothWing(s, x0, y0, span, col, spot) {
  const W1 = smooth([[x0, y0], [x0 + s * span * 0.4, y0 - 46], [x0 + s * span, y0 - 54], [x0 + s * span * 1.1, y0 - 16], [x0 + s * span * 0.9, y0 + 24], [x0 + s * span * 0.45, y0 + 32]]);
  const W2 = smooth([[x0, y0 + 26], [x0 + s * span * 0.6, y0 + 36], [x0 + s * span * 0.8, y0 + 76], [x0 + s * span * 0.5, y0 + 96], [x0 + s * span * 0.2, y0 + 70]]);
  cel(W2, col, { d: 6, lw: 1.2 }); cel(W1, col, { d: 7, lw: 1.2 });
  for (const [cx, cy, r] of [[x0 + s * span * 0.7, y0 - 14, 12], [x0 + s * span * 0.5, y0 + 62, 9]]) { cel(ell(cx, cy, r, r * 0.8), spot, { d: 2, lw: 1 }); cel(ell(cx, cy, r * 0.5, r * 0.4), '#ecdcae', { d: 1, lw: 0.8, wash: false }); g().fillStyle = INK; g().beginPath(); g().arc(cx, cy, r * 0.2, 0, 7); g().fill(); }
}
function flameTongue(x, y, w, h, col) { cel(smooth([[x - w, y], [x - w * 0.6, y - h * 0.5], [x - w * 0.2, y - h * 0.4], [x, y - h], [x + w * 0.3, y - h * 0.45], [x + w * 0.7, y - h * 0.6], [x + w, y]]), col, { d: 3, lw: 1, nolight: true, wash: false }); }
function hornPair(cx, cy, type, col, size = 1) {
  for (const s of S2) {
    let pts;
    if (type === 'curl') pts = [[cx + s * 6, cy], [cx + s * 22, cy - 10], [cx + s * 32, cy + 4], [cx + s * 26, cy + 18], [cx + s * 18, cy + 12], [cx + s * 22, cy + 4], [cx + s * 14, cy + 4]];
    else if (type === 'antler') { brush([[cx + s * 6, cy], [cx + s * 16, cy - 16], [cx + s * 22, cy - 34]], 3 * size, col); brush([[cx + s * 14, cy - 12], [cx + s * 26, cy - 18]], 2.2 * size, col); brush([[cx + s * 19, cy - 26], [cx + s * 30, cy - 34]], 2 * size, col); continue; }
    else if (type === 'oni') pts = [[cx + s * 4, cy], [cx + s * 8, cy - 18 * size], [cx + s * 12, cy]];
    else pts = [[cx + s * 6, cy + 2], [cx + s * 20, cy - 12 * size], [cx + s * 30, cy - 34 * size], [cx + s * 24, cy - 10 * size], [cx + s * 14, cy + 4]];
    cel(smooth(pts.map(([x, y]) => [cx + (x - cx) * size, cy + (y - cy) * size])), col, { d: 2, lw: 1.1 });
    if (type !== 'oni') for (let k = 1; k < 4; k++) brush([[cx + s * (8 + k * 5) * size, cy - k * 4 * size], [cx + s * (10 + k * 5) * size, cy - k * 4 * size + 5]], 0.7, 'rgba(20,10,10,0.6)', false);
  }
}
function halo(cx, cy, r, col) { const G = g(); G.save(); G.strokeStyle = col; G.shadowColor = col; G.shadowBlur = 12; G.lineWidth = 2.2; G.beginPath(); G.ellipse(cx, cy, r, r * 0.3, 0, 0, 7); G.stroke(); G.lineWidth = 0.8; G.beginPath(); G.ellipse(cx, cy, r + 4, r * 0.3 + 2, 0, 0, 7); G.stroke(); G.restore(); }
const hex = (c) => (c && c[0] === '#' ? c : '#888888');

// ---------------------------------------------------------------- the figure builder
// o: build ('slim' | 'normal' | 'heavy'), skin, head ('human' | 'mask' | 'helm' | 'skull' | 'hood' | 'crow' | 'dog' | 'goat' | 'moth' | 'ghoul' | 'wrap' | 'lantern' | 'ice'),
//    face ('f' | 'm'), hair {style, col}, outfit {type, col, col2}, lower ('legs' | 'serpent' | 'fish'), wings {type, col}, horns {type, col},
//    halo, cape, tail, weapon {type, col}, left ('relaxed' | 'gesture' | 'hip' | 'orb'), fangs, crown, hood
function figure(o, e) {
  const G = g(), b = { slim: { sw: 17, ww: 9.5, hw: 12.5, au: 5.2, af: 4.1, lt: 8, lc: 5.8 }, normal: { sw: 21, ww: 12.5, hw: 14.5, au: 6.6, af: 5.2, lt: 9.5, lc: 6.8 }, heavy: { sw: 30, ww: 21, hw: 19, au: 10, af: 8, lt: 12, lc: 9 } }[o.build || 'normal'];
  const skin = o.skin || SKIN, out = o.outfit || { type: 'robe', col: '#4a3a5a', col2: '#c8a040' }, hyC = 52, sy = 82, wy = 128, py = 146, ky = 194, ay = 236;
  const lower = o.lower || 'legs', armCol = ['robe', 'armor', 'coat', 'suit', 'wrap'].includes(out.type) ? out.col : skin;
  const handCol = out.type === 'armor' ? out.col2 || out.col : out.type === 'wrap' ? out.col : skin;
  const wep = o.weapon && o.weapon.type, R = [X(b.sw + 9), wep ? 136 : 150], left = o.left || 'relaxed';
  const L = left === 'gesture' ? [X(-b.sw - 22), 96] : left === 'hip' ? [X(-b.ww - 6), 130] : left === 'orb' ? [X(-b.sw - 16), 112] : [X(-b.sw - 8), 150];
  const LE = left === 'gesture' ? [X(-b.sw - 14), 112] : left === 'hip' ? [X(-b.sw - 16), 110] : left === 'orb' ? [X(-b.sw - 16), 104] : [X(-b.sw - 6), 116];
  const RE = [X(b.sw + 7), 114];
  // ---- behind everything: wings, cape, tail, the long part of a weapon
  if (o.wings) {
    const w = o.wings, c = hex(w.col || '#e8e8f0');
    if (w.type === 'bat') for (const s of S2) batWing(s, X(s * b.sw * 0.6), 96, 96, c, tone(c, -0.35));
    else if (w.type === 'moth') for (const s of S2) mothWing(s, X(s * 6), 92, 100, c, w.spot || '#3a2a30');
    else if (w.type === 'six') { for (const [lift, y0, span] of [[40, 70, 96], [30, 104, 104], [16, 140, 84]]) for (const s of S2) featherWing(s, X(s * 10), y0, span, lift, c, 2); }
    else if (w.type === 'small') for (const s of S2) { cel(smooth([[X(s * 4), 100], [X(s * 40), 54], [X(s * 66), 58], [X(s * 50), 96], [X(s * 12), 108]]), c, { d: 3, lw: 1, air: false }); cel(smooth([[X(s * 4), 108], [X(s * 40), 120], [X(s * 46), 146], [X(s * 18), 130]]), c, { d: 2, lw: 1 }); brush([[X(s * 6), 102], [X(s * 56), 62]], 0.7, 'rgba(255,255,255,0.6)', false); }
    else for (const s of S2) featherWing(s, X(s * 12), 86, 100, 60, c, 3);
  }
  if (o.cape) { const c = smooth([[X(-b.sw), sy - 4], [X(b.sw), sy - 4], [X(b.sw + 22), 200], [X(b.sw + 28), 244], [X(0), 238], [X(-b.sw - 28), 244], [X(-b.sw - 22), 200]]); cel(c, o.cape, { d: 9 }); hatch(c, 4.5); }
  if (o.tail === 'devil') { brush([[X(10), 160], [X(46), 200], [X(70), 190], [X(80), 160]], 3.2, INK); brush([[X(10), 160], [X(46), 200], [X(70), 190], [X(80), 160]], 1.8, hex(out.col)); cel(poly([[X(74), 150], [X(88), 158], [X(80), 168]]), out.col, { d: 1, lw: 1 }); }
  if (o.tail === 'fox') for (let k = 0; k < (o.tails || 1); k++) { const a = -0.9 + k * (1.8 / Math.max(1, (o.tails || 1) - 1)); cel(smooth([[X(0), 170], [X(Math.sin(a) * 50 + 10), 150 - Math.cos(a) * 40], [X(Math.sin(a) * 86), 120 - Math.cos(a) * 70], [X(Math.sin(a) * 70 - 6), 160 - Math.cos(a) * 30]]), o.tailCol || out.col, { d: 4, lw: 1.1 }); }
  const longWep = wep && ['spear', 'staff', 'scythe', 'trident'].includes(wep);
  if (longWep) { const wc = hex(o.weapon.col || '#5a4030'); brush([[R[0], 26], [R[0], 242]], 4.2, INK, false); brush([[R[0], 26], [R[0], 242]], 2.4, wc, false);
    if (wep === 'spear') cel(poly([[R[0] - 5, 34], [R[0], 6], [R[0] + 5, 34], [R[0], 40]]), '#c8ccd8', { d: 2, lw: 1.1 });
    if (wep === 'trident') for (const dx of [-8, 0, 8]) cel(poly([[R[0] + dx - 2.5, 34], [R[0] + dx, dx ? 14 : 6], [R[0] + dx + 2.5, 34]]), '#d8c070', { d: 1, lw: 1 });
    if (wep === 'staff') { cel(ell(R[0], 24, 8, 8), '#2a2030', { d: 2, lw: 1.1 }); glow(R[0], 24, 24, css(hx(e), 0.9)); }
    if (wep === 'scythe') { cel(smooth([[R[0], 30], [R[0] - 30, 22], [R[0] - 62, 38], [R[0] - 70, 56], [R[0] - 50, 38], [R[0] - 26, 34], [R[0], 40]]), '#c8ccd4', { d: 2, lw: 1.1 }); }
  }
  // ---- legs (or a serpent's coils, or a fish's tail)
  if (lower === 'serpent' || lower === 'fish') {
    const c = hex(o.lowerCol || out.col);
    const tail = lower === 'serpent' ? [[X(0), wy], [X(26), 170], [X(-30), 206], [X(10), 234], [X(64), 226], [X(96), 196], [X(86), 176]] : [[X(0), wy], [X(14), 180], [X(-10), 216], [X(24), 236]];
    for (let k = 0; k < 2; k++) brush(tail, (k ? 30 : 34) - (lower === 'fish' ? 6 : 0), k ? c : INK);
    brush(tail.map(([x, y]) => [x - 3, y - 2]), 8, tone(c, 0.3), true);
    for (let i = 0; i < 12; i++) { const t = i / 12, k = t * (tail.length - 1), j = Math.min(tail.length - 2, Math.floor(k)), f = k - j, x = tail[j][0] + (tail[j + 1][0] - tail[j][0]) * f, y = tail[j][1] + (tail[j + 1][1] - tail[j][1]) * f; G.strokeStyle = 'rgba(20,10,20,0.5)'; G.lineWidth = 0.9; G.beginPath(); G.arc(x, y, 7, 0.3, Math.PI - 0.3); G.stroke(); }
    if (lower === 'fish') cel(smooth([[X(20), 230], [X(56), 206], [X(50), 236], [X(64), 250], [X(22), 244]]), c, { d: 3, lw: 1.1 });
  } else if (!['robe', 'dress'].includes(out.type)) {
    const lc = out.type === 'loin' || out.type === 'bare' ? skin : out.type === 'armor' ? out.col : out.type === 'coat' ? out.col2 || '#2a2028' : out.col;
    for (const s of S2) {
      cel(limbP(X(s * b.hw * 0.62), py - 4, X(s * (b.hw * 0.7 + 2)), ky, b.lt, b.lc + 1, 0.16, s), lc, { d: 4, bx: [X(s * b.hw * 0.65), 168, 22] });
      cel(limbP(X(s * (b.hw * 0.7 + 2)), ky, X(s * (b.hw * 0.75 + 4)), ay, b.lc + 1, b.lc * 0.8, 0.2, s), lc, { d: 4 });
      const bc = out.type === 'armor' ? out.col2 || out.col : out.type === 'loin' || out.type === 'bare' ? tone(skin, -0.1) && skin : '#2a2024';
      cel(smooth([[X(s * (b.hw * 0.75 - 2)), ay - 4], [X(s * (b.hw * 0.75 + 10)), ay - 2], [X(s * (b.hw * 0.75 + 14)), 244], [X(s * (b.hw * 0.75 - 4)), 244]]), out.type === 'loin' || out.type === 'bare' ? skin : bc, { d: 2, lw: 1.1 });
      if (out.type === 'armor') cel(ell(X(s * (b.hw * 0.7 + 2)), ky, b.lc + 2, 6), out.col2 || out.col, { d: 2, lw: 1 });
    }
  }
  // ---- the lower half of the clothes
  const flare = out.type === 'robe' ? 24 : 30;
  if (out.type === 'robe' || out.type === 'dress') {
    const top = out.type === 'robe' ? sy - 2 : wy - 4, wTop = out.type === 'robe' ? b.sw + 2 : b.ww + 3;
    const hem = []; for (let k = 0; k <= 8; k++) hem.push([X(-b.sw - flare + k * (2 * (b.sw + flare) / 8)), 244 - (o.tatter && k % 2 ? 10 : 0)]);
    const body = smooth([[X(-wTop), top], [X(wTop), top], [X(b.sw + 8), 170], ...hem.reverse(), [X(-b.sw - 8), 170]]);
    cel(body, out.col, { d: 9, bx: [128, 180, 60] }); if (o.dark !== false) hatch(body, 5, 0.9, 'rgba(20,10,24,0.28)');
    for (const dx of [-0.6, -0.2, 0.25, 0.65]) brush([[X(dx * b.sw), wy], [X(dx * (b.sw + 8)), 190], [X(dx * (b.sw + flare)), 240]], 1, 'rgba(14,6,16,0.55)');
    if (out.col2) { cel(smooth([[X(-b.ww - 3), wy - 4], [X(b.ww + 3), wy - 4], [X(b.ww + 3), wy + 5], [X(-b.ww - 3), wy + 5]]), out.col2, { d: 2, lw: 1.1 }); if (out.type === 'robe') cel(smooth([[X(-4), wy + 4], [X(4), wy + 4], [X(5), 210], [X(0), 216], [X(-5), 210]]), out.col2, { d: 2, lw: 1 }); }
  } else if (out.type === 'loin' || out.type === 'bare') {
    cel(smooth([[X(-b.hw - 4), py - 8], [X(b.hw + 4), py - 8], [X(b.hw + 8), 178], [X(4), 186], [X(-4), 186], [X(-b.hw - 8), 178]]), out.col, { d: 4 }); hatch(smooth([[X(-b.hw - 4), py - 8], [X(b.hw + 4), py - 8], [X(b.hw + 8), 178], [X(-b.hw - 8), 178]]), 4);
    if (out.col2) brush([[X(-b.hw - 4), py - 6], [X(0), py - 2], [X(b.hw + 4), py - 6]], 3.6, hex(out.col2), false);
  } else if (out.type === 'coat') {
    for (const s of S2) cel(smooth([[X(s * 4), sy], [X(s * (b.sw + 2)), sy - 2], [X(s * (b.sw + 12)), 150], [X(s * (b.sw + 18)), 214], [X(s * 8), 206], [X(s * 6), wy]]), out.col, { d: 7, bx: [X(s * 20), 150, 40] });
  } else if (out.type === 'armor') {
    cel(smooth([[X(-b.hw - 6), py - 12], [X(b.hw + 6), py - 12], [X(b.hw + 8), py + 10], [X(-b.hw - 8), py + 10]]), out.col, { d: 4 }); for (let k = 0; k < 3; k++) brush([[X(-b.hw - 6), py - 6 + k * 6], [X(b.hw + 6), py - 6 + k * 6]], 0.9, INK, false);
    if (out.col2) cel(smooth([[X(-7), py - 10], [X(7), py - 10], [X(8), 206], [X(0), 214], [X(-8), 206]]), out.tabard || out.col2, { d: 2, lw: 1.1 });
  }
  // ---- the torso
  const torso = smooth([[X(-b.sw), sy - 2], [X(b.sw), sy - 2], [X(b.sw * 0.88), 104], [X(b.ww), wy], [X(b.hw), py], [X(-b.hw), py], [X(-b.ww), wy], [X(-b.sw * 0.88), 104]]);
  const tCol = out.type === 'loin' || out.type === 'bare' ? skin : out.type === 'coat' ? out.col2 || '#d8d0c8' : out.type === 'dress' ? out.col : out.col;
  cel(torso, tCol, { d: 7, bx: [128, 104, 34] });
  if (out.type === 'loin' || out.type === 'bare' || o.muscle) {
    brush([[X(0), sy + 2], [X(0), py - 8]], 1.1); brush([[X(-b.sw * 0.7), 96], [X(-b.sw * 0.2), 106], [X(-2), 102]], 1); brush([[X(b.sw * 0.7), 96], [X(b.sw * 0.2), 106], [X(2), 102]], 1);
    for (let k = 0; k < 3; k++) { brush([[X(-b.ww + 2), 114 + k * 9], [X(-2), 112 + k * 9]], 0.8); brush([[X(b.ww - 2), 114 + k * 9], [X(2), 112 + k * 9]], 0.8); }
    if (out.type === 'bare') for (let k = 0; k < 4; k++) brush([[X(-b.sw * 0.7), 90 + k * 7], [X(0), 86 + k * 7], [X(b.sw * 0.7), 90 + k * 7]], 0.9, 'rgba(20,10,10,0.6)', false);
  }
  if (out.type === 'armor') { brush([[X(0), sy], [X(0), py - 10]], 1.2); for (let k = 0; k < 2; k++) brush([[X(-b.sw * 0.8), 100 + k * 12], [X(b.sw * 0.8), 100 + k * 12]], 0.9, INK, false); if (o.sigil !== false) { G.save(); G.translate(128, 100); G.strokeStyle = e; G.shadowColor = e; G.shadowBlur = 8; G.lineWidth = 1.2; G.beginPath(); G.arc(0, 0, 6, 0, 7); G.moveTo(0, -9); G.lineTo(0, 9); G.stroke(); G.restore(); } }
  if (out.type === 'suit' && out.col2) for (const [a1, a2] of [[[X(-b.sw * 0.8), 86], [X(b.ww), wy]], [[X(b.sw * 0.8), 86], [X(-b.ww), wy]], [[X(-b.ww), wy - 6], [X(b.ww), wy - 6]]]) brush([a1, a2], 2.4, hex(out.col2), false);
  if (out.type === 'dress' && o.bare !== false) cel(smooth([[X(-b.sw + 4), sy - 2], [X(b.sw - 4), sy - 2], [X(b.sw * 0.6), 96], [X(-b.sw * 0.6), 96]]), skin, { d: 3, lw: 1.1 });
  if (out.type === 'coat') { for (const s of S2) cel(smooth([[X(s * 4), sy], [X(s * (b.sw + 2)), sy - 2], [X(s * (b.sw * 0.9)), 108], [X(s * 6), 128]]), out.col, { d: 5 }); if (o.collar) for (const s of S2) cel(smooth([[X(s * 8), sy - 2], [X(s * (b.sw + 6)), sy - 26], [X(s * (b.sw + 10)), sy - 10], [X(s * (b.sw - 2)), sy + 6]]), o.collar, { d: 3, lw: 1.1 }); }
  // ---- arms
  const sleeve = out.type === 'robe' ? 1.6 : 1;
  for (const [s, E, H] of [[-1, LE, L], [1, RE, R]]) {
    cel(limbP(X(s * (b.sw - 2)), sy + 2, E[0], E[1], b.au * (out.type === 'armor' ? 1.25 : 1), b.au * 0.9, 0.2, s), armCol, { d: 4, bx: [(X(s * b.sw) + E[0]) / 2, (sy + E[1]) / 2, 16] });
    cel(limbP(E[0], E[1], H[0], H[1], b.af * sleeve, b.af * (out.type === 'robe' ? 2 : 0.8), 0.15, s), armCol, { d: 3 });
    if (out.type === 'armor') cel(ell(X(s * (b.sw + 2)), sy + 2, b.au + 6, b.au + 2), out.col2 || out.col, { d: 3, lw: 1.1 });
    cel(ell(H[0], H[1] + 3, b.af + 1.6, b.af + 2.4), handCol, { d: 2, lw: 1.1 });
    if (o.claws) for (let k = -1; k <= 1; k++) brush([[H[0] + k * 2.5, H[1] + 6], [H[0] + k * 3, H[1] + 14]], 1.3, '#efe6cc');
  }
  if (left === 'orb') { cel(ell(L[0], L[1] - 6, 7, 7), hex(o.orbCol || '#20182a'), { d: 2, lw: 1, nolight: true }); glow(L[0], L[1] - 6, 26, css(hx(e), 0.95)); }
  if (left === 'flame') glow(L[0], L[1] - 8, 24, 'rgba(255,140,40,0.95)');
  // ---- neck and head
  cel(limbP(X(0), 64, X(0), sy, b.au * 0.9, b.au * 1.1, 0), o.head === 'helm' || o.head === 'skull' ? (o.head === 'skull' ? '#e2d8c0' : out.col) : skin, { d: 2, lw: 1 });
  head(o, e, b, hyC, skin, out);
  // ---- whatever is in the right hand
  if (wep && !longWep) {
    const wc = hex(o.weapon.col || '#c8ccd8'), [hx0, hy0] = R;
    if (wep === 'sword' || wep === 'katana') { const tip = wep === 'katana' ? [hx0 + 44, hy0 - 96] : [hx0 + 36, hy0 - 104]; cel(smooth([[hx0 - 2, hy0 - 4], [hx0 + 3, hy0 - 6], [tip[0] + 2, tip[1] + (wep === 'katana' ? 6 : 0)], tip, [hx0 - 3, hy0 - 2]]), wc, { d: 2, lw: 1.1 }); brush([[hx0, hy0 - 4], tip], 0.7, 'rgba(255,255,255,0.7)', false); cel(poly([[hx0 - 9, hy0 - 2], [hx0 + 9, hy0 - 10], [hx0 + 10, hy0 - 6], [hx0 - 8, hy0 + 2]]), '#c8a040', { d: 1, lw: 1 }); }
    if (wep === 'club') { cel(smooth([[hx0 - 4, hy0], [hx0 + 4, hy0 - 2], [hx0 + 34, hy0 - 104], [hx0 + 22, hy0 - 112]]), wc, { d: 4 }); for (let k = 0; k < 6; k++) cel(ell(hx0 + 8 + k * 4.8, hy0 - 30 - k * 14, 2.4, 2.4), '#a8a8b0', { d: 1, lw: 0.7, wash: false }); }
    if (wep === 'lantern') { brush([[hx0, hy0 + 4], [hx0, hy0 + 16]], 1); cel(smooth([[hx0 - 7, hy0 + 16], [hx0 + 7, hy0 + 16], [hx0 + 8, hy0 + 34], [hx0, hy0 + 40], [hx0 - 8, hy0 + 34]]), '#2a2018', { d: 2, lw: 1 }); glow(hx0, hy0 + 28, 30, css(hx(e), 0.95)); }
    if (wep === 'fan') { cel(smooth([[hx0, hy0], [hx0 + 30, hy0 - 40], [hx0 + 40, hy0 - 22], [hx0 + 36, hy0 - 4]]), wc, { d: 3, lw: 1.1 }); for (let k = 0; k < 5; k++) brush([[hx0, hy0], [hx0 + 30 + k * 2.5, hy0 - 38 + k * 8]], 0.7, 'rgba(20,10,10,0.5)', false); }
    if (wep === 'whip') brush([[hx0, hy0], [hx0 + 30, hy0 + 30], [hx0 + 10, hy0 + 70], [hx0 + 44, hy0 + 96]], 2, INK);
    if (wep === 'book') { cel(poly([[hx0 - 12, hy0 - 4], [hx0 + 12, hy0 - 8], [hx0 + 14, hy0 + 18], [hx0 - 10, hy0 + 22]]), wc, { d: 2, lw: 1.1 }); brush([[hx0 + 1, hy0 - 6], [hx0 + 2, hy0 + 20]], 0.8); }
    if (wep === 'mirror') { cel(ell(hx0 + 4, hy0 - 22, 13, 16), '#c8a040', { d: 2, lw: 1.1 }); cel(ell(hx0 + 4, hy0 - 22, 10, 13), '#c8e0f0', { d: 2, lw: 0.8, wash: false }); glow(hx0 + 1, hy0 - 26, 10, css(hx(e), 0.7)); }
    cel(ell(hx0, hy0 + 3, b.af + 1.6, b.af + 2.4), handCol, { d: 2, lw: 1.1 });
  }
  if (longWep) cel(ell(R[0], R[1] + 3, b.af + 1.6, b.af + 2.4), handCol, { d: 2, lw: 1.1 });
}
// heads of every kind, centred on (128, hy)
function head(o, e, b, hy, skin, out) {
  const G = g(), t = o.head || 'human', hair = o.hair || { style: 'none' }, hc = hex(hair.col || '#2a2028');
  if (o.halo) halo(128, hy - 22, 18, o.halo === true ? '#ffe080' : o.halo);
  const longHair = hair.style === 'long' || hair.style === 'flow';
  if (longHair && !['helm', 'skull', 'hood', 'crow', 'dog', 'goat', 'moth', 'wrap', 'lantern', 'ice'].includes(t)) {
    cel(smooth([[X(-14), hy - 10], [X(0), hy - 20], [X(14), hy - 10], [X(18), hy + 24], [X(hair.style === 'flow' ? 30 : 22), hy + 62], [X(8), hy + 44], [X(0), hy + 20], [X(-8), hy + 44], [X(hair.style === 'flow' ? -30 : -22), hy + 62], [X(-18), hy + 24]]), hc, { d: 4, lw: 1.2 });
    for (const s of S2) brush([[X(s * 12), hy], [X(s * 18), hy + 30], [X(s * 20), hy + 56]], 0.8, 'rgba(255,255,255,0.18)', false);
  }
  if (o.hood) { const hd = smooth([[X(-18), hy + 14], [X(-18), hy - 8], [X(-8), hy - 22], [X(0), hy - 30], [X(8), hy - 22], [X(18), hy - 8], [X(18), hy + 14], [X(10), hy + 20], [X(-10), hy + 20]]); cel(hd, o.hood, { d: 5 }); }
  const face = smooth([[X(-10), hy - 6], [X(-6), hy - 13], [X(0), hy - 15], [X(6), hy - 13], [X(10), hy - 6], [X(9), hy + 5], [X(o.face === 'f' ? 4 : 6), hy + 12], [X(0), hy + 15], [X(o.face === 'f' ? -4 : -6), hy + 12], [X(-9), hy + 5]]);
  if (t === 'human' || t === 'mask' || t === 'ghoul') {
    const fc = t === 'mask' ? hex(o.maskCol || '#ece4d8') : t === 'ghoul' ? hex(o.skin || '#8a9480') : skin;
    if (o.hood) { G.fillStyle = '#0a060c'; G.fill(face); }
    cel(face, fc, { d: 3, lw: 1.2, bx: [128, hy - 2, 12] });
    if (t === 'mask') { for (const s of S2) { G.fillStyle = '#06030a'; G.beginPath(); G.ellipse(X(s * 4.5), hy - 1, 3.4, 1.6, s * -0.15, 0, 7); G.fill(); glow(X(s * 4.5), hy - 1, 5, css(hx(e), 1)); } brush([[X(-6), hy - 9], [X(0), hy - 7], [X(6), hy - 9]], 0.8, 'rgba(20,10,10,0.4)', false); brush([[X(0), hy + 2], [X(0), hy + 9]], 0.6, 'rgba(20,10,10,0.5)', false); }
    else {
      for (const s of S2) { const ex = X(s * 4.4), ey = hy - 1; if (t === 'ghoul') { G.fillStyle = '#0a0608'; G.beginPath(); G.ellipse(ex, ey, 3, 2.6, 0, 0, 7); G.fill(); glow(ex, ey, 4, css(hx(e), 1)); continue; }
        G.fillStyle = '#f2eadc'; G.beginPath(); G.ellipse(ex, ey, 3, 1.5, s * -0.12, 0, 7); G.fill(); G.fillStyle = e; G.beginPath(); G.arc(ex + s * 0.4, ey, 1.35, 0, 7); G.fill(); G.fillStyle = INK; G.beginPath(); G.arc(ex + s * 0.4, ey, 0.6, 0, 7); G.fill();
        brush([[ex - 3, ey - 1.6], [ex, ey - 2.4], [ex + 3, ey - 1.4]], 0.9); brush([[X(s * 1.8), hy - 5.5], [X(s * 7.5), hy - (o.face === 'f' ? 6.5 : 5)]], o.face === 'f' ? 0.8 : 1.4); }
      brush([[X(0), hy + 1], [X(-1), hy + 5], [X(0.5), hy + 6]], 0.7, 'rgba(20,10,10,0.6)', false);
      if (o.fangs) { G.fillStyle = '#2a0810'; G.fill(smooth([[X(-5), hy + 9], [X(5), hy + 9], [X(3), hy + 12], [X(-3), hy + 12]])); teeth(X(-5), hy + 9, X(5), hy + 9, 4, 2.6); }
      else brush([[X(-3), hy + 9.5], [X(0), hy + 10], [X(3), hy + 9.5]], o.face === 'f' ? 1.2 : 0.9, o.face === 'f' ? '#8a3040' : 'rgba(20,10,10,0.7)');
    }
    // hair over the brow
    if (hair.style === 'short' || hair.style === 'wild' || longHair || hair.style === 'bun' || hair.style === 'crest') {
      const fringe = hair.style === 'wild' ? [[X(-13), hy - 2], [X(-16), hy - 14], [X(-10), hy - 26], [X(-4), hy - 20], [X(2), hy - 30], [X(6), hy - 20], [X(14), hy - 26], [X(16), hy - 12], [X(13), hy - 2], [X(8), hy - 10], [X(0), hy - 12], [X(-8), hy - 10]]
        : [[X(-12), hy - 1], [X(-13), hy - 12], [X(-6), hy - 19], [X(4), hy - 20], [X(12), hy - 14], [X(13), hy - 2], [X(9), hy - 9], [X(2), hy - 12], [X(-6), hy - 9]];
      cel(smooth(fringe), hc, { d: 3, lw: 1.2 });
      if (hair.style === 'bun') cel(ell(X(0), hy - 22, 8, 6), hc, { d: 2, lw: 1.1 });
      if (hair.style === 'crest') cel(smooth([[X(-4), hy - 16], [X(0), hy - 36], [X(4), hy - 16]]), hc, { d: 2, lw: 1.1 });
    }
  } else if (t === 'helm') {
    const h = smooth([[X(-12), hy + 12], [X(-14), hy - 6], [X(-8), hy - 18], [X(0), hy - 22], [X(8), hy - 18], [X(14), hy - 6], [X(12), hy + 12], [X(0), hy + 16]]); cel(h, out.col, { d: 4, bx: [128, hy - 4, 14] });
    G.fillStyle = '#05020a'; G.fillRect(X(-10), hy - 3, 20, 3.4); if (!o.visorOnly) G.fillRect(X(-1.5), hy - 3, 3, 12); glow(X(-5), hy - 1.5, 5, css(hx(e), 1)); glow(X(5), hy - 1.5, 5, css(hx(e), 1));
    if (o.crest) cel(smooth([[X(-3), hy - 20], [X(0), hy - 42], [X(3), hy - 20]]), o.crest, { d: 2, lw: 1 });
  } else if (t === 'skull' || t === 'hood') {
    if (t === 'hood') { G.fillStyle = '#05030a'; G.fill(face); for (const s of S2) glow(X(s * 4.5), hy, 5, css(hx(e), 1)); }
    else { cel(smooth([[X(-10), hy - 2], [X(-8), hy - 13], [X(0), hy - 16], [X(8), hy - 13], [X(10), hy - 2], [X(6), hy + 8], [X(0), hy + 13], [X(-6), hy + 8]]), '#e2d8c0', { d: 3, lw: 1.2 }); for (const s of S2) { G.fillStyle = INK; G.beginPath(); G.ellipse(X(s * 4.4), hy - 1, 3.2, 3.8, 0, 0, 7); G.fill(); glow(X(s * 4.4), hy - 1, 4, css(hx(e), 1)); } for (let k = -2; k <= 2; k++) brush([[X(k * 2), hy + 7], [X(k * 2), hy + 11]], 0.8); }
  } else if (t === 'crow' || t === 'moth') {
    const hc2 = hex(o.headCol || (t === 'crow' ? '#1e1a24' : '#5a4a48'));
    cel(smooth([[X(-11), hy + 8], [X(-12), hy - 6], [X(-6), hy - 16], [X(0), hy - 18], [X(6), hy - 16], [X(12), hy - 6], [X(11), hy + 8], [X(0), hy + 12]]), hc2, { d: 3, lw: 1.2 });
    if (t === 'crow') { cel(smooth([[X(-5), hy + 2], [X(5), hy + 2], [X(2), hy + 20], [X(0), hy + 24], [X(-2), hy + 20]]), '#c8a040', { d: 2, lw: 1 }); eyeSlit(X(-6), hy - 3, 3.6, 2, e, 0.3); eyeSlit(X(6), hy - 3, 3.6, 2, e, -0.3); for (let k = 0; k < 5; k++) cel(poly([[X(-12 + k * 6), hy - 12], [X(-10 + k * 6), hy - 26 - (k % 2) * 6], [X(-6 + k * 6), hy - 12]]), hc2, { d: 1, lw: 0.9 }); }
    else { for (const s of S2) { cel(ell(X(s * 6), hy - 2, 5.5, 6.5), '#a01818', { d: 1, lw: 1, nolight: true }); glow(X(s * 6), hy - 3, 8, 'rgba(255,40,30,0.9)'); } for (const s of S2) { brush([[X(s * 3), hy - 14], [X(s * 14), hy - 34], [X(s * 26), hy - 40]], 1); for (let k = 0; k < 5; k++) brush([[X(s * (6 + k * 4)), hy - 22 - k * 3], [X(s * (8 + k * 4)), hy - 28 - k * 3]], 0.7); } }
  } else if (t === 'dog' || t === 'goat') {
    const hc2 = hex(o.headCol || '#6a5a4a');
    if (t === 'goat') hornPair(128, hy - 12, 'curl', hex(o.hornCol || '#d8ccb0'), 1.1);
    for (const s of S2) cel(poly([[X(s * 8), hy - 10], [X(s * (t === 'goat' ? 22 : 14)), hy - (t === 'goat' ? 6 : 28)], [X(s * 15), hy - 4]]), hc2, { d: 1.5, lw: 1 });
    cel(smooth([[X(-11), hy - 4], [X(-8), hy - 14], [X(0), hy - 16], [X(8), hy - 14], [X(11), hy - 4], [X(8), hy + 10], [X(4), hy + 22], [X(0), hy + 24], [X(-4), hy + 22], [X(-8), hy + 10]]), hc2, { d: 3, lw: 1.2, bx: [128, hy, 14] });
    G.fillStyle = INK; G.beginPath(); G.ellipse(X(0), hy + 19, 3.4, 2.2, 0, 0, 7); G.fill(); eyeSlit(X(-5), hy - 4, 3.4, 2, e, 0.25); eyeSlit(X(5), hy - 4, 3.4, 2, e, -0.25);
    if (t === 'goat') brush([[X(-3), hy + 22], [X(0), hy + 36], [X(3), hy + 22]], 2, hex(o.beard || '#d8d0c0'));
  } else if (t === 'wrap') {
    cel(smooth([[X(-10), hy - 6], [X(-6), hy - 14], [X(0), hy - 16], [X(6), hy - 14], [X(10), hy - 6], [X(9), hy + 6], [X(0), hy + 14], [X(-9), hy + 6]]), out.col, { d: 3, lw: 1.2 });
    for (let k = 0; k < 6; k++) brush([[X(-10), hy - 12 + k * 4.5], [X(10), hy - 10 + k * 4.5 + (k % 2) * 2]], 0.8, 'rgba(30,20,10,0.6)', false);
    G.fillStyle = '#05030a'; G.fillRect(X(-8), hy - 3, 16, 3.4); glow(X(-4), hy - 1.5, 5, css(hx(e), 1)); glow(X(4), hy - 1.5, 5, css(hx(e), 1));
  } else if (t === 'lantern') {
    cel(smooth([[X(-16), hy], [X(-14), hy - 14], [X(-4), hy - 20], [X(4), hy - 20], [X(14), hy - 14], [X(16), hy], [X(12), hy + 14], [X(0), hy + 18], [X(-12), hy + 14]]), '#d8782a', { d: 4, lw: 1.3, bx: [128, hy - 2, 18] });
    for (const dx of [-8, 0, 8]) brush([[X(dx), hy - 18], [X(dx * 1.1), hy + 16]], 0.8, 'rgba(60,20,0,0.6)', false);
    G.fillStyle = '#ffd860'; G.shadowColor = '#ffb020'; G.shadowBlur = 10; for (const s of S2) G.fill(poly([[X(s * 4), hy - 2], [X(s * 11), hy - 6], [X(s * 9), hy + 1]])); G.fill(poly([[X(-8), hy + 7], [X(-3), hy + 11], [X(0), hy + 7], [X(3), hy + 11], [X(8), hy + 7], [X(0), hy + 13]])); G.shadowBlur = 0;
    cel(smooth([[X(-2), hy - 20], [X(2), hy - 20], [X(4), hy - 30], [X(-1), hy - 28]]), '#4a5a2a', { d: 1, lw: 0.9 });
  } else if (t === 'ice') {
    cel(poly([[X(-13), hy + 10], [X(-15), hy - 6], [X(-6), hy - 16], [X(6), hy - 16], [X(15), hy - 6], [X(13), hy + 10], [X(0), hy + 16]]), '#c8e8f8', { d: 3, lw: 1.2 });
    for (let k = 0; k < 5; k++) cel(poly([[X(-12 + k * 6), hy - 12], [X(-10 + k * 6), hy - 32 - (k === 2 ? 10 : (k % 2) * 6)], [X(-7 + k * 6), hy - 12]]), '#a8d8f0', { d: 1, lw: 0.9 });
    eyeSlit(X(-5), hy - 2, 4, 2.4, e, 0.25); eyeSlit(X(5), hy - 2, 4, 2.4, e, -0.25);
    G.fillStyle = '#10202a'; G.fill(smooth([[X(-8), hy + 6], [X(8), hy + 6], [X(4), hy + 11], [X(-4), hy + 11]])); teeth(X(-7), hy + 6, X(7), hy + 6, 5, 3, '#e8f8ff');
  }
  if (o.horns) hornPair(128, hy - 12, o.horns.type || o.horns, hex(o.horns.col || '#d8ccb0'), o.horns.size || 1);
  if (o.crown) { cel(poly([[X(-12), hy - 14], [X(-12), hy - 26], [X(-6), hy - 20], [X(0), hy - 30], [X(6), hy - 20], [X(12), hy - 26], [X(12), hy - 14]]), hex(o.crown), { d: 2, lw: 1 }); glow(X(0), hy - 22, 6, css(hx(e), 0.8)); }
}

// ---------------------------------------------------------------- non-human plates
// a beast sitting up and facing you: dog, lion-dog, cat, fox, horse; heads 1–3, tails 1–9
function beast(a, b, e, o) {
  const G = g(), kind = o.kind || 'dog', heads = o.heads || 1, tails = o.tails || (kind === 'horse' ? 0 : 1);
  for (let k = 0; k < tails; k++) { const t = tails === 1 ? 0.6 : -1.1 + k * (2.2 / (tails - 1)); const tp = [[X(10), 206], [X(30 + Math.sin(t) * 30), 196 - Math.cos(t) * 30], [X(Math.sin(t) * 96), 186 - Math.cos(t) * 88], [X(Math.sin(t) * 108 + 6), 166 - Math.cos(t) * 96]];
    brush(tp, kind === 'fox' ? 22 : kind === 'cat' ? 9 : 14, INK); brush(tp, kind === 'fox' ? 18 : kind === 'cat' ? 6 : 10, a); if (kind === 'fox') cel(ell(tp[3][0], tp[3][1], 9, 9), b, { d: 2, lw: 1 }); }
  if (o.wings) for (const s of S2) featherWing(s, X(s * 22), 130, 90, 50, hex(o.wings), 2);
  if (o.flames) for (let k = 0; k < 9; k++) flameTongue(X(-80 + k * 20), 214, 12, 40 + (k % 3) * 18, k % 2 ? 'rgba(255,120,40,0.5)' : 'rgba(255,70,30,0.45)');
  // the back and haunches: two great thighs either side, the hind paws turned out
  cel(smooth([[X(-34), 180], [X(-20), 136], [X(20), 136], [X(34), 180], [X(30), 228], [X(-30), 228]]), a, { d: 7 });
  for (const s of S2) {
    cel(smooth([[X(s * 18), 176], [X(s * 40), 156], [X(s * 62), 172], [X(s * 66), 208], [X(s * 52), 230], [X(s * 26), 226]]), a, { d: 8, bx: [X(s * 46), 190, 26] });
    brush([[X(s * 44), 164], [X(s * 58), 190], [X(s * 50), 218]], 1, 'rgba(20,10,10,0.5)', false);
    cel(smooth([[X(s * 44), 228], [X(s * 66), 226], [X(s * 74), 236], [X(s * 66), 244], [X(s * 42), 244]]), a, { d: 3, lw: 1.1 });
    for (let k = 0; k < 3; k++) brush([[X(s * (60 + k * 5)), 238], [X(s * (62 + k * 6)), 245]], 1.4, '#efe6cc');
  }
  // the chest, deep and narrow, with a lighter breast
  const chest = smooth([[X(-26), 108], [X(26), 108], [X(32), 146], [X(24), 184], [X(-24), 184], [X(-32), 146]]); cel(chest, a, { d: 7, bx: [128, 140, 32] });
  cel(smooth([[X(-14), 118], [X(14), 118], [X(12), 162], [X(0), 176], [X(-12), 162]]), b, { d: 4, lw: 1.1 });
  for (let k = 0; k < 4; k++) brush([[X(-10 + k * 2), 128 + k * 10], [X(0), 132 + k * 10], [X(10 - k * 2), 128 + k * 10]], 0.7, 'rgba(20,10,10,0.35)', false);
  if (kind === 'lion' || o.mane) cel(smooth([[X(-44), 100], [X(-30), 70], [X(0), 58], [X(30), 70], [X(44), 100], [X(40), 130], [X(20), 120], [X(0), 136], [X(-20), 120], [X(-40), 130]]), hex(o.mane || b), { d: 6, lw: 1.3 });
  if (kind === 'lion' || o.mane) for (let k = 0; k < 9; k++) brush([[X(-36 + k * 9), 76 + Math.abs(k - 4) * 4], [X(-40 + k * 10), 104 + Math.abs(k - 4) * 3]], 0.9, 'rgba(20,10,10,0.5)', false);
  // forelegs: elbow, wrist, paw with claws
  for (const s of S2) {
    cel(limbP(X(s * 22), 140, X(s * 26), 190, 10, 7.5, 0.22, s), a, { d: 4, bx: [X(s * 24), 160, 14] });
    cel(limbP(X(s * 26), 190, X(s * 23), 230, 7.5, 6.5, 0.1, s), a, { d: 4 });
    cel(smooth([[X(s * 12), 228], [X(s * 34), 228], [X(s * 36), 242], [X(s * 10), 244]]), a, { d: 2, lw: 1.1 });
    for (let k = 0; k < 4; k++) brush([[X(s * (14 + k * 6)), 238], [X(s * (14 + k * 6)), 246]], 1.5, '#efe6cc');
  }
  if (o.collar) { brush([[X(-26), 112], [X(0), 122], [X(26), 112]], 4, hex(o.collar), false); cel(ell(X(0), 126, 4, 5), '#d8b040', { d: 1, lw: 0.9 }); }
  // heads
  const spots = heads === 1 ? [[0, 80]] : heads === 2 ? [[-24, 80], [24, 80]] : [[-40, 92], [0, 70], [40, 92]];
  for (const [dx, hy] of spots) {
    const x = X(dx);
    if (kind === 'horse') {
      cel(smooth([[x - 12, hy - 18], [x + 12, hy - 18], [x + 14, hy + 10], [x + 9, hy + 40], [x, hy + 46], [x - 9, hy + 40], [x - 14, hy + 10]]), a, { d: 4, lw: 1.2, bx: [x, hy, 16] });
      cel(smooth([[x - 8, hy + 26], [x + 8, hy + 26], [x + 9, hy + 42], [x, hy + 48], [x - 9, hy + 42]]), tone(a, -0.1).startsWith('r') ? a : a, { d: 2, lw: 1 });
      for (const s of S2) { G.fillStyle = INK; G.beginPath(); G.ellipse(x + s * 4, hy + 40, 2, 3, 0, 0, 7); G.fill(); cel(poly([[x + s * 6, hy - 16], [x + s * 12, hy - 34], [x + s * 14, hy - 14]]), a, { d: 1, lw: 1 }); }
      eyeSlit(x - 9, hy + 2, 4, 2.2, e, 0.4); eyeSlit(x + 9, hy + 2, 4, 2.2, e, -0.4);
      for (let k = 0; k < 7; k++) brush([[x - 6 + k * 2, hy - 18], [x - 14 + k * 2 + Math.sin(k) * 4, hy + 30 + (k % 3) * 10]], 2.2, hex(o.mane || b));
      continue;
    }
    for (const s of S2) cel(poly([[x + s * 8, hy - 12], [x + s * (kind === 'cat' ? 18 : kind === 'fox' ? 20 : 16), hy - (kind === 'fox' ? 38 : 32)], [x + s * 20, hy - 4]]), a, { d: 2, lw: 1.1 });
    for (const s of S2) cel(poly([[x + s * 11, hy - 12], [x + s * (kind === 'cat' ? 17 : 18), hy - (kind === 'fox' ? 32 : 26)], [x + s * 17, hy - 7]]), '#c88a90', { d: 1, lw: 0.8, wash: false });
    const snout = kind === 'cat' ? 8 : kind === 'fox' ? 20 : 16;
    cel(smooth([[x - 18, hy - 2], [x - 14, hy - 14], [x, hy - 18], [x + 14, hy - 14], [x + 18, hy - 2], [x + 12, hy + 10], [x + 6, hy + snout], [x, hy + snout + 3], [x - 6, hy + snout], [x - 12, hy + 10]]), a, { d: 4, lw: 1.2, bx: [x, hy - 4, 16] });
    cel(smooth([[x - 7, hy + 4], [x + 7, hy + 4], [x + 6, hy + snout], [x, hy + snout + 3], [x - 6, hy + snout]]), b, { d: 2, lw: 1 });
    G.fillStyle = INK; G.beginPath(); G.ellipse(x, hy + snout - 1, 3, 2, 0, 0, 7); G.fill();
    eyeSlit(x - 7.5, hy - 3, 4.4, 2.6, e, 0.3); eyeSlit(x + 7.5, hy - 3, 4.4, 2.6, e, -0.3);
    if (kind !== 'cat') { G.fillStyle = '#2a0810'; G.fill(smooth([[x - 7, hy + snout + 2], [x + 7, hy + snout + 2], [x + 4, hy + snout + 8], [x - 4, hy + snout + 8]])); teeth(x - 7, hy + snout + 2, x + 7, hy + snout + 2, 4, 3.5); }
    else for (const s of S2) for (let k = 0; k < 3; k++) brush([[x + s * 6, hy + 8 + k * 2], [x + s * 24, hy + 4 + k * 4]], 0.6, '#efe6d0', false);
    if (o.mark) { G.save(); G.strokeStyle = o.mark; G.lineWidth = 1.4; G.beginPath(); G.moveTo(x, hy - 14); G.lineTo(x, hy - 6); G.moveTo(x - 4, hy - 10); G.lineTo(x + 4, hy - 10); G.stroke(); G.restore(); }
  }
}
// a great bird with its wings spread like a coat of arms
function bird(a, b, e, o) {
  const G = g();
  if (o.fire) { G.save(); G.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const x = X(-110 + k * 17), h = 50 + Math.sin(k * 1.3) * 30; const gr = G.createLinearGradient(0, 150, 0, 150 - h * 2); gr.addColorStop(0, 'rgba(255,120,30,0.35)'); gr.addColorStop(1, 'rgba(255,200,60,0)'); G.fillStyle = gr; G.beginPath(); G.moveTo(x - 12, 180); G.quadraticCurveTo(x, 150 - h * 1.6, x + 12, 180); G.fill(); } G.restore(); }
  for (const s of S2) featherWing(s, X(s * 16), 90, 112, 74, a, 3);
  if (o.bolt) for (const s of S2) { G.save(); G.strokeStyle = '#fff6a0'; G.shadowColor = '#ffe040'; G.shadowBlur = 10; G.lineWidth = 2; G.beginPath(); G.moveTo(X(s * 60), 60); G.lineTo(X(s * 74), 86); G.lineTo(X(s * 64), 90); G.lineTo(X(s * 82), 124); G.stroke(); G.restore(); }
  // tail fan, legs, talons
  for (let k = -2; k <= 2; k++) cel(smooth([[X(k * 6), 176], [X(k * 16 - 6), 230], [X(k * 18), 242], [X(k * 16 + 6), 230]]), k % 2 ? b : a, { d: 3, lw: 1 });
  for (const lx of (o.legs === 3 ? [-14, 0, 14] : [-12, 12])) { brush([[X(lx), 170], [X(lx * 1.2), 200], [X(lx * 1.3), 214]], 4.4, INK); brush([[X(lx), 170], [X(lx * 1.2), 200], [X(lx * 1.3), 214]], 2.8, '#c8a040'); for (let k = -1; k <= 1; k++) brush([[X(lx * 1.3), 214], [X(lx * 1.3 + k * 6), 222]], 1.8, INK); }
  const body = smooth([[X(-24), 100], [X(24), 100], [X(32), 140], [X(20), 178], [X(-20), 178], [X(-32), 140]]); cel(body, a, { d: 7, bx: [128, 130, 34] });
  cel(smooth([[X(-14), 114], [X(14), 114], [X(16), 156], [X(0), 172], [X(-16), 156]]), b, { d: 4, lw: 1 }); for (let k = 0; k < 5; k++) brush([[X(-12), 124 + k * 9], [X(0), 128 + k * 9], [X(12), 124 + k * 9]], 0.7, 'rgba(20,10,20,0.4)', false);
  if (o.human) { // a harpy: a woman's head and breast
    cel(smooth([[X(-10), 92], [X(10), 92], [X(12), 112], [X(-12), 112]]), SKIN, { d: 3, lw: 1 });
    head({ head: 'human', face: 'f', hair: { style: 'wild', col: hex(o.hairCol || '#3a2a2a') } }, e, null, 72, SKIN, {});
    return;
  }
  const hc = hex(o.headCol || a);
  cel(smooth([[X(-16), 96], [X(-16), 74], [X(-6), 60], [X(6), 60], [X(16), 74], [X(16), 96], [X(0), 104]]), hc, { d: 4, lw: 1.2, bx: [128, 76, 16] });
  if (o.crest) for (let k = 0; k < 5; k++) cel(smooth([[X(-6 + k * 3), 64], [X(-14 + k * 7), 34 - (k === 2 ? 10 : 0)], [X(-4 + k * 3), 62]]), hex(o.crest), { d: 1.5, lw: 0.9 });
  cel(smooth([[X(-6), 84], [X(6), 84], [X(3), 100], [X(0), 108], [X(-3), 100]]), hex(o.beak || '#d8b040'), { d: 2, lw: 1.1 });
  eyeSlit(X(-8), 78, 4.6, 2.8, e, 0.35); eyeSlit(X(8), 78, 4.6, 2.8, e, -0.35);
  if (o.sun) { glow(X(0), 120, 22, 'rgba(255,220,80,0.9)'); }
}
// a serpent rising out of its coils, hood spread
function serpent(a, b, e, o) {
  const G = g(), coil = [[X(-80), 238], [X(-40), 222], [X(30), 230], [X(76), 214], [X(56), 192], [X(-20), 196], [X(-36), 176], [X(0), 160], [X(10), 120], [X(0), 90]];
  brush(coil, 34, INK); brush(coil, 29, a); brush(coil.map(([x, y]) => [x - 3, y - 3]), 9, tone(a, 0.25));
  for (let i = 0; i < 18; i++) { const t = i / 18, k = t * (coil.length - 1), j = Math.min(coil.length - 2, Math.floor(k)), f = k - j, x = coil[j][0] + (coil[j + 1][0] - coil[j][0]) * f, y = coil[j][1] + (coil[j + 1][1] - coil[j][1]) * f; G.strokeStyle = 'rgba(20,10,20,0.45)'; G.lineWidth = 0.9; G.beginPath(); G.arc(x, y, 8, 0.4, Math.PI - 0.4); G.stroke(); }
  if (o.hood !== false) cel(smooth([[X(0), 108], [X(-36), 90], [X(-40), 56], [X(-20), 30], [X(0), 24], [X(20), 30], [X(40), 56], [X(36), 90]]), a, { d: 6, bx: [128, 60, 34] });
  if (o.hood !== false) { cel(smooth([[X(0), 100], [X(-24), 84], [X(-26), 58], [X(0), 40], [X(26), 58], [X(24), 84]]), b, { d: 3, lw: 1 }); for (const s of S2) cel(ell(X(s * 14), 66, 6, 8), '#1a1218', { d: 1, lw: 0.9, wash: false }); }
  cel(smooth([[X(-12), 70], [X(-10), 52], [X(0), 44], [X(10), 52], [X(12), 70], [X(6), 84], [X(0), 88], [X(-6), 84]]), a, { d: 3, lw: 1.2, bx: [128, 60, 14] });
  eyeSlit(X(-6), 60, 4, 2.4, e, 0.35); eyeSlit(X(6), 60, 4, 2.4, e, -0.35); brush([[X(0), 88], [X(0), 98], [X(-4), 104]], 1.2, '#c02030'); brush([[X(0), 98], [X(4), 104]], 1.2, '#c02030');
  if (o.crown) { cel(poly([[X(-12), 46], [X(-12), 32], [X(-5), 38], [X(0), 26], [X(5), 38], [X(12), 32], [X(12), 46]]), '#d8b040', { d: 2, lw: 1 }); glow(X(0), 38, 7, css(hx(e), 0.8)); }
  if (o.whiskers) for (const s of S2) brush([[X(s * 8), 78], [X(s * 40), 70], [X(s * 60), 90]], 1.2, hex(o.whiskers));
}
// an eastern dragon: a long body in an S, whiskers, antlers, a mane of flame or water; quetzal: feathered
function longDragon(a, b, e, o) {
  const G = g(), path = [[X(84), 240], [X(-60), 214], [X(-84), 168], [X(40), 150], [X(70), 112], [X(-10), 96], [X(-24), 74]];
  if (o.feathers) for (let k = 0; k < 10; k++) { const t = 0.15 + k * 0.08, i = Math.min(path.length - 2, Math.floor(t * (path.length - 1))), f = t * (path.length - 1) - i, x = path[i][0] + (path[i + 1][0] - path[i][0]) * f, y = path[i][1] + (path[i + 1][1] - path[i][1]) * f; cel(smooth([[x, y], [x - 20, y - 24], [x - 4, y - 32], [x + 8, y - 6]]), k % 2 ? hex(o.feathers) : b, { d: 2, lw: 0.9 }); }
  brush(path, 30, INK); brush(path, 25, a); brush(path.map(([x, y]) => [x + 3, y + 4]), 8, b);
  for (let i = 0; i < 22; i++) { const t = i / 22, k = t * (path.length - 1), j = Math.min(path.length - 2, Math.floor(k)), f = k - j, x = path[j][0] + (path[j + 1][0] - path[j][0]) * f, y = path[j][1] + (path[j + 1][1] - path[j][1]) * f; if (i % 2) cel(poly([[x - 4, y - 10], [x, y - 20], [x + 4, y - 10]]), hex(o.fin || b), { d: 1, lw: 0.8 }); }
  for (const [x, y, s] of [[X(-50), 206, -1], [X(30), 152, 1]]) { brush([[x, y], [x + s * 18, y + 12], [x + s * 26, y + 26]], 5, INK); brush([[x, y], [x + s * 18, y + 12], [x + s * 26, y + 26]], 3.4, a); for (let k = -1; k <= 1; k++) brush([[x + s * 26, y + 26], [x + s * 30 + k * 4, y + 34]], 1.6, '#efe6cc'); }
  const hx0 = X(-26), hy0 = 62;
  hornPair(hx0 + 0, hy0 - 10, 'antler', hex(o.horn || '#e2d6b8'), 1);
  cel(smooth([[hx0 - 18, hy0 - 4], [hx0 - 12, hy0 - 16], [hx0 + 4, hy0 - 18], [hx0 + 18, hy0 - 8], [hx0 + 30, hy0 + 4], [hx0 + 28, hy0 + 14], [hx0 + 6, hy0 + 18], [hx0 - 14, hy0 + 12]]), a, { d: 4, lw: 1.3, bx: [hx0, hy0, 18] });
  G.fillStyle = '#2a0810'; G.fill(smooth([[hx0 + 8, hy0 + 10], [hx0 + 30, hy0 + 8], [hx0 + 24, hy0 + 18], [hx0 + 8, hy0 + 16]])); teeth(hx0 + 10, hy0 + 10, hx0 + 28, hy0 + 9, 5, 4);
  eyeSlit(hx0 + 4, hy0 - 4, 5, 3, e, -0.2);
  for (const dy of [0, 6]) brush([[hx0 + 26, hy0 + 6 + dy], [hx0 + 54, hy0 - 4 + dy * 2], [hx0 + 70, hy0 + 20 + dy]], 1.3, hex(o.whisker || b));
  for (let k = 0; k < 6; k++) brush([[hx0 - 10 + k * 3, hy0 - 12], [hx0 - 30 - k * 4, hy0 + 8 + k * 6]], 2.4, hex(o.mane || b));
  if (o.pearl) { cel(ell(X(66), 70, 10, 10), '#e8f4ff', { d: 2, lw: 1 }); glow(X(66), 70, 22, css(hx(e), 0.8)); }
}
// a western dragon crouched to spring, wings up
function wyrm(a, b, e, o) {
  const G = g();
  for (const s of S2) batWing(s, X(s * 30), 100, 100, a, tone(a, -0.3));
  brush([[X(30), 220], [X(80), 236], [X(112), 210], [X(118), 178]], 14, INK); brush([[X(30), 220], [X(80), 236], [X(112), 210], [X(118), 178]], 10, a);
  for (const s of S2) { cel(limbP(X(s * 40), 180, X(s * 52), 236, 14, 9, 0.2, s), a, { d: 5 }); cel(ell(X(s * 54), 238, 14, 6), a, { d: 2, lw: 1.1 }); for (let k = -1; k <= 1; k++) brush([[X(s * 54 + k * 5), 238], [X(s * 56 + k * 6), 246]], 1.8, '#efe6cc'); }
  const body = smooth([[X(-44), 120], [X(44), 120], [X(56), 180], [X(36), 226], [X(-36), 226], [X(-56), 180]]); cel(body, a, { d: 9, bx: [128, 170, 50] });
  cel(smooth([[X(-20), 128], [X(20), 128], [X(24), 200], [X(0), 220], [X(-24), 200]]), b, { d: 4, lw: 1.1 }); for (let k = 0; k < 8; k++) brush([[X(-20), 136 + k * 10], [X(20), 136 + k * 10]], 0.8, 'rgba(20,10,10,0.45)', false);
  for (const s of S2) { cel(limbP(X(s * 34), 136, X(s * 34), 186, 9, 7, 0.2, s), a, { d: 4 }); for (let k = -1; k <= 1; k++) brush([[X(s * 34 + k * 4), 188], [X(s * 36 + k * 5), 198]], 1.6, '#efe6cc'); }
  brush([[X(0), 124], [X(-4), 104], [X(0), 84]], 22, INK); brush([[X(0), 124], [X(-4), 104], [X(0), 84]], 18, a);
  hornPair(128, 58, 'up', hex(o.horn || '#e0d4b4'), 1.1);
  cel(smooth([[X(-20), 74], [X(-18), 56], [X(0), 48], [X(18), 56], [X(20), 74], [X(12), 92], [X(0), 98], [X(-12), 92]]), a, { d: 4, lw: 1.3, bx: [128, 66, 18] });
  G.fillStyle = '#2a0810'; G.fill(smooth([[X(-12), 84], [X(12), 84], [X(8), 94], [X(-8), 94]])); teeth(X(-11), 84, X(11), 84, 6, 4); teeth(X(-8), 94, X(8), 94, 4, -3);
  eyeSlit(X(-9), 66, 5, 3, e, 0.35); eyeSlit(X(9), 66, 5, 3, e, -0.35);
  if (o.fire) { glow(X(0), 96, 28, 'rgba(255,140,40,0.85)'); }
}
// many heads on many necks from one great body
function hydra(a, b, e, o) {
  const G = g(), n = o.heads || 8, heads = [];
  for (let k = 0; k < n; k++) { const t = n === 1 ? 0.5 : k / (n - 1), x = X(-104 + t * 208), y = 60 + Math.abs(t - 0.5) * 70 + (k % 2) * 16; heads.push([x, y]); }
  if (o.sea) { G.save(); G.globalAlpha = 0.6; for (let k = 0; k < 4; k++) brush([[X(-128), 218 + k * 8], [X(-40), 210 + k * 8], [X(40), 222 + k * 8], [X(128), 214 + k * 8]], 3, 'rgba(80,140,180,0.6)', false); G.restore(); }
  cel(smooth([[X(-90), 244], [X(-96), 200], [X(-60), 170], [X(60), 170], [X(96), 200], [X(90), 244]]), a, { d: 10, bx: [128, 200, 70] }); hatch(smooth([[X(-90), 244], [X(-96), 200], [X(-60), 170], [X(60), 170], [X(96), 200], [X(90), 244]]), 5);
  for (const [x, y] of heads) { const neck = [[X((x - 128) * 0.2), 190], [(x + 128) / 2, (y + 190) / 2 + 10], [x, y + 18]]; brush(neck, 17, INK); brush(neck, 13, a); brush(neck.map(([px, py]) => [px - 2, py - 2]), 4, b); }
  for (const [x, y] of heads) {
    cel(smooth([[x - 12, y + 8], [x - 10, y - 6], [x, y - 12], [x + 10, y - 6], [x + 12, y + 8], [x + 6, y + 18], [x, y + 22], [x - 6, y + 18]]), a, { d: 3, lw: 1.1 });
    if (o.horns) for (const s of S2) cel(poly([[x + s * 4, y - 8], [x + s * 12, y - 26], [x + s * 10, y - 6]]), hex(o.horns), { d: 1, lw: 0.9 });
    eyeSlit(x - 5, y + 1, 3.2, 2, e, 0.3); eyeSlit(x + 5, y + 1, 3.2, 2, e, -0.3);
    G.fillStyle = '#2a0810'; G.fill(smooth([[x - 6, y + 14], [x + 6, y + 14], [x + 3, y + 20], [x - 3, y + 20]])); teeth(x - 6, y + 14, x + 6, y + 14, 3, 2.6);
  }
}
// a great spider with a demon's face
function spider(a, b, e, o) {
  const G = g();
  for (const s of S2) for (let k = 0; k < 4; k++) { const y = 140 + k * 16, kx = X(s * (80 + k * 6)), ky = y - 52 + k * 12; brush([[X(s * 30), y], [kx, ky], [X(s * (110 + k * 6)), y + 64 + k * 8]], 7, INK); brush([[X(s * 30), y], [kx, ky], [X(s * (110 + k * 6)), y + 64 + k * 8]], 4.6, a); }
  const abd = ell(X(0), 196, 52, 42); cel(abd, a, { d: 9, bx: [128, 186, 50] }); for (let k = 0; k < 4; k++) brush([[X(-30 + k * 4), 170 + k * 10], [X(0), 166 + k * 12], [X(30 - k * 4), 170 + k * 10]], 1.4, hex(b), false);
  cel(ell(X(0), 132, 34, 30), a, { d: 6, bx: [128, 126, 30] });
  cel(smooth([[X(-20), 118], [X(-16), 104], [X(0), 98], [X(16), 104], [X(20), 118], [X(14), 136], [X(0), 144], [X(-14), 136]]), hex(o.face || '#d8c8a8'), { d: 3, lw: 1.2 });
  hornPair(128, 102, 'oni', '#e8dcc0', 1);
  for (const [x, y, r] of [[-7, 116, 4], [7, 116, 4], [-14, 108, 2.4], [14, 108, 2.4], [0, 106, 2.4]]) { G.fillStyle = e; G.shadowColor = e; G.shadowBlur = 6; G.beginPath(); G.arc(X(x), y, r, 0, 7); G.fill(); G.shadowBlur = 0; G.fillStyle = INK; G.beginPath(); G.arc(X(x), y, r * 0.4, 0, 7); G.fill(); }
  G.fillStyle = '#2a0810'; G.fill(smooth([[X(-8), 130], [X(8), 130], [X(5), 138], [X(-5), 138]])); teeth(X(-8), 130, X(8), 130, 5, 4);
  for (const s of S2) { brush([[X(s * 8), 140], [X(s * 12), 152], [X(s * 6), 160]], 3, INK); }
}
// a flame with a face, or a ghost with things circling it
function wisp(a, b, e, o) {
  const G = g();
  if (o.ghost) {
    for (const [x, y, w, h] of [[56, 70, 14, 10], [196, 90, 12, 16], [70, 190, 18, 12], [186, 200, 10, 10]]) { G.save(); G.translate(x, y); G.rotate((x % 7) * 0.2); cel(poly([[-w, -h], [w, -h], [w, h], [-w, h]]), x > 128 ? '#7a5a3a' : '#8a8a92', { d: 2, lw: 1 }); G.restore(); }
    const p = smooth([[X(0), 50], [X(36), 72], [X(40), 130], [X(30), 190], [X(14), 176], [X(6), 214], [X(-10), 182], [X(-26), 206], [X(-34), 150], [X(-40), 90]]);
    G.save(); G.globalAlpha = 0.85; cel(p, a, { d: 8, bx: [128, 110, 40] }); G.restore();
    for (const s of S2) { G.fillStyle = '#05030a'; G.beginPath(); G.ellipse(X(s * 12), 100, 7, 11, 0, 0, 7); G.fill(); glow(X(s * 12), 102, 8, css(hx(e), 0.9)); }
    G.fillStyle = '#05030a'; G.beginPath(); G.ellipse(X(0), 132, 9, 14, 0, 0, 7); G.fill();
    return;
  }
  G.save(); G.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) { const s = 1 - k * 0.25; const p = smooth([[X(0), 40 + k * 20], [X(26 * s), 90], [X(44 * s), 70 + k * 10], [X(46 * s), 140], [X(30 * s), 200], [X(0), 214], [X(-30 * s), 200], [X(-46 * s), 140], [X(-44 * s), 70 + k * 10], [X(-26 * s), 90]]); G.fillStyle = css(hx(k === 2 ? '#ffffff' : k ? b : a), 0.55); G.fill(p); }
  G.restore();
  glow(X(0), 160, 60, css(hx(a), 0.6));
  for (const s of S2) { G.fillStyle = '#0a0410'; G.beginPath(); G.ellipse(X(s * 12), 150, 5, 8, s * 0.2, 0, 7); G.fill(); }
  G.fillStyle = '#0a0410'; G.fill(smooth([[X(-10), 176], [X(0), 172], [X(10), 176], [X(0), 190]]));
}
// a flower spirit: a small woman in a dress of petals, a bloom for a hat
function flower(a, b, e, o) {
  const G = g();
  for (let k = 0; k < 9; k++) { const t = k / 9 * Math.PI * 2; cel(ell(X(Math.cos(t) * 44), 206 + Math.sin(t) * 14, 26, 10, t), k % 2 ? a : b, { d: 2, lw: 1 }); }
  figure({ build: 'slim', face: 'f', hair: { style: 'long', col: hex(o.hair || '#5a8a3a') }, outfit: { type: 'dress', col: a, col2: b }, left: 'gesture', wings: { type: 'small', col: '#e8f8ff' } }, e);
  for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2; cel(ell(X(Math.cos(t) * 12), 34 + Math.sin(t) * 4, 9, 5, t), b, { d: 1, lw: 0.9 }); }
  cel(ell(X(0), 34, 5, 4), '#ffe060', { d: 1, lw: 0.9 });
}
// golems of stone, ice or fire
function colossus(a, b, e, o) {
  const G = g(), fire = o.fire, ice = o.ice;
  if (fire) for (let k = 0; k < 12; k++) flameTongue(X(-110 + k * 20), 244, 14, 60 + (k % 4) * 20, k % 2 ? 'rgba(255,90,20,0.55)' : 'rgba(255,160,40,0.45)');
  for (const s of S2) { cel(limbP(X(s * 22), 170, X(s * 30), 236, 18, 15, 0.1, s), a, { d: 6 }); cel(smooth([[X(s * 14), 230], [X(s * 46), 230], [X(s * 48), 246], [X(s * 12), 246]]), a, { d: 3 }); }
  const chest = (ice ? poly : smooth)([[X(-48), 70], [X(48), 70], [X(56), 112], [X(40), 176], [X(-40), 176], [X(-56), 112]]); cel(chest, a, { d: 10, bx: [128, 110, 54] });
  if (!ice) for (const [x1, y1, x2, y2] of [[-30, 86, -10, 110], [24, 80, 6, 120], [-20, 140, 4, 160], [30, 136, 16, 168]]) brush([[X(x1), y1], [X((x1 + x2) / 2 + 4), (y1 + y2) / 2], [X(x2), y2]], 1.2, fire ? '#ffd040' : 'rgba(20,10,10,0.7)');
  if (ice) for (let k = 0; k < 7; k++) brush([[X(-40 + k * 12), 76], [X(-36 + k * 12), 170]], 0.8, 'rgba(255,255,255,0.45)', false);
  G.save(); G.translate(128, 124); G.strokeStyle = e; G.shadowColor = e; G.shadowBlur = 12; G.lineWidth = 2.2; G.beginPath(); G.arc(0, 0, 13, 0, 7); G.moveTo(0, -20); G.lineTo(0, 20); G.moveTo(-17, 0); G.lineTo(17, 0); G.stroke(); G.restore();
  for (const s of S2) { cel(ell(X(s * 56), 82, 22, 18), a, { d: 5 }); cel(limbP(X(s * 58), 94, X(s * 66), 150, 15, 13, 0.1, s), a, { d: 5 }); cel(ell(X(s * 68), 162, 17, 15), a, { d: 4 }); }
  const hd = (ice ? poly : smooth)([[X(-16), 70], [X(-18), 46], [X(0), 34], [X(18), 46], [X(16), 70]]); cel(hd, a, { d: 4, bx: [128, 52, 18] });
  G.fillStyle = '#05030a'; G.fillRect(X(-12), 52, 24, 5); glow(X(-6), 54, 7, css(hx(e), 1)); glow(X(6), 54, 7, css(hx(e), 1));
  if (o.crown) { cel(poly([[X(-18), 40], [X(-20), 18], [X(-10), 28], [X(0), 12], [X(10), 28], [X(20), 18], [X(18), 40]]), hex(o.crown), { d: 2, lw: 1.1 }); }
  if (o.horns) hornPair(128, 40, 'up', hex(o.horns), 1.1);
  if (ice) for (let k = 0; k < 6; k++) cel(poly([[X(-50 + k * 20), 176], [X(-44 + k * 20), 176], [X(-47 + k * 20), 190 + (k % 3) * 6]]), '#e8f8ff', { d: 1, lw: 0.8 });
}
// a squat little ice goblin: crystal skin, an icicle crown, a grin (original, not a snowman)
function frostling(a, b, e, o) {
  figure({ build: 'normal', head: 'ice', outfit: { type: 'bare', col: hex(o.cloth || '#3a5a8a'), col2: b }, skin: a, claws: true, left: 'gesture', lower: 'legs' }, e);
  const G = g(); G.save(); G.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const x = 40 + ((k * 61) % 176), y = 40 + ((k * 43) % 180); G.fillStyle = 'rgba(220,240,255,0.6)'; G.fillRect(x, y, 2, 2); } G.restore();
}
// a scarecrow with a carved-lantern head and a coat full of straw
function scarecrow(a, b, e, o) {
  brush([[X(0), 70], [X(0), 246]], 5, INK); brush([[X(0), 70], [X(0), 246]], 3.4, '#6a4a2a');
  brush([[X(-70), 92], [X(70), 92]], 5, INK); brush([[X(-70), 92], [X(70), 92]], 3.4, '#6a4a2a');
  figure({ build: 'slim', head: 'lantern', outfit: { type: 'coat', col: a, col2: '#3a2a24' }, weapon: { type: 'lantern' }, left: 'gesture', tatter: true }, e);
  const G = g(); for (let k = 0; k < 8; k++) brush([[X(-40 + k * 11), 196 + (k % 2) * 6], [X(-42 + k * 11), 214 + (k % 3) * 4]], 1.6, '#d8b860');
  void G;
}

Object.assign(P, {
  fig: (a, b, e, o) => figure(o, e),
  beast, bird, serpent, longDragon, wyrm, hydra, spider, wisp, flower, colossus, frostling, scarecrow,
});
Object.assign(FIT, { sprite: [0, -46, 0.6], flower: [0, -10, 0.78] });
export const BESTIARY = true;
