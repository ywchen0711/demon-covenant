// node tools/test.mjs [sim runs] — checks the data, the maps, the press-turn rules and negotiation, then plays the whole game
// on autopilot to see how hard each floor and boss is.
import { SKILLS, DEMONS, DEMON_ORDER, AREAS, FLOORS, RACE_ORDER, fuseRace, ITEMS } from '../js/data.js';
import { makeHero, makeDemon, gainExp, fuse, fusionResult, healFull, expFor } from '../js/party.js';
import { createBattle, useSkill, actor, consume, iconsLeft, endTurnIfDone, enemyStep, enemyAction, rewards, alive, canUse } from '../js/battle.js';
import { startTalk, prompt, answer } from '../js/talk.js';
import { buildFloor, bfs } from '../js/dungeon.js';
import { encounter, bossFor, FLOOR_CAP } from '../js/encounter.js';
import { EVENTS, BOSS, route } from '../js/story.js';

let fails = 0;
const ok = (name, cond, extra = '') => { console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); if (!cond) fails++; };
const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---- data
ok('40 demons to recruit', DEMON_ORDER.length === 40, String(DEMON_ORDER.length));
ok('every demon skill exists', Object.values(DEMONS).every((d) => Object.values(d.skills).every((s) => SKILLS[s])));
ok('every area demon exists', AREAS.every((a) => a.enc.every((id) => DEMONS[id] && !DEMONS[id].boss) && DEMONS[a.boss]));
ok('every pair of races fuses into something', RACE_ORDER.every((a) => RACE_ORDER.every((b) => fuseRace(a, b))));
ok('one story event per floor', EVENTS.length === FLOORS.length, `${EVENTS.length} / ${FLOORS.length}`);
ok('every boss has words', ['gozuki', 'nue', 'garuda', 'orochi', 'ren', 'yui', 'tiamat'].every((b) => BOSS[b]));
ok('names in both languages', Object.values(DEMONS).every((d) => d.name[0] && d.name[1]) && Object.values(SKILLS).every((s) => s.name[0] && s.name[1]));

// ---- maps
for (let i = 0; i < FLOORS.length; i++) for (const seed of [1, 2, 3]) {
  const f = buildFloor(seed, i), g = f.tiles.map((r) => r.split('')), d = bfs(g, [1, 1]);
  const marks = []; g.forEach((row, y) => row.forEach((c, x) => { if ('DBTFCN'.includes(c)) marks.push([c, x, y]); }));
  const unreach = marks.filter(([, x, y]) => d[y][x] < 0);
  const need = FLOORS[i].boss ? 'B' : 'D';
  if (seed === 1 || unreach.length || !marks.some((m) => m[0] === need)) ok(`floor ${i + 1} (seed ${seed}): ${need}, T${FLOORS[i].floor === 1 ? ', F' : ''} placed and everything reachable`,
    !unreach.length && marks.some((m) => m[0] === need) && marks.some((m) => m[0] === 'T') && (FLOORS[i].floor !== 1 || marks.some((m) => m[0] === 'F')), unreach.map((m) => m.join()).join(' '));
}

// ---- press turns
{
  const B = createBattle([makeHero('Kai')], [makeEnemy('slime'), makeEnemy('slime')], { rng: rng(1) });
  ok('a side starts with one icon per fighter', B.icons.full === 1 && B.icons.blink === 0);
  B.icons = { full: 2, blink: 0 }; consume(B, 'weak'); ok('a weakness hit leaves a blinking icon', B.icons.full === 1 && B.icons.blink === 1);
  consume(B, 'normal'); ok('a normal action spends the blinking icon first', B.icons.full === 1 && B.icons.blink === 0);
  B.icons = { full: 3, blink: 0 }; consume(B, 'miss'); ok('a miss costs two icons', iconsLeft(B) === 1);
  B.icons = { full: 3, blink: 1 }; consume(B, 'end'); ok('a repel ends the turn', iconsLeft(B) === 0);
  B.icons = { full: 1, blink: 1 }; consume(B, 'pass'); ok('passing turns a full icon into a blinking one', B.icons.full === 0 && B.icons.blink === 2);
  // affinities
  const h = makeHero('Kai'); h.lv = 10; h.ma = 20;
  const pix = makeEnemy('pixie', 5), B2 = createBattle([h], [pix], { rng: rng(3) });
  const r = useSkill(B2, h, 'force1', [pix]);
  ok('fire at a weakness: weak hit, half an icon', r.ev[0].weak && r.press === 'weak', JSON.stringify(r.ev[0].kind));
  const wisp = makeEnemy('wisp', 7), B3 = createBattle([h], [wisp], { rng: rng(4) });
  const r3 = useSkill(B3, h, 'attack', [wisp]);
  ok('a physical hit on a Will o\' Wisp is nulled', r3.ev[0].kind === 'null' || r3.ev[0].kind === 'miss', r3.ev[0].kind);
  function makeEnemy(id, lv) { const u = makeDemon(id, lv); u.enemy = true; return u; }
}
// ---- fusion
{
  const a = makeDemon('pixie'), b = makeDemon('caitsith'), r = fusionResult(a, b);
  ok('Pixie × Cait Sith makes a Yoma', r && DEMONS[r.id].race === 'yoma', r && r.id);
  ok('fusion above the hero\'s level is refused', fuse(makeDemon('dakini'), makeDemon('power'), 10).error === 'level');
  let n = 0; for (const x of DEMON_ORDER) for (const y of DEMON_ORDER) if (x < y && fusionResult(makeDemon(x), makeDemon(y))) n++;
  ok('most pairs of demons fuse', n > 600, String(n));
}
// ---- negotiation
{
  let joined = 0, angry = 0, total = 0;
  for (let s = 1; s <= 300; s++) {
    const r = rng(s), id = DEMON_ORDER[s % 12], T = startTalk(makeDemon(id), { heroLv: 30, heroMaxHp: 200, macca: 5000, bag: { salve: 3 }, stockFull: false, moon: 3, rng: r });
    for (let k = 0; k < 6; k++) { const p = prompt(T); if (p.kind === 'end') { total++; if (p.result === 'join') joined++; if (p.result === 'angry') angry++; break; } answer(T, p.kind === 'question' ? Math.floor(r() * 3) : true); }
  }
  ok('random answers recruit some demons, anger a few', joined > 30 && joined < 260 && angry < 120, `${joined} joined, ${angry} angry of ${total}`);
}

// ---- the whole game on autopilot
// the party: the hero plus the best demons the player could have (recruited or fused) at the hero's level
function bestDemons(hero, index) {
  const area = FLOORS[index].area, ids = AREAS.slice(0, area + 1).flatMap((a) => a.enc);
  const got = [...new Set(ids)].map((id) => DEMONS[id]).filter((d) => d.lv <= hero.lv).sort((a, b) => b.lv - a.lv).slice(0, 3).map((d) => makeDemon(d.id, Math.max(d.lv, hero.lv - 3)));
  return got.length ? got : [makeDemon('pixie')];     // ORACLE's Pixie at the start
}
function fight(party, foes, r) {
  const B = createBattle(party, foes, { rng: r });
  for (let guard = 0; guard < 400 && !B.over; guard++) {
    const a = actor(B); if (!a) break;
    if (B.side === 0) {
      // the party plays like the demons do, but knows a weakness once it has seen it
      const flip = { ...B, sides: [B.sides[1], B.sides[0]] };
      const act = enemyAction(flip, a);
      useSkill(B, a, act.skill, act.targets);
    } else enemyStep(B);
    endTurnIfDone(B);
  }
  return B;
}
const RUNS = +(process.argv[2] || 6);
const table = [];
for (let run = 0; run < RUNS; run++) {
  const r = rng(1000 + run), hero = makeHero('Kai'); let deaths = 0;
  for (let i = 0; i < FLOORS.length; i++) {
    let party = [hero, ...bestDemons(hero, i)], wins = 0, n = 0;
    for (const u of party) healFull(u);
    for (let k = 0; k < 13; k++) {
      if (k === 6) for (const u of party) healFull(u);           // a terminal half way
      const B = fight(party, encounter(i, r), r); n++;
      if (B.over === 'win') { wins++; const rw = rewards(B); for (const u of party) if (alive(u)) gainExp(u, rw.exp); }
      else { deaths++; for (const u of party) healFull(u); }
      for (const u of party) if (!alive(u)) u.hp = 1;
    }
    let bossWin = null;
    if (FLOORS[i].boss) {
      party = [hero, ...bestDemons(hero, i)]; for (const u of party) healFull(u);
      const ro = run % 3 === 0 ? 'law' : run % 3 === 1 ? 'chaos' : 'neutral';
      let tries = 0, won = false; while (tries < 3 && !won) { tries++; for (const u of party) healFull(u); const B = fight(party, bossFor(i, ro), r); if (B.over === 'win') { won = true; const rw = rewards(B); for (const u of party) gainExp(u, rw.exp); break; } for (let k = 0; k < 3; k++) { const B2 = fight(party, encounter(i, r), r); if (B2.over === 'win') for (const u of party) gainExp(u, rewards(B2).exp); for (const u of party) healFull(u); } }
      bossWin = won ? tries : 'lost';
    }
    (table[i] = table[i] || []).push({ lv: hero.lv, rate: wins / n, boss: bossWin, deaths });
  }
}
for (let i = 0; i < FLOORS.length; i++) {
  const rows = table[i], avg = (f) => (rows.reduce((s, x) => s + f(x), 0) / rows.length);
  const b = rows.filter((x) => x.boss).map((x) => x.boss);
  console.log(`     floor ${String(i + 1).padStart(2)} ${AREAS[FLOORS[i].area].id.padEnd(9)} cap ${FLOOR_CAP[i]}  hero Lv ${avg((x) => x.lv).toFixed(1).padStart(4)}  battles won ${(avg((x) => x.rate) * 100).toFixed(0)}%${b.length ? `  boss beaten on try ${b.join(',')}` : ''}`);
}
ok('the autopilot party (no items, no plan) clears the game in most runs', table[FLOORS.length - 1].filter((x) => x.boss !== 'lost').length >= RUNS * 0.6, table[FLOORS.length - 1].map((x) => x.boss).join(','));
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
