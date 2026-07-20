import { create } from 'zustand';

interface PlayerStore {
  ids: string[];
  activeId?: string;
  volume: number;
  loop: boolean;
  shuffle: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
  insertAfterCurrent: (id: string) => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  volume: 1,
  loop: false,
  shuffle: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleLoop: () => set((state) => ({ loop: !state.loop })),
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids }),
  setVolume: (volume: number) => set({ volume }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setCurrentTime: (currentTime: number) => set({ currentTime }),
  setDuration: (duration: number) => set({ duration }),
  reset: () => set({ ids: [], activeId: undefined, volume: 1, loop: false }),
  insertAfterCurrent: (id: string) =>
    set((state) => {
      const currentIndex = state.ids.findIndex((i) => i === state.activeId);
      const newIds = [...state.ids];
      if (currentIndex === -1) {
        newIds.unshift(id);
      } else {
        newIds.splice(currentIndex + 1, 0, id);
      }
      return { ids: newIds, activeId: id };
    }),
}));

export default usePlayer;
