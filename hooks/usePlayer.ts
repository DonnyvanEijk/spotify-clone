import { create } from 'zustand';

interface PlayerStore {
  ids: string[];
  activeId?: string;
  volume: number;
  loop: boolean;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  setVolume: (volume: number) => void;
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  volume: 1,
  loop: false,
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids }),
  setVolume: (volume: number) => set({ volume }),
  reset: () => set({ ids: [], activeId: undefined, volume: 1, loop: false }),
}));

export default usePlayer;