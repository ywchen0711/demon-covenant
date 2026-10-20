// DEMON COVENANT — the game: exploring floors in first person, battles with press turns, talking to demons, fusion,
// terminals, the story. Built on HUSH's renderer and sound.
import * as THREE from 'three';
import { DEMONS, SKILLS, ITEMS, SHOP, AREAS, FLOORS, RACES, EL_NAME, AFF_NAME, ELEMENTS, EQUIPS, BOSS_DROP, AIL_NAME, DIFFS } from './data.js?v=6';
import { makeHero, makeDemon, gainExp, healFull, fusionResult, fuse, expFor, unitName, affOf, STOCK_MAX, ACTIVE_MAX, setUidFloor, refreshStats } from './party.js?v=6';
import { createBattle, actor, useSkill, useItem, pass, tryEscape, consume, check, endTurnIfDone, enemyStep, rewards, alive, canUse, iconsLeft, sleepTurn, resetFighter } from './battle.js?v=6';
import { startTalk, prompt as talkPrompt, answer as talkAnswer } from './talk.js?v=6';
import { buildFloor, DIRS } from './dungeon.js?v=6';
import { encounter, bossFor } from './encounter.js?v=6';
import { PROLOGUE, EVENTS, BOSS, ENDINGS, route } from './story.js?v=6';
import { portrait } from './art.js?v=6';
import { AudioEngine } from './audio.js?v=6';
import { buildWorld, TILE } from './world3d.js?v=6';

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// ---------------------------------------------------------------- language
const q = new URLSearchParams(location.search);
let lang = q.get('lang') || (() => { try { return localStorage.getItem('dc.lang'); } catch (e) { return null; } })() || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en');
if (lang !== 'en') lang = 'zh';
const EN = () => lang === 'en';
const T = (p) => (p ? p[EN() ? 1 : 0] : '');
const L = (zh, en) => (EN() ? en : zh);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nm = (u) => unitName(u, EN());

// ---------------------------------------------------------------- renderer (as in HUSH)
const canvas = $('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(70, 1, 0.05, 80);
camera.rotation.order = 'YXZ'; scene.add(camera);
const hemi = new THREE.HemisphereLight('#3a4a44', '#0a0806', 0.5); scene.add(hemi);
const lamp = new THREE.PointLight('#fff1d6', 2.6, 20, 1.3); lamp.position.set(0, 0.2, 0); camera.add(lamp);
const audio = new AudioEngine();
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ---------------------------------------------------------------- the saved game and the moment-to-moment state
const KEY = 'dc.save';
let S = null;                       // the save: hero, demons, items, where you are, what you have done
const R = { world: null, floor: null, x: 1, y: 1, dir: 2, cam: { x: 0, z: 0, yaw: 0 }, anim: null, busy: false, mode: 'title', stepsHere: 0, t: 0 };
const loadSave = () => { try { const d = JSON.parse(localStorage.getItem(KEY)); return d && d.v === 1 ? d : null; } catch (e) { return null; } };
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } }
const unitByUid = (uid) => (S.hero.uid === uid ? S.hero : S.stock.find((u) => u.uid === uid));
const activeDemons = () => S.active.map(unitByUid).filter(Boolean);
const mapState = (i) => (S.maps[i] = S.maps[i] || { seen: '', opened: [], story: false, boss: false });
const moon = () => { const m = Math.floor(S.steps / 8) % 16; return m <= 8 ? m : 16 - m; };     // 0 new … 8 full

// ---------------------------------------------------------------- dialog kit (every menu, message and choice)
const ui = $('ui');
let modal = null;            // the open window's key handler
function openBox(html, cls) { const d = document.createElement('div'); d.className = 'box ' + (cls || ''); d.innerHTML = html; ui.appendChild(d); return d; }
function closeBox(d) { if (d && d.parentNode) d.parentNode.removeChild(d); }
// a message box: each line waits for a click / Enter
function say(lines, who) {
  return new Promise(async (resolve) => {
    const d = openBox('', 'msg');
    for (const line of lines) {
      const text = Array.isArray(line) ? T(line) : line;
      d.innerHTML = `${who ? `<div class="who">${esc(who)}</div>` : ''}<div class="txt"></div><div class="more">▼</div>`;
      const el = d.querySelector('.txt'); let i = 0, done = false;
      const type = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(type); done = true; } }, 18);
      await new Promise((go) => {
        const next = () => { if (!done) { clearInterval(type); el.textContent = text; done = true; return; } modal = null; d.onclick = null; go(); };
        d.onclick = next; modal = (k) => { if (k === 'ok' || k === 'back') next(); };
      });
      audio.play('menu');
    }
    closeBox(d); resolve();
  });
}
// a list to pick from: items [{ label, right, disabled, note }]; resolves with the index, or -1 when cancelled
function choose(title, items, opts = {}) {
  return new Promise((resolve) => {
    const d = openBox('', 'list ' + (opts.cls || '')); let sel = Math.max(0, items.findIndex((it) => !it.disabled));
    const draw = () => {
      d.innerHTML = (title ? `<div class="title">${title}</div>` : '') + '<div class="items">' + items.map((it, i) => `<button class="item ${i === sel ? 'on' : ''} ${it.disabled ? 'off' : ''}" data-i="${i}"><span>${it.label}</span>${it.right != null ? `<small>${it.right}</small>` : ''}</button>`).join('') + '</div>'
        + (items[sel] && items[sel].note ? `<div class="note">${items[sel].note}</div>` : '') + (opts.cancel !== false ? `<button class="cancel">${L('返回', 'Back')}</button>` : '');
      d.querySelectorAll('.item').forEach((b) => { b.onclick = () => { const i = +b.dataset.i; if (items[i].disabled) { audio.play('cancel'); return; } sel = i; pickIt(); }; b.onmouseenter = () => { if (sel !== +b.dataset.i) { sel = +b.dataset.i; draw(); } }; });
      const c = d.querySelector('.cancel'); if (c) c.onclick = () => done(-1);
      if (opts.onSel) opts.onSel(sel);
      const on = d.querySelector('.item.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    };
    const done = (v) => { modal = null; closeBox(d); audio.play(v < 0 ? 'cancel' : 'ok'); resolve(v); };
    const pickIt = () => { if (!items[sel] || items[sel].disabled) { audio.play('cancel'); return; } done(sel); };
    modal = (k) => {
      if (k === 'up' || k === 'down') { const step = k === 'up' ? -1 : 1; for (let n = 0; n < items.length; n++) { sel = (sel + step + items.length) % items.length; if (!items[sel].disabled) break; } audio.play('menu'); draw(); }
      else if (k === 'ok') pickIt(); else if (k === 'back' && opts.cancel !== false) done(-1);
    };
    draw();
  });
}
function toast(text) { const d = $('toast'); d.textContent = text; d.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => d.classList.remove('on'), 1800); }
function banner(text, sub) { const d = $('banner'); d.innerHTML = `<b>${esc(text)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`; d.classList.remove('on'); void d.offsetWidth; d.classList.add('on'); }

// ---------------------------------------------------------------- the HUD: where you are, the moon, the party, the map
function hud() {
  const F = FLOORS[S.floor], A = AREAS[F.area], m = moon();
  $('where').innerHTML = `${esc(T(A.name))}<small>${F.floor}F</small>`;
  $('moon').innerHTML = `<i style="--p:${m / 8}"></i><span>${m === 8 ? L('滿月', 'Full moon') : m === 0 ? L('新月', 'New moon') : `${m}/8`}</span>`;
  $('macca').textContent = `${S.macca} ${L('魔貨', 'macca')}`;
  const dng = Math.min(1, R.stepsHere / 14);
  $('danger').style.background = dng < 0.4 ? '#3ad070' : dng < 0.75 ? '#e0c040' : '#e04040';
  partyBars();
  drawMap();
}
function partyBars(cur) {
  const list = [S.hero, ...activeDemons()];
  $('party').innerHTML = list.map((u) => `<div class="pm ${u === cur ? 'cur' : ''} ${alive(u) ? '' : 'dead'}" data-uid="${u.uid}"><b>${esc(nm(u))}${statusTags(u)}</b><small>Lv${u.lv}</small>
    <div class="bar hp"><i style="width:${(u.hp / u.maxhp) * 100}%"></i></div><div class="nums">${u.hp}/${u.maxhp}</div>
    <div class="bar mp"><i style="width:${(u.mp / u.maxmp) * 100}%"></i></div><div class="nums">${u.mp}/${u.maxmp}</div></div>`).join('');
}
// little tags for ailments, walls and Charge
function statusTags(u) {
  let t = '';
  if (u.ail) t += `<em class="tag ${u.ail}">${esc(T(AIL_NAME[u.ail]))}</em>`;
  if (u.shield && (u.shield.phys || u.shield.mag)) t += `<em class="tag wall">${u.shield.phys && u.shield.mag ? '◈◈' : u.shield.phys ? L('物◈', 'P◈') : L('魔◈', 'M◈')}</em>`;
  if (u.charge) t += `<em class="tag charge">${u.charge === 'phys' ? L('蓄', 'CHG') : L('集', 'FOC')}</em>`;
  return t;
}
function reveal() {
  const st = mapState(S.floor), n = R.floor.n; let seen = st.seen.length === n * n ? st.seen.split('') : Array(n * n).fill('0');
  const mark = (x, y) => { if (x >= 0 && y >= 0 && x < n && y < n) seen[y * n + x] = '1'; };
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) mark(R.x + dx, R.y + dy);
  const [fx, fy] = DIRS[R.dir]; for (let k = 1; k < 8; k++) { const x = R.x + fx * k, y = R.y + fy * k; mark(x, y); mark(x + fy, y + fx); mark(x - fy, y - fx); if (tileAt(x, y) === '#') break; }
  st.seen = seen.join('');
}
function drawMap(big) {
  const cv = big ? $('bigmap') : $('map'), g = cv.getContext('2d'), n = R.floor.n, st = mapState(S.floor), s = cv.width / n;
  g.clearRect(0, 0, cv.width, cv.height); g.fillStyle = 'rgba(6,8,12,.75)'; g.fillRect(0, 0, cv.width, cv.height);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (st.seen[y * n + x] !== '1') continue;
    const c = tileAt(x, y);
    if (c === '#') { g.fillStyle = '#3a4a5a'; g.fillRect(x * s, y * s, s, s); continue; }
    g.fillStyle = '#1a2a2a'; g.fillRect(x * s, y * s, s, s);
    const col = { D: '#40ff90', U: '#40a0ff', T: '#40e0ff', F: '#ff4040', C: st.opened.includes(x + ',' + y) ? '#6a5a3a' : '#ffd040', N: st.story ? null : '#ffffff', B: '#ff2050' }[c];
    if (col) { g.fillStyle = col; g.fillRect(x * s + s * 0.2, y * s + s * 0.2, s * 0.6, s * 0.6); }
  }
  g.save(); g.translate((R.x + 0.5) * s, (R.y + 0.5) * s); g.rotate(R.dir * Math.PI / 2); g.fillStyle = '#ffe080';
  g.beginPath(); g.moveTo(0, -s * 0.5); g.lineTo(s * 0.4, s * 0.4); g.lineTo(-s * 0.4, s * 0.4); g.closePath(); g.fill(); g.restore();
}

// ---------------------------------------------------------------- floors
function tileAt(x, y) {
  const row = R.floor && R.floor.tiles[y]; if (!row || x < 0 || x >= row.length) return '#';
  const c = row[x], st = mapState(S.floor);
  if (c === 'B' && st.boss) return 'D';
  return c;
}
function enterFloor(index, at) {
  if (R.world) { scene.remove(R.world.group); R.world.dispose(); }
  S.floor = index;
  const F = FLOORS[index], A = AREAS[F.area], st = mapState(index);
  R.floor = buildFloor(S.seed, index);
  const bosses = F.boss ? bossFor(index, route(S.align)) : null;
  R.world = buildWorld(R.floor, A.look, { opened: new Set(st.opened), story: st.story, boss: st.boss, bossId: bosses && bosses[0].id });
  scene.add(R.world.group);
  const L2 = R.world.look; scene.fog = new THREE.FogExp2(L2.fog, L2.fogD); scene.background = new THREE.Color(L2.fog); lamp.color.set(L2.lamp); hemi.color.set(L2.amb[0]); hemi.groundColor.set(L2.amb[1]); hemi.intensity = L2.amb[2];
  if (at) { R.x = at.x; R.y = at.y; R.dir = at.dir; } else { R.x = R.floor.start.x; R.y = R.floor.start.y; R.dir = R.floor.start.dir; }
  // arrive facing an open corridor, not a wall
  if (!at) for (let k = 0; k < 4 && tileAt(R.x + DIRS[R.dir][0], R.y + DIRS[R.dir][1]) === '#'; k++) R.dir = (R.dir + 1) % 4;
  R.cam = { x: R.x * TILE, z: R.y * TILE, yaw: -R.dir * Math.PI / 2 }; R.anim = null; R.stepsHere = 0;
  S.pos = { x: R.x, y: R.y, dir: R.dir };
  reveal(); hud();
  audio.music(A.music);
}
const findTile = (ch) => { for (let y = 0; y < R.floor.n; y++) { const x = R.floor.tiles[y].indexOf(ch); if (x >= 0) return { x, y }; } return null; };

// ---------------------------------------------------------------- moving
function tryStep(back, side) {
  if (R.anim || R.busy || R.mode !== 'explore') return;
  const d = side ? (R.dir + side + 4) % 4 : back ? (R.dir + 2) % 4 : R.dir, [dx, dy] = DIRS[d], nx = R.x + dx, ny = R.y + dy;
  if (tileAt(nx, ny) === '#') { audio.play('bump'); return; }
  R.anim = { kind: 'move', fx: R.x * TILE, fz: R.y * TILE, tx: nx * TILE, tz: ny * TILE, t: 0, dur: 0.2 };
  R.x = nx; R.y = ny; audio.play('step');
}
function turn(d) {
  if (R.anim || R.busy || R.mode !== 'explore') return;
  const from = -R.dir * Math.PI / 2; R.dir = (R.dir + d + 4) % 4;
  R.anim = { kind: 'turn', from, to: from - d * Math.PI / 2, t: 0, dur: 0.16 };
  S.pos = { x: R.x, y: R.y, dir: R.dir };
  reveal(); drawMap();          // the map arrow turns with you, and you see down the new corridor
}
async function arrived() {
  S.steps++; R.stepsHere++; S.pos = { x: R.x, y: R.y, dir: R.dir };
  reveal(); hud();
  const c = tileAt(R.x, R.y), st = mapState(S.floor);
  R.busy = true;
  try {
    if (c === 'D') await goDown();
    else if (c === 'U') await goUp();
    else if (c === 'T') await terminal();
    else if (c === 'F') await fusionAltar();
    else if (c === 'C' && !st.opened.includes(R.x + ',' + R.y)) await openChest();
    else if (c === 'N' && !st.story) await storyEvent();
    else if (c === 'B' && !st.boss) await bossFight();
    else if (c === '.' && R.stepsHere > 3 && Math.random() < Math.min(0.2, 0.015 + (R.stepsHere - 4) * 0.009)) { R.stepsHere = 0; await randomBattle(); }
  } finally { R.busy = false; hud(); }
}
async function goDown() {
  if (S.floor >= FLOORS.length - 1) return;
  const i = await choose(L('要往下走嗎？', 'Go down?'), [{ label: L('前進', 'Go on') }, { label: L('留下', 'Stay') }]);
  if (i !== 0) return;
  audio.play('stairs'); fadeOut();
  await sleep(350);
  const next = S.floor + 1, newArea = FLOORS[next].area !== FLOORS[S.floor].area;
  enterFloor(next); save(); fadeIn();
  if (newArea) banner(T(AREAS[FLOORS[next].area].name), `${FLOORS[next].floor}F`);
}
async function goUp() {
  if (S.floor === 0) return;
  const i = await choose(L('要回到上一層嗎？', 'Go back up?'), [{ label: L('回去', 'Go up') }, { label: L('留下', 'Stay') }]);
  if (i !== 0) return;
  audio.play('stairs'); fadeOut(); await sleep(350);
  enterFloor(S.floor - 1); const d = findTile('D') || findTile('B'); if (d) { R.x = d.x; R.y = d.y; R.cam = { x: d.x * TILE, z: d.y * TILE, yaw: -R.dir * Math.PI / 2 }; reveal(); } fadeIn(); save();
}
function fadeOut() { $('fade').classList.add('on'); }
function fadeIn() { setTimeout(() => $('fade').classList.remove('on'), 80); }
async function openChest() {
  const st = mapState(S.floor); st.opened.push(R.x + ',' + R.y); R.world.openChest(R.x, R.y); audio.play('chest');
  const tier = S.floor, r = Math.random();
  if (r < 0.4) { const n = Math.round((60 + tier * 60) * (0.7 + Math.random() * 0.6)); S.macca += n; await say([L(`寶箱裡有 ${n} 魔貨。`, `The chest holds ${n} macca.`)]); }
  else if (r < 0.6) {
    // a piece of equipment from this area or the next (the Killing Stone only in the Abyss)
    const area = FLOORS[S.floor].area, pool = Object.keys(EQUIPS).filter((k) => (!EQUIPS[k].drop && EQUIPS[k].tier >= area - 1 && EQUIPS[k].tier <= area + 1) || (k === 'stone' && area >= 4));
    const k = pool[Math.floor(Math.random() * pool.length)]; S.gear[k] = (S.gear[k] || 0) + 1;
    await say([L(`得到了裝備「${EQUIPS[k].name[0]}」！（選單 → 裝備）`, `Found equipment: ${EQUIPS[k].name[1]}! (Menu → Equip)`)]);
  }
  else { const pool = tier < 3 ? ['salve', 'salve', 'water', 'smoke', 'incense', 'antidote', 'bell'] : tier < 7 ? ['salve2', 'water', 'incense', 'gem', 'salve2', 'panacea'] : ['jade', 'salve2', 'water', 'incense', 'gem', 'panacea']; const it = pool[Math.floor(Math.random() * pool.length)]; S.bag[it] = (S.bag[it] || 0) + 1; await say([L(`得到了「${ITEMS[it].name[0]}」！`, `Found: ${ITEMS[it].name[1]}!`)]); }
  save();
}

// ---------------------------------------------------------------- story
async function storyEvent() {
  const ev = EVENTS[S.floor]; mapState(S.floor).story = true; R.world.remove(R.x, R.y);
  await say(ev.lines);
  if (ev.choice) {
    await say([ev.choice.q]);
    const i = await choose('', ev.choice.opts.map((o) => ({ label: esc(T(o.t)) })), { cancel: false }), o = ev.choice.opts[i];
    if (o.align === 'zero') S.align = 0; else S.align += o.align;
    await say(o.reply);
  }
  if (ev.after) await say(ev.after);
  if (ev.gift) { S.bag[ev.gift.item] = (S.bag[ev.gift.item] || 0) + ev.gift.n; await say([L(`得到了「${ITEMS[ev.gift.item].name[0]}」×${ev.gift.n}。`, `Received ${ITEMS[ev.gift.item].name[1]} ×${ev.gift.n}.`)]); }
  save();
}

// ---------------------------------------------------------------- terminals: rest, save, shop, party
async function terminal() {
  audio.play('ok');
  for (;;) {
    const i = await choose(`<b>${L('終端機', 'Terminal')}</b> <small>${S.macca} ${L('魔貨', 'macca')}</small>`, [{ label: L('休息（全員回復）', 'Rest (heal everyone)') }, { label: L('記錄', 'Save') }, { label: L('商店', 'Shop') }, { label: L('隊伍', 'Party') }, { label: L('離開', 'Leave') }]);
    if (i === 0) { for (const u of [S.hero, ...S.stock]) healFull(u); audio.play('healfx'); hud(); await say([L('全員的體力與魔力都恢復了。', 'Everyone is fully restored.')]); }
    else if (i === 1) { save(); audio.play('ok'); await say([L('已經記錄。', 'Your progress is saved.')]); }
    else if (i === 2) await shop();
    else if (i === 3) await partyMenu();
    else return;
  }
}
async function shop() {
  for (;;) {
    const c = await choose(`${L('商店', 'Shop')} <small>${S.macca} ${L('魔貨', 'macca')}</small>`, [{ label: L('道具', 'Items') }, { label: L('裝備', 'Equipment'), note: L('武器與防具給主角，飾品誰都能戴', 'Weapons and armour for the hero; anyone can wear an accessory') }, { label: L('賣出', 'Sell') }]);
    if (c < 0) return;
    if (c === 0) await shopItems(); else if (c === 1) await shopGear(); else await sellMenu();
  }
}
async function shopItems() {
  for (;;) {
    const list = SHOP.map((k) => ({ label: `${esc(T(ITEMS[k].name))} <small>×${S.bag[k] || 0}</small>`, right: `${ITEMS[k].price}`, disabled: S.macca < ITEMS[k].price, note: itemNote(k) }));
    const i = await choose(`${L('道具', 'Items')} <small>${S.macca} ${L('魔貨', 'macca')}</small>`, list); if (i < 0) return;
    const k = SHOP[i]; S.macca -= ITEMS[k].price; S.bag[k] = (S.bag[k] || 0) + 1; audio.play('gold'); hud();
  }
}
// what the shops of this area sell: everything of its tier and below
async function shopGear() {
  const area = FLOORS[S.floor].area, keys = Object.keys(EQUIPS).filter((k) => !EQUIPS[k].drop && EQUIPS[k].tier <= area).sort((a, b) => SLOT_ORDER[EQUIPS[a].slot] - SLOT_ORDER[EQUIPS[b].slot] || EQUIPS[a].price - EQUIPS[b].price);
  for (;;) {
    const list = keys.map((k) => { const e = EQUIPS[k], cur = e.slot !== 'acc' && S.hero.eq[e.slot]; return { label: `${esc(T(e.name))} <small>${esc(T(SLOT_NAME[e.slot]))}${owned(k) ? ` ×${owned(k)}` : ''}</small>`, right: `${e.price}`, disabled: S.macca < e.price, note: gearNote(k) + (cur ? `<br><small>${L('現在', 'Now')}: ${esc(T(EQUIPS[cur].name))} — ${gearNote(cur)}</small>` : '') }; });
    const i = await choose(`${L('裝備', 'Equipment')} <small>${S.macca} ${L('魔貨', 'macca')}</small>`, list); if (i < 0) return;
    const k = keys[i], e = EQUIPS[k]; S.macca -= e.price; S.gear[k] = (S.gear[k] || 0) + 1; audio.play('gold'); hud();
    const who = e.slot === 'acc' ? [S.hero, ...S.stock] : [S.hero];
    const j = await choose(L(`要讓誰裝備「${e.name[0]}」？`, `Who wears the ${e.name[1]}?`), [...who.map((u) => ({ label: esc(nm(u)), right: u.eq[e.slot] ? esc(T(EQUIPS[u.eq[e.slot]].name)) : '—' })), { label: L('先收著', 'Keep it for now') }]);
    if (j >= 0 && j < who.length) { equip(who[j], e.slot, k); audio.play('ok'); toast(L(`${nm(who[j])}裝備了${e.name[0]}`, `${nm(who[j])} equips the ${e.name[1]}`)); }
  }
}
// selling: items and spare equipment go for half their price (a Demon Crystal for all of it)
async function sellMenu() {
  for (;;) {
    const rows = [...Object.keys(S.bag).filter((k) => S.bag[k] > 0).map((k) => ({ k, item: true, n: S.bag[k], name: ITEMS[k].name, price: k === 'gem' ? ITEMS[k].price : Math.floor(ITEMS[k].price / 2) })),
      ...Object.keys(S.gear).filter((k) => S.gear[k] > 0).map((k) => ({ k, item: false, n: S.gear[k], name: EQUIPS[k].name, price: Math.floor((EQUIPS[k].price || 3000) / 2) }))];
    if (!rows.length) { await say([L('沒有可以賣的東西。', 'You have nothing to sell.')]); return; }
    const i = await choose(`${L('賣出', 'Sell')} <small>${S.macca} ${L('魔貨', 'macca')}</small>`, rows.map((r) => ({ label: `${esc(T(r.name))} <small>×${r.n}</small>`, right: `+${r.price}`, note: r.item ? itemNote(r.k) : gearNote(r.k) }))); if (i < 0) return;
    const r = rows[i], box = r.item ? S.bag : S.gear; box[r.k]--; if (!box[r.k]) delete box[r.k]; S.macca += r.price; audio.play('gold'); hud();
  }
}
const itemNote = (k) => { const it = ITEMS[k]; return it.use === 'heal' ? (it.amt >= 9999 ? L('一人體力全滿', 'Fully heals one') : L(`回復一人 ${it.amt} 體力`, `Heals one by ${it.amt} HP`)) : it.use === 'mp' ? L(`回復一人 ${it.amt} 魔力`, `Restores ${it.amt} MP to one`) : it.use === 'revive' ? L('讓倒下的同伴復活', 'Revives a fallen ally') : it.use === 'escape' ? L('一定能逃離戰鬥（頭目戰除外）', 'Always escapes a battle (not a boss)') : it.use === 'cure' ? (it.ail === 'all' ? L('治好一人的所有異常（戰鬥中）', 'Cures every ailment of one (in battle)') : L(`治好一人的${T(AIL_NAME[it.ail])}（戰鬥中）`, `Cures ${AIL_NAME[it.ail][1].toLowerCase()} (in battle)`)) : L('可以賣錢的寶石', 'A gem worth money'); };

// ---------------------------------------------------------------- equipment
const SLOT_NAME = { weapon: ['武器', 'Weapon'], armor: ['防具', 'Armour'], acc: ['飾品', 'Accessory'] }, SLOT_ORDER = { weapon: 0, armor: 1, acc: 2 };
const owned = (k) => S.gear[k] || 0;
const slotsOf = (u) => (u.hero ? ['weapon', 'armor', 'acc'] : ['acc']);
function gearNote(k) {
  const e = EQUIPS[k], p = [];
  if (e.atk) p.push(L(`物攻 +${e.atk}`, `Atk +${e.atk}`)); if (e.mag) p.push(L(`魔攻 +${e.mag}`, `Mag +${e.mag}`)); if (e.def) p.push(L(`防禦 +${e.def}`, `Def +${e.def}`));
  for (const [st, zh, en] of [['st', '力', 'St'], ['ma', '魔', 'Ma'], ['vi', '體', 'Vi'], ['ag', '速', 'Ag'], ['lu', '運', 'Lu']]) if (e[st]) p.push(L(`${zh} +${e[st]}`, `${en} +${e[st]}`));
  if (e.hp) p.push(`HP +${e.hp}%`); if (e.mp) p.push(`MP +${e.mp}%`);
  for (const [el, a] of Object.entries(e.affs)) p.push(L(`${T(EL_NAME[el])}${T(AFF_NAME[a])}`, `${T(AFF_NAME[a])} ${T(EL_NAME[el])}`));
  if (e.guard) p.push(e.guard === 'all' ? L('防止中毒與睡眠', 'Wards off poison and sleep') : L(`防止${T(AIL_NAME[e.guard])}`, `Wards off ${AIL_NAME[e.guard][1].toLowerCase()}`));
  return p.join(' · ');
}
// put on (or take off, id = null) a piece; the old one goes back into the bag
function equip(u, slot, id) {
  u.eq = u.eq || {}; const old = u.eq[slot];
  if (old) S.gear[old] = (S.gear[old] || 0) + 1;
  if (id) { S.gear[id]--; if (!S.gear[id]) delete S.gear[id]; }
  u.eq[slot] = id || null; refreshStats(u);
}
async function equipMenu() {
  for (;;) {
    const all = [S.hero, ...S.stock];
    const i = await choose(L('誰的裝備？', 'Whose equipment?'), all.map((u) => ({ label: `${esc(nm(u))} <small>Lv${u.lv}</small>`, right: slotsOf(u).map((sl) => (u.eq[sl] ? esc(T(EQUIPS[u.eq[sl]].name)) : '—')).join(' / ') }))); if (i < 0) return;
    const u = all[i];
    for (;;) {
      const slots = slotsOf(u);
      const j = await choose(`${esc(nm(u))} <small>${L('物攻', 'Atk')} ${u.atk} · ${L('魔攻', 'Mag')} ${u.mag} · ${L('防禦', 'Def')} ${u.def}</small>`, slots.map((sl) => ({ label: esc(T(SLOT_NAME[sl])), right: u.eq[sl] ? esc(T(EQUIPS[u.eq[sl]].name)) : '—', note: u.eq[sl] ? gearNote(u.eq[sl]) : L('（空）', '(empty)') }))); if (j < 0) break;
      const slot = slots[j], have = Object.keys(S.gear).filter((k) => S.gear[k] > 0 && EQUIPS[k].slot === slot);
      if (!have.length && !u.eq[slot]) { toast(L('沒有可以裝備的東西（到終端機的商店看看）', 'Nothing to wear (try a terminal shop)')); continue; }
      const k = await choose(esc(T(SLOT_NAME[slot])), [{ label: L('（卸下）', '(Take off)'), disabled: !u.eq[slot] }, ...have.map((x) => ({ label: esc(T(EQUIPS[x].name)), right: `×${S.gear[x]}`, note: gearNote(x) }))]);
      if (k < 0) continue;
      equip(u, slot, k === 0 ? null : have[k - 1]); audio.play('ok'); hud(); save();
    }
  }
}

// ---------------------------------------------------------------- the party: who fights
async function partyMenu() {
  for (;;) {
    const items = S.stock.map((u) => ({ label: `${S.active.includes(u.uid) ? '⚔ ' : '　'}${esc(nm(u))} <small>${esc(T(RACES[DEMONS[u.id].race].name))}</small>`, right: `Lv${u.lv} ${alive(u) ? '' : L('（倒下）', '(down)')}`, note: skillLine(u) }));
    const i = await choose(`${L('隊伍：最多三隻惡魔上場', 'Party: up to three demons fight')} (${S.active.length}/${ACTIVE_MAX})`, items); if (i < 0) return;
    const u = S.stock[i];
    if (S.active.includes(u.uid)) S.active = S.active.filter((x) => x !== u.uid);
    else if (S.active.length < ACTIVE_MAX) S.active.push(u.uid); else { toast(L('上場的惡魔已經有三隻了', 'Three demons are already fighting')); continue; }
    hud();
  }
}
const skillLine = (u) => u.skills.map((s) => esc(T(SKILLS[s].name))).join(' · ');

// ---------------------------------------------------------------- the fusion altar
async function fusionAltar() {
  audio.music('fuse');
  try {
    for (;;) {
      if (S.stock.length < 2) { await say([L('合體需要至少兩隻惡魔。', 'Fusion needs at least two demons.')]); return; }
      const list = (skip) => S.stock.map((u, i) => ({ label: `${esc(nm(u))} <small>${esc(T(RACES[DEMONS[u.id].race].name))}</small>`, right: `Lv${u.lv}`, disabled: i === skip, note: skillLine(u) }));
      const a = await choose(`<b>${L('合體祭壇', 'Fusion Altar')}</b> ${L('選第一隻惡魔', 'Pick the first demon')}`, list(-1)); if (a < 0) return;
      const b = await choose(`${L('和誰合體？', 'Fuse with whom?')}`, list(a).map((it, j) => { if (j === a) return it; const r = fusionResult(S.stock[a], S.stock[j]); return { ...it, right: r ? `→ ${esc(T(DEMONS[r.id].name))} Lv${r.lv}` : '—', disabled: !r, note: r && r.lv > S.hero.lv ? L(`需要主角等級 ${r.lv}`, `Needs the hero at Lv ${r.lv}`) : it.note }; }));
      if (b < 0) continue;
      const A = S.stock[a], B = S.stock[b], res = fusionResult(A, B);
      if (res.lv > S.hero.lv) { await say([L(`主角的等級不夠，無法控制 Lv${res.lv} 的惡魔。`, `Your level is too low to control a Lv ${res.lv} demon.`)]); continue; }
      const d = DEMONS[res.id];
      const ok = await choose(`${esc(nm(A))} × ${esc(nm(B))} → <b>${esc(T(d.name))}</b> Lv${res.lv}<br><small>${L('繼承', 'Inherits')}: ${res.inherit.map((s) => esc(T(SKILLS[s].name))).join(' · ') || '—'}</small>`, [{ label: L('合體', 'Fuse') }, { label: L('取消', 'Cancel') }]);
      if (ok !== 0) continue;
      const out = fuse(A, B, S.hero.lv); if (!out.unit) continue;
      const wasActive = S.active.includes(A.uid) || S.active.includes(B.uid);
      for (const u of [A, B]) if (u.eq && u.eq.acc) S.gear[u.eq.acc] = (S.gear[u.eq.acc] || 0) + 1;     // accessories come back
      S.stock = S.stock.filter((u) => u !== A && u !== B); S.active = S.active.filter((x) => x !== A.uid && x !== B.uid);
      S.stock.push(out.unit); if (wasActive || S.active.length < ACTIVE_MAX) S.active.push(out.unit.uid);
      audio.play('fuse'); flash('#ff4040');
      await showDemon(out.unit, L('合體成功！', 'Fusion complete!'));
      save(); hud();
    }
  } finally { audio.music(AREAS[FLOORS[S.floor].area].music); }
}
function flash(col) { const f = $('flash'); f.style.background = col; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
// a demon's card: portrait, stats, affinities, skills
function demonCard(u) {
  const d = DEMONS[u.id], aff = affOf(u);
  return `<div class="card"><canvas class="por"></canvas><div class="info"><h3>${esc(nm(u))} <small>${u.hero ? L('主角', 'Hero') : esc(T(RACES[d.race].name))} Lv${u.lv}</small></h3>
    <div class="stats">HP ${u.hp}/${u.maxhp} · MP ${u.mp}/${u.maxmp}<br>${L('力', 'St')} ${u.st} · ${L('魔', 'Ma')} ${u.ma} · ${L('體', 'Vi')} ${u.vi} · ${L('速', 'Ag')} ${u.ag} · ${L('運', 'Lu')} ${u.lu}</div>
    <div class="affs">${ELEMENTS.filter((e) => e !== 'almighty').map((e) => `<span class="aff ${aff[e] || ''}">${esc(T(EL_NAME[e]))}<b>${aff[e] ? esc(T(AFF_NAME[aff[e]])) : '－'}</b></span>`).join('')}</div>
    <div class="skills">${u.skills.map((s) => `<span title="${esc(skillNote(SKILLS[s]))}">${esc(T(SKILLS[s].name))}</span>`).join('')}</div>
    <div class="gear">${slotsOf(u).map((sl) => `<span><i>${esc(T(SLOT_NAME[sl]))}</i>${u.eq && u.eq[sl] ? esc(T(EQUIPS[u.eq[sl]].name)) : '—'}</span>`).join('')}${u.hero ? `<span><i>${L('物攻/防', 'Atk/Def')}</i>${u.atk || 0} / ${u.def || 0}</span>` : ''}</div>
    ${u.hero ? '' : `<div class="exp">${L('下一級', 'Next')} ${Math.max(0, expFor(u.lv + 1) - u.exp)}</div>`}</div></div>`;
}
function paintCard(d, u) { const c = d.querySelector('.por'); if (!c) return; c.width = c.height = 200; const g = c.getContext('2d'); if (u.hero) { g.fillStyle = '#1a2030'; g.fillRect(0, 0, 200, 200); heroPortrait(g); } else g.drawImage(portrait(DEMONS[u.id].art, true), 0, 0, 200, 200); }
// the hero: a student in a dark coat, lit by the cyan screen of the summoning program on the arm
function heroPortrait(g) {
  const bg = g.createRadialGradient(100, 90, 10, 100, 100, 130); bg.addColorStop(0, '#24384a'); bg.addColorStop(1, '#070a10'); g.fillStyle = bg; g.fillRect(0, 0, 200, 200);
  const coat = g.createLinearGradient(40, 140, 160, 200); coat.addColorStop(0, '#3a4660'); coat.addColorStop(1, '#10141e');
  g.fillStyle = coat; g.beginPath(); g.moveTo(24, 200); g.quadraticCurveTo(30, 140, 100, 136); g.quadraticCurveTo(170, 140, 176, 200); g.fill();
  g.fillStyle = '#c8d0e0'; g.beginPath(); g.moveTo(86, 140); g.lineTo(100, 172); g.lineTo(114, 140); g.fill(); g.fillStyle = '#a02030'; g.beginPath(); g.moveTo(96, 148); g.lineTo(100, 176); g.lineTo(104, 148); g.fill();
  const skin = g.createRadialGradient(90, 92, 4, 100, 104, 44); skin.addColorStop(0, '#f6dcc4'); skin.addColorStop(1, '#b88a6a'); g.fillStyle = skin; g.beginPath(); g.ellipse(100, 104, 32, 38, 0, 0, 7); g.fill(); g.fillRect(90, 132, 20, 12);
  g.fillStyle = '#14141c'; g.beginPath(); g.moveTo(64, 104); g.quadraticCurveTo(58, 58, 100, 56); g.quadraticCurveTo(146, 56, 138, 106); g.lineTo(130, 84); g.lineTo(116, 92); g.lineTo(104, 80); g.lineTo(88, 92); g.lineTo(74, 84); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,200,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(82, 64); g.quadraticCurveTo(100, 58, 120, 64); g.stroke();
  g.fillStyle = '#1a1a24'; g.fillRect(83, 102, 12, 5); g.fillRect(106, 102, 12, 5); g.fillStyle = '#5ad8ff'; g.fillRect(87, 103, 4, 3); g.fillRect(110, 103, 4, 3);
  g.strokeStyle = '#8a5a4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(94, 124); g.lineTo(106, 124); g.stroke();
  g.save(); g.shadowColor = '#40e0ff'; g.shadowBlur = 18; g.fillStyle = '#40e0ff'; g.fillRect(138, 150, 30, 40); g.restore();
  g.fillStyle = '#062030'; g.fillRect(141, 153, 24, 30); g.fillStyle = '#40e0ff'; for (let y = 157; y < 180; y += 6) g.fillRect(144, y, 8 + (y * 7) % 12, 2);
  g.fillStyle = 'rgba(64,224,255,.18)'; g.beginPath(); g.ellipse(132, 120, 20, 40, -0.3, 0, 7); g.fill();
}
async function showDemon(u, title) {
  const d = openBox(`<div class="title">${title || ''}</div>${demonCard(u)}<div class="more">▼</div>`, 'cardbox'); paintCard(d, u);
  await new Promise((go) => { const fin = () => { modal = null; closeBox(d); go(); }; d.onclick = fin; modal = (k) => { if (k === 'ok' || k === 'back') fin(); }; });
}

// ---------------------------------------------------------------- the main menu (Esc / Tab)
async function mainMenu() {
  if (R.mode !== 'explore' || R.busy || R.anim) return;
  R.busy = true;
  try {
    for (;;) {
      const i = await choose(L('選單', 'Menu'), [{ label: L('狀態', 'Status') }, { label: L('道具', 'Items') }, { label: L('技能', 'Skills') }, { label: L('裝備', 'Equip') }, { label: L('隊伍', 'Party') }, { label: L('地圖', 'Map') }, { label: L('設定', 'Settings') }, { label: L('回到標題', 'Title screen') }]);
      if (i < 0) return;
      if (i === 0) { for (;;) { const all = [S.hero, ...S.stock]; const j = await choose(L('誰的狀態？', 'Whose status?'), all.map((u) => ({ label: `${S.active.includes(u.uid) || u.hero ? '⚔ ' : '　'}${esc(nm(u))}`, right: `Lv${u.lv}` }))); if (j < 0) break; await showDemon(all[j]); } }
      if (i === 1) await fieldItems();
      if (i === 2) await fieldSkills();
      if (i === 3) await equipMenu();
      if (i === 4) await partyMenu();
      if (i === 5) { $('bigwrap').hidden = false; drawMap(true); await new Promise((go) => { const fin = () => { $('bigwrap').hidden = true; modal = null; $('bigwrap').onclick = null; go(); }; $('bigwrap').onclick = fin; modal = () => fin(); }); }
      if (i === 6) await settings();
      if (i === 7) { const k = await choose(L('回到標題？（沒記錄的進度會消失）', 'Back to the title? (Unsaved progress is lost)'), [{ label: L('是', 'Yes') }, { label: L('否', 'No') }]); if (k === 0) { titleScreen(); return; } }
    }
  } finally { R.busy = false; hud(); }
}
async function pickAlly(title, dead) {
  const list = [S.hero, ...activeDemons(), ...S.stock.filter((u) => !S.active.includes(u.uid))];
  const i = await choose(title, list.map((u) => ({ label: esc(nm(u)), right: `${u.hp}/${u.maxhp} · ${u.mp}/${u.maxmp}`, disabled: dead ? alive(u) : !alive(u) })));
  return i < 0 ? null : list[i];
}
async function fieldItems() {
  for (;;) {
    const keys = Object.keys(S.bag).filter((k) => S.bag[k] > 0);
    if (!keys.length) { await say([L('沒有道具。', 'You have no items.')]); return; }
    const i = await choose(L('道具', 'Items'), keys.map((k) => ({ label: esc(T(ITEMS[k].name)), right: `×${S.bag[k]}`, disabled: !['heal', 'mp', 'revive'].includes(ITEMS[k].use), note: itemNote(k) }))); if (i < 0) return;
    const k = keys[i], it = ITEMS[k], u = await pickAlly(L('對誰使用？', 'Use on whom?'), it.use === 'revive'); if (!u) continue;
    S.bag[k]--; if (!S.bag[k]) delete S.bag[k];
    if (it.use === 'heal') u.hp = Math.min(u.maxhp, u.hp + it.amt); if (it.use === 'mp') u.mp = Math.min(u.maxmp, u.mp + it.amt); if (it.use === 'revive') u.hp = Math.round(u.maxhp * it.amt / 100);
    audio.play('healfx'); hud();
  }
}
async function fieldSkills() {
  for (;;) {
    const casters = [S.hero, ...S.stock].filter((u) => alive(u) && u.skills.some((s) => ['heal', 'revive'].includes(SKILLS[s].kind)));
    if (!casters.length) { await say([L('沒有人會回復技能。', 'Nobody knows a healing skill.')]); return; }
    const i = await choose(L('誰使用？', 'Who casts?'), casters.map((u) => ({ label: esc(nm(u)), right: `MP ${u.mp}/${u.maxmp}` }))); if (i < 0) return;
    const c = casters[i], sks = c.skills.filter((s) => ['heal', 'revive'].includes(SKILLS[s].kind));
    const j = await choose(L('技能', 'Skill'), sks.map((s) => ({ label: esc(T(SKILLS[s].name)), right: `MP ${SKILLS[s].cost.mp}`, disabled: c.mp < SKILLS[s].cost.mp }))); if (j < 0) continue;
    const sk = SKILLS[sks[j]];
    if (sk.target === 'party') { c.mp -= sk.cost.mp; for (const u of [S.hero, ...activeDemons()]) if (alive(u)) u.hp = Math.min(u.maxhp, u.hp + (sk.power >= 999 ? u.maxhp : Math.round(sk.power * (1 + c.ma / 35)))); }
    else { const u = await pickAlly(L('對誰使用？', 'On whom?'), sk.kind === 'revive'); if (!u) continue; c.mp -= sk.cost.mp; if (sk.kind === 'revive') u.hp = Math.round(u.maxhp * sk.power / 100); else u.hp = Math.min(u.maxhp, u.hp + (sk.power >= 999 ? u.maxhp : Math.round(sk.power * (1 + c.ma / 35)))); }
    audio.play('healfx'); hud();
  }
}
async function settings() {
  for (;;) {
    const vol = S.music ?? 0.5;
    const df = DIFFS[S.diff || 'normal'];
    const i = await choose(L('設定', 'Settings'), [{ label: EN() ? '中文' : 'English' }, { label: L('音樂', 'Music'), right: vol > 0 ? `${Math.round(vol * 100)}%` : L('關', 'off') }, { label: L('難度', 'Difficulty'), right: T(df.name) }]); if (i < 0) return;
    if (i === 2) { const order = ['easy', 'normal', 'hard']; S.diff = order[(order.indexOf(S.diff || 'normal') + 1) % 3]; save(); }
    if (i === 0) { lang = EN() ? 'zh' : 'en'; try { localStorage.setItem('dc.lang', lang); } catch (e) { /* ignore */ } document.documentElement.lang = EN() ? 'en' : 'zh-Hant'; staticText(); hud(); }
    if (i === 1) { S.music = vol >= 0.75 ? 0 : vol + 0.25; audio.setMusicVolume(S.music); }
  }
}

// ---------------------------------------------------------------- battles
const known = (id) => (S.known[id] = S.known[id] || {});
async function randomBattle() { return battle(encounter(S.floor, Math.random), {}); }
async function bossFight() {
  const bosses = bossFor(S.floor, route(S.align)), id = bosses[0].id;
  if (BOSS[id]) await say(BOSS[id].pre);
  const r = await battle(bosses, { boss: true });
  if (r !== 'win') return;
  mapState(S.floor).boss = true; R.world.remove(R.x, R.y);
  const post = id === 'ren' && bosses.length > 1 ? [...BOSS.ren.post, ...BOSS.yui.post] : (BOSS[id] && BOSS[id].post) || [];
  if (post.length) await say(post);
  save();
  if (id === 'tiamat') await ending();
}
let BT = null;          // the battle on screen
async function battle(foes, opts) {
  R.mode = 'battle'; audio.play('encounter'); audio.music(opts.boss ? 'boss' : 'battle'); flash('#ffffff');
  const party = [S.hero, ...activeDemons()];
  const B = createBattle(party, foes, { moon: moon(), ambush: !opts.boss && Math.random() < 0.08, diff: S.diff || 'normal', floor: S.floor });
  BT = { B, foes, boss: !!opts.boss, popups: [] };
  if (B.tick.length) B.tick = [];
  $('battle').hidden = false; drawBattle();
  await say([foes.length > 1 ? L(`${foes.map(nm).join('、')}出現了！`, `${foes.map(nm).join(', ')} appear!`) : L(`${nm(foes[0])}出現了！`, `${nm(foes[0])} appears!`), ...(B.side === 1 ? [L('被偷襲了！', 'An ambush!')] : [])]);
  let lastSide = B.side;
  while (!B.over) {
    drawBattle();
    if (B.side !== lastSide) { lastSide = B.side; banner(B.side === 0 ? L('我方回合', 'Your turn') : L('敵方回合', 'Enemy turn')); await sleep(550); if (B.tick.length) { const tk = B.tick; B.tick = []; await showEvents(tk); } }
    if (B.side === 0) { const a = actor(B); if (!a) { B.over = 'lose'; break; } await playerTurn(a); }
    else { await sleep(380); const res = enemyStep(B); if (res) await showEvents(res.ev, res.actor, res.skill); }
    if (!B.over) endTurnIfDone(B);
  }
  drawBattle();
  for (const u of [S.hero, ...S.stock]) resetFighter(u);       // ailments, walls and Charge end with the battle
  const result = B.over;
  if (result === 'win') await victory(B);
  $('battle').hidden = true; BT = null;
  if (result === 'lose') { await gameOver(); return 'lose'; }
  if (result === 'escape') await say([L('成功逃走了。', 'You got away.')]);
  R.mode = 'explore'; audio.music(AREAS[FLOORS[S.floor].area].music); hud();
  return result;
}
function drawBattle() {
  const { B } = BT;
  $('foes').innerHTML = B.sides[1].map((u, i) => {
    if (u.left) return '';
    const k = known(u.id), seen = Object.entries(k).map(([el, a]) => `<span class="aff ${a}">${esc(T(EL_NAME[el]))}${esc(T(AFF_NAME[a] || ['普', 'Norm']))}</span>`).join('');
    return `<div class="foe ${alive(u) ? '' : 'gone'} ${DEMONS[u.id].boss ? 'boss' : ''}" data-i="${i}"><canvas width="256" height="256"></canvas><div class="fn">${esc(nm(u))} <small>Lv${u.lv}</small>${statusTags(u)}</div><div class="bar hp"><i style="width:${u.hp / u.maxhp * 100}%"></i></div><div class="known">${seen}</div></div>`;
  }).join('');
  $('foes').querySelectorAll('.foe').forEach((el) => { const u = B.sides[1][+el.dataset.i]; el.querySelector('canvas').getContext('2d').drawImage(portrait(DEMONS[u.id].art), 0, 0); });
  const I = B.icons;
  $('icons').innerHTML = `<span class="side">${B.side === 0 ? L('我方', 'You') : L('敵方', 'Foe')}</span>` + Array.from({ length: I.full }, () => `<i class="ic ${B.side ? 'foe' : ''}"></i>`).join('') + Array.from({ length: I.blink }, () => `<i class="ic blink ${B.side ? 'foe' : ''}"></i>`).join('');
  partyBars(B.side === 0 ? actor(B) : null);
}
// pick a target: enemies ('one'), allies ('ally') or the fallen ('dead')
async function pickTarget(B, kind) {
  if (kind === 'one') { const live = B.sides[1].filter((u) => alive(u) && !u.left); if (live.length === 1) return live[0]; const i = await choose(L('目標', 'Target'), live.map((u) => ({ label: esc(nm(u)), right: `Lv${u.lv}` })), { cls: 'small' }); return i < 0 ? null : live[i]; }
  const list = B.sides[0].filter((u) => (kind === 'dead' ? !alive(u) : alive(u)));
  if (!list.length) { toast(L('沒有可以選的對象', 'No one to choose')); return null; }
  const i = await choose(L('對象', 'Target'), list.map((u) => ({ label: esc(nm(u)), right: `${u.hp}/${u.maxhp}` })), { cls: 'small' }); return i < 0 ? null : list[i];
}
async function playerTurn(a) {
  const B = BT.B;
  const sl = sleepTurn(B, a);
  if (sl) { await showEvents(sl.ev, a); if (!sl.woke) return; }
  for (;;) {
    drawBattle();
    const cmds = [['attack', L('攻擊', 'Attack')], ['skill', L('技能', 'Skills')], ['item', L('道具', 'Items')]];
    if (a.hero) cmds.push(['talk', L('交談', 'Talk')], ['summon', L('召喚', 'Summon')]);
    cmds.push(['pass', L('跳過', 'Pass')], ['run', L('逃跑', 'Run')]);
    const i = await choose(`<b>${esc(nm(a))}</b> <small>HP ${a.hp}/${a.maxhp} MP ${a.mp}/${a.maxmp}</small>`, cmds.map(([k, l]) => ({ label: l, disabled: k === 'item' && !Object.keys(S.bag).some((x) => ITEMS[x].use && S.bag[x] > 0) })), { cancel: false, cls: 'cmd' });
    const c = cmds[i][0];
    if (c === 'attack') { const t = await pickTarget(B, 'one'); if (!t) continue; const res = useSkill(B, a, 'attack', [t]); await showEvents(res.ev, a, 'attack'); return; }
    if (c === 'skill') {
      const sks = a.skills.filter((s) => s !== 'attack');
      const j = await choose(L('技能', 'Skills'), sks.map((s) => { const sk = SKILLS[s]; return { label: `${esc(T(sk.name))} <small>${sk.el ? esc(T(EL_NAME[sk.el])) : ''}</small>`, right: sk.cost.mp ? `MP ${sk.cost.mp}` : sk.cost.hp ? `HP ${Math.ceil(a.maxhp * sk.cost.hp / 100)}` : '', disabled: !canUse(a, s), note: skillNote(sk) }; }), { cls: 'cmd' });
      if (j < 0) continue;
      const sk = SKILLS[sks[j]]; let targets = [];
      if (['one', 'ally', 'dead'].includes(sk.target)) { const t = await pickTarget(B, sk.target); if (!t) continue; targets = [t]; }
      const res = useSkill(B, a, sks[j], targets); await showEvents(res.ev, a, sks[j]); return;
    }
    if (c === 'item') {
      const keys = Object.keys(S.bag).filter((k) => ITEMS[k].use && S.bag[k] > 0);
      const j = await choose(L('道具', 'Items'), keys.map((k) => ({ label: esc(T(ITEMS[k].name)), right: `×${S.bag[k]}`, disabled: ITEMS[k].use === 'escape' && BT.boss, note: itemNote(k) })), { cls: 'cmd' }); if (j < 0) continue;
      const k = keys[j], it = ITEMS[k]; let t = a;
      if (it.use === 'cure' && !B.sides[0].some((u) => alive(u) && u.ail)) { toast(L('沒有人陷入異常', 'Nobody has an ailment')); continue; }
      if (it.target === 'ally' || it.target === 'dead') { t = await pickTarget(B, it.target === 'dead' ? 'dead' : 'ally'); if (!t) continue; }
      const res = useItem(B, a, k, t, S.bag); await showEvents(res.ev, a, null, T(it.name)); return;
    }
    if (c === 'talk') { const t = await pickTarget(B, 'one'); if (!t) continue; await talk(B, a, t); return; }
    if (c === 'summon') { if (await summon(B, a)) return; continue; }
    if (c === 'pass') { const res = pass(B); await showEvents(res.ev, a); return; }
    if (c === 'run') { const res = tryEscape(B, a); await showEvents(res.ev, a); return; }
  }
}
const skillNote = (sk) => {
  const tgt = { one: L('敵方一體', 'one foe'), all: L('敵方全體', 'all foes'), multi: L('敵方隨機 2-4 次', '2-4 random hits'), ally: L('我方一人', 'one ally'), party: L('我方全體', 'all allies'), dead: L('倒下的同伴', 'a fallen ally'), self: L('自己', 'self') }[sk.target];
  const ail = sk.ail && T(AIL_NAME[sk.ail]);
  const what = sk.kind === 'atk' ? L(`${T(EL_NAME[sk.el])}屬性攻擊 威力${sk.power}`, `${T(EL_NAME[sk.el])} attack, power ${sk.power}`) + (sk.drain ? L('，吸收體力', ', drains HP') : '') + (sk.mpdrain ? L('，吸收魔力', ', drains MP') : '') + (sk.ail ? L(`，可能${ail}`, `, may ${sk.ail === 'poison' ? 'poison' : 'put to sleep'}`) : '')
    : sk.kind === 'heal' ? (sk.power >= 999 ? L('體力全滿', 'full HP') : L(`回復 ${sk.power}+`, `heals ${sk.power}+`)) : sk.kind === 'revive' ? L('復活', 'revives')
    : sk.kind === 'charge' ? (sk.stat === 'phys' ? L('下一次物理攻擊 2.5 倍', 'next physical attack ×2.5') : L('下一次魔法攻擊 2.5 倍', 'next magic attack ×2.5'))
    : sk.kind === 'shield' ? (sk.stat === 'phys' ? L('反彈下一次物理攻擊', 'reflects the next physical attack') : L('反彈下一次魔法攻擊', 'reflects the next magic attack'))
    : sk.kind === 'dispel' ? L('消除敵方的強化、反射壁與蓄力', 'removes foes\' boosts, walls and Charge')
    : sk.kind === 'cleanse' ? L('消除我方的弱化與異常', 'removes your debuffs and ailments')
    : sk.kind === 'ail' ? L(`使敵人${ail}（${Math.round(sk.chance * 100)}%）`, `${sk.ail === 'poison' ? 'poisons' : 'puts to sleep'} (${Math.round(sk.chance * 100)}%)`)
    : sk.kind === 'buff' ? (sk.stat === 'atk' ? L('攻擊力提升', 'attack up') : L('防禦力提升', 'defence up')) : (sk.stat === 'atk' ? L('敵攻擊力下降', 'foe attack down') : L('敵防禦力下降', 'foe defence down'));
  return `${what} · ${tgt}`;
};
// summon: swap a demon from the stock into the fight (uses the hero's action)
async function summon(B, hero) {
  const bench = S.stock.filter((u) => !S.active.includes(u.uid) && alive(u));
  if (!bench.length) { toast(L('沒有可以召喚的惡魔', 'No demons to summon')); return false; }
  const i = await choose(L('召喚誰？', 'Summon whom?'), bench.map((u) => ({ label: esc(nm(u)), right: `Lv${u.lv} ${u.hp}/${u.maxhp}`, note: skillLine(u) })), { cls: 'cmd' }); if (i < 0) return false;
  const u = bench[i], fighting = B.sides[0].filter((x) => !x.hero);
  if (fighting.length >= ACTIVE_MAX) {
    const j = await choose(L('換下誰？', 'Who returns?'), fighting.map((x) => ({ label: esc(nm(x)), right: `${x.hp}/${x.maxhp}` })), { cls: 'cmd' }); if (j < 0) return false;
    const out = fighting[j]; S.active = S.active.filter((x) => x !== out.uid); B.sides[0].splice(B.sides[0].indexOf(out), 1);
  }
  S.active.push(u.uid); resetFighter(u); B.sides[0].push(u);
  audio.play('join'); consume(B, 'normal'); B.next++; check(B);
  await say([L(`召喚了${nm(u)}！`, `${nm(u)} is summoned!`)]);
  return true;
}
// ---- talking
async function talk(B, hero, d) {
  const ctx = { heroLv: S.hero.lv, heroMaxHp: S.hero.maxhp, macca: S.macca, bag: S.bag, stockFull: S.stock.length >= STOCK_MAX, moon: moon(), owned: S.stock.map((u) => u.id) };
  const Tk = startTalk(d, ctx), who = nm(d);
  audio.play('talk');
  for (let guard = 0; guard < 8; guard++) {
    const p = talkPrompt(Tk);
    if (p.kind === 'end') { await talkEnd(B, d, p); return; }
    if (p.kind === 'question') {
      await say([p.text], who);
      const i = await choose(esc(T(p.text)), p.answers.map((a) => ({ label: esc(T(a)) })), { cancel: false });
      const r = talkAnswer(Tk, i); audio.play('talk'); await say([r.text], who);
    } else {
      await say([p.text], who);
      const can = p.what === 'macca' ? S.macca >= p.amount : p.what === 'item' ? (S.bag[p.item] || 0) > 0 : S.hero.hp > p.amount;
      const i = await choose(esc(T(p.text)), [{ label: L('答應', 'Agree'), disabled: !can }, { label: L('拒絕', 'Refuse') }], { cancel: false });
      if (i === 0) { if (p.what === 'macca') { S.macca -= p.amount; ctx.macca = S.macca; } else if (p.what === 'item') { S.bag[p.item]--; if (!S.bag[p.item]) delete S.bag[p.item]; } else S.hero.hp -= p.amount; audio.play('gold'); }
      const r = talkAnswer(Tk, i === 0); await say([r.text], who); hud(); drawBattle();
    }
  }
}
async function talkEnd(B, d, p) {
  const who = nm(d);
  await say([p.text], who);
  if (p.result === 'join') {
    const u = makeDemon(d.id, d.lv); S.stock.push(u); if (S.active.length < ACTIVE_MAX) S.active.push(u.uid);
    d.hp = 0; d.left = true; audio.play('join'); flash('#80c0ff');
    await showDemon(u, L(`${who}成為了同伴！`, `${who} joins you!`));
    consume(B, 'normal');
  } else if (p.result === 'gift') {
    const gift = Math.random() < 0.5 ? ['macca', Math.round(d.lv * 20)] : ['item', d.lv > 20 ? 'salve2' : 'salve'];
    if (gift[0] === 'macca') S.macca += gift[1]; else S.bag[gift[1]] = (S.bag[gift[1]] || 0) + 1;
    d.hp = 0; d.left = true;
    await say([gift[0] === 'macca' ? L(`得到了 ${gift[1]} 魔貨。`, `You receive ${gift[1]} macca.`) : L(`得到了「${ITEMS[gift[1]].name[0]}」。`, `You receive ${ITEMS[gift[1]].name[1]}.`)]);
    consume(B, 'normal');
  } else if (p.result === 'leave') { d.hp = 0; d.left = true; consume(B, 'normal'); }
  else consume(B, 'end');
  B.next++; check(B); drawBattle();
}
// ---- the events of an action, one by one
async function showEvents(ev, a, skill, label) {
  const B = BT.B, sk = skill && SKILLS[skill];
  if (sk && skill !== 'attack') { banner(T(sk.name)); }
  else if (label) banner(label);
  if (sk) audio.play(sk.kind === 'heal' || sk.kind === 'revive' || sk.kind === 'cleanse' ? 'healfx' : ['buff', 'charge', 'shield'].includes(sk.kind) ? 'buff' : ['debuff', 'dispel', 'ail'].includes(sk.kind) ? 'debuff' : sk.el === 'phys' ? 'slash' : sk.el === 'almighty' ? 'almighty' : sk.el);
  if (sk && sk.kind === 'atk' && sk.el !== 'phys') flash({ fire: '#ff6020', ice: '#80d0ff', elec: '#ffff60', force: '#a0ffa0', light: '#ffffe0', dark: '#8020a0', almighty: '#ffffff' }[sk.el] || '#fff');
  for (const e of ev) {
    const t = e.t, foe = t && B.sides[1].includes(t), el = foe ? $('foes').querySelector(`.foe[data-i="${B.sides[1].indexOf(t)}"]`) : $('party').querySelector(`.pm[data-uid="${t && t.uid}"]`);
    if (e.kind === 'hit') {
      // remember what each kind of demon does with each element (shown under its portrait from then on)
      if (foe && sk && sk.el && sk.el !== 'almighty') known(t.id)[sk.el] = e.weak ? 'w' : e.resist ? 's' : '-';
      pop(el, e.dmg, e.weak ? 'weak' : e.crit ? 'crit' : e.resist ? 'resist' : '', e.weak ? L('弱點！', 'WEAK!') : e.crit ? L('會心！', 'CRITICAL!') : e.resist ? L('抵抗', 'Resist') : '');
      if (e.weak || e.crit) audio.play('weak'); if (!foe) shake();
      if (e.dead) { audio.play('down'); }
    } else if (e.kind === 'miss') { pop(el, L('MISS', 'MISS'), 'miss'); audio.play('miss'); }
    else if (e.kind === 'null') { if (foe && sk) known(t.id)[sk.el] = 'n'; pop(el, L('無效', 'NULL'), 'miss'); audio.play('null'); }
    else if (e.kind === 'repel') { if (foe && sk && !e.wall) known(t.id)[sk.el] = 'r'; pop(el, e.wall ? L('反射壁！', 'WALL!') : L('反射', 'REPEL'), 'miss'); audio.play('null'); }
    else if (e.kind === 'drain') { if (foe && sk) known(t.id)[sk.el] = 'd'; pop(el, L('吸收', 'DRAIN'), 'heal'); audio.play('null'); }
    else if (e.kind === 'heal' || e.kind === 'mp') pop(el, '+' + e.n, 'heal');
    else if (e.kind === 'revive') pop(el, L('復活', 'REVIVED'), 'heal');
    else if (e.kind === 'buff' || e.kind === 'debuff') pop(el, (e.kind === 'buff' ? '▲' : '▼') + (e.stat === 'atk' ? L('攻', 'ATK') : L('防', 'DEF')), e.kind === 'buff' ? 'heal' : 'weak');
    else if (e.kind === 'ail') { pop(el, T(AIL_NAME[e.ail]), e.ail, e.ail === 'sleep' ? 'Zzz' : ''); audio.play('debuff'); }
    else if (e.kind === 'ailfail') pop(el, L('沒有效果', 'NO EFFECT'), 'miss');
    else if (e.kind === 'sleeping') { banner(L(`${nm(t)}正在睡覺……`, `${nm(t)} is asleep…`)); pop(el, 'Zzz', 'sleep'); }
    else if (e.kind === 'wake') pop(el, L('醒了！', 'AWAKE!'), 'heal');
    else if (e.kind === 'poison') pop(el, e.dmg, 'poison', L('中毒', 'POISON'));
    else if (e.kind === 'charge') pop(el, e.stat === 'phys' ? L('蓄力！', 'CHARGED!') : L('集中！', 'FOCUSED!'), 'crit');
    else if (e.kind === 'shield') pop(el, e.stat === 'phys' ? L('物理反射壁', 'PHYS WALL') : L('魔法反射壁', 'MAGIC WALL'), 'heal');
    else if (e.kind === 'dispel') pop(el, L('消除', 'DISPEL'), 'weak');
    else if (e.kind === 'cleanse') pop(el, L('淨化', 'CLEANSED'), 'heal');
    else if (e.kind === 'pass') { banner(L('跳過', 'Pass')); }
    else if (e.kind === 'escape') audio.play('stairs');
    else if (e.kind === 'fail') { banner(L('逃不掉！', 'Couldn\'t escape!')); audio.play('cancel'); }
    else if (e.kind === 'noescape') { banner(L('無法從頭目戰中逃跑！', 'There is no escaping a boss!')); audio.play('cancel'); }
    if (['ail', 'shield', 'charge', 'dispel', 'cleanse', 'wake', 'poison', 'sleeping'].includes(e.kind)) drawBattle(); else drawBattleSoft();
    await sleep(260);
  }
  drawBattle(); await sleep(250);
}
function drawBattleSoft() { const B = BT.B; B.sides[1].forEach((u, i) => { const el = $('foes').querySelector(`.foe[data-i="${i}"]`); if (!el) return; el.querySelector('.hp i').style.width = `${u.hp / u.maxhp * 100}%`; el.classList.toggle('gone', !alive(u)); }); partyBars(); }
function pop(el, text, cls, label) {
  if (!el) return;
  const d = document.createElement('div'); d.className = 'pop ' + (cls || ''); d.innerHTML = `${label ? `<small>${esc(label)}</small>` : ''}${esc(String(text))}`;
  const r = el.getBoundingClientRect(); d.style.left = `${r.left + r.width / 2}px`; d.style.top = `${r.top + r.height * 0.35}px`;
  document.body.appendChild(d); setTimeout(() => d.remove(), 1100);
  el.classList.remove('hurt'); void el.offsetWidth; el.classList.add('hurt');
}
function shake() { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); }
async function victory(B) {
  audio.music(null); audio.play('win');
  const stayed = { sides: [B.sides[0], B.sides[1].filter((u) => !u.left)], rng: Math.random };
  const rw = stayed.sides[1].length ? rewards(stayed) : { exp: 0, macca: 0 };
  S.macca += rw.macca;
  const lines = [L(`戰鬥勝利！得到 ${rw.exp} 經驗值、${rw.macca} 魔貨。`, `Victory! ${rw.exp} EXP and ${rw.macca} macca.`)];
  if (rw.exp) for (const u of B.sides[0]) if (alive(u)) for (const up of gainExp(u, rw.exp)) { lines.push(L(`${nm(u)}升到了 ${up.lv} 級！`, `${nm(u)} reaches level ${up.lv}!`)); for (const s of up.learned) lines.push(L(`${nm(u)}學會了「${SKILLS[s].name[0]}」！`, `${nm(u)} learns ${SKILLS[s].name[1]}!`)); }
  if (lines.length > 1) audio.play('levelup');
  if (rw.exp && Math.random() < 0.18) { const it = S.floor < 4 ? 'salve' : 'salve2'; S.bag[it] = (S.bag[it] || 0) + 1; lines.push(L(`得到了「${ITEMS[it].name[0]}」。`, `Found ${ITEMS[it].name[1]}.`)); }
  // bosses leave something behind
  if (BT.boss) for (const u of B.sides[1]) { const k = BOSS_DROP[u.id]; if (k) { S.gear[k] = (S.gear[k] || 0) + 1; lines.push(L(`${nm(u)}留下了「${EQUIPS[k].name[0]}」！（選單 → 裝備）`, `${nm(u)} leaves behind the ${EQUIPS[k].name[1]}! (Menu → Equip)`)); } }
  partyBars(); await say(lines);
}
async function gameOver() {
  R.mode = 'over'; audio.music(null); audio.play('scream');
  const d = openBox(`<h1>GAME OVER</h1><p>${L('你的旅程在此結束……', 'Your journey ends here…')}</p><button id="go-load" class="big">${L('從記錄繼續', 'Continue from save')}</button><button id="go-title">${L('回到標題', 'Title screen')}</button>`, 'over');
  await new Promise((go) => { d.querySelector('#go-load').onclick = () => { closeBox(d); go(); loadGame(); }; d.querySelector('#go-title').onclick = () => { closeBox(d); go(); titleScreen(); }; });
}
async function ending() {
  R.mode = 'ending'; audio.music(4);
  const r = route(S.align); S.cleared = (S.cleared || []).concat([r]); save();
  fadeOut(); await sleep(800);
  await say(ENDINGS[r]);
  fadeIn(); titleScreen();
}

// ---------------------------------------------------------------- title, new game, continue
function staticText() {
  document.title = L('魔都轉生 · Demon Covenant', 'Demon Covenant · 魔都轉生');
  $('t-new').textContent = L('新的遊戲', 'New Game'); $('t-cont').textContent = L('繼續', 'Continue'); $('t-lang').textContent = EN() ? '中文' : 'English';
  $('t-sub').textContent = L('與惡魔交談，締結契約，在崩毀的東京活下去。', 'Talk to demons, make covenants, and survive the ruins of Tokyo.');
  $('t-help').innerHTML = L('↑↓ 前進後退 · ←→ 轉向 · Q/E 側移 · Enter 確定 · Esc 選單 · M 地圖', '↑↓ move · ←→ turn · Q/E sidestep · Enter confirm · Esc menu · M map');
}
function titleScreen() {
  R.mode = 'title'; R.busy = false; modal = null; ui.innerHTML = ''; $('hud').hidden = true; $('battle').hidden = true; $('title').hidden = false;
  $('t-cont').hidden = !loadSave(); staticText(); audio.music(null);
}
async function newGame() {
  audio.start(); $('title').hidden = true;
  const name = await askName();
  S = { v: 1, seed: Math.floor(Math.random() * 1e9), name, hero: makeHero(name), stock: [], active: [], macca: 300, bag: { salve: 3, water: 1, antidote: 1 }, gear: {}, align: 0, floor: 0, steps: 0, maps: {}, known: {}, music: 0.5 };
  const dI = await choose(L('難度（之後可以在設定裡更改）', 'Difficulty (you can change it later in Settings)'), [{ label: L('簡單', 'Easy'), right: L('劇情為主', 'For the story') }, { label: L('普通', 'Normal'), right: L('推薦', 'Recommended') }, { label: L('困難', 'Hard'), right: L('要動腦', 'A real fight') }]);
  S.diff = ['easy', 'normal', 'hard'][dI < 0 ? 1 : dI];
  R.mode = 'story'; await say(PROLOGUE);
  const pixie = makeDemon('pixie'); S.stock.push(pixie); S.active.push(pixie.uid);
  await showDemon(pixie, L('ORACLE 送來了一隻惡魔。', 'ORACLE sends you a demon.'));
  await say([[`小妖精：「我是小妖精！今後請多指教囉，${name}！」`, `Pixie: "I'm Pixie! Let's get along, ${name}!"`], ['（遇到惡魔時，可以用「交談」讓牠成為同伴。打中弱點可以多行動一次！）', '(When you meet a demon, try Talk to make it an ally. Hitting a weakness gives you an extra action!)']]);
  startPlay(); enterFloor(0); banner(T(AREAS[0].name), '1F'); save();
}
function askName() {
  return new Promise((resolve) => {
    const d = openBox(`<div class="title">${L('你的名字', 'Your name')}</div><input id="nm" maxlength="8" value="${L('凱', 'Kai')}"><button id="nm-ok" class="big">${L('決定', 'OK')}</button>`, 'name');
    const inp = d.querySelector('#nm'); inp.focus(); inp.select();
    const fin = () => { const v = inp.value.trim() || L('凱', 'Kai'); modal = null; closeBox(d); audio.play('ok'); resolve(v); };
    d.querySelector('#nm-ok').onclick = fin; inp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); fin(); } };
    modal = () => {};
  });
}
function loadGame() {
  const d = loadSave(); if (!d) return titleScreen();
  audio.start(); S = d; S.known = S.known || {};
  // saves from before equipment: give the hero the starting gear and bring every stat up to date
  S.gear = S.gear || {}; S.hero.eq = S.hero.eq || { weapon: 'knife', armor: 'jacket', acc: null };
  for (const u of [S.hero, ...S.stock]) { u.eq = u.eq || {}; resetFighter(u); refreshStats(u); }
  setUidFloor(1 + Math.max(S.hero.uid, ...S.stock.map((u) => u.uid)));
  $('title').hidden = true; startPlay(); enterFloor(S.floor, S.pos); audio.setMusicVolume(S.music ?? 0.5);
  banner(T(AREAS[FLOORS[S.floor].area].name), `${FLOORS[S.floor].floor}F`);
}
function startPlay() { R.mode = 'explore'; ui.innerHTML = ''; modal = null; $('hud').hidden = false; $('battle').hidden = true; }

// ---------------------------------------------------------------- input
const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
  Enter: 'ok', ' ': 'ok', z: 'ok', Z: 'ok', Escape: 'back', x: 'back', X: 'back', Backspace: 'back', Tab: 'menu', q: 'sl', Q: 'sl', e: 'sr', E: 'sr', m: 'map', M: 'map' };
const held = new Set();
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  const k = KEYMAP[e.key]; if (!k) return;
  e.preventDefault(); audio.start();
  if (modal) { modal(k === 'menu' ? 'back' : k); return; }
  if (R.mode === 'title') { if (k === 'ok') ($('t-cont').hidden ? newGame() : loadGame()); return; }
  if (R.mode !== 'explore') return;
  held.add(k);
  if (k === 'left' || k === 'right') turn(k === 'left' ? -1 : 1);     // directions go clockwise: north, east, south, west
  else if (k === 'up' || k === 'down') tryStep(k === 'down');
  else if (k === 'sl' || k === 'sr') tryStep(false, k === 'sl' ? -1 : 1);
  else if (k === 'back' || k === 'menu') mainMenu();
  else if (k === 'map') { R.busy = true; $('bigwrap').hidden = false; drawMap(true); modal = () => { $('bigwrap').hidden = true; modal = null; R.busy = false; }; $('bigwrap').onclick = () => modal && modal(); }
});
addEventListener('keyup', (e) => { const k = KEYMAP[e.key]; if (k) held.delete(k); });
// touch: the on-screen pad
for (const [id, fn] of [['tp-up', () => tryStep(false)], ['tp-down', () => tryStep(true)], ['tp-left', () => turn(-1)], ['tp-right', () => turn(1)], ['tp-menu', () => mainMenu()], ['tp-map', () => { if (R.mode === 'explore' && !R.busy) { R.busy = true; $('bigwrap').hidden = false; drawMap(true); modal = () => { $('bigwrap').hidden = true; modal = null; R.busy = false; }; $('bigwrap').onclick = () => modal && modal(); } }]]) {
  const b = $(id); b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio.start(); if (!modal) fn(); b.dataset.hold = '1'; clearInterval(b._t); if (id === 'tp-up' || id === 'tp-down') b._t = setInterval(() => { if (b.dataset.hold && !modal) fn(); }, 260); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => { b.dataset.hold = ''; clearInterval(b._t); });
}
$('t-new').onclick = () => { if (loadSave() && !$('t-new').dataset.armed) { $('t-new').dataset.armed = '1'; $('t-new').textContent = L('再按一次：覆蓋記錄開始新遊戲', 'Press again: start over (replaces your save)'); setTimeout(() => { delete $('t-new').dataset.armed; staticText(); }, 3000); return; } newGame(); };
$('t-cont').onclick = () => loadGame();
$('t-lang').onclick = () => { lang = EN() ? 'zh' : 'en'; try { localStorage.setItem('dc.lang', lang); } catch (e) { /* ignore */ } document.documentElement.lang = EN() ? 'en' : 'zh-Hant'; staticText(); };

// ---------------------------------------------------------------- the frame
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; R.t += dt;
  if (R.anim) {
    const a = R.anim; a.t += dt / a.dur; const k = Math.min(1, a.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    if (a.kind === 'move') { R.cam.x = a.fx + (a.tx - a.fx) * e; R.cam.z = a.fz + (a.tz - a.fz) * e; }
    else R.cam.yaw = a.from + (a.to - a.from) * e;
    if (k >= 1) {
      R.anim = null;
      if (a.kind === 'move') arrived().then(() => { if (!R.busy && R.mode === 'explore' && !modal) { if (held.has('up')) tryStep(false); else if (held.has('down')) tryStep(true); } });
      else R.cam.yaw = -R.dir * Math.PI / 2;
    }
  }
  const bob = R.anim && R.anim.kind === 'move' ? Math.sin(R.anim.t * Math.PI) * 0.04 : 0;
  camera.position.set(R.cam.x, 1.6 + bob + (R.mode === 'battle' ? Math.sin(R.t * 0.7) * 0.03 : 0), R.cam.z);
  camera.rotation.set(R.mode === 'battle' ? -0.05 : 0, R.cam.yaw + (R.mode === 'battle' ? Math.sin(R.t * 0.4) * 0.03 : 0), 0);
  if (R.world) R.world.update(R.t);
  lamp.intensity = 2.5 + Math.sin(R.t * 3.1) * 0.08 + Math.sin(R.t * 7.3) * 0.04;
  if (audio.ready) { const f = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion); audio.setListener(camera.position, f, new THREE.Vector3(0, 1, 0)); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
// a title-screen backdrop: a corridor of Shinjuku
S = { seed: 7, maps: {}, floor: 0, steps: 0, align: 0 };
R.floor = buildFloor(7, 0); R.world = buildWorld(R.floor, 'subway', { opened: new Set(), story: false, boss: false }); scene.add(R.world.group);
{ const L2 = R.world.look; scene.fog = new THREE.FogExp2(L2.fog, L2.fogD); scene.background = new THREE.Color(L2.fog); }
R.cam = { x: TILE, z: TILE, yaw: Math.PI };
document.documentElement.lang = EN() ? 'en' : 'zh-Hant';
titleScreen();
requestAnimationFrame(frame);
window.__dc = { get S() { return S; }, R, newGame, loadGame, enterFloor, battle, randomBattle, terminal, fusionAltar, get BT() { return BT; }, press: (k) => modal && modal(k), tryStep, turn, hud, makeDemon, encounter };
