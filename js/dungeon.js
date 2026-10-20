// DEMON COVENANT — floor layouts: a seeded maze with a few rooms and loops, then stairs, terminals, a fusion altar,
// chests, story spots and the boss. No DOM.
//   tiles: '#' wall, '.' floor, 'U' way back up, 'D' way down, 'T' terminal (rest, save, shop), 'F' fusion altar,
//          'C' chest, 'N' story spot, 'B' boss (becomes 'D' once beaten)
import { FLOORS, AREAS } from './data.js?v=5';

export function makeRng(seed) {
  return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];      // north, east, south, west

export function buildFloor(seed, index) {
  const F = FLOORS[index], A = AREAS[F.area], n = A.size, r = makeRng(seed * 131 + index * 7919 + 17);
  const g = Array.from({ length: n }, () => Array(n).fill('#'));
  // a maze on the odd cells (depth-first, so long winding corridors)
  const stack = [[1, 1]]; g[1][1] = '.';
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = DIRS.map(([dx, dy]) => [x + dx * 2, y + dy * 2, dx, dy]).filter(([nx, ny]) => nx > 0 && ny > 0 && nx < n - 1 && ny < n - 1 && g[ny][nx] === '#');
    if (!opts.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = opts[Math.floor(r() * opts.length)];
    g[y + dy][x + dx] = '.'; g[ny][nx] = '.'; stack.push([nx, ny]);
  }
  // some loops, so it is not one long corridor
  for (let k = 0; k < n * 1.4; k++) {
    const x = 1 + Math.floor(r() * (n - 2)), y = 1 + Math.floor(r() * (n - 2));
    if (g[y][x] !== '#') continue;
    if ((g[y][x - 1] === '.' && g[y][x + 1] === '.' && g[y - 1][x] === '#' && g[y + 1][x] === '#') || (g[y - 1][x] === '.' && g[y + 1][x] === '.' && g[y][x - 1] === '#' && g[y][x + 1] === '#')) g[y][x] = '.';
  }
  // two or three halls
  for (let k = 0; k < 2 + Math.floor(r() * 2); k++) {
    const w = 3, h = 3, x0 = 1 + 2 * Math.floor(r() * ((n - 5) / 2)), y0 = 1 + 2 * Math.floor(r() * ((n - 5) / 2));
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) g[y][x] = '.';
  }
  // distances from the start
  const start = [1, 1], dist = bfs(g, start);
  const cells = [];
  for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) if (g[y][x] === '.' && dist[y][x] >= 0) cells.push([x, y, dist[y][x]]);
  const far = cells.reduce((a, b) => (b[2] > a[2] ? b : a));
  const used = new Set([start.join(), far.join()]);
  const put = (c, ch) => { g[c[1]][c[0]] = ch; used.add(c[0] + ',' + c[1]); };
  const free = (c) => !used.has(c[0] + ',' + c[1]) && g[c[1]][c[0]] === '.';
  const nearStart = (lo, hi) => cells.filter((c) => c[2] >= lo && c[2] <= hi && free(c));
  g[1][1] = index === 0 ? '.' : 'U';
  if (F.boss) put(far, 'B'); else put(far, 'D');
  // a terminal near the start, the fusion altar on an area's first floor
  const t = nearStart(3, 7); if (t.length) put(t[Math.floor(r() * t.length)], 'T');
  if (F.floor === 1) { const f = nearStart(4, 10); if (f.length) put(f[Math.floor(r() * f.length)], 'F'); }
  // a second terminal right before the boss
  if (F.boss) { const bt = cells.filter((c) => c[2] >= far[2] - 4 && c[2] <= far[2] - 2 && free(c)); if (bt.length) put(bt[0], 'T'); }
  // chests in dead ends
  const dead = cells.filter((c) => free(c) && c[2] > 4 && DIRS.filter(([dx, dy]) => g[c[1] + dy][c[0] + dx] !== '#').length === 1);
  for (const c of dead.sort(() => r() - 0.5).slice(0, 3 + Math.floor(r() * 3))) put(c, 'C');
  // the story spot, about half way in
  const mid = cells.filter((c) => free(c) && c[2] >= far[2] * 0.35 && c[2] <= far[2] * 0.6);
  if (mid.length) put(mid[Math.floor(r() * mid.length)], 'N');
  return { n, tiles: g.map((row) => row.join('')), start: { x: 1, y: 1, dir: 2 }, area: F.area, index };
}
export function bfs(g, [sx, sy]) {
  const n = g.length, d = Array.from({ length: n }, () => Array(n).fill(-1)), q = [[sx, sy]]; d[sy][sx] = 0;
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (g[ny] && g[ny][nx] && g[ny][nx] !== '#' && d[ny][nx] < 0) { d[ny][nx] = d[y][x] + 1; q.push([nx, ny]); } } }
  return d;
}
export { DIRS };
