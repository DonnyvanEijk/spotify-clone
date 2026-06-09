let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(
  context: AudioContext,
  freq: number,
  gain: number,
  start: number,
  duration: number
) {
  const osc = context.createOscillator();
  const g = context.createGain();
  osc.connect(g);
  g.connect(context.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.01);
}

export function playSendSound() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    tone(c, 880, 0.12, t, 0.08);
    tone(c, 1100, 0.08, t + 0.06, 0.1);
  } catch {}
}

export function playReceiveSound() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    tone(c, 523, 0.08, t, 0.15);
    tone(c, 659, 0.06, t + 0.1, 0.18);
  } catch {}
}
