type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let muted = false;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let noiseBuf: AudioBuffer | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.ratio.value = 6;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(comp).connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.32;
    musicGain.connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlock() {
  ac();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}

export function setMuted(m: boolean) {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
  if (m && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isMuted() {
  return muted;
}

function tone(
  freq: number,
  dur: number,
  { type = "square" as Wave, vol = 0.2, slide = 0, delay = 0, dest = null as AudioNode | null } = {},
) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest ?? master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, { vol = 0.3, from = 4000, to = 200, delay = 0, q = 1 } = {}) {
  const c = ac();
  if (!c || !master) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

export const sfx = {
  pop: () => tone(500, 0.12, { type: "sine", vol: 0.35, slide: 1400 }),
  blip: () => tone(900 + Math.random() * 300, 0.04, { type: "square", vol: 0.05 }),
  click: () => tone(1200, 0.05, { type: "triangle", vol: 0.2, slide: 600 }),
  coin: () => {
    tone(988, 0.08, { vol: 0.15 });
    tone(1319, 0.3, { vol: 0.15, delay: 0.08 });
  },
  bonk: () => {
    tone(420, 0.25, { type: "sine", vol: 0.5, slide: 70 });
    noise(0.08, { vol: 0.25, from: 2000, to: 300 });
  },
  boing: () => tone(150, 0.4, { type: "sine", vol: 0.4, slide: 600 }),
  buzzer: () => {
    tone(110, 0.55, { type: "sawtooth", vol: 0.3 });
    tone(116, 0.55, { type: "sawtooth", vol: 0.3 });
  },
  whoosh: () => noise(0.45, { vol: 0.35, from: 300, to: 5000, q: 0.7 }),
  slam: () => {
    tone(90, 0.5, { type: "sine", vol: 0.8, slide: 30 });
    noise(0.3, { vol: 0.6, from: 1500, to: 100 });
  },
  boom: () => {
    tone(70, 1.2, { type: "sine", vol: 0.9, slide: 25 });
    noise(1.2, { vol: 0.8, from: 3000, to: 60 });
  },
  sparkle: () => {
    [0, 0.06, 0.12, 0.18].forEach((d, i) =>
      tone(1500 + i * 400, 0.15, { type: "triangle", vol: 0.08, delay: d }),
    );
  },
  win: () => {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      tone(f, 0.18, { type: "square", vol: 0.13, delay: i * 0.09 }),
    );
  },
  sad: () => {
    [392, 370, 349, 330].forEach((f, i) =>
      tone(f, i === 3 ? 0.8 : 0.3, { type: "triangle", vol: 0.25, delay: i * 0.3 }),
    );
  },
  drumroll: (secs = 2) => {
    const n = Math.floor(secs / 0.045);
    for (let i = 0; i < n; i++)
      noise(0.05, { vol: 0.1 + (i / n) * 0.4, from: 1200, to: 400, delay: i * 0.045 });
  },
  airhorn: (delay = 0) => {
    const pattern = [
      [0, 0.18],
      [0.24, 0.18],
      [0.48, 0.9],
    ];
    pattern.forEach(([d, len]) => {
      [415, 420, 523, 528, 622].forEach((f) =>
        tone(f, len, { type: "sawtooth", vol: 0.16, delay: delay + d }),
      );
    });
  },
  siren: (secs = 3) => {
    const c = ac();
    if (!c || !master) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    const g = c.createGain();
    o.type = "sawtooth";
    o.frequency.value = 750;
    lfo.frequency.value = 2.2;
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.1);
    g.gain.setValueAtTime(0.22, t + secs - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + secs);
    o.connect(g).connect(master);
    o.start(t);
    lfo.start(t);
    o.stop(t + secs);
    lfo.stop(t + secs);
  },
  engine: () => tone(80 + Math.random() * 30, 0.1, { type: "sawtooth", vol: 0.05 }),
};

export function say(text: string, { pitch = 1.2, rate = 1, volume = 1 } = {}) {
  if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = pitch;
  u.rate = rate;
  u.volume = volume;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find((x) => /en[-_](GB|IN)/i.test(x.lang) && /female|samantha|google/i.test(x.name)) ||
    voices.find((x) => /^en/i.test(x.lang));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// Happy Birthday (public domain melody), 3/4 time, beat units.
const N: Record<string, number> = {
  G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784,
  C3: 131, F3: 175, G3: 196, C4: 262,
};
const MELODY: [string | null, number][] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2], [null, 1],
];
const BASS: [string, number][] = [
  ["C3", 3], ["G3", 3], ["G3", 3], ["C3", 3], ["C3", 3], ["F3", 3], ["C3", 1.5], ["G3", 1.5], ["C3", 3],
];

export function startMusic(beat = 0.3) {
  const c = ac();
  if (!c || !musicGain || musicTimer) return;
  const total = MELODY.reduce((s, [, d]) => s + d, 0);
  let next = c.currentTime + 0.1;
  const schedule = () => {
    if (!ctx || !musicGain) return;
    while (next < ctx.currentTime + 1.5) {
      let t = next - ctx.currentTime;
      for (const [n, d] of MELODY) {
        if (n) {
          tone(N[n], d * beat * 0.95, { type: "square", vol: 0.12, delay: t, dest: musicGain });
          tone(N[n] * 2, d * beat * 0.5, { type: "triangle", vol: 0.04, delay: t, dest: musicGain });
        }
        t += d * beat;
      }
      let tb = next - ctx.currentTime + beat;
      for (const [n, d] of BASS) {
        tone(N[n], d * beat * 0.9, { type: "triangle", vol: 0.22, delay: tb, dest: musicGain });
        tb += d * beat;
      }
      next += total * beat;
    }
  };
  schedule();
  musicTimer = setInterval(schedule, 400);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  // Notes are scheduled a whole loop ahead, so swap the bus to silence them.
  if (ctx && master && musicGain) {
    musicGain.disconnect();
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.32;
    musicGain.connect(master);
  }
}

export function isMusicPlaying() {
  return musicTimer !== null;
}
