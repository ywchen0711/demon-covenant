// DEMON COVENANT — who you meet on each floor. No DOM.
import { AREAS, FLOORS, DEMONS } from './data.js';
import { makeEnemy } from './party.js';

// the strongest demon that can turn up on each floor (the area's list, filtered by this cap)
export const FLOOR_CAP = [3, 7, 11, 15, 19, 23, 27, 31, 34, 37, 40];
export function encounter(index, rng) {
  const F = FLOORS[index], A = AREAS[F.area], cap = FLOOR_CAP[index], low = index ? FLOOR_CAP[index - 1] - 6 : 0;
  let pool = A.enc.filter((id) => DEMONS[id].lv <= cap && DEMONS[id].lv >= low);
  if (!pool.length) pool = A.enc.slice(0, 3);
  const n = Math.min(index === 0 ? 2 : 4, 1 + Math.floor(rng() * (index < 2 ? 2.4 : 3.6)));
  return Array.from({ length: n }, () => { const id = pool[Math.floor(rng() * pool.length)]; return makeEnemy(id, Math.max(1, Math.min(cap, DEMONS[id].lv + Math.floor(rng() * 3) - 1))); });
}
// the boss of a floor (Abyss 2: depends on the road chosen)
export function bossFor(index, route) {
  const F = FLOORS[index], A = AREAS[F.area];
  if (A.id === 'abyss' && F.floor === 2) {
    if (route === 'law') return [makeEnemy('yui')];
    if (route === 'chaos') return [makeEnemy('ren')];
    const a = makeEnemy('ren', 34), b = makeEnemy('yui', 34);
    for (const u of [a, b]) { u.maxhp = Math.round(u.maxhp * 0.6); u.hp = u.maxhp; }
    return [a, b];
  }
  if (A.id === 'abyss' && F.floor === 1) return null;
  return [makeEnemy(A.boss)];
}
