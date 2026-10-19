// DEMON COVENANT — units (the hero and demons): stats, levels, experience, skills, and demon fusion. No DOM.
import { DEMONS, HERO, SKILLS, statsAt, fuseRace } from './data.js';

let nextUid = 1;
export const setUidFloor = (n) => { nextUid = Math.max(nextUid, n); };
// total experience to reach a level
export const expFor = (lv) => Math.round(12 * Math.pow(Math.max(0, lv - 1), 2.45));
export const MAX_LV = 60;
export const STOCK_MAX = 8, ACTIVE_MAX = 3;

const learned = (table, lv) => Object.entries(table).filter(([l]) => +l <= lv).sort((a, b) => a[0] - b[0]).map(([, s]) => s);
function applyStats(u, keepRatio = true) {
  const d = u.hero ? null : DEMONS[u.id], st = statsAt(u.hero ? HERO.build : d.build, u.lv);
  const hpR = keepRatio && u.maxhp ? u.hp / u.maxhp : 1, mpR = keepRatio && u.maxmp ? u.mp / u.maxmp : 1;
  Object.assign(u, { st: st.st, ma: st.ma, vi: st.vi, ag: st.ag, lu: st.lu });
  u.maxhp = Math.round(st.hp * (u.hero ? 1.25 : 1) * (d && d.boss ? d.hpX : 1)); u.maxmp = Math.round(st.mp * (u.hero ? 1.1 : 1) * (d && d.boss ? 2 : 1));
  u.hp = u.hp === undefined ? u.maxhp : Math.max(u.hp > 0 ? 1 : 0, Math.round(u.maxhp * hpR));
  u.mp = u.mp === undefined ? u.maxmp : Math.round(u.maxmp * mpR);
}
export function makeHero(name) {
  const u = { uid: nextUid++, id: 'hero', hero: true, name, lv: 1, exp: 0, skills: learned(HERO.skills, 1), aff: {} };
  applyStats(u, false); return u;
}
export function makeDemon(id, lv) {
  const d = DEMONS[id]; lv = Math.max(1, lv || d.lv);
  const u = { uid: nextUid++, id, lv, exp: expFor(lv), skills: d.boss ? Object.values(d.skills) : learned(d.skills, lv).slice(-6), aff: d.aff };
  if (!u.skills.length) u.skills = ['attack'];
  applyStats(u, false); return u;
}
// a demon as met in the wild: a level or two either side of its own
export function makeEnemy(id, lv) { const u = makeDemon(id, lv); u.enemy = true; return u; }
export const unitName = (u, en) => (u.hero ? u.name : DEMONS[u.id].name[en ? 1 : 0]);
export const affOf = (u) => (u.hero ? HERO.aff : DEMONS[u.id].aff);

// experience: returns the level-ups, each with the skills learned
export function gainExp(u, n) {
  const ups = [];
  u.exp += n;
  while (u.lv < MAX_LV && u.exp >= expFor(u.lv + 1)) {
    u.lv++;
    const before = u.maxhp; applyStats(u); u.hp = Math.min(u.maxhp, u.hp + (u.maxhp - before));
    const table = u.hero ? HERO.skills : DEMONS[u.id].skills, got = [];
    for (const [l, s] of Object.entries(table)) if (+l === u.lv && !u.skills.includes(s)) { if (u.skills.length >= 8) u.skills.shift(); u.skills.push(s); got.push(s); }
    ups.push({ lv: u.lv, learned: got });
  }
  return ups;
}
export function healFull(u) { u.hp = u.maxhp; u.mp = u.maxmp; }

// ---------------------------------------------------------------- fusion
// the race comes from the fusion table; the demon is the lowest one of that race above the average level
export function fusionResult(a, b) {
  const ra = DEMONS[a.id].race, rb = DEMONS[b.id].race, race = fuseRace(ra, rb);
  if (!race) return null;
  const cands = Object.values(DEMONS).filter((d) => d.race === race && !d.boss).sort((x, y) => x.lv - y.lv);
  const target = Math.floor((a.lv + b.lv) / 2) + 1;
  let d = cands.find((x) => x.lv >= target && x.id !== a.id && x.id !== b.id) || [...cands].reverse().find((x) => x.id !== a.id && x.id !== b.id);
  if (ra === rb) d = cands.find((x) => x.lv > Math.max(a.lv, b.lv)) || null;     // same race: the next one up
  if (!d) return null;
  // up to two skills carried over from the parents (the strongest ones the child does not know)
  const own = learned(d.skills, d.lv), power = (s) => (SKILLS[s].power || 0) * (SKILLS[s].target === 'all' || SKILLS[s].target === 'party' ? 1.4 : 1);
  const inherit = [...new Set([...a.skills, ...b.skills])].filter((s) => s !== 'attack' && !own.includes(s)).sort((x, y) => power(y) - power(x)).slice(0, 2);
  return { id: d.id, lv: d.lv, inherit };
}
export function fuse(a, b, heroLv) {
  const r = fusionResult(a, b); if (!r) return { error: 'none' };
  if (r.lv > heroLv) return { error: 'level', need: r.lv };
  const u = makeDemon(r.id, r.lv);
  for (const s of r.inherit) if (!u.skills.includes(s)) { if (u.skills.length >= 8) break; u.skills.push(s); }
  return { unit: u };
}
