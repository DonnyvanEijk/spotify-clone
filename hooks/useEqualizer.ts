import { create } from "zustand";

export const EQ_PRESETS: Record<string, { label: string; bands: number[]; dynamic?: true }> = {
  dynamic:    { label: "Dynamic",    bands: [0,  0,  0,  0,  0,  0,  0,  0,  0,  0], dynamic: true },
  flat:       { label: "Flat",       bands: [0,  0,  0,  0,  0,  0,  0,  0,  0,  0] },
  bass:       { label: "Bass Boost", bands: [6,  5,  4,  2,  0,  0,  0,  0,  0,  0] },
  treble:     { label: "Treble",     bands: [0,  0,  0,  0,  0,  0,  2,  4,  5,  6] },
  pop:        { label: "Pop",        bands: [3,  2,  0, -1, -2, -1,  0,  2,  3,  3] },
  rock:       { label: "Rock",       bands: [5,  4,  3,  0, -1,  0,  2,  4,  5,  5] },
  jazz:       { label: "Jazz",       bands: [3,  2,  1,  2, -1, -1,  0,  1,  2,  3] },
  classical:  { label: "Classical",  bands: [4,  3,  2,  0,  0,  0,  0,  2,  3,  4] },
  electronic: { label: "Electronic", bands: [6,  5,  2,  0, -2,  0,  2,  3,  4,  5] },
  vocal:      { label: "Vocal",      bands: [0,  0,  0,  1,  2,  4,  4,  3,  1,  0] },
};

interface EqualizerStore {
  enabled: boolean;
  preset: string;
  bands: number[];
  /** Live band values when preset === "dynamic". Used only for display. */
  dynamicBands: number[];
  setEnabled: (v: boolean) => void;
  setBand: (index: number, gain: number) => void;
  applyPreset: (name: string) => void;
  hydrate: (enabled: boolean, preset: string, bands: number[]) => void;
  setDynamicBands: (bands: number[]) => void;
}

const useEqualizer = create<EqualizerStore>((set) => ({
  enabled: true,
  preset: "flat",
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  dynamicBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  setEnabled: (enabled) => set({ enabled }),

  setBand: (index, gain) =>
    set((s) => {
      const bands = [...s.bands];
      bands[index] = gain;
      return { bands, preset: "custom" };
    }),

  applyPreset: (name) => {
    const p = EQ_PRESETS[name];
    if (!p) return;
    set({ preset: name, bands: [...p.bands] });
  },

  hydrate: (enabled, preset, bands) => set({ enabled, preset, bands }),
  setDynamicBands: (dynamicBands) => set({ dynamicBands }),
}));

export default useEqualizer;
