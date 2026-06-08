import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomStatusStore {
  customStatus: string; // e.g. "🎸 Jamming" — empty string means none set
  setCustomStatus: (v: string) => void;
  clearCustomStatus: () => void;
}

const useCustomStatus = create<CustomStatusStore>()(
  persist(
    (set) => ({
      customStatus: "",
      setCustomStatus: (v) => set({ customStatus: v }),
      clearCustomStatus: () => set({ customStatus: "" }),
    }),
    { name: "donbeat-custom-status" }
  )
);

export default useCustomStatus;
