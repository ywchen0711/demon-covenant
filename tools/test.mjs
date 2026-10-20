// node tools/test.mjs [sim runs] — checks the data, the maps, the press-turn rules and negotiation, then plays the whole game
// on autopilot to see how hard each floor and boss is.
import { SKILLS, DEMONS, DEMON_ORDER, AREAS, FLOORS, RACE_ORDER, fuseRace, ITEMS, EQUIPS, BOSS_DROP, SHOP, HERO } from '../js/data.js?v=6';
import { makeHero, makeDemon, gainExp, fuse, fusionResult, healFull, expFor, refreshStats, affOf } from '../js/party.js?v=6';
import { createBattle, useSkill, useItem, actor, consume, iconsLeft, endTurnIfDone, enemyStep, enemyAction, rewards, alive, canUse, sleepTurn, startSide } from '../js/battle.js?v=6';
import { startTalk, prompt, answer } from '../js/talk.js?v=6';
import { buildFloor, bfs } from '../js/dungeon.js?v=6';
import { encounter, bossFor, FLOOR_CAP } from '../js/encounter.js?v=6';
import { EVENTS, BOSS, route } from '../js/story.js?v=6';

let fails = 0;
const ok = (name, cond, extra = '') => { console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); if (!cond) fails++; };
const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---- data
ok('77 demons to recruit', DEMON_ORDER.length === 77, String(DEMON_ORDER.length));
ok('demon ids are unique', new Set(DEMON_ORDER).size === DEMON_ORDER.length);
ok('every new demon is met somewhere or fused (Lv 41+ only by fusion)', DEMON_ORDER.every((id) => DEMONS[id].lv > 40 || AREAS.some((a) => a.enc.includes(id))), DEMON_ORDER.filter((id) => DEMONS[id].lv <= 40 && !AREAS.some((a) => a.enc.includes(id))).join());
ok('the hero learns skills up to Lv 58', Object.values(HERO.skills).every((s) => SKILLS[s]) && Math.max(...Object.keys(HERO.skills).map(Number)) >= 58);
ok('every shop item and equipment piece has a name and price', SHOP.every((k) => ITEMS[k] && ITEMS[k].price > 0) && Object.values(EQUIPS).every((e) => e.name[0] && e.name[1] && ['weapon', 'armor', 'acc'].includes(e.slot) && (e.drop || e.price > 0)));
ok('every boss drop exists', Object.values(BOSS_DROP).every((k) => EQUIPS[k]));
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
// ---- equipment and the new skills
{
  const h = makeHero('Kai'); h.lv = 20; refreshStats(h); const before = { atk: h.atk, def: h.def, hp: h.maxhp };
  h.eq = { weapon: 'katana', armor: 'suit', acc: 'bead' }; refreshStats(h);
  ok('a better weapon and armour raise attack, defence and HP', h.atk === 18 && h.def === 12 && h.maxhp > before.hp * 1.25, `${before.atk}->${h.atk} ${before.def}->${h.def} ${before.hp}->${h.maxhp}`);
  const pix = makeDemon('pixie'); pix.eq = { acc: 'windbag' };
  ok('an accessory covers a weakness (Pixie + Wind Bag: force resisted)', affOf(pix).force === 's' && affOf(makeDemon('pixie')).force === 'w');
  const gob = makeDemon('slime', 20); gob.enemy = true;
  const dmgWith = (w, charge) => { const a = makeHero('K'); a.lv = 20; a.eq = { weapon: w }; refreshStats(a); let t = 0; for (let s = 0; s < 40; s++) { const f = makeDemon('kodama', 20); const B = createBattle([a], [f], { rng: rng(s) }); if (charge) a.charge = 'phys'; const r = useSkill(B, a, 'lunge', [f]); t += r.ev.filter((e) => e.kind === 'hit').reduce((n, e) => n + e.dmg, 0); a.hp = a.maxhp; } return t; };
  ok('a sword hits harder than a knife', dmgWith('katana') > dmgWith('knife') * 1.1, `${dmgWith('knife')} vs ${dmgWith('katana')}`);
  ok('Charge makes the next physical hit much stronger', dmgWith('knife', true) > dmgWith('knife') * 2);
  // a wall turns an attack back
  const a = makeHero('K'), f = makeDemon('golem'); const B = createBattle([a], [f], { rng: rng(9) }); f.shield = { phys: true };
  const r = useSkill(B, a, 'lunge', [f]);
  ok('a physical wall reflects the attack and breaks', (r.ev[0].kind === 'repel' && r.ev[0].wall && !f.shield.phys) || r.ev[0].kind === 'miss', r.ev[0].kind);
  // poison and sleep
  const p = makeHero('K'), e = makeDemon('slime'); const B2 = createBattle([p], [e], { rng: rng(2) }); p.ail = 'poison'; const hp0 = p.hp; startSide(B2, 0);
  ok('poison takes health as its side\'s turn begins', p.hp < hp0 && B2.tick.length === 1);
  let slept = 0; for (let s = 0; s < 60; s++) { const u = makeHero('K'), d = makeDemon('kitsune'); const B3 = createBattle([u], [d], { rng: rng(s) }); B3.side = 1; useSkill(B3, d, 'dormina', [u]); if (u.ail === 'sleep') slept++; }
  ok('Dormina puts someone to sleep about half the time', slept > 15 && slept < 55, String(slept));
  const guard = makeHero('K'); guard.eq = { acc: 'amulet' }; const d4 = makeDemon('kitsune'); const B4 = createBattle([guard], [d4], { rng: rng(1) }); B4.side = 1; useSkill(B4, d4, 'dormina', [guard]);
  ok('an amulet keeps ailments away', !guard.ail);
  const sl = makeHero('K'); const B5 = createBattle([sl], [makeDemon('slime')], { rng: rng(5) }); sl.ail = 'sleep'; let turns = 0; while (sl.ail && turns < 50) { sleepTurn(B5, sl); turns++; }
  ok('a sleeper wakes up sooner or later', !sl.ail && turns < 50, String(turns));
  const boss = makeDemon('nue'); const B6 = createBattle([makeHero('K')], [boss], { rng: rng(1) }); useSkill(B6, B6.sides[0][0], 'dormina', [boss]);
  ok('bosses never fall asleep', !boss.ail);
  const c = makeHero('K'); const B7 = createBattle([c], [makeDemon('slime')], { rng: rng(1) }); c.ail = 'poison'; c.buff.atk = -2; c.mp = 99; useSkill(B7, c, 'cleanse', []);
  ok('Dekunda clears ailments and debuffs', !c.ail && c.buff.atk === 0);
  const bag = { antidote: 1 }; c.ail = 'poison'; useItem(createBattle([c], [makeDemon('slime')], { rng: rng(1) }), c, 'antidote', c, bag); ok('an antidote cures poison', !c.ail && !bag.antidote);
  const v = makeDemon('vampire'); v.hp = 50; const B8 = createBattle([makeHero('K')], [v], { rng: rng(3) }); B8.side = 1; const r8 = useSkill(B8, v, 'drain', [B8.sides[0][0]]);
  ok('Life Drain heals the drinker', r8.ev.some((e) => e.kind === 'heal' && e.t === v) || r8.ev[0].kind === 'miss', r8.ev.map((e) => e.kind).join());
  const g = makeHero('K'); for (let lv = 2; lv <= 60; lv++) gainExp(g, expFor(lv) - g.exp);
  ok('the hero ends with God\'s Hand and still knows a heal', g.skills.includes('godhand') && g.skills.some((s) => SKILLS[s].kind === 'heal') && g.skills.length <= 8, g.skills.join());
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
function fight(party, foes, r, floor = 0, diff = 'normal') {
  const B = createBattle(party, foes, { rng: r, floor, diff });
  for (let guard = 0; guard < 400 && !B.over; guard++) {
    const a = actor(B); if (!a) break;
    if (B.side === 0) {
      const sl = sleepTurn(B, a); if (sl && !sl.woke) { endTurnIfDone(B); continue; }
      // the party plays like the demons do, but knows a weakness once it has seen it
      const flip = { ...B, sides: [B.sides[1], B.sides[0]] };
      const act = enemyAction(flip, a);
      useSkill(B, a, act.skill, act.targets);
    } else enemyStep(B);
    endTurnIfDone(B);
  }
  return B;
}
const RUNS = +(process.argv[2] || 6), DIFF = process.argv[3] || 'normal';
const table = [];
for (let run = 0; run < RUNS; run++) {
  const r = rng(1000 + run), hero = makeHero('Kai'); let deaths = 0;
  for (let i = 0; i < FLOORS.length; i++) {
    let party = [hero, ...bestDemons(hero, i)], wins = 0, n = 0;
    for (const u of party) healFull(u);
    for (let k = 0; k < 13; k++) {
      if (k === 6) for (const u of party) healFull(u);           // a terminal half way
      const B = fight(party, encounter(i, r), r, i, DIFF); n++;
      if (B.over === 'win') { wins++; const rw = rewards(B); for (const u of party) if (alive(u)) gainExp(u, rw.exp); }
      else { deaths++; for (const u of party) healFull(u); }
      for (const u of party) if (!alive(u)) u.hp = 1;
    }
    let bossWin = null;
    if (FLOORS[i].boss) {
      party = [hero, ...bestDemons(hero, i)]; for (const u of party) healFull(u);
      const ro = run % 3 === 0 ? 'law' : run % 3 === 1 ? 'chaos' : 'neutral';
      let tries = 0, won = false; while (tries < 3 && !won) { tries++; for (const u of party) healFull(u); const B = fight(party, bossFor(i, ro), r, i, DIFF); if (B.over === 'win') { won = true; const rw = rewards(B); for (const u of party) gainExp(u, rw.exp); break; } for (let k = 0; k < 3; k++) { const B2 = fight(party, encounter(i, r), r); if (B2.over === 'win') for (const u of party) gainExp(u, rewards(B2).exp); for (const u of party) healFull(u); } }
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
