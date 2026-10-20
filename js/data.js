// DEMON COVENANT — the data: skills, races, demons, bosses, items, areas. No DOM here (node tests load it).
// Names are [中文, English]. Demons come from world folklore and mythology.

// ---------------------------------------------------------------- elements and affinities
export const ELEMENTS = ['phys', 'fire', 'ice', 'elec', 'force', 'light', 'dark', 'almighty'];
export const EL_NAME = { phys: ['物理', 'Phys'], fire: ['火', 'Fire'], ice: ['冰', 'Ice'], elec: ['雷', 'Elec'], force: ['風', 'Force'], light: ['光', 'Light'], dark: ['闇', 'Dark'], almighty: ['萬能', 'Almighty'] };
export const AFF_NAME = { w: ['弱', 'Weak'], s: ['耐', 'Resist'], n: ['無', 'Null'], r: ['反', 'Repel'], d: ['吸', 'Drain'] };
// "fire:w ice:s" → { fire: 'w', ice: 's' }
export const parseAff = (s) => Object.fromEntries((s || '').split(/\s+/).filter(Boolean).map((x) => x.split(':')));

// ---------------------------------------------------------------- skills
// kind: atk (damage) / heal / revive / buff / debuff; target: one / all / multi (2-4 random hits) / ally / party / dead
// cost: mp, or hp (% of max HP, physical skills)
const S = (zh, en, el, kind, power, cost, target, extra = {}) => ({ name: [zh, en], el, kind, power, cost, target, ...extra });
export const SKILLS = {
  attack:   S('攻擊', 'Attack', 'phys', 'atk', 60, {}, 'one'),
  lunge:    S('突刺', 'Lunge', 'phys', 'atk', 95, { hp: 7 }, 'one'),
  rampage:  S('亂擊', 'Rampage', 'phys', 'atk', 55, { hp: 11 }, 'multi', { hits: [2, 4] }),
  cleave:   S('迴旋斬', 'Cleave', 'phys', 'atk', 70, { hp: 13 }, 'all'),
  mighty:   S('剛斬', 'Mighty Blow', 'phys', 'atk', 165, { hp: 14 }, 'one', { crit: 0.25 }),
  myriad:   S('千刃', 'Thousand Blades', 'phys', 'atk', 115, { hp: 20 }, 'all'),
  fire1:    S('火球', 'Fireball', 'fire', 'atk', 55, { mp: 3 }, 'one'),
  fire2:    S('烈火', 'Fireblast', 'fire', 'atk', 100, { mp: 6 }, 'one'),
  fireAll:  S('火炎陣', 'Fire Wave', 'fire', 'atk', 50, { mp: 9 }, 'all'),
  fire3:    S('劫火', 'Inferno', 'fire', 'atk', 170, { mp: 12 }, 'one'),
  fireAll2: S('煉獄', 'Purgatory', 'fire', 'atk', 105, { mp: 20 }, 'all'),
  ice1:     S('冰刃', 'Frost', 'ice', 'atk', 55, { mp: 3 }, 'one'),
  ice2:     S('冰槍', 'Ice Lance', 'ice', 'atk', 100, { mp: 6 }, 'one'),
  iceAll:   S('冰風暴', 'Blizzard', 'ice', 'atk', 50, { mp: 9 }, 'all'),
  ice3:     S('絕對零度', 'Absolute Zero', 'ice', 'atk', 170, { mp: 12 }, 'one'),
  iceAll2:  S('永凍', 'Permafrost', 'ice', 'atk', 105, { mp: 20 }, 'all'),
  elec1:    S('電擊', 'Spark', 'elec', 'atk', 55, { mp: 3 }, 'one'),
  elec2:    S('落雷', 'Thunder', 'elec', 'atk', 100, { mp: 6 }, 'one'),
  elecAll:  S('雷網', 'Storm Net', 'elec', 'atk', 50, { mp: 9 }, 'all'),
  elec3:    S('天雷', 'Heaven\'s Bolt', 'elec', 'atk', 170, { mp: 12 }, 'one'),
  elecAll2: S('雷神怒', 'Thunder God', 'elec', 'atk', 105, { mp: 20 }, 'all'),
  force1:   S('疾風', 'Gust', 'force', 'atk', 55, { mp: 3 }, 'one'),
  force2:   S('旋風', 'Whirlwind', 'force', 'atk', 100, { mp: 6 }, 'one'),
  forceAll: S('暴風', 'Gale', 'force', 'atk', 50, { mp: 9 }, 'all'),
  force3:   S('真空刃', 'Vacuum Blade', 'force', 'atk', 170, { mp: 12 }, 'one'),
  forceAll2:S('天變', 'Tempest', 'force', 'atk', 105, { mp: 20 }, 'all'),
  light1:   S('聖光', 'Holy Light', 'light', 'atk', 70, { mp: 5 }, 'one'),
  lightAll: S('審判之光', 'Judgement', 'light', 'atk', 65, { mp: 12 }, 'all'),
  light3:   S('天罰', 'Divine Wrath', 'light', 'atk', 180, { mp: 15 }, 'one'),
  dark1:    S('詛咒', 'Curse', 'dark', 'atk', 70, { mp: 5 }, 'one'),
  darkAll:  S('冥府之門', 'Gate of Hades', 'dark', 'atk', 65, { mp: 12 }, 'all'),
  dark3:    S('魂喰', 'Soul Eater', 'dark', 'atk', 180, { mp: 15 }, 'one'),
  ruin:     S('破滅', 'Ruin', 'almighty', 'atk', 90, { mp: 18 }, 'all'),
  ruin2:    S('終焉', 'Doomsday', 'almighty', 'atk', 140, { mp: 30 }, 'all'),
  heal:     S('治療', 'Heal', null, 'heal', 55, { mp: 3 }, 'ally'),
  healAll:  S('全體治療', 'Heal All', null, 'heal', 45, { mp: 7 }, 'party'),
  heal2:    S('大治療', 'Greater Heal', null, 'heal', 999, { mp: 7 }, 'ally'),
  healAll2: S('慈雨', 'Merciful Rain', null, 'heal', 140, { mp: 15 }, 'party'),
  revive:   S('甦生', 'Revive', null, 'revive', 50, { mp: 12 }, 'dead'),
  warcry:   S('戰吼', 'War Cry', null, 'buff', 1, { mp: 10 }, 'party', { stat: 'atk' }),
  ironwall: S('鐵壁', 'Iron Wall', null, 'buff', 1, { mp: 10 }, 'party', { stat: 'def' }),
  hex:      S('衰弱', 'Hex', null, 'debuff', 1, { mp: 10 }, 'all', { stat: 'atk' }),
  rend:     S('破甲', 'Rend', null, 'debuff', 1, { mp: 10 }, 'all', { stat: 'def' }),
  // drains, heavy blows, focusing, reflecting walls, clearing boosts, and ailments (poison, sleep)
  drain:    S('吸血', 'Life Drain', 'dark', 'atk', 75, { mp: 6 }, 'one', { drain: 0.5 }),
  mpDrain:  S('吸魔', 'Spirit Drain', 'almighty', 'atk', 30, {}, 'one', { mpdrain: 0.6 }),
  venom:    S('毒牙', 'Venom Bite', 'phys', 'atk', 80, { hp: 8 }, 'one', { ail: 'poison', chance: 0.45 }),
  deathbound: S('殺陣', 'Deathbound', 'phys', 'atk', 150, { hp: 22 }, 'all'),
  godhand:  S('神之手', 'God\'s Hand', 'phys', 'atk', 290, { hp: 24 }, 'one', { crit: 0.3 }),
  charge:   S('蓄力', 'Charge', null, 'charge', 0, { mp: 8 }, 'self', { stat: 'phys' }),
  focus:    S('集中', 'Concentrate', null, 'charge', 0, { mp: 8 }, 'self', { stat: 'mag' }),
  physWall: S('物理反射壁', 'Tetrakarn', null, 'shield', 0, { mp: 18 }, 'party', { stat: 'phys' }),
  magWall:  S('魔法反射壁', 'Makarakarn', null, 'shield', 0, { mp: 18 }, 'party', { stat: 'mag' }),
  dispel:   S('消除', 'Dekaja', null, 'dispel', 0, { mp: 10 }, 'all'),
  cleanse:  S('淨化', 'Dekunda', null, 'cleanse', 0, { mp: 10 }, 'party'),
  poisma:   S('毒霧', 'Poison Mist', null, 'ail', 0, { mp: 5 }, 'all', { ail: 'poison', chance: 0.5 }),
  dormina:  S('催眠', 'Dormina', null, 'ail', 0, { mp: 5 }, 'one', { ail: 'sleep', chance: 0.6 }),
  lullaby:  S('搖籃曲', 'Lullaby', null, 'ail', 0, { mp: 12 }, 'all', { ail: 'sleep', chance: 0.4 }),
};
// ailments last until the battle ends: poison takes a bit of health each turn, sleep skips turns (and a hit wakes)
export const AIL_NAME = { poison: ['中毒', 'Poison'], sleep: ['睡眠', 'Sleep'] };

// ---------------------------------------------------------------- races, and what talking to them is like
// personality: what kind of answers they like in a negotiation (see talk.js)
export const RACES = {
  fairy:  { name: ['妖精', 'Fairy'], pers: 'childish' }, beast: { name: ['魔獸', 'Beast'], pers: 'wild' }, jirae: { name: ['地靈', 'Jirae'], pers: 'gloomy' },
  foul:   { name: ['邪鬼', 'Foul'], pers: 'gloomy' }, yoma: { name: ['妖魔', 'Yoma'], pers: 'cunning' }, divine: { name: ['天使', 'Divine'], pers: 'noble' },
  avian:  { name: ['靈鳥', 'Avian'], pers: 'proud' }, snake: { name: ['龍蛇', 'Snake'], pers: 'proud' }, night: { name: ['夜魔', 'Night'], pers: 'cunning' },
  brute:  { name: ['凶鬼', 'Brute'], pers: 'wild' },
};
export const RACE_ORDER = Object.keys(RACES);
// fusion: which race two races make (same race makes a stronger demon of that race)
const FUSE_ROWS = {
  fairy:  { beast: 'yoma', jirae: 'beast', foul: 'night', yoma: 'divine', divine: 'avian', avian: 'jirae', snake: 'night', night: 'yoma', brute: 'jirae' },
  beast:  { jirae: 'brute', foul: 'brute', yoma: 'night', divine: 'avian', avian: 'snake', snake: 'avian', night: 'foul', brute: 'snake' },
  jirae:  { foul: 'brute', yoma: 'fairy', divine: 'fairy', avian: 'beast', snake: 'brute', night: 'foul', brute: 'beast' },
  foul:   { yoma: 'night', divine: 'jirae', avian: 'night', snake: 'brute', night: 'brute', brute: 'night' },
  yoma:   { divine: 'avian', avian: 'divine', snake: 'night', night: 'fairy', brute: 'beast' },
  divine: { avian: 'snake', snake: 'avian', night: 'yoma', brute: 'yoma' },
  avian:  { snake: 'divine', night: 'yoma', brute: 'beast' },
  snake:  { night: 'brute', brute: 'beast' },
  night:  { brute: 'foul' },
};
export function fuseRace(a, b) { if (a === b) return a; return (FUSE_ROWS[a] && FUSE_ROWS[a][b]) || (FUSE_ROWS[b] && FUSE_ROWS[b][a]); }

// ---------------------------------------------------------------- demons
// [id, 中文, English, race, level, build, affinities, { level: skill }, art]
// build sets how the stats grow: phys (strength), mag (magic), tank (vitality), fast (agility), bal
// art: [body, main colour, second colour, eye colour] — drawn by js/art.js
const D = [
  ['pixie', '小妖精', 'Pixie', 'fairy', 2, 'mag', 'elec:s force:w dark:w', { 1: 'heal', 2: 'elec1', 5: 'force1' }, ["fig", "#3a6a5a", "#c8e8d0", "#80e0ff", {"fit": [0, -46, 0.6], "build": "slim", "face": "f", "hair": {"style": "short", "col": "#d8e8f0"}, "outfit": {"type": "dress", "col": "#3a7a6a", "col2": "#e0f0e8"}, "wings": {"type": "small", "col": "#d8f4ff"}, "left": "gesture"}]],
  ['kelpie', '水馬', 'Kelpie', 'fairy', 10, 'bal', 'ice:d fire:w elec:w', { 10: 'ice1', 11: 'heal', 13: 'lunge' }, ["beast", "#2a4a5a", "#7aa0a8", "#80ffe0", {"kind": "horse", "mane": "#3a6a4a"}]],
  ['leanan', '靈感妖精', 'Leanan Sidhe', 'fairy', 20, 'mag', 'force:s dark:s fire:w', { 20: 'force2', 21: 'heal2', 23: 'hex' }, ["fig", "#2a4a3a", "#d8b860", "#c8ffd0", {"build": "slim", "face": "f", "hair": {"style": "long", "col": "#a83a2a"}, "outfit": {"type": "dress", "col": "#2a4a3a", "col2": "#d8b860"}, "weapon": {"type": "book", "col": "#5a2a2a"}, "left": "gesture"}]],
  ['titania', '妖精女王', 'Titania', 'fairy', 33, 'mag', 'elec:s force:s ice:s dark:w', { 33: 'elecAll', 34: 'healAll2', 36: 'elec3' }, ["fig", "#6a4a8a", "#e8d0f0", "#fff0a0", {"build": "slim", "face": "f", "hair": {"style": "flow", "col": "#e8c870"}, "outfit": {"type": "dress", "col": "#6a4a8a", "col2": "#e8d0f0"}, "wings": {"type": "small", "col": "#f0e0ff"}, "crown": "#e8c040", "left": "orb"}]],
  ['caitsith', '貓妖精', 'Cait Sith', 'beast', 6, 'fast', 'dark:s light:w', { 6: 'rampage', 7: 'dark1', 9: 'warcry' }, ["beast", "#1e1c22", "#e8e4dc", "#ffd040", {"kind": "cat", "collar": "#a02a2a"}]],
  ['shiisa', '風獅爺', 'Shiisa', 'beast', 4, 'phys', 'fire:s force:w', { 4: 'lunge', 6: 'fire1' }, ["beast", "#c89040", "#e8c890", "#ffffff", {"kind": "lion", "mane": "#a04020"}]],
  ['nekomata', '貓又', 'Nekomata', 'beast', 13, 'fast', 'elec:s force:w', { 13: 'lunge', 14: 'elec1', 16: 'rampage' }, ["beast", "#c88a50", "#f0e0c8", "#80ff60", {"kind": "cat", "tails": 2}]],
  ['inugami', '犬神', 'Inugami', 'beast', 19, 'phys', 'dark:n light:w', { 19: 'mighty', 20: 'dark1', 22: 'rend' }, ["beast", "#e0d8c8", "#f0e8e0", "#ff3030", {"kind": "dog", "mark": "#c02020"}]],
  ['cerberus', '地獄三頭犬', 'Cerberus', 'beast', 34, 'phys', 'fire:d ice:w', { 34: 'fire3', 35: 'myriad', 37: 'warcry' }, ["beast", "#2a1e1c", "#5a3a2a", "#ffb020", {"kind": "dog", "heads": 3, "flames": true, "collar": "#6a6a72"}]],
  ['kodama', '木靈', 'Kodama', 'jirae', 3, 'tank', 'force:s fire:w', { 3: 'force1', 4: 'heal' }, ["fig", "#4a7a3a", "#d8cca8", "#a0ffb0", {"fit": [0, -6, 0.8], "build": "slim", "head": "mask", "maskCol": "#d8cca8", "outfit": {"type": "robe", "col": "#4a7a3a", "col2": "#8a6a3a"}, "horns": {"type": "antler", "col": "#5a3a24"}, "left": "gesture", "tatter": true}]],
  ['huapo', '花魄', 'Hua Po', 'jirae', 5, 'mag', 'fire:s ice:w', { 5: 'fire1', 7: 'heal' }, ["flower", "#ff9ab8", "#ffd0e0", "#ff6a8a", {"fit": [0, -10, 0.78], "hair": "#4a8a3a"}]],
  ['sudama', '魑魅', 'Sudama', 'jirae', 8, 'bal', 'force:s elec:w', { 8: 'force1', 9: 'lunge', 11: 'hex' }, ["fig", "#5a4a2a", "#d8e0a0", "#ffff80", {"fit": [0, -6, 0.74], "build": "slim", "head": "ghoul", "skin": "#8a9a5a", "outfit": {"type": "bare", "col": "#5a4a2a"}, "claws": true, "horns": {"type": "oni", "col": "#d8d0a0"}, "left": "gesture"}]],
  ['hitokoto', '一言主', 'Hitokotonushi', 'jirae', 18, 'tank', 'phys:s force:n fire:w', { 18: 'force2', 19: 'ironwall', 21: 'healAll' }, ["fig", "#7a6a4a", "#d8c890", "#ffd060", {"build": "heavy", "head": "mask", "maskCol": "#e8dcc0", "outfit": {"type": "robe", "col": "#7a6a4a", "col2": "#d8c890"}, "weapon": {"type": "staff", "col": "#5a4030"}, "hair": {"style": "long", "col": "#2a2420"}}]],
  ['tsuchigumo', '土蜘蛛', 'Tsuchigumo', 'jirae', 27, 'phys', 'phys:s elec:s fire:w', { 27: 'myriad', 28: 'elec2', 30: 'rend' }, ["spider", "#3a2e24", "#c09050", "#ff4020", {"face": "#d8c0a0"}]],
  // the first of the bestiary-style demons (js/grimoire.js): met on the first floor
  ['ooze', '腐泥', 'Ooze', 'foul', 1, 'tank', 'phys:s fire:w', { 1: 'attack', 2: 'poisma', 4: 'lunge' }, ['ooze', '#4a5a2a', '#a8c870', '#c8ff40']],
  ['mimic', '噬寶箱', 'Gnashing Chest', 'jirae', 2, 'tank', 'phys:s ice:w', { 2: 'lunge', 3: 'rampage', 5: 'warcry' }, ['mimic', '#7a4a2a', '#b8a060', '#ff5030']],
  ['lampmoth', '燈蛾夫人', 'Lady Lampmoth', 'night', 2, 'mag', 'force:s fire:w', { 2: 'dormina', 3: 'force1', 4: 'heal' }, ['lampmoth', '#2a2230', '#b8a888', '#ffc860']],
  ['lanternbones', '提燈骸', 'Lantern Bones', 'foul', 3, 'mag', 'dark:n fire:w light:w', { 3: 'dark1', 4: 'fire1', 6: 'hex' }, ['lantern', '#3a3046', '#6a2a2a', '#80ffd0']],
  ['hollowmail', '空鎧', 'Hollow Mail', 'brute', 3, 'phys', 'phys:s elec:w', { 3: 'lunge', 4: 'warcry', 6: 'rampage' }, ['hollowmail', '#6a6a78', '#b89040', '#c060ff']],
  ['slime', '史萊姆', 'Slime', 'foul', 1, 'tank', 'phys:s fire:w', { 1: 'attack', 3: 'lunge' }, ["ooze", "#3a5a2a", "#9ac860", "#c8ff40"]],
  ['wisp', '鬼火', 'Will o\' Wisp', 'foul', 7, 'mag', 'phys:n fire:s ice:w light:w', { 7: 'fire1', 8: 'dark1' }, ["wisp", "#80c0ff", "#e0f0ff", "#ffffff", {}]],
  ['ghoul', '食屍鬼', 'Ghoul', 'foul', 15, 'phys', 'dark:n ice:s fire:w light:w', { 15: 'rampage', 16: 'dark1', 18: 'hex' }, ["fig", "#4a3a30", "#7a8470", "#ff2020", {"build": "normal", "head": "ghoul", "skin": "#7a8470", "outfit": {"type": "bare", "col": "#4a3a30"}, "claws": true}]],
  ['mothman', '天蛾人', 'Mothman', 'foul', 23, 'fast', 'force:s elec:w', { 23: 'force2', 24: 'dark1', 26: 'forceAll' }, ["fig", "#3a3040", "#6a5a50", "#ff2020", {"build": "slim", "head": "moth", "outfit": {"type": "suit", "col": "#3a3040", "col2": "#6a5a50"}, "wings": {"type": "moth", "col": "#5a4a4a", "spot": "#a02020"}}]],
  ['kappa', '河童', 'Kappa', 'yoma', 5, 'bal', 'ice:s elec:w', { 5: 'ice1', 6: 'lunge' }, ["fig", "#4a4030", "#c8b080", "#ffe040", {"build": "normal", "skin": "#5a8a5a", "head": "crow", "headCol": "#4a7a4a", "outfit": {"type": "loin", "col": "#4a4030", "col2": "#c8b080"}, "claws": true, "left": "gesture"}]],
  ['karasu', '鴉天狗', 'Karasu Tengu', 'yoma', 12, 'fast', 'force:s elec:w', { 12: 'force1', 13: 'lunge', 15: 'force2' }, ["fig", "#2a2a34", "#c83a2a", "#ffd040", {"build": "normal", "head": "crow", "outfit": {"type": "robe", "col": "#2a2a34", "col2": "#c83a2a"}, "wings": {"type": "feather", "col": "#1e1c24"}, "weapon": {"type": "spear", "col": "#4a3020"}}]],
  ['onmoraki', '陰摩羅鬼', 'Onmoraki', 'yoma', 17, 'mag', 'fire:s dark:n light:w ice:w', { 17: 'fire2', 18: 'dark1', 20: 'fireAll' }, ["bird", "#2a2234", "#ff8a30", "#ffff60", {"fire": true, "headCol": "#e8e0d8"}]],
  ['dakini', '荼吉尼天', 'Dakini', 'yoma', 30, 'phys', 'phys:s fire:s dark:s light:w', { 30: 'mighty', 31: 'fire3', 33: 'warcry' }, ["fig", "#8a1a1a", "#d8b040", "#ffffff", {"build": "slim", "face": "f", "skin": "#c8603a", "hair": {"style": "wild", "col": "#14100c"}, "outfit": {"type": "suit", "col": "#8a1a1a", "col2": "#d8b040"}, "weapon": {"type": "sword"}, "left": "flame", "fangs": true}]],
  ['angel', '天使', 'Angel', 'divine', 11, 'mag', 'light:n dark:w', { 11: 'light1', 12: 'heal', 14: 'force1' }, ["fig", "#e8eef8", "#ffd860", "#80c0ff", {"build": "slim", "head": "mask", "outfit": {"type": "robe", "col": "#e8eef8", "col2": "#ffd860"}, "wings": {"type": "feather", "col": "#f0f0f8"}, "halo": true, "left": "gesture", "dark": false}]],
  ['archangel', '大天使', 'Archangel', 'divine', 16, 'phys', 'light:n dark:w', { 16: 'lunge', 17: 'light1', 19: 'mighty' }, ["fig", "#c8d0e0", "#c84a3a", "#ffffff", {"build": "normal", "head": "helm", "outfit": {"type": "armor", "col": "#c8d0e0", "col2": "#c84a3a"}, "wings": {"type": "feather", "col": "#e0e4f0"}, "weapon": {"type": "sword"}}]],
  ['principality', '權天使', 'Principality', 'divine', 25, 'mag', 'light:n force:s dark:w', { 25: 'lightAll', 26: 'healAll', 28: 'iceAll' }, ["fig", "#f0e8c8", "#8a60d8", "#c0a0ff", {"build": "slim", "head": "mask", "outfit": {"type": "robe", "col": "#f0e8c8", "col2": "#8a60d8"}, "wings": {"type": "feather", "col": "#f4f0e0"}, "halo": true, "crown": "#d8b040", "weapon": {"type": "staff", "col": "#c8a040"}, "dark": false}]],
  ['power', '能天使', 'Power', 'divine', 32, 'phys', 'light:n phys:s dark:w', { 32: 'myriad', 33: 'light3', 35: 'ironwall' }, ["fig", "#7a8098", "#3a4aa0", "#ffffff", {"build": "normal", "head": "helm", "outfit": {"type": "armor", "col": "#7a8098", "col2": "#3a4aa0"}, "wings": {"type": "feather", "col": "#c8ccd8"}, "weapon": {"type": "spear", "col": "#4a4a5a"}, "crest": "#3a4aa0"}]],
  ['itsumade', '以津真天', 'Itsumade', 'avian', 9, 'fast', 'fire:s ice:w', { 9: 'fire1', 10: 'rampage' }, ["bird", "#8a3a2a", "#e0c080", "#ffff40", {"headCol": "#c8b8a0"}]],
  ['thunderbird', '雷鳥', 'Thunderbird', 'avian', 22, 'mag', 'elec:d force:w', { 22: 'elec2', 23: 'elecAll', 25: 'force1' }, ["bird", "#2a3a6a", "#ffe040", "#ffffff", {"bolt": true, "crest": "#ffe040"}]],
  ['phoenix', '不死鳥', 'Phoenix', 'avian', 29, 'mag', 'fire:d ice:w', { 29: 'fireAll', 30: 'revive', 32: 'fire3' }, ["bird", "#d84a1a", "#ffd060", "#ffffff", {"fire": true, "crest": "#ffd060"}]],
  ['naga', '那伽', 'Naga', 'snake', 14, 'bal', 'elec:s fire:w', { 14: 'elec1', 15: 'lunge', 17: 'elec2' }, ["fig", "#3a5a3a", "#d8b040", "#ffff80", {"build": "normal", "face": "m", "skin": "#6a9a7a", "lower": "serpent", "lowerCol": "#3a7a5a", "outfit": {"type": "bare", "col": "#3a5a3a", "col2": "#d8b040"}, "weapon": {"type": "trident", "col": "#5a4030"}}]],
  ['mizuchi', '蛟', 'Mizuchi', 'snake', 21, 'mag', 'ice:d elec:w', { 21: 'ice2', 22: 'iceAll', 24: 'hex' }, ["longDragon", "#3a6ac8", "#c8f0ff", "#ffffff", {"mane": "#e0f8ff", "pearl": true}]],
  ['rajanaga', '那伽王', 'Raja Naga', 'snake', 31, 'phys', 'elec:d fire:w', { 31: 'elec3', 32: 'myriad', 34: 'elecAll2' }, ["serpent", "#2a5a3a", "#ffd040", "#ff4040", {"crown": true}]],
  ['lilim', '莉莉姆', 'Lilim', 'night', 8, 'mag', 'dark:s light:w', { 8: 'elec1', 9: 'dark1', 11: 'ice1' }, ["fig", "#3a1a3a", "#c83a6a", "#ff60c0", {"build": "slim", "face": "f", "hair": {"style": "long", "col": "#2a1a2a"}, "outfit": {"type": "suit", "col": "#3a1a3a", "col2": "#c83a6a"}, "wings": {"type": "bat", "col": "#3a2a3a"}, "horns": {"type": "up", "col": "#2a1a20", "size": 0.7}, "tail": "devil"}]],
  ['incubus', '夢魔', 'Incubus', 'night', 15, 'mag', 'dark:n light:w', { 15: 'dark1', 16: 'force2', 18: 'hex' }, ["fig", "#2a1a3a", "#c8a0ff", "#ff4080", {"build": "slim", "face": "m", "hair": {"style": "short", "col": "#14101c"}, "outfit": {"type": "coat", "col": "#2a1a3a", "col2": "#d8d0e0"}, "wings": {"type": "bat", "col": "#2a1a2a"}, "horns": {"type": "curl", "col": "#c8b8a0"}, "tail": "devil", "left": "hip"}]],
  ['yaksini', '夜叉女', 'Yaksini', 'night', 19, 'phys', 'phys:s ice:s fire:w', { 19: 'rampage', 20: 'ice2', 22: 'warcry' }, ["fig", "#2a3a5a", "#c8a040", "#ff4040", {"build": "slim", "face": "f", "skin": "#6a8aa8", "hair": {"style": "wild", "col": "#14101c"}, "outfit": {"type": "dress", "col": "#2a3a5a", "col2": "#c8a040"}, "fangs": true, "claws": true, "weapon": {"type": "katana"}}]],
  ['succubus', '魅魔', 'Succubus', 'night', 26, 'mag', 'dark:n force:s light:w', { 26: 'darkAll', 27: 'ice2', 29: 'rend' }, ["fig", "#1a0a14", "#c02050", "#ff2080", {"build": "slim", "face": "f", "hair": {"style": "flow", "col": "#8a1a3a"}, "outfit": {"type": "suit", "col": "#1a0a14", "col2": "#c02050"}, "wings": {"type": "bat", "col": "#4a1a2a"}, "horns": {"type": "up", "col": "#1a0a10", "size": 0.8}, "tail": "devil", "weapon": {"type": "whip"}}]],
  ['ippon', '一本踏鞴', 'Ippon-Datara', 'brute', 7, 'phys', 'fire:s ice:w', { 7: 'lunge', 9: 'rampage' }, ["fig", "#5a4a3a", "#c0a080", "#ff6020", {"build": "heavy", "face": "m", "skin": "#8a6a5a", "hair": {"style": "wild", "col": "#2a2018"}, "outfit": {"type": "loin", "col": "#5a4a3a", "col2": "#c0a080"}, "fangs": true, "weapon": {"type": "club", "col": "#4a4048"}}]],
  ['oni', '鬼', 'Oni', 'brute', 16, 'phys', 'phys:s light:w', { 16: 'mighty', 17: 'rampage', 19: 'warcry' }, ["fig", "#d8a030", "#3a2a1a", "#ffff60", {"build": "heavy", "face": "m", "skin": "#b83a2a", "hair": {"style": "wild", "col": "#1a1414"}, "horns": {"type": "oni", "col": "#e8dcc0", "size": 1.4}, "fangs": true, "outfit": {"type": "loin", "col": "#d8a030", "col2": "#3a2a1a"}, "weapon": {"type": "club", "col": "#3a3a42"}}]],
  ['rakshasa', '羅剎', 'Rakshasa', 'brute', 24, 'phys', 'phys:s dark:s light:w', { 24: 'cleave', 25: 'mighty', 27: 'rend' }, ["fig", "#5a3a4a", "#d8b040", "#ff3030", {"build": "heavy", "face": "m", "skin": "#3a5a8a", "hair": {"style": "wild", "col": "#e8e8f0"}, "horns": {"type": "oni", "col": "#e8dcc0", "size": 1.3}, "fangs": true, "claws": true, "outfit": {"type": "armor", "col": "#5a3a4a", "col2": "#d8b040"}, "weapon": {"type": "katana"}, "sigil": false}]],
  ['kinki', '金鬼', 'Kin-ki', 'brute', 31, 'tank', 'phys:r elec:w', { 31: 'myriad', 32: 'ironwall', 34: 'mighty' }, ["fig", "#8a6a20", "#ffe080", "#ff2020", {"build": "heavy", "face": "m", "skin": "#c8a030", "hair": {"style": "wild", "col": "#1a1414"}, "horns": {"type": "oni", "col": "#f0e8d0", "size": 1.4}, "fangs": true, "outfit": {"type": "armor", "col": "#8a6a20", "col2": "#ffe080"}, "weapon": {"type": "club", "col": "#5a4a20"}, "sigil": false}]],
  // ---- the second covenant: more demons
  ['jackfrost', '傑克霜精', 'Jack Frost', 'fairy', 6, 'mag', 'ice:n fire:w', { 6: 'ice1', 7: 'dormina', 9: 'heal' }, ["frostling", "#a8d8f0", "#3a6ab8", "#40a0ff", {"cloth": "#3a5a8a", "fit": [0, -10, 0.78]}]],
  ['pyrojack', '南瓜燈籠', 'Pyro Jack', 'fairy', 12, 'mag', 'fire:n ice:w', { 12: 'fire1', 13: 'poisma', 15: 'fire2' }, ["scarecrow", "#5a3a2a", "#3a2a24", "#ffb030", {}]],
  ['oberon', '妖精王', 'Oberon', 'fairy', 40, 'mag', 'elec:d force:s dark:w', { 40: 'elecAll2', 41: 'magWall', 43: 'healAll2' }, ["fig", "#2a4a3a", "#d8d0b0", "#a0ff80", {"build": "normal", "face": "m", "hair": {"style": "long", "col": "#d8d8e0"}, "outfit": {"type": "coat", "col": "#2a4a3a", "col2": "#d8d0b0"}, "cape": "#4a2a3a", "crown": "#d8b040", "weapon": {"type": "staff", "col": "#5a4030"}}]],
  ['kingfrost', '霜之王', 'King Frost', 'fairy', 46, 'tank', 'ice:r fire:w', { 46: 'iceAll2', 47: 'ironwall', 49: 'heal2' }, ["colossus", "#a8d0e8", "#e8f8ff", "#40c0ff", {"ice": true, "crown": "#e8f4ff"}]],
  ['kitsune', '狐仙', 'Kitsune', 'beast', 10, 'mag', 'fire:s ice:w', { 10: 'fire1', 11: 'dormina', 13: 'drain' }, ["beast", "#d88a3a", "#f8ecd8", "#ff4040", {"kind": "fox", "tails": 2}]],
  ['orthrus', '雙頭犬', 'Orthrus', 'beast', 25, 'phys', 'fire:s ice:w', { 25: 'venom', 26: 'fire2', 28: 'charge' }, ["beast", "#4a2e22", "#c87040", "#ffff40", {"kind": "dog", "heads": 2}]],
  ['kyubi', '九尾狐', 'Kyubi', 'beast', 38, 'mag', 'fire:d light:s ice:w', { 38: 'fireAll2', 39: 'lullaby', 41: 'focus' }, ["beast", "#f4ead0", "#ff8a40", "#ff2060", {"kind": "fox", "tails": 9}]],
  ['gnome', '地精', 'Gnome', 'jirae', 2, 'tank', 'phys:s force:w', { 2: 'lunge', 4: 'heal' }, ["fig", "#6a5040", "#4a5a3a", "#ffb040", {"fit": [0, 0, 0.74], "build": "heavy", "face": "m", "hair": {"style": "wild", "col": "#e0dcd0"}, "outfit": {"type": "coat", "col": "#6a5040", "col2": "#4a5a3a"}, "weapon": {"type": "lantern"}}]],
  ['golem', '魔像', 'Golem', 'jirae', 22, 'tank', 'phys:s force:s elec:w', { 22: 'mighty', 23: 'physWall', 25: 'rampage' }, ["colossus", "#8a8478", "#40d0ff", "#40e0ff", {}]],
  ['titan', '泰坦', 'Titan', 'jirae', 36, 'tank', 'phys:s elec:s force:w', { 36: 'deathbound', 37: 'charge', 39: 'ironwall' }, ["colossus", "#7a5a3a", "#ff8030", "#ffd040", {"horns": "#e0d0b0"}]],
  ['poltergeist', '騷靈', 'Poltergeist', 'foul', 4, 'mag', 'phys:s light:w', { 4: 'force1', 5: 'poisma' }, ["wisp", "#a090d8", "#f0e0ff", "#ffffff", {"ghost": true}]],
  ['mummy', '木乃伊', 'Mummy', 'foul', 11, 'tank', 'dark:n fire:w light:w', { 11: 'venom', 12: 'poisma', 14: 'rampage' }, ["fig", "#c8bc98", "#8a7a5a", "#ff8020", {"build": "normal", "head": "wrap", "outfit": {"type": "wrap", "col": "#c8bc98"}, "left": "gesture"}]],
  ['reaper', '死神', 'Reaper', 'foul', 35, 'mag', 'dark:r light:w', { 35: 'dark3', 36: 'drain', 38: 'darkAll' }, ["fig", "#1c1a26", "#5a5a6a", "#ff3030", {"build": "slim", "head": "skull", "hood": "#14121c", "outfit": {"type": "robe", "col": "#1c1a26", "col2": "#5a5a6a"}, "weapon": {"type": "scythe", "col": "#3a2a20"}, "tatter": true}]],
  ['apsaras', '天女', 'Apsaras', 'yoma', 9, 'mag', 'ice:s elec:w', { 9: 'ice1', 10: 'heal', 12: 'cleanse' }, ["fig", "#80b8e0", "#f0e8ff", "#40a0ff", {"build": "slim", "face": "f", "hair": {"style": "bun", "col": "#1a1418"}, "outfit": {"type": "dress", "col": "#80b8e0", "col2": "#f0e8ff"}, "halo": true, "left": "gesture"}]],
  ['kurama', '鞍馬天狗', 'Kurama Tengu', 'yoma', 36, 'fast', 'force:d elec:w', { 36: 'force3', 37: 'forceAll2', 39: 'charge' }, ["fig", "#f0ece0", "#c83a2a", "#ffd040", {"build": "normal", "face": "m", "skin": "#c84a3a", "hair": {"style": "wild", "col": "#e8e8e0"}, "outfit": {"type": "robe", "col": "#f0ece0", "col2": "#c83a2a"}, "wings": {"type": "feather", "col": "#e8e0d8"}, "weapon": {"type": "fan", "col": "#f0e8e0"}}]],
  ['virtue', '力天使', 'Virtue', 'divine', 20, 'bal', 'light:n elec:s dark:w', { 20: 'elec2', 21: 'cleanse', 23: 'light1' }, ["fig", "#d0d8f0", "#ffd860", "#80c0ff", {"build": "normal", "head": "mask", "outfit": {"type": "robe", "col": "#d0d8f0", "col2": "#ffd860"}, "wings": {"type": "feather", "col": "#e8ecf8"}, "left": "orb", "dark": false}]],
  ['valkyrie', '女武神', 'Valkyrie', 'divine', 28, 'phys', 'phys:s ice:s fire:w', { 28: 'mighty', 29: 'charge', 31: 'ice2' }, ["fig", "#8a9ab8", "#ffd040", "#ffffff", {"build": "normal", "face": "f", "hair": {"style": "long", "col": "#e8d080"}, "outfit": {"type": "armor", "col": "#8a9ab8", "col2": "#ffd040"}, "wings": {"type": "feather", "col": "#e8e8f0"}, "weapon": {"type": "spear", "col": "#5a4030"}, "cape": "#5a2a2a", "sigil": false}]],
  ['dominion', '主天使', 'Dominion', 'divine', 40, 'mag', 'light:r dark:w', { 40: 'light3', 41: 'magWall', 43: 'healAll2' }, ["fig", "#ffffff", "#ffd040", "#ff4040", {"build": "normal", "head": "mask", "outfit": {"type": "robe", "col": "#f4f2ee", "col2": "#ffd040"}, "wings": {"type": "six", "col": "#f8f6f0"}, "halo": true, "left": "orb", "dark": false}]],
  ['metatron', '梅塔特隆', 'Metatron', 'divine', 54, 'mag', 'light:r phys:s dark:s', { 54: 'light3', 55: 'lightAll', 57: 'magWall' }, ["fig", "#f0e8c0", "#ffffff", "#ffe060", {"build": "heavy", "head": "mask", "maskCol": "#e8c860", "outfit": {"type": "armor", "col": "#f0e8c0", "col2": "#ffffff"}, "wings": {"type": "six", "col": "#fff8e0"}, "halo": true, "weapon": {"type": "sword"}}]],
  ['harpy', '鷹身女妖', 'Harpy', 'avian', 3, 'fast', 'force:s elec:w', { 3: 'force1', 4: 'rampage' }, ["bird", "#7a5a3a", "#e8c8a0", "#ff4040", {"human": true, "hairCol": "#3a2a2a"}]],
  ['yatagarasu', '八咫烏', 'Yatagarasu', 'avian', 37, 'mag', 'light:d fire:s dark:w', { 37: 'lightAll', 38: 'fire3', 40: 'cleanse' }, ["bird", "#14121c", "#ffd040", "#ff3020", {"legs": 3, "sun": true}]],
  ['lamia', '拉彌亞', 'Lamia', 'snake', 18, 'phys', 'fire:s ice:w', { 18: 'venom', 19: 'dormina', 21: 'rampage' }, ["fig", "#2a3a2a", "#d8b040", "#ffd040", {"build": "slim", "face": "f", "lower": "serpent", "lowerCol": "#4a7a3a", "hair": {"style": "long", "col": "#1a2018"}, "outfit": {"type": "suit", "col": "#2a3a2a", "col2": "#d8b040"}, "claws": true, "fangs": true}]],
  ['seiryu', '青龍', 'Seiryu', 'snake', 27, 'mag', 'ice:d fire:w', { 27: 'iceAll', 28: 'heal2', 30: 'focus' }, ["longDragon", "#2a6ab8", "#a8e0f8", "#ffff80", {"mane": "#e0f4ff"}]],
  ['quetzal', '羽蛇神', 'Quetzalcoatl', 'snake', 39, 'mag', 'force:d light:s elec:w', { 39: 'forceAll2', 40: 'healAll2', 42: 'focus' }, ["longDragon", "#3aa070", "#ffd040", "#ff6040", {"feathers": "#e84a3a", "mane": "#ffd040"}]],
  ['fafnir', '法夫納', 'Fafnir', 'snake', 48, 'phys', 'fire:d ice:w', { 48: 'fireAll2', 49: 'deathbound', 51: 'physWall' }, ["wyrm", "#5a2a18", "#d8a040", "#ff2020", {"fire": true}]],
  ['siren', '塞壬', 'Siren', 'night', 13, 'mag', 'ice:s elec:w', { 13: 'lullaby', 14: 'ice1', 16: 'mpDrain' }, ["fig", "#3a90a8", "#e0f0f8", "#80ffff", {"build": "slim", "face": "f", "lower": "fish", "lowerCol": "#3a90a8", "hair": {"style": "flow", "col": "#c8d8e0"}, "outfit": {"type": "suit", "col": "#3a90a8", "col2": "#e0f0f8"}, "left": "gesture"}]],
  ['vampire', '吸血鬼', 'Vampire', 'night', 33, 'phys', 'dark:n light:w fire:w', { 33: 'drain', 34: 'dormina', 36: 'mighty' }, ["fig", "#140a10", "#e8e0d8", "#ff2040", {"build": "normal", "face": "m", "hair": {"style": "short", "col": "#1a1418"}, "outfit": {"type": "coat", "col": "#140a10", "col2": "#e8e0d8"}, "cape": "#6a0a1a", "collar": "#2a0a14", "fangs": true, "left": "hip"}]],
  ['lilith', '莉莉絲', 'Lilith', 'night', 44, 'mag', 'dark:d ice:s light:w', { 44: 'darkAll', 45: 'lullaby', 47: 'mpDrain' }, ["fig", "#2a0a1e", "#ff80c0", "#ff2080", {"build": "slim", "face": "f", "hair": {"style": "flow", "col": "#1a0a14"}, "outfit": {"type": "dress", "col": "#2a0a1e", "col2": "#ff80c0"}, "wings": {"type": "bat", "col": "#2a0a1e"}, "horns": {"type": "curl", "col": "#1a0a10"}, "left": "orb"}]],
  ['momunofu', '武者', 'Momunofu', 'brute', 12, 'phys', 'phys:s elec:w', { 12: 'lunge', 13: 'charge', 15: 'cleave' }, ["fig", "#5a3a2a", "#c84a2a", "#ffffff", {"build": "normal", "head": "helm", "outfit": {"type": "armor", "col": "#5a3a2a", "col2": "#c84a2a"}, "crest": "#d8b040", "horns": {"type": "up", "col": "#d8b040", "size": 0.8}, "weapon": {"type": "katana"}, "sigil": false}]],
  ['minotaur', '米諾陶', 'Minotaur', 'brute', 22, 'phys', 'phys:s ice:w', { 22: 'mighty', 23: 'rampage', 25: 'warcry' }, ["oxhead", "#5a3a1a", "#7a4a2a", "#ff3020"]],
  ['shuten', '酒吞童子', 'Shuten-doji', 'brute', 39, 'phys', 'phys:s fire:s light:w', { 39: 'deathbound', 40: 'charge', 42: 'godhand' }, ["fig", "#6a2a3a", "#ffe0a0", "#ff4040", {"build": "heavy", "face": "m", "skin": "#c86a5a", "hair": {"style": "wild", "col": "#c83a2a"}, "horns": {"type": "oni", "col": "#f0e8d0", "size": 1.5}, "fangs": true, "outfit": {"type": "robe", "col": "#6a2a3a", "col2": "#ffe0a0"}, "weapon": {"type": "club", "col": "#3a3a42"}}]],
  ['surt', '蘇爾特', 'Surt', 'brute', 52, 'phys', 'fire:r ice:w', { 52: 'fireAll2', 53: 'ruin', 55: 'godhand' }, ["colossus", "#2a1a1a", "#ff5020", "#ffd040", {"fire": true, "crown": "#ffb020"}]],
];
// stat builds: how a demon's points spread over strength, magic, vitality, agility and luck
const BUILD = { phys: [1.4, 0.6, 1.0, 1.0, 0.8], mag: [0.6, 1.5, 0.8, 1.0, 1.0], tank: [1.0, 0.8, 1.5, 0.7, 0.9], fast: [1.0, 0.9, 0.7, 1.5, 1.0], bal: [1.0, 1.0, 1.0, 1.0, 1.0] };
export function statsAt(build, lv) {
  const w = BUILD[build] || BUILD.bal, base = 2 + lv * 0.95;
  const [st, ma, vi, ag, lu] = w.map((x) => Math.max(2, Math.round(base * x)));
  return { st, ma, vi, ag, lu, hp: Math.round(8 + lv * 4.6 + vi * 2), mp: Math.round(6 + lv * 1.6 + ma * 1.4) };
}
export const DEMONS = {};
for (const [id, zh, en, race, lv, build, aff, skills, art] of D) DEMONS[id] = { id, name: [zh, en], race, lv, build, aff: parseAff(aff), skills, art };
export const DEMON_ORDER = D.map((d) => d[0]);

// bosses: not recruitable; hp multiplier and extra press turns
const B = (id, zh, en, race, lv, build, aff, skills, art, hpX, turns) => { DEMONS[id] = { id, name: [zh, en], race, lv, build, aff: parseAff(aff), skills, art, boss: true, hpX, turns }; };
B('gozuki', '牛頭鬼', 'Gozuki', 'brute', 9, 'phys', 'phys:s fire:s ice:w', { 1: 'lunge', 2: 'rampage', 3: 'warcry' }, ["oxhead", "#5a3a2a", "#8a4a3a", "#ff6020"], 2.4, 2);
B('nue', '鵺', 'Nue', 'beast', 16, 'mag', 'elec:d dark:s force:w', { 1: 'elec2', 2: 'elecAll', 3: 'dark1', 4: 'rampage', 5: 'dormina' }, ["beast", "#4a3a5a", "#e8c070", "#80ffff", {"kind": "lion", "mane": "#2a2030"}], 3.9, 2);
B('garuda', '迦樓羅', 'Garuda', 'avian', 24, 'bal', 'force:d elec:w fire:s', { 1: 'force2', 2: 'forceAll', 3: 'mighty', 4: 'warcry' }, ["fig", "#3a8a5a", "#d89030", "#ffffff", {"build": "heavy", "head": "crow", "headCol": "#c88a30", "outfit": {"type": "armor", "col": "#3a8a5a", "col2": "#d89030"}, "wings": {"type": "feather", "col": "#d89030"}, "weapon": {"type": "spear", "col": "#5a3a20"}, "sigil": false}], 4.3, 2);
B('orochi', '八岐大蛇', 'Yamata no Orochi', 'snake', 31, 'phys', 'ice:d fire:w dark:s', { 1: 'iceAll', 2: 'myriad', 3: 'ice3', 4: 'rend', 5: 'poisma' }, ["hydra", "#3a5a3a", "#c8b060", "#ff2020", {"heads": 8}], 6.3, 2);
B('ren', '蓮・天之劍', 'Ren, Sword of Heaven', 'divine', 37, 'phys', 'light:n phys:s dark:w', { 1: 'light3', 2: 'myriad', 3: 'healAll2', 4: 'warcry', 5: 'charge' }, ["fig", "#f0f0ff", "#ffd040", "#80c0ff", {"build": "normal", "face": "m", "hair": {"style": "short", "col": "#d8dce8"}, "outfit": {"type": "armor", "col": "#e8eaf4", "col2": "#ffd040"}, "wings": {"type": "feather", "col": "#f4f4fc"}, "halo": true, "weapon": {"type": "sword"}}], 6.2, 2);
B('yui', '結衣・夜之后', 'Yui, Queen of Night', 'night', 37, 'mag', 'dark:n force:s light:w', { 1: 'dark3', 2: 'darkAll', 3: 'iceAll2', 4: 'hex', 5: 'lullaby' }, ["fig", "#2a0a3a", "#ff4090", "#c040ff", {"build": "slim", "face": "f", "hair": {"style": "long", "col": "#1a0a2a"}, "outfit": {"type": "dress", "col": "#2a0a3a", "col2": "#ff4090"}, "wings": {"type": "feather", "col": "#3a2a4a"}, "crown": "#c040ff", "left": "orb"}], 6.2, 2);
B('tiamat', '提亞瑪特', 'Tiamat', 'snake', 43, 'bal', 'ice:s fire:s elec:s force:s', { 1: 'ruin', 2: 'fireAll2', 3: 'iceAll2', 4: 'elecAll2', 5: 'ruin2', 6: 'rend', 7: 'dispel' }, ["hydra", "#1a3a4a", "#5aa0b8", "#ff80ff", {"heads": 7, "horns": "#e0d4b4", "sea": true}], 5.6, 3);

// ---------------------------------------------------------------- the hero
export const HERO = { build: 'bal', skills: { 1: 'lunge', 3: 'heal', 6: 'charge', 12: 'cleave', 16: 'cleanse', 20: 'mighty', 28: 'myriad', 34: 'heal2', 42: 'deathbound', 50: 'godhand', 58: 'ruin2' }, aff: {} };

// ---------------------------------------------------------------- items
export const ITEMS = {
  salve:   { name: ['傷藥', 'Salve'], use: 'heal', amt: 60, price: 60, target: 'ally' },
  salve2:  { name: ['大傷藥', 'Great Salve'], use: 'heal', amt: 200, price: 220, target: 'ally' },
  jade:    { name: ['寶玉', 'Jade'], use: 'heal', amt: 9999, price: 600, target: 'ally' },
  water:   { name: ['靈水', 'Spirit Water'], use: 'mp', amt: 30, price: 250, target: 'ally' },
  incense: { name: ['返魂香', 'Revival Incense'], use: 'revive', amt: 50, price: 500, target: 'dead' },
  smoke:   { name: ['煙玉', 'Smoke Ball'], use: 'escape', price: 80, target: 'self' },
  antidote:{ name: ['解毒草', 'Antidote'], use: 'cure', ail: 'poison', price: 40, target: 'ally' },
  bell:    { name: ['醒神鈴', 'Waking Bell'], use: 'cure', ail: 'sleep', price: 60, target: 'ally' },
  panacea: { name: ['萬靈丹', 'Panacea'], use: 'cure', ail: 'all', price: 160, target: 'ally' },
  gem:     { name: ['魔晶石', 'Demon Crystal'], use: null, price: 300 },
};
export const SHOP = ['salve', 'salve2', 'water', 'incense', 'smoke', 'antidote', 'bell', 'panacea', 'jade'];

// ---------------------------------------------------------------- equipment
// slot: weapon / armor (the hero only) or acc (anyone, demons too). atk adds to physical damage, mag to magic damage,
// def takes away from damage taken; st..lu add to stats, hp / mp add a percentage; aff adds resistances (never makes a
// weakness worse); guard keeps an ailment away ('all' for both). tier: the first area whose shops sell it; drop: never sold.
const E = (zh, en, slot, price, tier, extra) => ({ name: [zh, en], slot, price, tier, ...extra });
export const EQUIPS = {
  knife:    E('小刀', 'Pocket Knife', 'weapon', 50, 0, { atk: 4 }),
  pipe:     E('鐵管', 'Iron Pipe', 'weapon', 380, 0, { atk: 10 }),
  katana:   E('太刀', 'Tachi', 'weapon', 1400, 1, { atk: 18 }),
  staff:    E('錫杖', 'Monk\'s Staff', 'weapon', 1600, 1, { atk: 8, mag: 14, ma: 3 }),
  spear:    E('十文字槍', 'Cross Spear', 'weapon', 3600, 2, { atk: 26, ag: 2 }),
  wand:     E('靈木杖', 'Spirit Wand', 'weapon', 4200, 3, { atk: 12, mag: 26, ma: 5 }),
  kusanagi: E('草薙劍', 'Kusanagi', 'weapon', 0, 9, { atk: 36, st: 4, drop: true }),
  masamune: E('正宗', 'Masamune', 'weapon', 0, 9, { atk: 48, st: 6, lu: 5, drop: true }),
  jacket:   E('學生服', 'School Uniform', 'armor', 50, 0, { def: 2 }),
  vest:     E('防彈背心', 'Kevlar Vest', 'armor', 450, 0, { def: 5 }),
  haori:    E('陣羽織', 'Battle Haori', 'armor', 1700, 1, { def: 8, vi: 2 }),
  suit:     E('魔裝甲', 'Demonica Suit', 'armor', 4400, 2, { def: 12, vi: 3, hp: 10 }),
  robe:     E('天衣', 'Celestial Robe', 'armor', 7800, 3, { def: 15, ma: 4, mp: 15 }),
  yoroi:    E('神鎧', 'Divine Armour', 'armor', 0, 9, { def: 22, vi: 6, hp: 15, drop: true }),
  clover:   E('四葉草', 'Four-leaf Clover', 'acc', 600, 0, { lu: 6 }),
  bandage:  E('護身繃帶', 'Charm Bandage', 'acc', 500, 0, { hp: 10 }),
  amulet:   E('護身符', 'Amulet', 'acc', 1200, 1, { guard: 'all' }),
  ratskin:  E('火鼠皮衣', 'Fire-Rat Pelt', 'acc', 1100, 1, { aff: 'fire:s' }),
  hairpin:  E('雪女之簪', 'Yuki-onna\'s Pin', 'acc', 1100, 1, { aff: 'ice:s' }),
  raiju:    E('雷獸之角', 'Raiju Horn', 'acc', 1100, 1, { aff: 'elec:s' }),
  windbag:  E('風神袋', 'Wind God\'s Bag', 'acc', 1100, 1, { aff: 'force:s' }),
  ring:     E('力之戒', 'Ring of Might', 'acc', 1500, 1, { st: 4 }),
  sage:     E('賢者之戒', 'Sage\'s Ring', 'acc', 1500, 1, { ma: 4 }),
  mirror:   E('八咫鏡片', 'Mirror Shard', 'acc', 1900, 2, { aff: 'light:s' }),
  jet:      E('黑曜石', 'Obsidian', 'acc', 1900, 2, { aff: 'dark:s' }),
  feather:  E('天狗羽扇', 'Tengu Fan', 'acc', 2400, 2, { ag: 6 }),
  bead:     E('命之珠', 'Life Bead', 'acc', 2600, 2, { hp: 20 }),
  magatama: E('勾玉', 'Magatama', 'acc', 3800, 3, { mp: 25, hp: 10 }),
  stone:    E('殺生石', 'Killing Stone', 'acc', 0, 9, { st: 5, ma: 5, aff: 'phys:s', drop: true }),
};
for (const e of Object.values(EQUIPS)) e.affs = parseAff(e.aff);
export const SLOTS = ['weapon', 'armor', 'acc'];
// what each boss leaves behind
// difficulty: how hard the foes hit (foe), how hard you hit them (you), and how much they teach (exp)
export const DIFFS = {
  easy:   { name: ['簡單', 'Easy'], foe: 0.72, you: 1.2, exp: 1.25 },
  normal: { name: ['普通', 'Normal'], foe: 1, you: 1, exp: 1 },
  hard:   { name: ['困難', 'Hard'], foe: 1.25, you: 0.85, exp: 1 },
};
export const BOSS_DROP = { gozuki: 'katana', nue: 'raiju', garuda: 'feather', orochi: 'kusanagi', ren: 'masamune', yui: 'yoroi' };

// ---------------------------------------------------------------- areas and floors
// size: the maze size (odd); enc: the demons met there (level range around their own level); look: see js/world3d.js
export const AREAS = [
  { id: 'shinjuku', name: ['新宿地下街', 'Shinjuku Underground'], floors: 2, size: 15, look: 'subway', enc: ['ooze', 'mimic', 'lampmoth', 'lanternbones', 'hollowmail', 'slime', 'pixie', 'gnome', 'harpy', 'kodama', 'shiisa', 'poltergeist', 'huapo', 'kappa', 'jackfrost', 'caitsith', 'wisp', 'ippon', 'sudama', 'lilim'], boss: 'gozuki', music: 0 },
  { id: 'ikebukuro', name: ['池袋廢墟商場', 'Ikebukuro Ruined Mall'], floors: 2, size: 17, look: 'mall', enc: ['itsumade', 'apsaras', 'kelpie', 'kitsune', 'mummy', 'angel', 'karasu', 'pyrojack', 'momunofu', 'siren', 'nekomata', 'naga', 'incubus', 'ghoul', 'archangel', 'oni', 'lilim', 'sudama'], boss: 'nue', music: 1 },
  { id: 'tower', name: ['東京鐵塔', 'Tokyo Tower'], floors: 2, size: 17, look: 'tower', enc: ['onmoraki', 'hitokoto', 'lamia', 'inugami', 'yaksini', 'virtue', 'leanan', 'mizuchi', 'golem', 'minotaur', 'thunderbird', 'archangel', 'oni', 'mothman', 'incubus'], boss: 'garuda', music: 2 },
  { id: 'kudan', name: ['九段靈廟', 'Kudan Spirit Shrine'], floors: 2, size: 19, look: 'shrine', enc: ['mothman', 'rakshasa', 'principality', 'orthrus', 'succubus', 'seiryu', 'tsuchigumo', 'valkyrie', 'phoenix', 'dakini', 'mizuchi', 'thunderbird'], boss: 'orochi', music: 3 },
  { id: 'abyss', name: ['東京深淵', 'The Abyss of Tokyo'], floors: 3, size: 19, look: 'abyss', enc: ['dakini', 'power', 'rajanaga', 'kinki', 'vampire', 'titania', 'cerberus', 'reaper', 'titan', 'kurama', 'yatagarasu', 'kyubi', 'quetzal', 'shuten', 'oberon', 'dominion', 'succubus', 'phoenix', 'principality'], boss: 'tiamat', music: 4 },
];
// every floor in order: { area, floor (1-based), last (the area's last floor), boss (a boss waits at the far end) }
export const FLOORS = AREAS.flatMap((a, ai) => Array.from({ length: a.floors }, (_, i) => ({ area: ai, floor: i + 1, last: i === a.floors - 1, boss: i === a.floors - 1 || (a.id === 'abyss' && i === 1) })));
