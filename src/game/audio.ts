type Bus = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  music: GainNode;
  engine: OscillatorNode | null;
  engineGain: GainNode | null;
  engineFilter: BiquadFilterNode | null;
};

let bus: Bus | null = null;
let muted = false;

export function unlockAudio() {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!bus) {
    const ctx = new Ctx({ latencyHint: "interactive" });
    const master = ctx.createGain();
    const sfx = ctx.createGain();
    const music = ctx.createGain();
    sfx.gain.value = 0.7;
    music.gain.value = 0.35;
    master.gain.value = muted ? 0 : 0.85;
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
    bus = { ctx, master, sfx, music, engine: null, engineGain: null, engineFilter: null };
  }
  if (bus.ctx.state === "suspended") void bus.ctx.resume();
}

export function setMuted(next: boolean) {
  muted = next;
  if (!bus) return;
  bus.master.gain.setTargetAtTime(next ? 0 : 0.85, bus.ctx.currentTime, 0.03);
}

export function isMuted() {
  return muted;
}

function envGain(duration: number, peak = 0.2) {
  if (!bus) return null;
  const g = bus.ctx.createGain();
  g.gain.setValueAtTime(0.0001, bus.ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, bus.ctx.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, bus.ctx.currentTime + duration);
  g.connect(bus.sfx);
  return g;
}

export function sfxWhoosh() {
  if (!bus || muted) return;
  const ctx = bus.ctx;
  const o = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(900, ctx.currentTime);
  f.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.16);
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.16);
  const g = envGain(0.18, 0.08);
  if (!g) return;
  o.connect(f);
  f.connect(g);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}

export function sfxOvertake() {
  if (!bus || muted) return;
  const ctx = bus.ctx;
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(520 * (0.96 + Math.random() * 0.08), ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
  const g = envGain(0.16, 0.12);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(ctx.currentTime + 0.18);
}

export function sfxTicket() {
  if (!bus || muted) return;
  const ctx = bus.ctx;
  const tones = [880, 620, 880];
  tones.forEach((n, i) => {
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = n;
    const g = ctx.createGain();
    const t = ctx.currentTime + i * 0.09;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g);
    g.connect(bus!.sfx);
    o.start(t);
    o.stop(t + 0.12);
  });
}

export function sfxCrash() {
  if (!bus || muted) return;
  const ctx = bus.ctx;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  const g = envGain(0.45, 0.4);
  if (!g) return;
  src.connect(f);
  f.connect(g);
  src.start();
}

export function sfxClear() {
  if (!bus || muted) return;
  const ctx = bus.ctx;
  const notes = [392, 523, 659];
  notes.forEach((n, i) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = n;
    const g = ctx.createGain();
    const t = ctx.currentTime + i * 0.09;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g);
    g.connect(bus!.sfx);
    o.start(t);
    o.stop(t + 0.3);
  });
}

export function startEngine() {
  if (!bus) return;
  stopEngine();
  const ctx = bus.ctx;
  const o = ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = 70;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 420;
  const g = ctx.createGain();
  g.gain.value = muted ? 0 : 0.045;
  o.connect(f);
  f.connect(g);
  g.connect(bus.music);
  o.start();
  bus.engine = o;
  bus.engineGain = g;
  bus.engineFilter = f;
}

export function updateEngine(speed: number, playing: boolean) {
  if (!bus?.engine || !bus.engineFilter || !bus.engineGain) return;
  const t = bus.ctx.currentTime;
  const freq = 55 + speed * 0.22;
  bus.engine.frequency.setTargetAtTime(freq, t, 0.05);
  bus.engineFilter.frequency.setTargetAtTime(280 + speed * 0.5, t, 0.08);
  bus.engineGain.gain.setTargetAtTime(playing && !muted ? 0.045 : 0, t, 0.08);
}

export function stopEngine() {
  if (!bus?.engine) return;
  try {
    bus.engine.stop();
  } catch {
    /* already stopped */
  }
  bus.engine.disconnect();
  bus.engineGain?.disconnect();
  bus.engineFilter?.disconnect();
  bus.engine = null;
  bus.engineGain = null;
  bus.engineFilter = null;
}

export function resumeAudio() {
  if (bus && bus.ctx.state === "suspended") void bus.ctx.resume();
}
