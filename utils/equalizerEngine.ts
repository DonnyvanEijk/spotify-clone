import { Howler } from "howler";

export const EQ_FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const EQ_LABELS = ["31", "63", "125", "250", "500", "1K", "2K", "4K", "8K", "16K"];

let filters: BiquadFilterNode[] | null = null;
let analyser: AnalyserNode | null = null;
let connected = false;

function howlerCtx(): AudioContext | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (Howler as any).ctx ?? null;
}

function howlerMaster(): GainNode | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (Howler as any).masterGain ?? null;
}

function ensureChain(): BiquadFilterNode[] | null {
  const c = howlerCtx();
  const m = howlerMaster();
  if (!c || !m) return null;

  if (filters && filters[0].context !== c) {
    filters = null;
    analyser = null;
    connected = false;
  }

  if (!filters) {
    filters = EQ_FREQUENCIES.map((freq, i) => {
      const f = c.createBiquadFilter();
      f.type = i === 0 ? "lowshelf" : i === 9 ? "highshelf" : "peaking";
      f.frequency.value = freq;
      f.Q.value = 1.4;
      f.gain.value = 0;
      return f;
    });
  }

  if (!analyser) {
    analyser = c.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.5;
  }

  if (!connected) {
    try { m.disconnect(); } catch {}
    m.connect(analyser);
    let prev: AudioNode = analyser;
    for (const f of filters) { prev.connect(f); prev = f; }
    prev.connect(c.destination);
    connected = true;
  }

  return filters;
}

export function syncEQ(gains: number[], enabled: boolean): void {
  const chain = ensureChain();
  if (!chain) return;
  gains.forEach((g, i) => { chain[i].gain.value = enabled ? g : 0; });
}

export function getAnalyser(): AnalyserNode | null {
  ensureChain(); 
  return analyser;
}
