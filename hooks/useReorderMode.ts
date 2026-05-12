import { create } from "zustand";

interface ReorderModeStore {
  isActive: boolean;
  id: string | null;
  type: "playlist" | "album" | null;
  onOpen: (id: string, type: "playlist" | "album") => void;
  onClose: () => void;
}

const useReorderMode = create<ReorderModeStore>((set) => ({
  isActive: false,
  id: null,
  type: null,
  onOpen: (id, type) => set({ isActive: true, id, type }),
  onClose: () => set({ isActive: false, id: null, type: null }),
}));

export default useReorderMode;
