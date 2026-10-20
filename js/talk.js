// DEMON COVENANT — talking to demons. Each race has a temperament; a demon asks two questions and makes one demand,
// and if it likes how you answered (and you are strong enough, and there is room in your summoning app) it joins you.
// No DOM.
import { DEMONS, RACES, ITEMS } from './data.js?v=7';

// what each temperament thinks of each kind of answer
const LIKES = {
  childish: { playful: 2, kind: 1, cheerful: 1, cold: -2, dark: -1, timid: 0 },
  wild:     { bold: 2, honest: 1, timid: -2, flatter: -1, clever: -1 },
  gloomy:   { dark: 2, honest: 1, cheerful: -2, playful: -1, bold: -1 },
  cunning:  { clever: 2, greedy: 1, dark: 1, honest: -1, kind: -1 },
  noble:    { honest: 2, kind: 2, greedy: -2, dark: -2, flatter: -1 },
  proud:    { flatter: 2, timid: 1, bold: -2, cold: -1, honest: -1 },
};
// [question, [answer, kind], ...]
const Q = [
  [['你為什麼要來這種地方？', 'Why would a human come down here?'], [['為了救我的朋友。', 'To save my friends.'], 'kind'], [['為了變得更強。', 'To get stronger.'], 'bold'], [['……迷路了啦。', '…I got lost.'], 'playful']],
  [['人類比惡魔更優秀嗎？', 'Are humans better than demons?'], [['當然。', 'Of course.'], 'bold'], [['大家都一樣。', 'We are all the same.'], 'honest'], [['惡魔比較了不起。', 'Demons are far greater.'], 'flatter']],
  [['這世上最重要的是什麼？', 'What matters most in this world?'], [['力量。', 'Power.'], 'bold'], [['愛。', 'Love.'], 'kind'], [['錢。', 'Money.'], 'greedy']],
  [['好無聊喔，做點有趣的事吧！', 'I\'m bored. Do something funny!'], [['做個鬼臉。', 'Pull a funny face.'], 'playful'], [['不理它。', 'Ignore it.'], 'cold'], [['講個鬼故事。', 'Tell a ghost story.'], 'dark']],
  [['為了活下去，你會背叛朋友嗎？', 'Would you betray a friend to survive?'], [['絕對不會。', 'Never.'], 'honest'], [['必要的話。', 'If I had to.'], 'clever'], [['看是誰囉。', 'Depends on the friend.'], 'dark']],
  [['你看我，是不是很美／很強？', 'Look at me. Am I not magnificent?'], [['太美了！', 'Utterly magnificent!'], 'flatter'], [['普普通通。', 'You\'re all right.'], 'honest'], [['我見過更好的。', 'I\'ve seen better.'], 'cold']],
  [['害怕的時候你會怎麼做？', 'What do you do when you are afraid?'], [['照樣往前衝。', 'Charge in anyway.'], 'bold'], [['逃跑。', 'Run.'], 'timid'], [['祈禱。', 'Pray.'], 'honest']],
  [['你喜歡夜晚嗎？', 'Do you like the night?'], [['喜歡，很安靜。', 'Yes. It is quiet.'], 'dark'], [['我比較喜歡白天。', 'I prefer the daylight.'], 'cheerful'], [['無所謂。', 'I don\'t care.'], 'cold']],
  [['如果能實現一個願望，你要什麼？', 'If you had one wish, what would it be?'], [['讓東京恢復原樣。', 'Bring the old Tokyo back.'], 'kind'], [['統治這個新世界。', 'To rule this new world.'], 'greedy'], [['永遠玩不完的遊戲。', 'A game that never ends.'], 'playful']],
  [['給我一個不吃掉你的理由。', 'Give me one reason not to eat you.'], [['我會讓你值回票價。', 'I\'ll make it worth your while.'], 'clever'], [['你試試看啊。', 'Go ahead and try.'], 'bold'], [['拜託不要……', 'Please… I beg you.'], 'timid']],
  [['你覺得神存在嗎？', 'Do you believe in God?'], [['相信。', 'I do.'], 'honest'], [['神早就拋棄這座城市了。', 'God abandoned this city long ago.'], 'dark'], [['只要對我有利就信。', 'When it suits me.'], 'clever']],
  [['你今天開心嗎？', 'Are you having a good day?'], [['開心！遇到你了！', 'I am now that I met you!'], 'cheerful'], [['東京都毀了，怎麼開心。', 'Tokyo is in ruins. How could I be?'], 'honest'], [['跟你沒關係。', 'None of your business.'], 'cold']],
];
// how a demon reacts
const REACT = {
  good: [['嘻嘻，我喜歡這個回答。', 'Hee hee. I like that answer.'], ['哼，有點意思。', 'Hmph. Not bad.'], ['……說得好。', '…Well said.']],
  bad: [['蛤？你在說什麼啊。', 'Huh? What are you even saying?'], ['真無聊。', 'How dull.'], ['我不喜歡你這種人。', 'I don\'t like your kind.']],
  meh: [['嗯……這樣啊。', 'Hmm… I see.'], ['隨便你。', 'Whatever.']],
};
const pick = (r, a) => a[Math.floor(r() * a.length)];

// ctx: { heroLv, heroHp, macca, bag, stockFull, moon, rng }
export function startTalk(demon, ctx) {
  const d = DEMONS[demon.id], r = ctx.rng || Math.random, pers = RACES[d.race].pers;
  const steps = ['q', 'q', 'demand'].sort(() => r() - 0.5);
  const qs = [...Q].sort(() => r() - 0.5).slice(0, 2);
  const T = { demon, pers, steps, qs, mood: ctx.moon === 0 ? 1 : 0, i: 0, ctx, r, done: null, log: [] };
  if (d.boss) T.done = { result: 'refuse', text: ['……愚蠢。', '…Fool.'] };
  else if (ctx.moon === 8) T.done = { result: 'angry', text: ['哈哈哈哈！滿月！滿月啊！我現在只想大鬧一場！', 'Ahahaha! The full moon! The full moon! All I want is to tear something apart!'] };
  return T;
}
// what the demon says next: { kind: 'question', text, answers } | { kind: 'demand', what, amount, text } | { kind: 'end', ... }
export function prompt(T) {
  if (T.done) return { kind: 'end', ...T.done };
  const step = T.steps[T.i];
  if (step === 'q') { const q = T.qs[T.steps.slice(0, T.i).filter((s) => s === 'q').length]; return { kind: 'question', text: q[0], answers: q.slice(1).map((a) => a[0]) }; }
  if (step === 'demand') {
    if (!T.demand) {
      const lv = T.demon.lv, have = Object.keys(T.ctx.bag || {}).filter((k) => ITEMS[k] && ITEMS[k].use && T.ctx.bag[k] > 0);
      const roll = T.r();
      if (roll < 0.55) T.demand = { what: 'macca', amount: Math.round(lv * (14 + T.r() * 12)) };
      else if (roll < 0.8 && have.length) T.demand = { what: 'item', item: pick(T.r, have) };
      else T.demand = { what: 'hp', amount: Math.max(5, Math.round(T.ctx.heroMaxHp * 0.12)) };
    }
    const m = T.demand, text = m.what === 'macca' ? [`給我 ${m.amount} 魔貨，我就考慮看看。`, `Give me ${m.amount} macca and I'll think about it.`]
      : m.what === 'item' ? [`我想要你的「${ITEMS[m.item].name[0]}」。`, `I want your ${ITEMS[m.item].name[1]}.`]
      : [`讓我嚐嚐你的血……${m.amount} 點就好。`, `Let me taste your blood… just ${m.amount} HP.`];
    return { kind: 'demand', ...m, text };
  }
  return { kind: 'end', ...settle(T) };
}
// answer a question (index 0-2) or a demand (true = give it); returns the demon's reaction
export function answer(T, choice) {
  const p = prompt(T); if (p.kind === 'end') return null;
  let delta = 0;
  if (p.kind === 'question') {
    const q = T.qs[T.steps.slice(0, T.i).filter((s) => s === 'q').length], tag = q[1 + choice][1];
    delta = (LIKES[T.pers][tag] || 0) + (T.r() < 0.15 ? (T.r() < 0.5 ? 1 : -1) : 0);
  } else {
    const m = T.demand;
    if (choice) {
      if (m.what === 'macca' && T.ctx.macca < m.amount) { delta = -1; T.short = true; }
      else { delta = 2; T.paid = (T.paid || []).concat([m]); }
    } else delta = -2;
  }
  T.mood += delta; T.i++;
  const react = T.short ? ['你根本沒那麼多錢嘛！', 'You don\'t even have that much!'] : pick(T.r, delta > 0 ? REACT.good : delta < 0 ? REACT.bad : REACT.meh);
  T.short = false;
  if (T.mood <= -3) T.done = { result: 'angry', text: ['夠了！我要把你撕碎！', 'Enough! I\'ll tear you apart!'] };
  return { delta, text: react };
}
function settle(T) {
  const d = DEMONS[T.demon.id], c = T.ctx;
  if (T.mood >= 2) {
    if (T.demon.lv > c.heroLv) return { result: 'gift', text: ['你還太弱了，配不上我。這個拿去吧。', 'You\'re too weak to command me. Take this, though.'] };
    if (c.stockFull) return { result: 'gift', text: ['你的召喚程式已經滿了啊。下次吧。', 'Your summoning app is full. Another time.'] };
    if ((c.owned || []).includes(T.demon.id)) return { result: 'gift', text: ['你已經有一個我了嘛。這個送你吧。', 'You already have one of me. Take this instead.'] };
    return { result: 'join', text: [`我是${d.name[0]}。今後請多指教。`, `I am ${d.name[1]}. Let us get along from now on.`] };
  }
  if (T.mood <= -2) return { result: 'angry', text: ['你這傢伙真讓人火大！', 'You really get on my nerves!'] };
  return { result: 'leave', text: ['……算了，我走了。', '…Forget it. I\'m leaving.'] };
}
