// DEMON COVENANT — battles with press turns. No DOM: the page (main.js) and the node tests drive it the same way.
//
// Each side gets one turn icon per fighter (a boss brings extra). An action normally uses one icon. Hitting a weakness or
// landing a critical hit uses only half (a full icon starts blinking; a blinking one is used up). A miss or a nulled hit
// costs two icons, and a repelled or drained attack ends the turn. Passing turns a full icon into a blinking one.
import { SKILLS, ITEMS, DEMONS } from './data.js';
import { affOf } from './party.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const alive = (u) => u.hp > 0;

// side 0 = the party, side 1 = the demons
export function createBattle(party, enemies, opts = {}) {
  const B = { sides: [party, enemies], side: opts.ambush ? 1 : 0, icons: { full: 0, blink: 0 }, next: 0, log: [], over: null, turnNo: 0,
    boss: enemies.some((e) => DEMONS[e.id] && DEMONS[e.id].boss), moon: opts.moon || 0, rng: opts.rng || Math.random, escaped: false };
  for (const u of [...party, ...enemies]) u.buff = { atk: 0, def: 0 };
  startSide(B, B.side);
  return B;
}
export function startSide(B, side) {
  B.side = side; B.next = 0; B.turnNo++;
  const live = B.sides[side].filter(alive);
  const n = live.reduce((s, u) => s + (DEMONS[u.id] && DEMONS[u.id].boss ? DEMONS[u.id].turns : 1), 0);
  B.icons = { full: n, blink: 0 };
}
export const iconsLeft = (B) => B.icons.full + B.icons.blink;
// whose go it is on the current side (fighters take turns in order, skipping the fallen)
export function actor(B) {
  const list = B.sides[B.side].filter(alive); if (!list.length) return null;
  return list[B.next % list.length];
}

// ---------------------------------------------------------------- damage
function calc(B, a, d, sk) {
  const r = B.rng, el = sk.el, aff = el === 'almighty' ? null : (affOf(d)[el] || null);
  const phys = el === 'phys';
  // hit or miss (magic rarely misses)
  const hit = phys ? clamp(0.93 + (a.ag - d.ag) / 120, 0.7, 0.99) : 0.98;
  if (el !== 'almighty' && r() > hit) return { miss: true, dmg: 0 };
  if (aff === 'n') return { aff, dmg: 0 };
  const stat = phys ? a.st : a.ma;
  let dmg = (sk.power / 100) * (stat * 2.2 + a.lv * 1.3 + 10) * (30 / (30 + d.vi * 1.3 + d.lv * 0.5));
  dmg *= (1 + 0.3 * a.buff.atk) / (1 + 0.3 * d.buff.def);
  if (B.moon === 8) dmg *= 1.1;                                     // the full moon makes everything wilder
  dmg *= 0.88 + r() * 0.24;
  let crit = false;
  if (phys && r() < 0.05 + (sk.crit || 0) + (a.lu - d.lu) / 200) { crit = true; dmg *= 1.5; }
  if (aff === 'w') dmg *= 1.5; else if (aff === 's') dmg *= 0.5;
  return { aff, crit, dmg: Math.max(1, Math.round(dmg)) };
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
// use a skill. targets: the units chosen (for 'one' / 'ally' / 'dead'); 'all' / 'party' / 'multi' pick their own
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
      if (r.aff === 'r') { a.hp = Math.max(0, a.hp - r.dmg); ev.push({ kind: 'repel', t: d, back: a, dmg: r.dmg }); press = 'end'; continue; }
      if (r.aff === 'd') { d.hp = Math.min(d.maxhp, d.hp + r.dmg); ev.push({ kind: 'drain', t: d, dmg: r.dmg }); press = 'end'; continue; }
      d.hp = Math.max(0, d.hp - r.dmg);
      ev.push({ kind: 'hit', t: d, dmg: r.dmg, weak: r.aff === 'w', resist: r.aff === 's', crit: r.crit, el: sk.el, dead: d.hp <= 0 });
      if (r.aff === 'w' || r.crit) press = worse(press, 'weak');
    }
  } else if (sk.kind === 'heal') {
    const list = sk.target === 'party' ? friends.filter(alive) : targets.filter(alive);
    for (const t of list) { const n = sk.power >= 999 ? t.maxhp : Math.round(sk.power * (1 + a.ma / 35)); const got = Math.min(t.maxhp - t.hp, n); t.hp += got; ev.push({ kind: 'heal', t, n: got }); }
  } else if (sk.kind === 'revive') {
    for (const t of targets) if (!alive(t)) { t.hp = Math.max(1, Math.round(t.maxhp * sk.power / 100)); ev.push({ kind: 'revive', t }); }
  } else if (sk.kind === 'buff' || sk.kind === 'debuff') {
    const list = (sk.kind === 'buff' ? friends : foes).filter(alive), d = sk.kind === 'buff' ? 1 : -1;
    for (const t of list) { t.buff[sk.stat] = clamp(t.buff[sk.stat] + d, -2, 2); ev.push({ kind: sk.kind, t, stat: sk.stat }); }
  }
  return finish(B, press, ev);
}
export function useItem(B, a, itemId, target, bag) {
  const it = ITEMS[itemId], ev = [];
  bag[itemId]--; if (!bag[itemId]) delete bag[itemId];
  if (it.use === 'heal') { const got = Math.min(target.maxhp - target.hp, it.amt); target.hp += got; ev.push({ kind: 'heal', t: target, n: got }); }
  if (it.use === 'mp') { const got = Math.min(target.maxmp - target.mp, it.amt); target.mp += got; ev.push({ kind: 'mp', t: target, n: got }); }
  if (it.use === 'revive' && !alive(target)) { target.hp = Math.round(target.maxhp * it.amt / 100); ev.push({ kind: 'revive', t: target }); }
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
// prefers a weakness it has seen, heals a hurt friend, otherwise picks a skill it can afford
export function enemyAction(B, a) {
  const r = B.rng, foes = B.sides[0].filter(alive), friends = B.sides[1].filter(alive);
  const usable = a.skills.filter((s) => canUse(a, s));
  const hurt = friends.filter((f) => f.hp < f.maxhp * 0.45).sort((x, y) => x.hp / x.maxhp - y.hp / y.maxhp)[0];
  const heal = usable.find((s) => SKILLS[s].kind === 'heal');
  if (hurt && heal && r() < 0.7) return { skill: heal, targets: [hurt] };
  const buff = usable.filter((s) => SKILLS[s].kind === 'buff' || SKILLS[s].kind === 'debuff');
  if (buff.length && r() < 0.15) return { skill: buff[Math.floor(r() * buff.length)], targets: [] };
  // only attacks that can hurt someone (nothing that the targets null, repel or drain)
  const hurts = (s, f) => SKILLS[s].el === 'almighty' || !['n', 'r', 'd'].includes(affOf(f)[SKILLS[s].el]);
  const atks = usable.filter((s) => SKILLS[s].kind === 'atk' && foes.some((f) => hurts(s, f)));
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
  const { skill, targets } = enemyAction(B, a);
  const res = useSkill(B, a, skill, targets);
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
