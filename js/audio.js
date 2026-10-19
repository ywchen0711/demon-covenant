// DEMON COVENANT — sound, synthesized with the Web Audio API (the engine comes from HUSH): one-shot effects for
// exploring and battles, and a small generated soundtrack for each area and for fights.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.onCaption = null;      // (text, seconds) => void
    this.loops = new Set();
  }

  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    this.master.connect(comp); comp.connect(ctx.destination);
    // shared noise buffers
    const n = ctx.sampleRate * 2;
    this.white = ctx.createBuffer(1, n, ctx.sampleRate);
    this.brown = ctx.createBuffer(1, n, ctx.sampleRate);
    const w = this.white.getChannelData(0), b = this.brown.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      w[i] = Math.random() * 2 - 1;
      last = (last + 0.02 * w[i]) / 1.02; b[i] = last * 3.5;
    }
    this.ambience();
  }

  get ready() { return !!this.ctx; }
  get now() { return this.ctx ? this.ctx.currentTime : 0; }

  caption(text, secs) { if (this.onCaption) this.onCaption(text, secs || 2.5); }

  // ---- listener follows the camera ----
  setListener(pos, forward, up) {
    if (!this.ctx) return;
    const L = this.ctx.listener, t = this.ctx.currentTime;
    if (L.positionX) {
      L.positionX.setValueAtTime(pos.x, t); L.positionY.setValueAtTime(pos.y, t); L.positionZ.setValueAtTime(pos.z, t);
      L.forwardX.setValueAtTime(forward.x, t); L.forwardY.setValueAtTime(forward.y, t); L.forwardZ.setValueAtTime(forward.z, t);
      L.upX.setValueAtTime(up.x, t); L.upY.setValueAtTime(up.y, t); L.upZ.setValueAtTime(up.z, t);
    } else {
      L.setPosition(pos.x, pos.y, pos.z);
      L.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  // ---- building blocks ----
  panner(pos, ref, roll) {
    const p = this.ctx.createPanner();
    p.panningModel = 'HRTF'; p.distanceModel = 'inverse';
    p.refDistance = ref || 1.5; p.rolloffFactor = roll || 1.1; p.maxDistance = 80;
    this.place(p, pos);
    p.connect(this.master);
    return p;
  }
  place(p, pos) {
    const t = this.ctx.currentTime;
    if (p.positionX) { p.positionX.setValueAtTime(pos.x, t); p.positionY.setValueAtTime(pos.y, t); p.positionZ.setValueAtTime(pos.z, t); }
    else p.setPosition(pos.x, pos.y, pos.z);
  }
  out(pos, ref, roll) { return pos ? this.panner(pos, ref, roll) : this.master; }
  noise(buf, dest, t, dur, type, freq, q, vol, attack, release) {
    const s = this.ctx.createBufferSource(); s.buffer = buf === 'brown' ? this.brown : this.white; s.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq || 1000; f.Q.value = q || 0.7;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + (release || 0.05));
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random()); s.stop(t + dur + (release || 0.05) + 0.05);
    return { src: s, filter: f, gain: g };
  }
  tone(dest, t, freq, dur, type, vol, toFreq, attack) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (toFreq) o.frequency.exponentialRampToValueAtTime(toFreq, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  // ---- one-shot sounds (pos optional = world position) ----
  play(name, pos, vol) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.01, v = vol == null ? 1 : vol;
    const d = (ref, roll) => this.out(pos, ref, roll);
    switch (name) {
      case 'step': {
        const o = d(1, 1.2);
        this.noise('brown', o, t, 0.06, 'lowpass', 380, 1, 0.35 * v);
        this.tone(o, t, 90, 0.09, 'sine', 0.25 * v, 60);
        break;
      }
      case 'creak': {                       // door hinge
        const o = d(2, 0.8);
        const s = this.ctx.createOscillator(); s.type = 'sawtooth';
        s.frequency.setValueAtTime(140, t); s.frequency.linearRampToValueAtTime(95, t + 0.45); s.frequency.linearRampToValueAtTime(120, t + 0.8);
        const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6;
        const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18 * v, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        s.connect(f); f.connect(g); g.connect(o); s.start(t); s.stop(t + 1);
        this.noise('white', o, t + 0.85, 0.03, 'highpass', 2000, 1, 0.2 * v);   // latch
        break;
      }
      case 'drawer': this.noise('brown', d(1, 1), t, 0.28, 'bandpass', 700, 1.5, 0.5 * v, 0.05); break;
      case 'locked': for (let i = 0; i < 3; i++) this.noise('white', d(1, 1), t + i * 0.09, 0.03, 'bandpass', 2600, 4, 0.35 * v); break;
      case 'key': [2637, 3136, 3520].forEach((f, i) => this.tone(d(1, 1), t + i * 0.05, f, 0.35, 'sine', 0.08 * v)); break;
      case 'unlock': this.noise('white', d(1, 1), t, 0.05, 'bandpass', 1800, 3, 0.4); this.tone(d(1, 1), t + 0.08, 1400, 0.2, 'triangle', 0.1); break;
      case 'gold': [1568, 2093].forEach((f, i) => this.tone(this.master, t + i * 0.07, f, 0.25, 'triangle', 0.08)); break;
      case 'pickup': [880, 1320].forEach((f, i) => this.tone(this.master, t + i * 0.08, f, 0.25, 'sine', 0.1)); break;
      case 'heal': [523, 659, 784].forEach((f, i) => this.tone(this.master, t + i * 0.07, f, 0.3, 'sine', 0.1)); break;
      case 'wardrobe': this.noise('brown', d(1, 1), t, 0.2, 'lowpass', 600, 1, 0.5); this.tone(d(1, 1), t, 200, 0.15, 'triangle', 0.08, 150); break;
      case 'flicker': for (let i = 0; i < 5; i++) this.tone(d(2, 1), t + i * 0.07 + Math.random() * 0.05, 120, 0.04, 'square', 0.05); break;
      case 'shatter': this.noise('white', d(2, 0.8), t, 0.35, 'highpass', 3000, 0.7, 0.4 * v); break;
      case 'psst': {                        // the Hisser
        const o = d(1.2, 1);
        this.noise('white', o, t, 0.02, 'bandpass', 1200, 2, 0.6);
        this.noise('white', o, t + 0.08, 0.55, 'bandpass', 4200, 2.5, 0.55, 0.06, 0.12);
        break;
      }
      case 'repel': this.noise('white', d(1.2, 1), t, 0.6, 'bandpass', 2500, 3, 0.4, 0.02, 0.3); this.tone(d(1.2, 1), t, 400, 0.5, 'sawtooth', 0.04, 120); break;
      case 'bite': this.noise('white', this.master, t, 0.12, 'bandpass', 1500, 1, 0.9); this.tone(this.master, t, 300, 0.25, 'sawtooth', 0.25, 80); break;
      case 'thud': {                        // the Listener's footstep
        const o = d(3, 0.9);
        this.tone(o, t, 55, 0.5, 'sine', 0.7 * v, 35);
        this.noise('brown', o, t, 0.15, 'lowpass', 250, 1, 0.6 * v);
        break;
      }
      case 'growl': {
        const o = d(3, 0.9), s = this.ctx.createOscillator(), lfo = this.ctx.createOscillator(), lg = this.ctx.createGain(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
        s.type = 'sawtooth'; s.frequency.value = 62; lfo.frequency.value = 9; lg.gain.value = 18; lfo.connect(lg); lg.connect(s.frequency);
        f.type = 'lowpass'; f.frequency.value = 500;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4 * v, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        s.connect(f); f.connect(g); g.connect(o); s.start(t); lfo.start(t); s.stop(t + 1.5); lfo.stop(t + 1.5);
        break;
      }
      case 'heartbeat': this.tone(this.master, t, 60, 0.12, 'sine', 0.5 * v, 40); this.tone(this.master, t + 0.18, 55, 0.14, 'sine', 0.4 * v, 38); break;
      case 'scream': {                      // death / jumpscare
        this.noise('white', this.master, t, 0.9, 'bandpass', 1800, 0.8, 0.9, 0.01, 0.3);
        const s = this.tone(this.master, t, 900, 1.0, 'sawtooth', 0.35, 180);
        this.tone(this.master, t, 1340, 0.8, 'square', 0.15, 260);
        void s;
        break;
      }
      case 'hit': this.noise('white', this.master, t, 0.1, 'lowpass', 2500, 1, 0.7); this.tone(this.master, t, 160, 0.2, 'square', 0.15, 60); break;
      case 'skitter': for (let i = 0; i < 10; i++) this.noise('white', d(0.8, 1), t + i * 0.035, 0.015, 'highpass', 5000, 1, 0.4); break;
      case 'creakFar': this.play('creak', pos, 0.4); break;
      case 'knock': for (let i = 0; i < 3; i++) { this.tone(d(1.5, 1), t + i * 0.28, 110, 0.12, 'sine', 0.5, 70); this.noise('brown', d(1.5, 1), t + i * 0.28, 0.06, 'lowpass', 600, 1, 0.5); } break;
      case 'win': [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(this.master, t + i * 0.18, f, 1.2, 'sine', 0.12)); break;
      // ---- menus, exploring, battles ----
      case 'menu': this.tone(this.master, t, 880, 0.05, 'square', 0.035); break;
      case 'ok': this.tone(this.master, t, 660, 0.06, 'square', 0.04); this.tone(this.master, t + 0.05, 990, 0.08, 'square', 0.04); break;
      case 'cancel': this.tone(this.master, t, 440, 0.08, 'square', 0.035, 300); break;
      case 'bump': this.tone(this.master, t, 90, 0.12, 'sine', 0.25, 60); this.noise('brown', this.master, t, 0.06, 'lowpass', 300, 1, 0.3); break;
      case 'stairs': for (let i = 0; i < 6; i++) { this.noise('brown', this.master, t + i * 0.11, 0.05, 'lowpass', 500, 1, 0.3); this.tone(this.master, t + i * 0.11, 120 - i * 6, 0.08, 'sine', 0.2); } break;
      case 'chest': this.noise('brown', this.master, t, 0.2, 'bandpass', 500, 2, 0.4); [784, 1047, 1319].forEach((f, i) => this.tone(this.master, t + 0.15 + i * 0.07, f, 0.35, 'triangle', 0.08)); break;
      case 'encounter': { this.noise('white', this.master, t, 0.5, 'highpass', 2000, 1, 0.25, 0.01, 0.3); [220, 233, 220, 233, 440].forEach((f, i) => this.tone(this.master, t + i * 0.07, f, 0.12, 'sawtooth', 0.09)); break; }
      case 'slash': this.noise('white', this.master, t, 0.12, 'bandpass', 2400, 1.2, 0.5, 0.005, 0.08); this.tone(this.master, t, 300, 0.12, 'sawtooth', 0.08, 90); break;
      case 'fire': this.noise('brown', this.master, t, 0.55, 'lowpass', 1200, 0.8, 0.7, 0.02, 0.3); this.noise('white', this.master, t, 0.4, 'bandpass', 900, 1, 0.25, 0.02, 0.2); break;
      case 'ice': [2637, 3520, 2960, 4186].forEach((f, i) => this.tone(this.master, t + i * 0.04, f, 0.3, 'triangle', 0.06)); this.noise('white', this.master, t, 0.25, 'highpass', 5000, 1, 0.2); break;
      case 'elec': for (let i = 0; i < 8; i++) this.noise('white', this.master, t + i * 0.03, 0.025, 'highpass', 3000 + Math.random() * 3000, 1, 0.45); this.tone(this.master, t, 60, 0.4, 'square', 0.12, 40); break;
      case 'force': this.noise('white', this.master, t, 0.6, 'bandpass', 700, 0.6, 0.45, 0.1, 0.3); break;
      case 'light': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(this.master, t + i * 0.03, f, 0.6, 'sine', 0.07)); break;
      case 'dark': this.tone(this.master, t, 110, 0.7, 'sawtooth', 0.12, 55); this.tone(this.master, t, 116, 0.7, 'sawtooth', 0.1, 58); this.noise('brown', this.master, t, 0.6, 'lowpass', 300, 1, 0.4); break;
      case 'almighty': this.noise('white', this.master, t, 1.0, 'lowpass', 4000, 0.7, 0.6, 0.01, 0.5); this.tone(this.master, t, 50, 1.1, 'sine', 0.6, 30); break;
      case 'healfx': [659, 784, 988, 1319].forEach((f, i) => this.tone(this.master, t + i * 0.06, f, 0.4, 'sine', 0.07)); break;
      case 'buff': [392, 494, 587, 784].forEach((f, i) => this.tone(this.master, t + i * 0.05, f, 0.25, 'square', 0.04)); break;
      case 'debuff': [784, 587, 494, 392].forEach((f, i) => this.tone(this.master, t + i * 0.05, f, 0.25, 'square', 0.04)); break;
      case 'weak': this.tone(this.master, t, 1568, 0.12, 'square', 0.06); this.tone(this.master, t + 0.08, 2093, 0.18, 'square', 0.06); break;
      case 'miss': this.noise('white', this.master, t, 0.25, 'bandpass', 600, 2, 0.25); break;
      case 'null': this.tone(this.master, t, 200, 0.25, 'triangle', 0.15, 180); break;
      case 'down': this.noise('brown', this.master, t, 0.5, 'lowpass', 400, 1, 0.5, 0.01, 0.3); this.tone(this.master, t, 220, 0.6, 'sawtooth', 0.08, 50); break;
      case 'levelup': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(this.master, t + i * 0.08, f, 0.25, 'square', 0.05)); break;
      case 'fuse': this.tone(this.master, t, 110, 2.2, 'sawtooth', 0.08, 880); this.noise('white', this.master, t, 2.0, 'bandpass', 1500, 2, 0.15, 1.5, 0.4); [523, 784, 1047].forEach((f, i) => this.tone(this.master, t + 2 + i * 0.1, f, 0.8, 'sine', 0.1)); break;
      case 'join': [392, 494, 587, 784].forEach((f, i) => this.tone(this.master, t + i * 0.12, f, 0.6, 'triangle', 0.08)); break;
      case 'talk': for (let i = 0; i < 4; i++) this.tone(this.master, t + i * 0.06, 300 + Math.random() * 300, 0.05, 'square', 0.03); break;
    }
  }

  // ---- continuous positional sounds; returns a handle with setPos / setVolume / stop ----
  loop(name, pos) {
    if (!this.ctx) return { setPos() {}, setVolume() {}, stop() {} };
    const ctx = this.ctx, t = ctx.currentTime;
    const p = this.panner(pos, name === 'rumble' ? 4 : 2, name === 'rumble' ? 0.7 : 1);
    const vol = ctx.createGain(); vol.gain.value = 0.0001; vol.connect(p);
    const nodes = [];
    if (name === 'rumble') {                // the Stampede: roaring wind and a growling engine
      const s = ctx.createBufferSource(); s.buffer = this.brown; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320;
      s.connect(f); f.connect(vol); s.start(t); nodes.push(s);
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 46;
      const of = ctx.createBiquadFilter(); of.type = 'lowpass'; of.frequency.value = 180;
      const og = ctx.createGain(); og.gain.value = 0.5;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 7; const lg = ctx.createGain(); lg.gain.value = 0.35; lfo.connect(lg); lg.connect(og.gain);
      o.connect(of); of.connect(og); og.connect(vol); o.start(t); lfo.start(t); nodes.push(o, lfo);
      const sc = ctx.createBufferSource(); sc.buffer = this.white; sc.loop = true;
      const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1400; sf.Q.value = 3;
      const sg = ctx.createGain(); sg.gain.value = 0.18; sc.connect(sf); sf.connect(sg); sg.connect(vol); sc.start(t); nodes.push(sc);
    } else if (name === 'hum') {            // the Gaze: a low eerie choir
      [196, 233.1, 293.7, 392.4].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * (1 + (i - 1.5) * 0.002);
        const g = ctx.createGain(); g.gain.value = 0.12;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.3 + i * 0.13; const lg = ctx.createGain(); lg.gain.value = 0.08; lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(vol); o.start(t); lfo.start(t); nodes.push(o, lfo);
      });
    } else if (name === 'breath') {         // something behind you in the wardrobe / the Listener
      const s = ctx.createBufferSource(); s.buffer = this.white; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 1.2;
      const g = ctx.createGain(); g.gain.value = 0.2;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.35; const lg = ctx.createGain(); lg.gain.value = 0.2; lfo.connect(lg); lg.connect(g.gain);
      s.connect(f); f.connect(g); g.connect(vol); s.start(t); lfo.start(t); nodes.push(s, lfo);
    } else if (name === 'buzz') {           // a dying light bulb
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 120;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 240; f.Q.value = 4;
      const g = ctx.createGain(); g.gain.value = 0.05; o.connect(f); f.connect(g); g.connect(vol); o.start(t); nodes.push(o);
    }
    const handle = {
      setPos: (q) => this.place(p, q),
      setVolume: (v, ramp) => { vol.gain.cancelScheduledValues(ctx.currentTime); vol.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, ramp || 0.15); },
      stop: () => {
        vol.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } }); p.disconnect(); }, 900);
        this.loops.delete(handle);
      }
    };
    this.loops.add(handle);
    return handle;
  }

  stopAll() { Array.from(this.loops).forEach((h) => h.stop()); }

  // ---- the soundtrack: a drone and a slow minor figure for each area, a driving loop for battles ----
  music(kind) {
    if (!this.ctx || this.song === kind) return;
    this.song = kind;
    if (this.songTimer) clearInterval(this.songTimer);
    if (this.songBus) { const old = this.songBus; old.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3); setTimeout(() => old.disconnect(), 1500); }
    if (kind == null) return;
    const ctx = this.ctx, bus = this.songBus = ctx.createGain(); bus.gain.value = 0.0001; bus.connect(this.master); bus.gain.setTargetAtTime(this.musicVol ?? 0.5, ctx.currentTime, 0.5);
    // root note and scale per area: subway, mall, tower, shrine, abyss; 'battle' and 'boss'
    const SONG = { 0: [110, [0, 3, 7, 10, 12, 10, 7, 3], 0.42], 1: [98, [0, 2, 3, 7, 8, 7, 3, 2], 0.38], 2: [123.5, [0, 5, 7, 10, 12, 7, 5, 3], 0.36], 3: [87.3, [0, 3, 5, 7, 10, 7, 5, 3], 0.5], 4: [73.4, [0, 1, 5, 6, 7, 6, 1, 0], 0.55],
      battle: [110, [0, 0, 12, 0, 10, 0, 7, 8], 0.14], boss: [98, [0, 0, 1, 0, 12, 0, 11, 7], 0.13], fuse: [130.8, [0, 7, 12, 15, 19, 15, 12, 7], 0.3] };
    const [root, notes, beat] = SONG[kind] || SONG[0], fight = kind === 'battle' || kind === 'boss';
    // a drone under everything
    for (const m of fight ? [0.5] : [0.5, 0.75]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = fight ? 'sawtooth' : 'sine'; o.frequency.value = root * m; g.gain.value = fight ? 0.05 : 0.08; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = fight ? 400 : 300; o.connect(f); f.connect(g); g.connect(bus); o.start(); bus.addEventListener && 0; this.songNodes = (this.songNodes || []).concat([o]); }
    let i = 0;
    const tick = () => {
      if (!this.songBus || this.songBus !== bus) return;
      const t = ctx.currentTime + 0.05, n = notes[i % notes.length], f = root * Math.pow(2, n / 12) * (fight ? 1 : 2);
      if (fight) { this.tone(bus, t, f, beat * 0.9, 'square', 0.06); if (i % 2 === 0) this.noise('brown', bus, t, 0.05, 'lowpass', 200, 1, 0.35); if (i % 4 === 2) this.noise('white', bus, t, 0.04, 'highpass', 4000, 1, 0.12); }
      else { if (i % 2 === 0 || Math.random() < 0.3) this.tone(bus, t, f, beat * 3, 'triangle', 0.05, null, 0.15); if (i % 8 === 0) this.tone(bus, t, f * 1.5, beat * 6, 'sine', 0.03, null, 0.5); }
      i++;
    };
    this.songTimer = setInterval(tick, beat * 1000);
    const nodes = this.songNodes; this.songNodes = [];
    bus._stop = () => nodes.forEach((o) => { try { o.stop(); } catch (e) { /* stopped */ } });
    const prevStop = this._stopDrone; this._stopDrone = bus._stop; if (prevStop) setTimeout(prevStop, 1500);
  }
  setMusicVolume(v) { this.musicVol = v; if (this.songBus) this.songBus.gain.setTargetAtTime(Math.max(0.0001, v), this.ctx.currentTime, 0.2); }

  // ---- the building breathes: low drone + distant creaks ----
  ambience() {
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain(); g.gain.value = 0.02; g.connect(this.master);
    [55, 55.4, 82.4].forEach((f) => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(g); o.start(t); });
    const s = ctx.createBufferSource(); s.buffer = this.brown; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160;
    const ng = ctx.createGain(); ng.gain.value = 0.12; s.connect(f); f.connect(ng); ng.connect(this.master); s.start(t);
  }
}
