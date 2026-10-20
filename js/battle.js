// DEMON COVENANT — battles with press turns. No DOM: the page (main.js) and the node tests drive it the same way.
//
// Each side gets one turn icon per fighter (a boss brings extra). An action normally uses one icon. Hitting a weakness or
// landing a critical hit uses only half (a full icon starts blinking; a blinking one is used up). A miss or a nulled hit
// costs two icons, and a repelled or drained attack ends the turn. Passing turns a full icon into a blinking one.
//
// On top of that: Charge / Concentrate make the next physical / magic attack 2.5 times as strong; a reflecting wall turns
// the next attack of its kind back on the attacker; Dekaja clears the foes' boosts and walls, Dekunda the party's
// debuffs and ailments. Poison takes a little health at the start of each of its side's turns; a sleeper skips turns
// until it wakes (or is hit, which hurts more). Ailments end with the battle.
import { SKILLS, ITEMS, DEMONS } from './data.js?v=5';
import { affOf, guards } from './party.js?v=5';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const alive = (u) => u.hp > 0;
const isBoss = (u) => !!(DEMONS[u.id] && DEMONS[u.id].boss);
// a fighter comes into battle clean
export function resetFighter(u) { u.buff = { atk: 0, def: 0 }; u.ail = null; u.charge = null; u.shield = null; }

// side 0 = the party, side 1 = the demons
export function createBattle(party, enemies, opts = {}) {
  const B = { sides: [party, enemies], side: opts.ambush ? 1 : 0, icons: { full: 0, blink: 0 }, next: 0, log: [], over: null, turnNo: 0,
    boss: enemies.some(isBoss), moon: opts.moon || 0, rng: opts.rng || Math.random, escaped: false, tick: [] };
  for (const u of [...party, ...enemies]) resetFighter(u);
  startSide(B, B.side);
  return B;
}
export function startSide(B, side) {
  B.side = side; B.next = 0; B.turnNo++;
  // poison bites as the side's turn begins (never below 1 HP)
  B.tick = [];
  for (const u of B.sides[side]) if (alive(u) && u.ail === 'poison') {
    const n = Math.min(u.hp - 1, Math.max(1, Math.round(u.maxhp * (isBoss(u) ? 0.03 : 0.08))));
    if (n > 0) { u.hp -= n; B.tick.push({ kind: 'poison', t: u, dmg: n }); }
  }
  const live = B.sides[side].filter(alive);
  const n = live.reduce((s, u) => s + (isBoss(u) ? DEMONS[u.id].turns : 1), 0);
  B.icons = { full: n, blink: 0 };
}
export const iconsLeft = (B) => B.icons.full + B.icons.blink;
// whose go it is on the current side (fighters take turns in order, skipping the fallen)
export function actor(B) {
  const list = B.sides[B.side].filter(alive); if (!list.length) return null;
  return list[B.next % list.length];
}
// a sleeper's go: it may wake (and then acts), otherwise the go is spent sleeping
export function sleepTurn(B, a) {
  if (!a || a.ail !== 'sleep') return null;
  if (B.rng() < 0.35) { a.ail = null; return { woke: true, ev: [{ kind: 'wake', t: a }] }; }
  const res = finish(B, 'normal', [{ kind: 'sleeping', t: a }]); res.actor = a; return res;
}

// ---------------------------------------------------------------- damage
const kindOf = (sk) => (sk.el === 'phys' ? 'phys' : 'mag');
function calc(B, a, d, sk) {
  const r = B.rng, el = sk.el, phys = el === 'phys';
  let aff = el === 'almighty' ? null : (affOf(d)[el] || null), wall = false;
  // hit or miss (magic rarely misses; a sleeper cannot dodge)
  const hit = phys ? clamp(0.93 + (a.ag - d.ag) / 120, 0.7, 0.99) : 0.98;
  if (el !== 'almighty' && d.ail !== 'sleep' && r() > hit) return { miss: true, dmg: 0 };
  // a reflecting wall sends the first attack of its kind back, and breaks
  if (el !== 'almighty' && d.shield && d.shield[kindOf(sk)]) { d.shield[kindOf(sk)] = false; aff = 'r'; wall = true; }
  if (aff === 'n') return { aff, dmg: 0 };
  const stat = phys ? a.st : a.ma, gear = phys ? a.atk || 0 : a.mag || 0;
  let dmg = (sk.power / 100) * (stat * 2.2 + a.lv * 1.3 + 10 + gear) * (30 / (30 + d.vi * 1.3 + d.lv * 0.5 + (d.def || 0)));
  dmg *= (1 + 0.3 * a.buff.atk) / (1 + 0.3 * d.buff.def);
  if (a.charge && a.charge === kindOf(sk)) dmg *= 2.5;             // Charge / Concentrate
  if (d.ail === 'sleep') dmg *= 1.3;                               // a sleeper takes it hard
  if (B.moon === 8) dmg *= 1.1;                                     // the full moon makes everything wilder
  dmg *= 0.88 + r() * 0.24;
  let crit = false;
  if (phys && r() < 0.05 + (sk.crit || 0) + (a.lu - d.lu) / 200) { crit = true; dmg *= 1.5; }
  if (aff === 'w') dmg *= 1.5; else if (aff === 's') dmg *= 0.5;
  return { aff, crit, wall, dmg: Math.max(1, Math.round(dmg)) };
}
// an ailment lands by chance (luck helps); an amulet keeps it away, and bosses never fall asleep
function tryAil(B, a, d, ail, chance, ev, quiet) {
  if (!alive(d) || d.ail === ail) return false;
  const boss = isBoss(d);
  if (guards(d, ail) || (boss && ail === 'sleep')) { if (!quiet) ev.push({ kind: 'ailfail', t: d }); return false; }
  const p = clamp(chance * (1 + (a.lu - d.lu) / 40) * (boss ? 0.5 : 1), 0.05, 0.95);
  if (B.rng() < p) { d.ail = ail; ev.push({ kind: 'ail', t: d, ail }); return true; }
  if (!quiet) ev.push({ kind: 'ailfail', t: d });
  return false;
}
// how much an action costs the side, worst case over all its targets
const RANK = { normal: 0, weak: 1, miss: 2, end: 3 };
function worse(a, b) { return RANK[b] > RANK[a] ? b : a; }

export function canUse(u, sk) {
  const s = SKILLS[sk]; if (!s) return false;
  if (s.cost.mp && u.mp < s.cost.mp) return false;
  if (s.cost.hp && u.hp <= Math.ceil(u.maxhp * s.cost.hp / 100)) return false;
  return true;
}
// use a skill. targets: the units chosen (for 'one' / 'ally' / 'dead'); 'all' / 'party' / 'multi' / 'self' pick their own
export function useSkill(B, a, skId, targets) {
  const sk = SKILLS[skId], ev = [], foes = B.sides[1 - sideOf(B, a)], friends = B.sides[sideOf(B, a)];
  if (sk.cost.mp) a.mp -= sk.cost.mp;
  if (sk.cost.hp) a.hp -= Math.ceil(a.maxhp * sk.cost.hp / 100);
  let press = 'normal';
  if (sk.kind === 'atk') {
    let list = sk.target === 'all' ? foes.filter(alive) : targets.filter(alive);
    if (sk.target === 'multi') { const live = foes.filter(alive), n = sk.hits[0] + Math.floor(B.rng() * (sk.hits[1] - sk.hits[0] + 1)); list = Array.from({ length: n }, () => live[Math.floor(B.rng() * live.length)]); }
    for (const d of list) {
      if (!alive(d)) continue;
      const r = calc(B, a, d, sk);
      if (r.miss) { ev.push({ kind: 'miss', t: d }); press = worse(press, 'miss'); continue; }
      if (r.aff === 'n') { ev.push({ kind: 'null', t: d }); press = worse(press, 'miss'); continue; }
      if (r.aff === 'r') { a.hp = Math.max(0, a.hp - r.dmg); ev.push({ kind: 'repel', t: d, back: a, dmg: r.dmg, wall: r.wall }); press = 'end'; continue; }
      if (r.aff === 'd') { d.hp = Math.min(d.maxhp, d.hp + r.dmg); ev.push({ kind: 'drain', t: d, dmg: r.dmg }); press = 'end'; continue; }
      d.hp = Math.max(0, d.hp - r.dmg);
      ev.push({ kind: 'hit', t: d, dmg: r.dmg, weak: r.aff === 'w', resist: r.aff === 's', crit: r.crit, el: sk.el, dead: d.hp <= 0 });
      if (r.aff === 'w' || r.crit) press = worse(press, 'weak');
      if (d.ail === 'sleep' && alive(d)) { d.ail = null; ev.push({ kind: 'wake', t: d }); }
      if (sk.drain && alive(a)) { const got = Math.min(a.maxhp - a.hp, Math.round(r.dmg * sk.drain)); if (got > 0) { a.hp += got; ev.push({ kind: 'heal', t: a, n: got }); } }
      if (sk.mpdrain && alive(a)) { const got = Math.min(d.mp, a.maxmp - a.mp, Math.round(r.dmg * sk.mpdrain)); if (got > 0) { d.mp -= got; a.mp += got; ev.push({ kind: 'mp', t: a, n: got }); } }
      if (sk.ail) tryAil(B, a, d, sk.ail, sk.chance, ev, true);
    }
    if (a.charge === kindOf(sk)) a.charge = null;                 // the gathered power is spent
  } else if (sk.kind === 'heal') {
    const list = sk.target === 'party' ? friends.filter(alive) : targets.filter(alive);
    for (const t of list) { const n = sk.power >= 999 ? t.maxhp : Math.round(sk.power * (1 + a.ma / 35)); const got = Math.min(t.maxhp - t.hp, n); t.hp += got; ev.push({ kind: 'heal', t, n: got }); }
  } else if (sk.kind === 'revive') {
    for (const t of targets) if (!alive(t)) { t.hp = Math.max(1, Math.round(t.maxhp * sk.power / 100)); t.ail = null; ev.push({ kind: 'revive', t }); }
  } else if (sk.kind === 'buff' || sk.kind === 'debuff') {
    const list = (sk.kind === 'buff' ? friends : foes).filter(alive), d = sk.kind === 'buff' ? 1 : -1;
    for (const t of list) { t.buff[sk.stat] = clamp(t.buff[sk.stat] + d, -2, 2); ev.push({ kind: sk.kind, t, stat: sk.stat }); }
  } else if (sk.kind === 'charge') {
    a.charge = sk.stat; ev.push({ kind: 'charge', t: a, stat: sk.stat });
  } else if (sk.kind === 'shield') {
    for (const t of friends.filter(alive)) { t.shield = { ...(t.shield || {}), [sk.stat]: true }; ev.push({ kind: 'shield', t, stat: sk.stat }); }
  } else if (sk.kind === 'dispel') {
    for (const t of foes.filter(alive)) { t.buff.atk = Math.min(0, t.buff.atk); t.buff.def = Math.min(0, t.buff.def); t.shield = null; t.charge = null; ev.push({ kind: 'dispel', t }); }
  } else if (sk.kind === 'cleanse') {
    for (const t of friends.filter(alive)) { t.buff.atk = Math.max(0, t.buff.atk); t.buff.def = Math.max(0, t.buff.def); t.ail = null; ev.push({ kind: 'cleanse', t }); }
  } else if (sk.kind === 'ail') {
    const list = sk.target === 'all' ? foes.filter(alive) : targets.filter(alive);
    for (const d of list) tryAil(B, a, d, sk.ail, sk.chance, ev, false);
  }
  return finish(B, press, ev);
}
export function useItem(B, a, itemId, target, bag) {
  const it = ITEMS[itemId], ev = [];
  bag[itemId]--; if (!bag[itemId]) delete bag[itemId];
  if (it.use === 'heal') { const got = Math.min(target.maxhp - target.hp, it.amt); target.hp += got; ev.push({ kind: 'heal', t: target, n: got }); }
  if (it.use === 'mp') { const got = Math.min(target.maxmp - target.mp, it.amt); target.mp += got; ev.push({ kind: 'mp', t: target, n: got }); }
  if (it.use === 'revive' && !alive(target)) { target.hp = Math.round(target.maxhp * it.amt / 100); target.ail = null; ev.push({ kind: 'revive', t: target }); }
  if (it.use === 'cure') { if (target.ail && (it.ail === 'all' || it.ail === target.ail)) target.ail = null; ev.push({ kind: 'cleanse', t: target }); }
  if (it.use === 'escape') { B.escaped = true; B.over = 'escape'; ev.push({ kind: 'escape' }); return { ev, press: 'normal' }; }
  return finish(B, 'normal', ev);
}
export function pass(B) { return finish(B, 'pass', [{ kind: 'pass' }]); }
// running away: a chance by agility (never from a boss); a failure costs the whole turn
export function tryEscape(B, a) {
  if (B.boss) return finish(B, 'end', [{ kind: 'noescape' }]);
  const foe = B.sides[1].filter(alive), ag = foe.reduce((s, u) => s + u.ag, 0) / Math.max(1, foe.length);
  if (B.rng() < clamp(0.45 + (a.ag - ag) / 60, 0.2, 0.9)) { B.over = 'escape'; return { ev: [{ kind: 'escape' }], press: 'normal' }; }
  return finish(B, 'end', [{ kind: 'fail' }]);
}
// spend icons and see whether the battle or the turn is over
export function consume(B, press) {
  const I = B.icons;
  if (press === 'end') { I.full = 0; I.blink = 0; }
  else if (press === 'miss') { for (let k = 0; k < 2; k++) { if (I.blink) I.blink--; else if (I.full) I.full--; } }
  else if (press === 'weak' || press === 'pass') { if (I.full) { I.full--; I.blink++; } else if (I.blink) I.blink--; }
  else { if (I.blink) I.blink--; else if (I.full) I.full--; }
}
function finish(B, press, ev) {
  consume(B, press);
  B.next++;
  B.log.push(...ev);
  check(B);
  return { ev, press };
}
export function check(B) {
  if (B.over) return B.over;
  if (!B.sides[1].some(alive)) B.over = 'win';
  else if (!B.sides[0].some((u) => u.hero && alive(u))) B.over = 'lose';
  return B.over;
}
// when the side's icons run out, the other side's turn begins
export function endTurnIfDone(B) { if (!B.over && iconsLeft(B) <= 0) { startSide(B, 1 - B.side); return true; } return false; }
const sideOf = (B, u) => (B.sides[0].includes(u) ? 0 : 1);

// ---------------------------------------------------------------- the demons' minds
// prefers a weakness it has seen, heals a hurt friend, sometimes boosts, walls, clears or puts to sleep; otherwise
// picks an attack it can afford (one that matches its Charge if it has one)
export function enemyAction(B, a) {
  const r = B.rng, foes = B.sides[0].filter(alive), friends = B.sides[1].filter(alive);
  const usable = a.skills.filter((s) => canUse(a, s));
  const hurt = friends.filter((f) => f.hp < f.maxhp * 0.45).sort((x, y) => x.hp / x.maxhp - y.hp / y.maxhp)[0];
  const heal = usable.find((s) => SKILLS[s].kind === 'heal');
  if (hurt && heal && r() < 0.7) return { skill: heal, targets: [hurt] };
  // clearing: worth it when the other side has boosts, or this side is hexed or ailing
  const cleanse = usable.find((s) => SKILLS[s].kind === 'cleanse');
  if (cleanse && friends.some((f) => f.ail || f.buff.atk < 0 || f.buff.def < 0) && r() < 0.5) return { skill: cleanse, targets: [] };
  const dispel = usable.find((s) => SKILLS[s].kind === 'dispel');
  if (dispel && foes.some((f) => f.buff.atk > 0 || f.buff.def > 0 || f.charge || (f.shield && (f.shield.phys || f.shield.mag))) && r() < 0.45) return { skill: dispel, targets: [] };
  const support = usable.filter((s) => {
    const k = SKILLS[s].kind;
    if (k === 'buff' || k === 'debuff') return true;
    if (k === 'charge') return !a.charge;
    if (k === 'shield') return friends.some((f) => !(f.shield && f.shield[SKILLS[s].stat]));
    if (k === 'ail') return foes.some((f) => !f.ail);
    return false;
  });
  if (support.length && !a.charge && r() < 0.2) {
    const s = support[Math.floor(r() * support.length)];
    if (SKILLS[s].kind === 'ail' && SKILLS[s].target === 'one') { const c = foes.filter((f) => !f.ail); return { skill: s, targets: [c[Math.floor(r() * c.length)]] }; }
    return { skill: s, targets: [] };
  }
  // only attacks that can hurt someone (nothing that the targets null, repel or drain)
  const hurts = (s, f) => SKILLS[s].el === 'almighty' || !['n', 'r', 'd'].includes(affOf(f)[SKILLS[s].el]);
  let atks = usable.filter((s) => SKILLS[s].kind === 'atk' && foes.some((f) => hurts(s, f)));
  if (a.charge) { const m = atks.filter((s) => kindOf(SKILLS[s]) === a.charge); if (m.length) atks = m; }
  if (!atks.length) return { skill: 'attack', targets: [foes[Math.floor(r() * foes.length)]] };
  // look for a weakness among the party
  if (r() < 0.65) for (const s of atks.sort(() => r() - 0.5)) {
    const el = SKILLS[s].el, weak = foes.filter((f) => affOf(f)[el] === 'w');
    if (weak.length) return { skill: s, targets: [weak[Math.floor(r() * weak.length)]] };
  }
  // avoid what the target shrugs off
  const pick = atks[Math.floor(r() * atks.length)], el = SKILLS[pick].el;
  const ok = foes.filter((f) => !['n', 'r', 'd'].includes(affOf(f)[el]));
  return { skill: pick, targets: [(ok.length ? ok : foes)[Math.floor(r() * (ok.length ? ok : foes).length)]] };
}
// one full enemy turn (the page animates the events one by one)
export function enemyStep(B) {
  const a = actor(B); if (!a) return null;
  const sl = sleepTurn(B, a);
  if (sl && !sl.woke) { sl.skill = null; return sl; }
  const { skill, targets } = enemyAction(B, a);
  const res = useSkill(B, a, skill, targets);
  if (sl) res.ev.unshift(...sl.ev);
  res.actor = a; res.skill = skill;
  return res;
}

// ---------------------------------------------------------------- rewards
export function rewards(B) {
  const foes = B.sides[1];
  const exp = foes.reduce((s, u) => s + Math.round(Math.pow(u.lv, 1.75) * 2.2 + 6) * (DEMONS[u.id].boss ? 8 : 1), 0);
  const macca = foes.reduce((s, u) => s + Math.round(u.lv * 9 + B.rng() * u.lv * 6) * (DEMONS[u.id].boss ? 6 : 1), 0);
  return { exp, macca };
}
