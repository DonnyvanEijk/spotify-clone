import { create } from 'zustand';

interface PlayerStore {
  ids: string[];
  activeId?: string;
  volume: number;
  loop: boolean;
  shuffle: boolean;
  toggleShuffle: () => void;
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
  shuffle: false,
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids }),
  setVolume: (volume: number) => set({ volume }),
  reset: () => set({ ids: [], activeId: undefined, volume: 1, loop: false }),
}));

export default usePlayer;