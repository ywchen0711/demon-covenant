// DEMON COVENANT — demon portraits, drawn in code on a canvas: a body type and a palette per demon (see data.js).
// Shapes are filled with a soft light from the upper left, outlined in near-black, with glowing eyes.
const cache = new Map();
const OUT = '#0a0710';

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
// a soft-lit fill for a shape centred near (x, y) with size s
function lit(g, x, y, s, col) { const gr = g.createRadialGradient(x - s * 0.35, y - s * 0.4, s * 0.05, x, y, s * 1.1); gr.addColorStop(0, shade(col, 0.35)); gr.addColorStop(0.55, col); gr.addColorStop(1, shade(col, -0.55)); return gr; }
function blob(g, x, y, rx, ry, col, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fillStyle = lit(g, x, y, Math.max(rx, ry), col); g.fill(); g.lineWidth = 4; g.strokeStyle = OUT; g.stroke(); }
function shape(g, pts, col, cx, cy, s, close = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) p.length === 4 ? g.quadraticCurveTo(p[0], p[1], p[2], p[3]) : g.lineTo(p[0], p[1]); if (close) g.closePath(); g.fillStyle = lit(g, cx, cy, s, col); g.fill(); g.lineWidth = 4; g.strokeStyle = OUT; g.stroke(); }
function limb(g, x1, y1, x2, y2, w, col) { g.lineCap = 'round'; g.lineWidth = w + 6; g.strokeStyle = OUT; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
function eyes(g, x, y, gap, r, col, n = 2) {
  g.save(); g.shadowColor = col; g.shadowBlur = 14;
  for (let i = 0; i < n; i++) { const ex = x + (i - (n - 1) / 2) * gap; g.fillStyle = col; g.beginPath(); g.ellipse(ex, y, r, r * 0.75, 0, 0, 7); g.fill(); }
  g.restore();
  for (let i = 0; i < n; i++) { const ex = x + (i - (n - 1) / 2) * gap; g.fillStyle = OUT; g.beginPath(); g.arc(ex, y, r * 0.32, 0, 7); g.fill(); }
}
function wing(g, x, y, s, dir, col, feather = true) {
  const pts = [[x, y], [x + dir * s * 1.1, y - s * 0.9], [x + dir * s * 1.5, y - s * 0.2], [x + dir * s * 1.2, y + s * 0.25], [x + dir * s * 0.7, y + s * 0.15], [x + dir * s * 0.3, y + s * 0.35]];
  shape(g, pts, col, x + dir * s * 0.7, y - s * 0.2, s);
  if (feather) { g.strokeStyle = shade(col, -0.45); g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + dir * s * 0.2, y); g.lineTo(x + dir * s * (0.5 + k * 0.28), y - s * (0.5 - k * 0.22)); g.stroke(); } }
}
function horns(g, x, y, gap, len, col) { for (const d of [-1, 1]) shape(g, [[x + d * gap, y], [x + d * (gap + len * 0.5), y - len * 0.9, x + d * (gap + len * 0.9), y - len * 1.1], [x + d * (gap + len * 0.2), y - len * 0.2]], col, x + d * gap, y - len * 0.5, len); }
function aura(g, col) { const gr = g.createRadialGradient(128, 140, 10, 128, 140, 128); gr.addColorStop(0, shade(col, 0.1).replace('rgb', 'rgba').replace(')', ',0.35)')); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }

const DRAW = {
  fairy(g, a, b, e) {
    wing(g, 124, 120, 50, -1, shade(b, -0.05)); wing(g, 132, 120, 50, 1, shade(b, -0.05));
    g.globalAlpha = 0.85; g.globalAlpha = 1;
    shape(g, [[112, 130], [144, 130], [152, 196], [104, 196]], a, 128, 160, 40);
    limb(g, 116, 140, 96, 170, 7, '#f4d8c0'); limb(g, 140, 140, 162, 112, 7, '#f4d8c0');
    limb(g, 118, 196, 114, 226, 7, '#f4d8c0'); limb(g, 138, 196, 144, 226, 7, '#f4d8c0');
    blob(g, 128, 104, 24, 26, '#f6dcc4'); shape(g, [[100, 104], [104, 70, 128, 72], [154, 70, 156, 104], [140, 88], [116, 88]], a, 128, 84, 30);
    eyes(g, 128, 108, 18, 6, '#3a6aff'); g.fillStyle = e; g.beginPath(); g.arc(122, 106, 2, 0, 7); g.arc(140, 106, 2, 0, 7); g.fill();
  },
  lady(g, a, b, e) {
    shape(g, [[128, 92], [176, 236, 196, 248], [60, 248], [80, 236, 128, 92]], a, 128, 190, 80);
    limb(g, 108, 128, 84, 178, 9, b); limb(g, 148, 128, 172, 178, 9, b);
    shape(g, [[110, 120], [146, 120], [140, 170], [116, 170]], shade(a, -0.2), 128, 145, 30);
    blob(g, 128, 92, 22, 26, b);
    shape(g, [[100, 96], [96, 50, 128, 52], [162, 50, 158, 100], [168, 150], [146, 96], [110, 96], [88, 150]], shade(a, -0.35), 128, 80, 40);
    eyes(g, 128, 94, 18, 5, e);
  },
  angel(g, a, b, e) {
    wing(g, 116, 116, 62, -1, '#f4f4ff'); wing(g, 140, 116, 62, 1, '#f4f4ff');
    g.save(); g.strokeStyle = '#ffe680'; g.shadowColor = '#ffe680'; g.shadowBlur = 16; g.lineWidth = 5; g.beginPath(); g.ellipse(128, 56, 26, 8, 0, 0, 7); g.stroke(); g.restore();
    shape(g, [[106, 112], [150, 112], [168, 236], [88, 236]], a, 128, 170, 70);
    shape(g, [[106, 112], [150, 112], [140, 150], [116, 150]], b, 128, 130, 30);
    limb(g, 110, 124, 82, 150, 9, shade(a, 0.1)); limb(g, 146, 124, 176, 96, 9, shade(a, 0.1));
    limb(g, 176, 96, 196, 40, 5, '#d8d8e0');
    blob(g, 128, 90, 20, 23, '#f0e0d0'); shape(g, [[108, 92], [110, 64, 128, 66], [148, 64, 150, 92], [138, 80], [118, 80]], b, 128, 76, 24);
    eyes(g, 128, 94, 15, 4, e);
  },
  cat(g, a, b, e) {
    shape(g, [[150, 210], [200, 200, 214, 150], [222, 120, 206, 104], [210, 140, 186, 178], [160, 196]], a, 190, 160, 40);
    blob(g, 128, 186, 48, 44, a);
    blob(g, 128, 176, 22, 30, b);
    limb(g, 104, 210, 100, 232, 12, a); limb(g, 152, 210, 156, 232, 12, a);
    blob(g, 128, 112, 40, 36, a);
    for (const d of [-1, 1]) shape(g, [[128 + d * 14, 86], [128 + d * 36, 56], [128 + d * 40, 98]], a, 128 + d * 30, 80, 20);
    blob(g, 128, 126, 14, 10, b); eyes(g, 128, 108, 30, 8, e);
    g.strokeStyle = OUT; g.lineWidth = 2; for (const d of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(128 + d * 14, 126 + k * 4); g.lineTo(128 + d * 52, 118 + k * 9); g.stroke(); }
  },
  dog(g, a, b, e) {
    shape(g, [[90, 160], [70, 120, 96, 110], [70, 180], [96, 230]], b, 84, 160, 40);
    blob(g, 132, 180, 58, 42, a);
    limb(g, 100, 200, 96, 236, 13, a); limb(g, 162, 200, 168, 236, 13, a);
    blob(g, 120, 116, 36, 32, a); shape(g, [[96, 116], [74, 126], [72, 140], [100, 142]], a, 86, 130, 20);
    for (const d of [-1, 1]) shape(g, [[120 + d * 14, 92], [120 + d * 30, 62], [120 + d * 34, 100]], a, 120 + d * 26, 84, 18);
    shape(g, [[96, 150], [128, 160], [160, 150], [128, 172]], b, 128, 158, 30);
    eyes(g, 124, 110, 26, 7, e); g.fillStyle = OUT; g.beginPath(); g.arc(76, 132, 5, 0, 7); g.fill();
  },
  horse(g, a, b, e) {
    blob(g, 140, 170, 62, 36, a);
    for (const x of [96, 116, 164, 184]) limb(g, x, 190, x - 4, 236, 11, a);
    shape(g, [[96, 156], [80, 100], [92, 70], [112, 74], [118, 140]], a, 100, 110, 40);
    shape(g, [[92, 70], [64, 88], [60, 106], [84, 104]], a, 76, 92, 20);
    shape(g, [[104, 70], [132, 90, 130, 150], [116, 150], [112, 100]], b, 118, 110, 30);
    shape(g, [[200, 160], [236, 150, 232, 196], [210, 184]], b, 216, 172, 20);
    eyes(g, 92, 86, 0, 6, e, 1);
  },
  spirit(g, a, b, e) {
    g.save(); g.shadowColor = a; g.shadowBlur = 30; blob(g, 128, 150, 54, 70, a); g.restore();
    blob(g, 128, 150, 54, 70, a);
    for (const [x, y, r] of [[96, 196, 14], [150, 204, 16], [124, 214, 12]]) blob(g, x, y, r, r * 0.8, b);
    limb(g, 82, 150, 60, 132, 8, b); limb(g, 174, 150, 196, 128, 8, b);
    shape(g, [[96, 104], [128, 70], [160, 104], [148, 96], [128, 88], [108, 96]], b, 128, 90, 30);
    g.fillStyle = e; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(128 + d * 18, 140, 9, 12, 0, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(128, 170, 8, 10, 0, 0, 7); g.fill();
  },
  imp(g, a, b, e) {
    shape(g, [[150, 196], [190, 214, 200, 184], [206, 168], [190, 176], [168, 186]], a, 180, 190, 20);
    blob(g, 128, 176, 40, 44, a); blob(g, 128, 180, 22, 26, b);
    limb(g, 96, 160, 76, 196, 10, a); limb(g, 160, 160, 182, 132, 10, a);
    limb(g, 112, 214, 108, 238, 10, a); limb(g, 144, 214, 150, 238, 10, a);
    blob(g, 128, 118, 36, 32, a); horns(g, 128, 98, 16, 26, b);
    eyes(g, 128, 116, 24, 8, e); g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(110, 134); g.quadraticCurveTo(128, 144, 146, 134); g.stroke();
  },
  giant(g, a, b, e) {
    shape(g, [[84, 110], [172, 110], [188, 210], [68, 210]], a, 128, 160, 70);
    limb(g, 80, 120, 52, 196, 22, a); limb(g, 176, 120, 204, 196, 22, a);
    limb(g, 104, 210, 100, 244, 22, b); limb(g, 152, 210, 156, 244, 22, b);
    shape(g, [[84, 150], [172, 150], [176, 172], [80, 172]], b, 128, 160, 50);
    blob(g, 128, 88, 30, 30, a); eyes(g, 128, 86, 0, 11, e, 1);
  },
  ogre(g, a, b, e) {
    shape(g, [[80, 110], [176, 110], [192, 200], [64, 200]], a, 128, 156, 70);
    shape(g, [[64, 196], [192, 196], [184, 226], [72, 226]], b, 128, 210, 60);
    limb(g, 78, 124, 46, 190, 22, a); limb(g, 178, 124, 212, 92, 22, a);
    limb(g, 212, 92, 230, 36, 10, '#8a8a90'); blob(g, 230, 36, 12, 12, '#6a6a70');
    limb(g, 104, 226, 100, 248, 20, a); limb(g, 152, 226, 156, 248, 20, a);
    blob(g, 128, 86, 34, 32, a); horns(g, 128, 64, 14, 26, b);
    eyes(g, 128, 84, 26, 8, e);
    g.fillStyle = '#f0f0e0'; for (const d of [-1, 1]) { g.beginPath(); g.moveTo(128 + d * 10, 100); g.lineTo(128 + d * 14, 112); g.lineTo(128 + d * 18, 100); g.fill(); }
  },
  spider(g, a, b, e) {
    for (const d of [-1, 1]) for (let k = 0; k < 4; k++) { const y = 130 + k * 16; limb(g, 128 + d * 30, y, 128 + d * (80 + k * 6), y - 40 + k * 10, 8, a); limb(g, 128 + d * (80 + k * 6), y - 40 + k * 10, 128 + d * (104 + k * 8), y + 40 + k * 8, 7, a); }
    blob(g, 128, 186, 50, 42, a); g.strokeStyle = b; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 150); g.lineTo(128, 220); g.moveTo(100, 186); g.lineTo(156, 186); g.stroke();
    blob(g, 128, 128, 34, 30, shade(a, 0.1));
    eyes(g, 128, 120, 14, 5, e, 4); eyes(g, 128, 134, 18, 4, e, 2);
  },
  blob(g, a, b, e) {
    shape(g, [[52, 214], [44, 160, 92, 130], [118, 64, 128, 64], [142, 64, 164, 130], [214, 160, 206, 214]], a, 128, 170, 90);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(100, 128, 14, 22, -0.5, 0, 7); g.fill();
    blob(g, 74, 214, 12, 8, a); blob(g, 186, 220, 10, 7, a);
    g.fillStyle = OUT; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(128 + d * 22, 160, 9, 13, 0, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(128, 190, 18, 9, 0, 0, Math.PI); g.fill();
  },
  wisp(g, a, b, e) {
    g.save(); g.shadowColor = a; g.shadowBlur = 40;
    shape(g, [[128, 50], [180, 130, 168, 176], [150, 214, 128, 214], [104, 214, 88, 176], [76, 130, 128, 50]], a, 128, 150, 70); g.restore();
    shape(g, [[128, 92], [158, 146, 150, 172], [140, 196, 128, 196], [114, 196, 106, 172], [98, 146, 128, 92]], b, 128, 160, 40);
    g.fillStyle = OUT; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(128 + d * 14, 162, 6, 9, 0, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(128, 184, 7, 9, 0, 0, 7); g.fill();
  },
  zombie(g, a, b, e) {
    shape(g, [[96, 110], [160, 110], [172, 214], [84, 214]], b, 128, 160, 60);
    limb(g, 98, 122, 50, 118, 12, a); limb(g, 158, 122, 206, 124, 12, a);
    limb(g, 108, 214, 98, 246, 13, a); limb(g, 148, 214, 160, 246, 13, a);
    blob(g, 124, 82, 26, 30, a);
    eyes(g, 124, 80, 20, 6, e); g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(112, 100); g.lineTo(138, 98); g.stroke();
    g.strokeStyle = shade(b, -0.5); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(100 + k * 18, 140); g.lineTo(96 + k * 20, 200); g.stroke(); }
  },
  moth(g, a, b, e) {
    for (const d of [-1, 1]) { shape(g, [[128, 120], [128 + d * 120, 50], [128 + d * 110, 150], [128 + d * 30, 150]], a, 128 + d * 70, 110, 60); shape(g, [[128, 150], [128 + d * 90, 160], [128 + d * 70, 220], [128 + d * 20, 180]], b, 128 + d * 50, 180, 40); blob(g, 128 + d * 66, 100, 14, 14, b); }
    blob(g, 128, 150, 18, 52, shade(a, -0.3));
    blob(g, 128, 100, 20, 20, shade(a, -0.4)); eyes(g, 128, 98, 16, 9, e);
    for (const d of [-1, 1]) { g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(128 + d * 6, 82); g.quadraticCurveTo(128 + d * 30, 40, 128 + d * 40, 50); g.stroke(); }
  },
  bird(g, a, b, e) {
    wing(g, 112, 118, 70, -1, a); wing(g, 144, 118, 70, 1, a);
    blob(g, 128, 156, 34, 50, a); blob(g, 128, 164, 20, 34, b);
    shape(g, [[114, 200], [128, 244], [142, 200]], a, 128, 220, 20);
    limb(g, 116, 200, 110, 236, 5, '#e0b040'); limb(g, 140, 200, 146, 236, 5, '#e0b040');
    blob(g, 128, 100, 26, 26, a);
    shape(g, [[118, 106], [128, 132], [138, 106]], '#f0c040', 128, 114, 14);
    shape(g, [[110, 84], [128, 52], [146, 84]], b, 128, 70, 20);
    eyes(g, 128, 96, 22, 6, e);
  },
  serpent(g, a, b, e) {
    g.lineCap = 'round';
    g.lineWidth = 46; g.strokeStyle = OUT; g.beginPath(); g.moveTo(60, 236); g.bezierCurveTo(230, 230, 220, 170, 140, 160); g.bezierCurveTo(70, 150, 90, 90, 128, 80); g.stroke();
    g.lineWidth = 38; g.strokeStyle = a; g.stroke();
    g.lineWidth = 12; g.strokeStyle = b; g.beginPath(); g.moveTo(70, 232); g.bezierCurveTo(222, 224, 212, 178, 140, 170); g.bezierCurveTo(84, 160, 100, 100, 128, 92); g.stroke();
    shape(g, [[92, 78], [128, 50], [164, 78], [150, 106], [106, 106]], a, 128, 80, 40);
    shape(g, [[88, 62], [128, 30], [168, 62], [128, 58]], b, 128, 50, 30);
    eyes(g, 128, 80, 26, 6, e); g.strokeStyle = '#c02020'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 106); g.lineTo(128, 122); g.lineTo(120, 130); g.moveTo(128, 122); g.lineTo(136, 130); g.stroke();
  },
  chimera(g, a, b, e) {
    shape(g, [[170, 190], [214, 196, 226, 150], [234, 120, 212, 110], [204, 150, 180, 170]], '#5a8a4a', 210, 160, 30);
    blob(g, 214, 108, 12, 10, '#5a8a4a'); eyes(g, 214, 106, 0, 3, '#ffff60', 1);
    blob(g, 128, 176, 60, 40, a);
    for (const x of [86, 108, 150, 172]) { limb(g, x, 196, x, 236, 12, b); g.strokeStyle = OUT; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - 6, 206 + k * 9); g.lineTo(x + 6, 206 + k * 9); g.stroke(); } }
    blob(g, 92, 118, 34, 32, '#a07a50');
    blob(g, 92, 126, 20, 16, '#e0b890'); eyes(g, 92, 112, 22, 7, e);
  },
  hydra(g, a, b, e) {
    blob(g, 128, 200, 76, 44, a);
    const heads = [[40, 70], [80, 40], [128, 28], [176, 40], [216, 70]];
    for (const [x, y] of heads) { g.lineCap = 'round'; g.lineWidth = 26; g.strokeStyle = OUT; g.beginPath(); g.moveTo(128, 196); g.quadraticCurveTo((x + 128) / 2, 150, x, y + 20); g.stroke(); g.lineWidth = 19; g.strokeStyle = a; g.stroke(); }
    for (const [x, y] of heads) { shape(g, [[x - 18, y + 18], [x, y - 6], [x + 18, y + 18], [x, y + 34]], a, x, y + 12, 22); shape(g, [[x - 14, y + 4], [x, y - 18], [x + 14, y + 4], [x, y]], b, x, y - 4, 14); eyes(g, x, y + 12, 12, 4, e); }
  },
};

// signature details drawn over (or under) the body: art[4] lists them
const EXTRA = {
  batwings: { under: true, draw(g, a) { for (const d of [-1, 1]) shape(g, [[128 + d * 14, 110], [128 + d * 70, 60], [128 + d * 112, 84], [128 + d * 96, 110], [128 + d * 108, 140], [128 + d * 82, 130], [128 + d * 74, 160], [128 + d * 40, 140]], shade(a, -0.35), 128 + d * 70, 110, 50); } },
  wings2: { under: true, draw(g) { wing(g, 112, 150, 52, -1, '#e0e0f8'); wing(g, 144, 150, 52, 1, '#e0e0f8'); } },
  fairywings: { under: true, draw(g, a, b) { for (const d of [-1, 1]) { g.save(); g.globalAlpha = 0.75; blob(g, 128 + d * 60, 100, 46, 26, b, d * -0.5); blob(g, 128 + d * 50, 150, 32, 18, b, d * 0.4); g.restore(); } } },
  crown: { draw(g) { shape(g, [[104, 64], [110, 40], [120, 56], [128, 34], [136, 56], [146, 40], [152, 64]], '#ffd040', 128, 52, 26); g.save(); g.fillStyle = '#ff3040'; g.shadowColor = '#ff3040'; g.shadowBlur = 8; g.beginPath(); g.arc(128, 54, 4, 0, 7); g.fill(); g.restore(); } },
  heads3: { draw(g, a, b, e) { for (const d of [-1, 1]) { blob(g, 120 + d * 46, 104, 26, 24, a); for (const s of [-1, 1]) shape(g, [[120 + d * 46 + s * 10, 86], [120 + d * 46 + s * 22, 64], [120 + d * 46 + s * 26, 92]], a, 120 + d * 46 + s * 20, 80, 12); eyes(g, 120 + d * 46, 100, 16, 5, e); } } },
  arms4: { under: true, draw(g, a, b) { limb(g, 108, 140, 60, 110, 8, b); limb(g, 148, 140, 196, 110, 8, b); limb(g, 60, 110, 52, 86, 6, '#d8d8e0'); limb(g, 196, 110, 204, 86, 6, '#d8d8e0'); } },
  horns: { draw(g, a, b) { horns(g, 128, 74, 14, 24, b); } },
};
// the portrait of a demon (art = [body, main colour, second colour, eye colour, extras]) as a 256×256 canvas
export function portrait(art) {
  const key = art.join();
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.lineJoin = 'round';
  aura(g, art[1]);
  const extras = (art[4] || []).map((k) => EXTRA[k]).filter(Boolean);
  for (const x of extras) if (x.under) x.draw(g, art[1], art[2], art[3]);
  (DRAW[art[0]] || DRAW.blob)(g, art[1], art[2], art[3]);
  for (const x of extras) if (!x.under) x.draw(g, art[1], art[2], art[3]);
  cache.set(key, c);
  return c;
}
export const BODIES = Object.keys(DRAW);
