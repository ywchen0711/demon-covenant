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
};

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
  ['pixie', '小妖精', 'Pixie', 'fairy', 2, 'mag', 'elec:s force:w dark:w', { 1: 'heal', 2: 'elec1', 5: 'force1' }, ['fairy', '#7fd0ff', '#f0f8ff', '#ffffff']],
  ['kelpie', '水馬', 'Kelpie', 'fairy', 10, 'bal', 'ice:d fire:w elec:w', { 10: 'ice1', 11: 'heal', 13: 'lunge' }, ['horse', '#3a7a9a', '#bfe8f0', '#e8ffff']],
  ['leanan', '靈感妖精', 'Leanan Sidhe', 'fairy', 20, 'mag', 'force:s dark:s fire:w', { 20: 'force2', 21: 'heal2', 23: 'hex' }, ['lady', '#3a8a5a', '#f0d8a0', '#c8ffd0']],
  ['titania', '妖精女王', 'Titania', 'fairy', 33, 'mag', 'elec:s force:s ice:s dark:w', { 33: 'elecAll', 34: 'healAll2', 36: 'elec3' }, ['lady', '#c87ad8', '#fff0f8', '#ffffff', ['fairywings', 'crown']]],
  ['caitsith', '貓妖精', 'Cait Sith', 'beast', 6, 'fast', 'dark:s light:w', { 6: 'rampage', 7: 'dark1', 9: 'warcry' }, ['cat', '#2a2a32', '#f0f0f0', '#ffe040']],
  ['shiisa', '風獅爺', 'Shiisa', 'beast', 4, 'phys', 'fire:s force:w', { 4: 'lunge', 6: 'fire1' }, ['dog', '#d8a040', '#c83a2a', '#ffffff']],
  ['nekomata', '貓又', 'Nekomata', 'beast', 13, 'fast', 'elec:s force:w', { 13: 'lunge', 14: 'elec1', 16: 'rampage' }, ['cat', '#d8a060', '#fff0d8', '#80ff60']],
  ['inugami', '犬神', 'Inugami', 'beast', 19, 'phys', 'dark:n light:w', { 19: 'mighty', 20: 'dark1', 22: 'rend' }, ['dog', '#e8e0d0', '#c02020', '#ff3030']],
  ['cerberus', '地獄三頭犬', 'Cerberus', 'beast', 34, 'phys', 'fire:d ice:w', { 34: 'fire3', 35: 'myriad', 37: 'warcry' }, ['dog', '#3a2a28', '#ff6a20', '#ffd040', ['heads3']]],
  ['kodama', '木靈', 'Kodama', 'jirae', 3, 'tank', 'force:s fire:w', { 3: 'force1', 4: 'heal' }, ['spirit', '#c8e8a0', '#5a8a3a', '#2a3a1a']],
  ['huapo', '花魄', 'Hua Po', 'jirae', 5, 'mag', 'fire:s ice:w', { 5: 'fire1', 7: 'heal' }, ['spirit', '#ffb0c8', '#ff6a8a', '#ffffff']],
  ['sudama', '魑魅', 'Sudama', 'jirae', 8, 'bal', 'force:s elec:w', { 8: 'force1', 9: 'lunge', 11: 'hex' }, ['imp', '#8a9a5a', '#d8e0a0', '#ffff80']],
  ['hitokoto', '一言主', 'Hitokotonushi', 'jirae', 18, 'tank', 'phys:s force:n fire:w', { 18: 'force2', 19: 'ironwall', 21: 'healAll' }, ['giant', '#7a6a4a', '#d8c890', '#ffffff']],
  ['tsuchigumo', '土蜘蛛', 'Tsuchigumo', 'jirae', 27, 'phys', 'phys:s elec:s fire:w', { 27: 'myriad', 28: 'elec2', 30: 'rend' }, ['spider', '#4a3a2a', '#c09050', '#ff4020']],
  ['slime', '史萊姆', 'Slime', 'foul', 1, 'tank', 'phys:s fire:w', { 1: 'attack', 3: 'lunge' }, ['blob', '#5ab84a', '#c0f0a0', '#1a2a10']],
  ['wisp', '鬼火', 'Will o\' Wisp', 'foul', 7, 'mag', 'phys:n fire:s ice:w light:w', { 7: 'fire1', 8: 'dark1' }, ['wisp', '#80c0ff', '#e0f0ff', '#ffffff']],
  ['ghoul', '食屍鬼', 'Ghoul', 'foul', 15, 'phys', 'dark:n ice:s fire:w light:w', { 15: 'rampage', 16: 'dark1', 18: 'hex' }, ['zombie', '#6a7a5a', '#a0a080', '#ff2020']],
  ['mothman', '天蛾人', 'Mothman', 'foul', 23, 'fast', 'force:s elec:w', { 23: 'force2', 24: 'dark1', 26: 'forceAll' }, ['moth', '#5a4a6a', '#c8a0d0', '#ff2020']],
  ['kappa', '河童', 'Kappa', 'yoma', 5, 'bal', 'ice:s elec:w', { 5: 'ice1', 6: 'lunge' }, ['imp', '#4aa05a', '#d8c070', '#ffffff']],
  ['karasu', '鴉天狗', 'Karasu Tengu', 'yoma', 12, 'fast', 'force:s elec:w', { 12: 'force1', 13: 'lunge', 15: 'force2' }, ['bird', '#2a2a3a', '#d84a3a', '#ffd040']],
  ['onmoraki', '陰摩羅鬼', 'Onmoraki', 'yoma', 17, 'mag', 'fire:s dark:n light:w ice:w', { 17: 'fire2', 18: 'dark1', 20: 'fireAll' }, ['bird', '#3a2a4a', '#ff8a30', '#ffff60']],
  ['dakini', '荼吉尼天', 'Dakini', 'yoma', 30, 'phys', 'phys:s fire:s dark:s light:w', { 30: 'mighty', 31: 'fire3', 33: 'warcry' }, ['lady', '#a02a2a', '#ffc860', '#ffffff', ['arms4']]],
  ['angel', '天使', 'Angel', 'divine', 11, 'mag', 'light:n dark:w', { 11: 'light1', 12: 'heal', 14: 'force1' }, ['angel', '#e8f0ff', '#ffd860', '#80c0ff']],
  ['archangel', '大天使', 'Archangel', 'divine', 16, 'phys', 'light:n dark:w', { 16: 'lunge', 17: 'light1', 19: 'mighty' }, ['angel', '#c8d8f0', '#d84a3a', '#ffffff']],
  ['principality', '權天使', 'Principality', 'divine', 25, 'mag', 'light:n force:s dark:w', { 25: 'lightAll', 26: 'healAll', 28: 'iceAll' }, ['angel', '#f0e8c8', '#8a60d8', '#ffe080']],
  ['power', '能天使', 'Power', 'divine', 32, 'phys', 'light:n phys:s dark:w', { 32: 'myriad', 33: 'light3', 35: 'ironwall' }, ['angel', '#a0a8c0', '#3a4aa0', '#ffffff']],
  ['itsumade', '以津真天', 'Itsumade', 'avian', 9, 'fast', 'fire:s ice:w', { 9: 'fire1', 10: 'rampage' }, ['bird', '#8a3a2a', '#e0c080', '#ffff40']],
  ['thunderbird', '雷鳥', 'Thunderbird', 'avian', 22, 'mag', 'elec:d force:w', { 22: 'elec2', 23: 'elecAll', 25: 'force1' }, ['bird', '#3a4a8a', '#ffe040', '#ffffff']],
  ['phoenix', '不死鳥', 'Phoenix', 'avian', 29, 'mag', 'fire:d ice:w', { 29: 'fireAll', 30: 'revive', 32: 'fire3' }, ['bird', '#ff6a20', '#ffe060', '#ffffff']],
  ['naga', '那伽', 'Naga', 'snake', 14, 'bal', 'elec:s fire:w', { 14: 'elec1', 15: 'lunge', 17: 'elec2' }, ['serpent', '#3a8a6a', '#e8d070', '#ffff80']],
  ['mizuchi', '蛟', 'Mizuchi', 'snake', 21, 'mag', 'ice:d elec:w', { 21: 'ice2', 22: 'iceAll', 24: 'hex' }, ['serpent', '#4a7ad8', '#c8f0ff', '#ffffff']],
  ['rajanaga', '那伽王', 'Raja Naga', 'snake', 31, 'phys', 'elec:d fire:w', { 31: 'elec3', 32: 'myriad', 34: 'elecAll2' }, ['serpent', '#2a6a4a', '#ffd040', '#ff4040']],
  ['lilim', '莉莉姆', 'Lilim', 'night', 8, 'mag', 'dark:s light:w', { 8: 'elec1', 9: 'dark1', 11: 'ice1' }, ['lady', '#5a2a6a', '#f0c0d0', '#ff60c0', ['batwings']]],
  ['incubus', '夢魔', 'Incubus', 'night', 15, 'mag', 'dark:n light:w', { 15: 'dark1', 16: 'force2', 18: 'hex' }, ['imp', '#3a2a5a', '#d0a0ff', '#ff4080']],
  ['yaksini', '夜叉女', 'Yaksini', 'night', 19, 'phys', 'phys:s ice:s fire:w', { 19: 'rampage', 20: 'ice2', 22: 'warcry' }, ['lady', '#3a6a8a', '#e8c0a0', '#ff4040']],
  ['succubus', '魅魔', 'Succubus', 'night', 26, 'mag', 'dark:n force:s light:w', { 26: 'darkAll', 27: 'ice2', 29: 'rend' }, ['lady', '#8a1a4a', '#ffd0e0', '#ff2080', ['batwings', 'horns']]],
  ['ippon', '一本踏鞴', 'Ippon-Datara', 'brute', 7, 'phys', 'fire:s ice:w', { 7: 'lunge', 9: 'rampage' }, ['giant', '#5a4a3a', '#c0a080', '#ff6020']],
  ['oni', '鬼', 'Oni', 'brute', 16, 'phys', 'phys:s light:w', { 16: 'mighty', 17: 'rampage', 19: 'warcry' }, ['ogre', '#c83a2a', '#e8c890', '#ffff60']],
  ['rakshasa', '羅剎', 'Rakshasa', 'brute', 24, 'phys', 'phys:s dark:s light:w', { 24: 'cleave', 25: 'mighty', 27: 'rend' }, ['ogre', '#3a5a8a', '#d0d0e0', '#ff3030']],
  ['kinki', '金鬼', 'Kin-ki', 'brute', 31, 'tank', 'phys:r elec:w', { 31: 'myriad', 32: 'ironwall', 34: 'mighty' }, ['ogre', '#c8a030', '#fff0a0', '#ff2020']],
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
B('gozuki', '牛頭鬼', 'Gozuki', 'brute', 9, 'phys', 'phys:s fire:s ice:w', { 1: 'lunge', 2: 'rampage', 3: 'warcry' }, ['ogre', '#6a3a2a', '#e0d0b0', '#ff3020', ['horns']], 2.9, 2);
B('nue', '鵺', 'Nue', 'beast', 16, 'mag', 'elec:d dark:s force:w', { 1: 'elec2', 2: 'elecAll', 3: 'dark1', 4: 'rampage' }, ['chimera', '#4a3a5a', '#e8c070', '#80ffff'], 3.9, 2);
B('garuda', '迦樓羅', 'Garuda', 'avian', 24, 'bal', 'force:d elec:w fire:s', { 1: 'force2', 2: 'forceAll', 3: 'mighty', 4: 'warcry' }, ['bird', '#d89030', '#3a8a5a', '#ffffff'], 3.6, 2);
B('orochi', '八岐大蛇', 'Yamata no Orochi', 'snake', 31, 'phys', 'ice:d fire:w dark:s', { 1: 'iceAll', 2: 'myriad', 3: 'ice3', 4: 'rend' }, ['hydra', '#3a5a3a', '#c8b060', '#ff2020'], 5.5, 2);
B('ren', '蓮・天之劍', 'Ren, Sword of Heaven', 'divine', 37, 'phys', 'light:n phys:s dark:w', { 1: 'light3', 2: 'myriad', 3: 'healAll2', 4: 'warcry' }, ['angel', '#f0f0ff', '#ffd040', '#40a0ff', ['wings2']], 5.5, 2);
B('yui', '結衣・夜之后', 'Yui, Queen of Night', 'night', 37, 'mag', 'dark:n force:s light:w', { 1: 'dark3', 2: 'darkAll', 3: 'iceAll2', 4: 'hex' }, ['lady', '#2a0a3a', '#ff4090', '#ff80ff', ['batwings', 'crown']], 5.5, 2);
B('tiamat', '提亞瑪特', 'Tiamat', 'snake', 43, 'bal', 'ice:s fire:s elec:s force:s', { 1: 'ruin', 2: 'fireAll2', 3: 'iceAll2', 4: 'elecAll2', 5: 'ruin2', 6: 'rend' }, ['hydra', '#2a1a4a', '#c040ff', '#ffffff', ['crown']], 4.8, 3);

// ---------------------------------------------------------------- the hero
export const HERO = { build: 'bal', skills: { 1: 'lunge', 3: 'heal', 12: 'cleave', 20: 'mighty', 28: 'myriad' }, aff: {} };

// ---------------------------------------------------------------- items
export const ITEMS = {
  salve:   { name: ['傷藥', 'Salve'], use: 'heal', amt: 60, price: 60, target: 'ally' },
  salve2:  { name: ['大傷藥', 'Great Salve'], use: 'heal', amt: 200, price: 220, target: 'ally' },
  jade:    { name: ['寶玉', 'Jade'], use: 'heal', amt: 9999, price: 600, target: 'ally' },
  water:   { name: ['靈水', 'Spirit Water'], use: 'mp', amt: 30, price: 250, target: 'ally' },
  incense: { name: ['返魂香', 'Revival Incense'], use: 'revive', amt: 50, price: 500, target: 'dead' },
  smoke:   { name: ['煙玉', 'Smoke Ball'], use: 'escape', price: 80, target: 'self' },
  gem:     { name: ['魔晶石', 'Demon Crystal'], use: null, price: 300 },
};
export const SHOP = ['salve', 'salve2', 'water', 'incense', 'smoke', 'jade'];

// ---------------------------------------------------------------- areas and floors
// size: the maze size (odd); enc: the demons met there (level range around their own level); look: see js/world3d.js
export const AREAS = [
  { id: 'shinjuku', name: ['新宿地下街', 'Shinjuku Underground'], floors: 2, size: 15, look: 'subway', enc: ['slime', 'pixie', 'kodama', 'shiisa', 'huapo', 'kappa', 'caitsith', 'wisp', 'ippon', 'sudama', 'lilim'], boss: 'gozuki', music: 0 },
  { id: 'ikebukuro', name: ['池袋廢墟商場', 'Ikebukuro Ruined Mall'], floors: 2, size: 17, look: 'mall', enc: ['itsumade', 'kelpie', 'angel', 'karasu', 'nekomata', 'naga', 'incubus', 'ghoul', 'archangel', 'oni', 'lilim', 'sudama'], boss: 'nue', music: 1 },
  { id: 'tower', name: ['東京鐵塔', 'Tokyo Tower'], floors: 2, size: 17, look: 'tower', enc: ['onmoraki', 'hitokoto', 'inugami', 'yaksini', 'leanan', 'mizuchi', 'thunderbird', 'archangel', 'oni', 'mothman', 'incubus'], boss: 'garuda', music: 2 },
  { id: 'kudan', name: ['九段靈廟', 'Kudan Spirit Shrine'], floors: 2, size: 19, look: 'shrine', enc: ['mothman', 'rakshasa', 'principality', 'succubus', 'tsuchigumo', 'phoenix', 'dakini', 'mizuchi', 'thunderbird'], boss: 'orochi', music: 3 },
  { id: 'abyss', name: ['東京深淵', 'The Abyss of Tokyo'], floors: 3, size: 19, look: 'abyss', enc: ['dakini', 'power', 'rajanaga', 'kinki', 'titania', 'cerberus', 'succubus', 'phoenix', 'principality'], boss: 'tiamat', music: 4 },
];
// every floor in order: { area, floor (1-based), last (the area's last floor), boss (a boss waits at the far end) }
export const FLOORS = AREAS.flatMap((a, ai) => Array.from({ length: a.floors }, (_, i) => ({ area: ai, floor: i + 1, last: i === a.floors - 1, boss: i === a.floors - 1 || (a.id === 'abyss' && i === 1) })));
