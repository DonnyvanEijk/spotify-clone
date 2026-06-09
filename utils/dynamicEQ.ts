import { EQ_FREQUENCIES, getAnalyser, syncEQ } from "./equalizerEngine";

const SMOOTHING = 0.91;  
const MAX_GAIN  = 7;    
const SKIP      = 4;   

let animFrame: number | null = null;
let smoothed   = new Array(10).fill(0) as number[];
let frameCount = 0;

/** Average dB energy in a 1/3-octave window around `freq`. Returns -100 if no signal. */
function bandEnergy(data: Float32Array, sampleRate: number, freq: number): number {
  const binWidth = (sampleRate / 2) / data.length;
  const lo = Math.max(0, Math.floor((freq / 1.26) / binWidth));
  const hi = Math.min(data.length - 1, Math.ceil((freq * 1.26) / binWidth));
  let sum = 0, count = 0;
  for (let i = lo; i <= hi; i++) {
    if (data[i] > -100) { sum += data[i]; count++; }
  }
  return count > 0 ? sum / count : -100;
}
export function startDynamicEQ(onUpdate: (gains: number[]) => void): void {
  if (animFrame !== null) return;

  const tick = () => {
    animFrame = requestAnimationFrame(tick);

    const node = getAnalyser();
    if (!node) return;

    const data = new Float32Array(node.frequencyBinCount);
    node.getFloatFrequencyData(data);

    const energies = EQ_FREQUENCIES.map(f => bandEnergy(data, node.context.sampleRate, f));
    const valid = energies.filter(e => e > -90);
    if (valid.length === 0) return;

    const mean = valid.reduce((a, b) => a + b, 0) / valid.length;

    const targets = energies.map(e =>
      e < -90 ? 0 : Math.max(-MAX_GAIN, Math.min(MAX_GAIN, -(e - mean) * 0.55))
    );

    smoothed = smoothed.map((g, i) => g * SMOOTHING + targets[i] * (1 - SMOOTHING));
    syncEQ(smoothed, true);

    frameCount++;
    if (frameCount % SKIP === 0) {
      onUpdate([...smoothed]);
    }
  };

  animFrame = requestAnimationFrame(tick);
}

export function stopDynamicEQ(): void {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  smoothed   = new Array(10).fill(0);
  frameCount = 0;
}
