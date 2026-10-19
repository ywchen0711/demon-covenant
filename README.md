# 魔都轉生 · DEMON COVENANT

A first-person dungeon RPG in a ruined Tokyo, in the tradition of the classic demon-negotiation games: **talk to demons, make
covenants with them, fuse them into stronger ones, and fight with press turns.** Chinese and English.

**Play:** https://ywchen0711.github.io/demon-covenant/  (keyboard or touch)

Built on the engine of [HUSH](https://github.com/ywchen0711/hush): three.js (pinned to 0.160.0 from a CDN), and every texture,
demon portrait and sound is generated in code. No asset files.

## The story

Tokyo, 20XX. The sky splits open, a dome of black light seals the city and demons pour up from beneath the earth. You wake under
Shinjuku Station with a strange app on your phone: **COVENANT**, a demon summoning program sent by someone calling themselves ORACLE.
Your friends 蓮 Ren and 結衣 Yui are down here too, and they will each take a side: the **Order of Dawn**, which would seal Tokyo
as God's thousand-year kingdom, or the **Kin of Night**, who would free Tiamat and let the strong rule. Your answers along the way
push you towards **Law**, **Chaos** or the **middle road**, and decide who you face in the Abyss and how it ends (three endings).

Five areas, eleven floors: 新宿地下街 Shinjuku Underground → 池袋廢墟商場 Ikebukuro Ruined Mall → 東京鐵塔 Tokyo Tower →
九段靈廟 Kudan Spirit Shrine → 東京深淵 The Abyss of Tokyo, with a boss at the end of each: 牛頭鬼 Gozuki, 鵺 Nue, 迦樓羅 Garuda,
八岐大蛇 Yamata no Orochi, your friend, and 提亞瑪特 Tiamat.

## How it plays

- **Exploring:** step through maze-like floors in first person. The automap fills in as you go; the danger light shows how close a
  fight is; the moon goes from new to full as you walk (demons won't talk at the full moon, and are friendlier at the new moon).
  Terminals let you rest, save, shop and change your party; chests hold macca and items; a glowing light marks the story.
- **Press turns:** each side gets a star per fighter. Hitting a **weakness** or landing a **critical** only uses half a star, so
  you can act again; a **miss** or a **nulled** hit costs two, and a **repelled** or **drained** attack ends your turn. Bosses get
  extra stars. What you learn about a demon's affinities is shown under it from then on.
- **Elements:** physical, fire, ice, electricity, force (wind), light, dark and almighty; each demon is weak to, resists, nulls,
  repels or drains some of them.
- **Talking:** choose *Talk* and a demon asks you questions and makes a demand (macca, an item or some of your blood). Each race has
  a temperament and likes different answers. Win it over and it joins you (if you are strong enough and have room).
- **Fusion:** at the altar on each area's first floor, two demons become a new one of another race, inheriting their best skills.
- **40 demons** from world folklore and mythology (Pixie, Kelpie, Cait Sith, Nekomata, Kodama, Kappa, Karasu Tengu, Angel,
  Thunderbird, Phoenix, Naga, Lilim, Succubus, Oni, Rakshasa, Cerberus, Titania …) in 10 races, plus the bosses.

## Controls

| | |
|---|---|
| ↑ / W, ↓ / S | step forward / back |
| ← / A, → / D | turn |
| Q / E | sidestep |
| Enter / Space / Z | confirm |
| Esc / X / Tab | menu, back |
| M | map |

On a phone, use the pad in the corner.

## Files

```
index.html, style.css
js/data.js       skills, races and fusion table, demons, bosses, items, areas
js/party.js      the hero and demons: stats, levels, skills, fusion
js/battle.js     press-turn battles and the demons' minds (no DOM)
js/talk.js       negotiation (no DOM)
js/dungeon.js    floor layouts (no DOM)
js/encounter.js  who you meet where
js/story.js      the story, boss speeches and endings
js/art.js        demon portraits drawn in code
js/world3d.js    the floors in 3D
js/audio.js      sound and music (from HUSH's engine)
js/main.js       the game
tools/test.mjs   data, maps, press turns, fusion and talk checks, and the whole game played on autopilot
```

Run locally with any static server (`python -m http.server`), then open http://localhost:8000. `npm test` runs the checks.
