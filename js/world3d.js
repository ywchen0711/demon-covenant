// DEMON COVENANT — a floor in 3D. Textures are drawn on canvases (the way HUSH does it); walls are instanced boxes,
// and the special tiles get glowing markers. Each area has its own look.
import * as THREE from 'three';
import { portrait } from './art.js';
import { DEMONS } from './data.js';

export const TILE = 3, WALL_H = 3.2;
const cache = new Map();
function tex(key, w, h, draw, repeat) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  cache.set(key, t); return t;
}
function grime(g, w, h, n, alpha, col = '20,14,8') {
  for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 50, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${alpha})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
}
function cracks(g, w, h, n, col) { g.strokeStyle = col; g.lineWidth = 1.5; for (let i = 0; i < n; i++) { let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 40; y += Math.random() * 30; g.lineTo(x, y); } g.stroke(); } }

// ---------------------------------------------------------------- the five looks
const LOOKS = {
  subway: { fog: '#0a0e0c', fogD: 0.11, lamp: '#e8fff0', amb: ['#3a4a44', '#0a0806', 0.5],
    wall: (g, w, h) => { g.fillStyle = '#c8ccc0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a8e84'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) g.strokeRect(x, y, 32, 32); g.fillStyle = '#2a7a4a'; g.fillRect(0, h * 0.45, w, 26); g.fillStyle = '#1a1a1a'; g.fillRect(0, h * 0.86, w, h * 0.14); grime(g, w, h, 30, 0.45); cracks(g, w, h, 4, 'rgba(30,30,30,.6)'); },
    floor: (g, w, h) => { g.fillStyle = '#4a4a46'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = '#c8b030'; g.fillRect(0, h * 0.46, w, 10); for (let x = 4; x < w; x += 12) { g.fillStyle = '#a89020'; g.fillRect(x, h * 0.46 + 2, 5, 6); } grime(g, w, h, 18, 0.4); },
    ceil: (g, w, h) => { g.fillStyle = '#2a2c2a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8f8e8'; g.fillRect(w * 0.42, 0, w * 0.16, h); grime(g, w, h, 10, 0.5); } },
  mall: { fog: '#0e0a0c', fogD: 0.09, lamp: '#ffe0c0', amb: ['#4a3a40', '#100808', 0.5],
    wall: (g, w, h) => { g.fillStyle = '#6a6470'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4650'; for (let y = h * 0.2; y < h * 0.85; y += 10) g.fillRect(0, y, w, 4); g.fillStyle = '#2a2830'; g.fillRect(0, 0, w, h * 0.2); g.fillStyle = `hsl(${Math.random() * 360},60%,45%)`; g.font = 'bold 40px sans-serif'; g.fillText(['SALE', 'CAFE', 'BOOK', '服飾', '電器'][Math.floor(Math.random() * 5)], 20, h * 0.15); grime(g, w, h, 30, 0.5); cracks(g, w, h, 6, 'rgba(20,10,10,.6)'); },
    floor: (g, w, h) => { for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = (x + y) / 64 % 2 ? '#7a7068' : '#5a524c'; g.fillRect(x, y, 64, 64); } grime(g, w, h, 30, 0.5); cracks(g, w, h, 8, 'rgba(0,0,0,.5)'); },
    ceil: (g, w, h) => { g.fillStyle = '#3a3438'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2428'; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } grime(g, w, h, 14, 0.5); } },
  tower: { fog: '#140808', fogD: 0.075, lamp: '#ffd8b0', amb: ['#5a3a30', '#100606', 0.55],
    wall: (g, w, h) => { g.fillStyle = '#1a1416'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8402a'; g.lineWidth = 14; g.strokeRect(8, 8, w - 16, h - 16); g.lineWidth = 9; g.beginPath(); g.moveTo(8, 8); g.lineTo(w - 8, h - 8); g.moveTo(w - 8, 8); g.lineTo(8, h - 8); g.stroke(); g.fillStyle = '#d8d0c0'; for (const [x, y] of [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14], [w / 2, h / 2]]) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } grime(g, w, h, 20, 0.5, '60,20,10'); },
    floor: (g, w, h) => { g.fillStyle = '#2a2a2c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a4a4e'; g.lineWidth = 3; for (let i = -h; i < w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); } grime(g, w, h, 16, 0.5); },
    ceil: (g, w, h) => { g.fillStyle = '#100c0c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a2a1a'; g.lineWidth = 8; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } } },
  shrine: { fog: '#0a0a14', fogD: 0.1, lamp: '#ffd890', amb: ['#3a3a5a', '#0a0808', 0.5],
    wall: (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a2a1a'; g.lineWidth = 10; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } g.lineWidth = 4; for (let y = 0; y < h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#5a2a1a'; g.fillRect(0, h * 0.82, w, h * 0.18); grime(g, w, h, 24, 0.35); },
    floor: (g, w, h) => { g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2a1a'; g.lineWidth = 3; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(0,0,0,.15)'; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.lineTo(w, y + 2); g.stroke(); } grime(g, w, h, 14, 0.4); },
    ceil: (g, w, h) => { g.fillStyle = '#2a1a12'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a0e08'; g.lineWidth = 12; for (let x = 0; x < w; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } } },
  abyss: { fog: '#0c0412', fogD: 0.1, lamp: '#e0b0ff', amb: ['#4a1a5a', '#080208', 0.6],
    wall: (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a0a2a'); gr.addColorStop(1, '#5a1a3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${150 + Math.random() * 100},40,90,.5)`; g.lineWidth = 2 + Math.random() * 4; g.beginPath(); let x = Math.random() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (Math.random() - 0.5) * 30; y += 20; g.lineTo(x, y); } g.stroke(); } for (let i = 0; i < 6; i++) { const x = Math.random() * w, y = Math.random() * h; g.fillStyle = '#ffe0a0'; g.beginPath(); g.ellipse(x, y, 7, 4, 0, 0, 7); g.fill(); g.fillStyle = '#100008'; g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); } },
    floor: (g, w, h) => { g.fillStyle = '#1a0614'; g.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(160,30,80,${Math.random() * 0.3})`; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 6 + Math.random() * 14, Math.random() * 3, 0, 7); g.fill(); } },
    ceil: (g, w, h) => { g.fillStyle = '#0a020a'; g.fillRect(0, 0, w, h); grime(g, w, h, 20, 0.6, '80,10,60'); } },
};
export const lookOf = (name) => LOOKS[name] || LOOKS.subway;

// ---------------------------------------------------------------- marker textures
const circleTex = () => tex('circle', 256, 256, (g, w) => {
  g.translate(w / 2, w / 2); g.strokeStyle = '#ff3a3a'; g.shadowColor = '#ff2020'; g.shadowBlur = 12; g.lineWidth = 5;
  g.beginPath(); g.arc(0, 0, 110, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, 92, 0, 7); g.stroke();
  g.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; g.lineTo(Math.cos(a) * 92, Math.sin(a) * 92); } g.stroke();
  g.font = '16px serif'; g.fillStyle = '#ff6a6a'; for (let i = 0; i < 12; i++) { g.save(); g.rotate(i * Math.PI / 6); g.fillText('ᚠᛟᚱᛞᚨᛗᚾᛋ'[i % 9], -5, -96); g.restore(); }
});
const screenTex = () => tex('screen', 128, 128, (g, w, h) => {
  g.fillStyle = '#062a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#40e0ff'; g.font = 'bold 18px monospace'; g.fillText('TERMINAL', 12, 30);
  g.fillStyle = '#20a0c0'; for (let y = 44; y < h - 10; y += 12) g.fillRect(12, y, 40 + Math.random() * 60, 5);
});
const arrowTex = (down) => tex('arrow' + down, 128, 128, (g, w) => {
  g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, w); g.fillStyle = down ? '#80ffb0' : '#80c0ff'; g.shadowColor = g.fillStyle; g.shadowBlur = 14;
  g.beginPath(); if (down) { g.moveTo(64, 110); g.lineTo(20, 60); g.lineTo(46, 60); g.lineTo(46, 16); g.lineTo(82, 16); g.lineTo(82, 60); g.lineTo(108, 60); } else { g.moveTo(64, 16); g.lineTo(108, 66); g.lineTo(82, 66); g.lineTo(82, 110); g.lineTo(46, 110); g.lineTo(46, 66); g.lineTo(20, 66); } g.closePath(); g.fill();
});

// ---------------------------------------------------------------- build
// floor: { n, tiles }, opened: Set of "x,y" chests already opened, flags: { boss done, story seen }
export function buildWorld(floor, lookName, state) {
  const L = lookOf(lookName), group = new THREE.Group(), n = floor.n, live = [];
  const mat = (name, draw, rep) => new THREE.MeshStandardMaterial({ map: tex(lookName + name, 256, 256, draw, rep), roughness: 0.9 });
  const wallMat = mat('wall', L.wall), floorMat = mat('floor', L.floor), ceilMat = mat('ceil', L.ceil);
  // walls: one box per wall tile that touches an open tile
  const walls = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (floor.tiles[y][x] !== '#') continue;
    const touches = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => floor.tiles[y + dy] && floor.tiles[y + dy][x + dx] && floor.tiles[y + dy][x + dx] !== '#');
    if (touches) walls.push([x, y]);
  }
  const box = new THREE.BoxGeometry(TILE, WALL_H, TILE), im = new THREE.InstancedMesh(box, wallMat, walls.length), m4 = new THREE.Matrix4();
  walls.forEach(([x, y], i) => { m4.makeTranslation(x * TILE, WALL_H / 2, y * TILE); im.setMatrixAt(i, m4); });
  group.add(im);
  const pg = new THREE.PlaneGeometry(n * TILE, n * TILE);
  const fl = new THREE.Mesh(pg, floorMat); fl.rotation.x = -Math.PI / 2; fl.position.set((n - 1) * TILE / 2, 0, (n - 1) * TILE / 2); floorMat.map.repeat.set(n, n); group.add(fl);
  const ce = new THREE.Mesh(pg, ceilMat); ce.rotation.x = Math.PI / 2; ce.position.set((n - 1) * TILE / 2, WALL_H, (n - 1) * TILE / 2); ceilMat.map.repeat.set(n, n); group.add(ce);
  // markers
  const markers = new Map(), at = (x, y) => new THREE.Vector3(x * TILE, 0, y * TILE);
  const glow = (col, inten = 2.2) => new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: inten, roughness: 0.6 });
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const c = floor.tiles[y][x], g = new THREE.Group(); g.position.copy(at(x, y));
    if (c === 'D' || c === 'U') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 40), glow(c === 'D' ? '#40ff90' : '#40a0ff')); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05; g.add(ring);
      if (c === 'D') { const hole = new THREE.Mesh(new THREE.CircleGeometry(0.85, 32), new THREE.MeshBasicMaterial({ color: '#000' })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.03; g.add(hole); }
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: arrowTex(c === 'D'), transparent: true, depthWrite: false })); sign.position.y = 1.6; g.add(sign); live.push({ obj: sign, spin: 1 });
    } else if (c === 'T') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.5), new THREE.MeshStandardMaterial({ color: '#2a3038', roughness: 0.4, metalness: 0.6 })); body.position.y = 0.7; g.add(body);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.45), new THREE.MeshBasicMaterial({ map: screenTex() })); scr.position.set(0, 1.05, 0.26); g.add(scr);
      const scr2 = scr.clone(); scr2.rotation.y = Math.PI; scr2.position.z = -0.26; g.add(scr2);
      const l = new THREE.PointLight('#40d0ff', 1.6, 6, 1.6); l.position.y = 1.3; g.add(l); live.push({ obj: scr, bob: 0 });
    } else if (c === 'F') {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshBasicMaterial({ map: circleTex(), transparent: true, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.04; g.add(disc); live.push({ obj: disc, rot: 0.3 });
      for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5, cd = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), glow('#ffe0a0', 0.6)); cd.position.set(Math.cos(a) * 1.2, 0.2, Math.sin(a) * 1.2); g.add(cd); }
      const l = new THREE.PointLight('#ff4040', 2, 7, 1.5); l.position.y = 1; g.add(l);
    } else if (c === 'C') {
      const open = state.opened.has(x + ',' + y);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.6), new THREE.MeshStandardMaterial({ color: '#6a4a2a', roughness: 0.7 })); base.position.y = 0.25; g.add(base);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.14, 0.62), new THREE.MeshStandardMaterial({ color: '#8a6a3a', roughness: 0.6, metalness: 0.3 })); lid.position.set(0, 0.57, open ? -0.3 : 0); lid.rotation.x = open ? -1.2 : 0; g.add(lid);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.08, 0.64), glow('#ffd040', open ? 0.1 : 0.8)); band.position.y = 0.36; g.add(band);
      g.userData = { lid, band };
    } else if (c === 'N' && !state.story) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), glow('#ffffff', 3)); orb.position.y = 1.5; g.add(orb); live.push({ obj: orb, bob: 1 });
      const l = new THREE.PointLight('#e0f0ff', 1.5, 6, 1.6); l.position.y = 1.5; g.add(l);
    } else if (c === 'B' && !state.boss && state.bossId) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(portrait(DEMONS[state.bossId].art)), transparent: true, depthWrite: false })); sp.scale.set(2.6, 2.6, 1); sp.position.y = 1.5; g.add(sp); live.push({ obj: sp, bob: 2 });
      const l = new THREE.PointLight('#ff2030', 2.5, 8, 1.4); l.position.y = 1.2; g.add(l);
    } else continue;
    group.add(g); markers.set(x + ',' + y, g);
  }
  return {
    group, markers, look: L,
    openChest(x, y) { const m = markers.get(x + ',' + y); if (m && m.userData.lid) { m.userData.lid.rotation.x = -1.2; m.userData.lid.position.z = -0.3; m.userData.band.material.emissiveIntensity = 0.1; } },
    remove(x, y) { const m = markers.get(x + ',' + y); if (m) { group.remove(m); markers.delete(x + ',' + y); } },
    update(t) { for (const L2 of live) { if (L2.spin) L2.obj.rotation.y = t * 1.5; if (L2.rot) L2.obj.rotation.z = t * L2.rot; if (L2.bob) L2.obj.position.y = (L2.bob === 2 ? 1.6 : 1.5) + Math.sin(t * 2) * 0.12; } },
    dispose() { group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); },
  };
}
