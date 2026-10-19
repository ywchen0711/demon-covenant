// DEMON COVENANT — the story: prologue, one event per floor (the 'N' spot), boss speeches, endings. Text is [中文, English].
// A choice moves the alignment: +1 towards Law (蓮 and the Order of Dawn), −1 towards Chaos (結衣 and the Kin of Night).

export const PROLOGUE = [
  ['20XX 年，東京。', 'Tokyo, 20XX.'],
  ['那一天，天空裂開了。', 'On that day, the sky split open.'],
  ['一道漆黑的穹頂罩住了整座城市，地底湧出了無數的惡魔。', 'A dome of black light closed over the city, and demons poured up from beneath the earth.'],
  ['你在新宿站的地下醒來。破裂的手機螢幕上，一個陌生的程式正在閃爍——', 'You wake beneath Shinjuku Station. On your cracked phone, an unfamiliar program is blinking —'],
  ['「惡魔召喚程式 COVENANT，安裝完成。」', '"Demon Summoning Program COVENANT: installation complete."'],
  ['「與惡魔交談，締結契約，活下去。——ORACLE」', '"Talk to the demons. Make covenants. Survive. — ORACLE"'],
];

// what each floor's story spot holds: lines, then perhaps a choice (each option: text, alignment change, reply lines)
export const EVENTS = [
  { // 新宿 1
    lines: [['「喂！你沒事吧！」', '"Hey! Are you all right?"'], ['是蓮和結衣。你的兩個朋友也被困在這裡。', 'It\'s Ren and Yui. Your two friends are trapped down here too.'],
      ['蓮：「那些怪物……剛才有一隻跟我說話。牠說只要給錢，就不殺我。」', 'Ren: "Those things… one of them talked to me. It said it wouldn\'t kill me if I paid."'],
      ['結衣：「你的手機也有那個程式？聽說能跟惡魔訂契約，讓牠們替你戰鬥。」', 'Yui: "You have that app too? They say you can make pacts with demons and have them fight for you."']],
    choice: { q: ['蓮：「我們接下來該怎麼辦？」', 'Ren: "So what do we do now?"'], opts: [
      { t: ['大家一起行動，找人求救。', 'Stick together and find help.'], align: 1, reply: [['蓮：「沒錯。只要守住秩序，一定有辦法。」', 'Ren: "Right. If we keep our heads, we\'ll find a way."']] },
      { t: ['不管用什麼手段，殺出一條路。', 'Fight our way out, whatever it takes.'], align: -1, reply: [['結衣：「哈，我喜歡。弱肉強食嘛。」', 'Yui: "Ha. I like that. Only the strong survive."']] },
      { t: ['先搞清楚這個程式怎麼用。', 'First, let\'s work out how this app works.'], align: 0, reply: [['兩人點了點頭。', 'They both nod.']] }] },
    after: [['蓮：「我去找其他倖存者。」結衣：「我去前面看看。」', 'Ren: "I\'ll look for other survivors." Yui: "I\'ll scout ahead."'], ['兩人往不同的方向走去了。', 'They head off in different directions.']] },
  { // 新宿 2
    lines: [['一群倖存者躲在剪票口後面發抖。', 'A group of survivors huddles behind the ticket gates.'], ['老人：「出口被一頭牛頭的怪物守住了……誰去都回不來。」', 'Old man: "A bull-headed monster guards the exit… no one who goes comes back."'],
      ['小女孩：「大哥哥，你會打倒牠嗎？」', 'Little girl: "Mister, will you beat it?"']],
    choice: { q: ['你要怎麼回答？', 'What do you say?'], opts: [
      { t: ['我會保護大家。', 'I\'ll protect everyone.'], align: 1, reply: [['小女孩露出了笑容。', 'The girl smiles.']] },
      { t: ['我只是要出去而已。', 'I\'m only getting myself out.'], align: -1, reply: [['老人嘆了口氣。', 'The old man sighs.']] },
      { t: ['我會試試看。', 'I\'ll try.'], align: 0, reply: [['小女孩用力點頭。', 'The girl nods hard.']] }] },
    gift: { item: 'salve', n: 2 } },
  { // 池袋 1
    lines: [['商場的廣場上，穿著白衣的人們排成整齊的隊伍。', 'In the mall\'s plaza, people in white robes stand in neat rows.'], ['蓮也在其中。', 'Ren is among them.'],
      ['蓮：「這是『晨曦騎士團』。他們說，惡魔是神降下的試煉。只要消滅所有惡魔，東京就能得救。」', 'Ren: "This is the Order of Dawn. They say the demons are a trial sent by God. Wipe them all out and Tokyo will be saved."'],
      ['蓮：「你也加入吧。可是……你身邊的那些是惡魔吧？」', 'Ren: "Join us. But… those are demons with you, aren\'t they?"']],
    choice: { q: ['蓮：「你怎麼想？」', 'Ren: "What do you think?"'], opts: [
      { t: ['騎士團是東京唯一的希望。', 'The Order is Tokyo\'s only hope.'], align: 1, reply: [['蓮：「我就知道你懂。」', 'Ren: "I knew you\'d understand."']] },
      { t: ['我走我自己的路。', 'I\'ll walk my own road.'], align: 0, reply: [['蓮：「……是嗎。」', 'Ren: "…I see."']] },
      { t: ['秩序不過是另一個牢籠。', 'Order is just another cage.'], align: -1, reply: [['蓮的表情僵住了。', 'Ren\'s face hardens.']] }] } },
  { // 池袋 2
    lines: [['結衣坐在倒塌的手扶梯上，身邊圍著幾隻惡魔。', 'Yui sits on a collapsed escalator, demons gathered around her.'],
      ['結衣：「我加入了『夜之眷屬』。在這裡，力量就是一切，沒人會管你。」', 'Yui: "I\'ve joined the Kin of Night. Down here, strength is everything, and nobody tells you what to do."'],
      ['一個男人偷了倖存者的食物，被惡魔們抓住了。', 'A man who stole the survivors\' food has been caught by the demons.'], ['結衣：「你說，該怎麼處置他？」', 'Yui: "So — what should we do with him?"']],
    choice: { q: ['你的決定是？', 'Your call?'], opts: [
      { t: ['把他交給騎士團審判。', 'Hand him to the Order for judgement.'], align: 1, reply: [['結衣：「真無聊。」', 'Yui: "How boring."']] },
      { t: ['弱者活該。隨惡魔處置。', 'The weak get what they deserve. Let the demons have him.'], align: -1, reply: [['結衣：「這才對嘛。」', 'Yui: "Now that\'s more like it."']] },
      { t: ['放了他，再分他一點食物。', 'Let him go, and share some food.'], align: 0, reply: [['男人哭著道謝。', 'The man thanks you in tears.']] }] } },
  { // 鐵塔 1
    lines: [['鐵塔大廳的終端機突然亮了起來。', 'A terminal in the tower lobby flickers to life.'], ['「我是 ORACLE。」', '"I am ORACLE."'],
      ['「這座穹頂，是沉睡在東京地底的『混沌之母』提亞瑪特甦醒的徵兆。」', '"The dome is a sign that Tiamat, the Mother of Chaos asleep beneath Tokyo, is waking."'],
      ['「晨曦騎士團想把東京永遠封印，建立神的千年王國。夜之眷屬想解放提亞瑪特，讓世界回到只有力量的時代。」', '"The Order of Dawn would seal Tokyo forever as God\'s thousand-year kingdom. The Kin of Night would free Tiamat and return the world to an age of strength alone."']],
    choice: { q: ['「你相信什麼？」', '"What do you believe in?"'], opts: [
      { t: ['神與秩序。', 'God and order.'], align: 1, reply: [['「……記錄了。」', '"…Noted."']] },
      { t: ['自由與力量。', 'Freedom and strength.'], align: -1, reply: [['「……記錄了。」', '"…Noted."']] },
      { t: ['人自己選擇的未來。', 'A future people choose for themselves.'], align: 0, reply: [['「……很有趣的答案。」', '"…An interesting answer."']] }] } },
  { // 鐵塔 2
    lines: [['頂樓的風很強。從破碎的玻璃望出去，整座東京都在黑色穹頂下燃燒。', 'The wind is strong up here. Through the shattered glass all of Tokyo burns beneath the black dome.'],
      ['一根巨大的金色羽毛落在你腳邊。', 'A huge golden feather lands at your feet.']], gift: { item: 'water', n: 2 } },
  { // 九段 1
    lines: [['靈廟裡飄著無數的燈火。是死者的靈魂。', 'Countless lights drift through the shrine. The souls of the dead.'],
      ['老婆婆的靈魂：「年輕人……我的孫子還活著嗎？他叫小翔，在池袋的學校……」', 'An old woman\'s spirit: "Young one… is my grandson still alive? His name is Sho, at a school in Ikebukuro…"']],
    choice: { q: ['你要怎麼回答？', 'What do you tell her?'], opts: [
      { t: ['他一定還活著，我會去找他。', 'I\'m sure he\'s alive. I\'ll find him.'], align: 0, reply: [['「……謝謝你。」燈火變得溫暖了。', '"…Thank you." Her light grows warm.']] },
      { t: ['死者應該安息，別再掛念了。', 'The dead should rest. Let go of him.'], align: 1, reply: [['「……是啊。」燈火慢慢升上天空。', '"…Yes." Her light slowly rises.']] },
      { t: ['死人的事跟我無關。', 'The dead are none of my business.'], align: -1, reply: [['燈火默默地熄滅了。', 'Her light silently goes out.']] }] },
    gift: { item: 'incense', n: 1 } },
  { // 九段 2
    lines: [['靈廟深處傳來八個頭的嘶吼。', 'From deep in the shrine come the roars of eight heads.'], ['所有的靈魂都被那頭大蛇吞了下去。', 'Every soul here has been swallowed by that great serpent.']] },
  { // 深淵 1
    lines: [['東京的地底，是一片翻騰的黑暗。', 'Beneath Tokyo lies a churning darkness.'], ['蓮和結衣都在等你。', 'Ren and Yui are both waiting for you.'],
      ['蓮：「跟我來。我們一起封印提亞瑪特，讓東京成為神的國度。」', 'Ren: "Come with me. We\'ll seal Tiamat together and make Tokyo the kingdom of God."'],
      ['結衣：「別聽他的。解放提亞瑪特，讓強者決定一切！」', 'Yui: "Don\'t listen to him. Free Tiamat and let the strong decide everything!"']],
    choice: { q: ['你選擇誰？', 'Who do you stand with?'], opts: [
      { t: ['蓮。', 'Ren.'], align: 3, reply: [['蓮：「謝謝你。」結衣：「……我會讓你後悔的。」', 'Ren: "Thank you." Yui: "…I\'ll make you regret this."']] },
      { t: ['結衣。', 'Yui.'], align: -3, reply: [['結衣：「我就知道！」蓮：「……那我只好阻止你了。」', 'Yui: "I knew it!" Ren: "…Then I have to stop you."']] },
      { t: ['我誰都不選。', 'Neither of you.'], align: 'zero', reply: [['蓮：「你瘋了嗎？」結衣：「那你就跟我們兩個為敵吧。」', 'Ren: "Are you insane?" Yui: "Then you\'re against both of us."']] }] } },
  { // 深淵 2
    lines: [['黑暗中，一道身影擋住了去路。', 'In the dark, a figure blocks your way.']] },
  { // 深淵 3
    lines: [['深淵的盡頭，一顆巨大的心臟在跳動。', 'At the bottom of the abyss, an enormous heart is beating.'], ['「ORACLE」的聲音：「去吧。決定這座城市的未來。」', 'ORACLE\'s voice: "Go. Decide this city\'s future."']] },
];

// what a boss says before the fight (by floor), and afterwards
export const BOSS = {
  gozuki: { pre: [['老人說過：「那頭怪物最怕冷，冬天從不出洞……」', 'The old man said: "That beast hates the cold. It never came out in winter…"'], ['牛頭鬼：「哞哈哈！又一個迷路的小羊！」', 'Gozuki: "Mwahaha! Another lost little lamb!"']], post: [['出口打開了。倖存者們歡呼著湧向地面。', 'The exit opens. The survivors stream up towards the surface, cheering.']] },
  nue: { pre: [['黑暗中，猴臉、狸身、虎足、蛇尾的怪物發出了怪聲。', 'In the dark, a beast with a monkey\'s face, a tanuki\'s body, tiger\'s legs and a snake for a tail lets out an eerie cry.']], post: [['鵺的叫聲消失了。商場重新安靜下來。', 'The Nue\'s cry fades. The mall falls quiet again.']] },
  garuda: { pre: [['迦樓羅：「渺小的人類，你沒有資格俯瞰這座城市！」', 'Garuda: "Tiny human, you are not worthy to look down upon this city!"']], post: [['風停了。遠方的穹頂中心，有什麼東西在地底跳動。', 'The wind dies. Far away, under the heart of the dome, something pulses beneath the earth.']] },
  orochi: { pre: [['八岐大蛇：「人之子……來當我的第九顆頭的食物吧。」', 'Yamata no Orochi: "Child of man… come and feed my ninth head."']], post: [['被吞下的靈魂一一解放，化作光芒升上天空。通往深淵的路打開了。', 'The swallowed souls are freed one by one and rise as light. The way to the Abyss opens.']] },
  ren: { pre: [['蓮：「為了神的國度……原諒我。」蓮的身上展開了光之翼。', 'Ren: "For the kingdom of God… forgive me." Wings of light unfold from Ren\'s back.']], post: [['蓮：「……你比我想的還要強。」', 'Ren: "…You\'re stronger than I thought."']] },
  yui: { pre: [['結衣：「只有強者能決定世界！」結衣的影子化成了夜之女王。', 'Yui: "Only the strong get to decide the world!" Yui\'s shadow becomes the Queen of Night.']], post: [['結衣：「……哈，輸了啊。」', 'Yui: "…Ha. I lost."']] },
  tiamat: { pre: [['提亞瑪特：「我是萬物之母。這座城市的一切都將回到我的懷抱。」', 'Tiamat: "I am the mother of all things. Everything in this city will return to my embrace."']], post: [] },
};

export const ENDINGS = {
  law: [['提亞瑪特被封印了。', 'Tiamat is sealed.'], ['黑色穹頂化為白色的光。晨曦騎士團宣告了千年王國的降臨。', 'The black dome turns to white light. The Order of Dawn proclaims the coming of the thousand-year kingdom.'],
    ['東京從此沒有惡魔，也沒有自由。人們跪在光之中，安靜地活著。', 'Tokyo knows no more demons — and no more freedom. People kneel in the light and live quietly.'], ['蓮站在你身旁。「這樣就好了。」', 'Ren stands beside you. "This is how it should be."'], ['── 秩序之路 完 ──', '── The Way of Law: The End ──']],
  chaos: [['提亞瑪特的心臟停止了跳動，牠的力量散落在東京的每一個角落。', 'Tiamat\'s heart stops, and her power scatters into every corner of Tokyo.'], ['穹頂碎裂了。人與惡魔在廢墟中並肩而立，只有強者能夠生存。', 'The dome shatters. Humans and demons stand side by side in the ruins, and only the strong survive.'],
    ['結衣大笑著奔向新的世界。「從今天起，誰都不用聽誰的！」', 'Yui runs laughing into the new world. "From today on, nobody answers to anybody!"'], ['── 混沌之路 完 ──', '── The Way of Chaos: The End ──']],
  neutral: [['提亞瑪特倒下了。沒有神的國度，也沒有力量的時代。', 'Tiamat falls. No kingdom of God, and no age of strength alone.'], ['穹頂慢慢消散，久違的陽光照進了東京。', 'The dome slowly fades, and sunlight falls on Tokyo for the first time in so long.'],
    ['蓮和結衣在瓦礫中醒來，三個人看著同一片天空。', 'Ren and Yui wake in the rubble, and the three of you look up at the same sky.'], ['「要重建這座城市，會花很久的時間吧。」「嗯。我們一起。」', '"Rebuilding this city is going to take a long time." "Yeah. Let\'s do it together."'], ['── 中庸之路 完 ──', '── The Way of the Middle: The End ──']],
};
export const route = (align) => (align >= 3 ? 'law' : align <= -3 ? 'chaos' : 'neutral');
