import { create } from "zustand";

interface useBatchAddToPlaylistModalStore {
    isOpen: boolean;
    songId: string[] | [];
    selectedPlaylistId: string | null;
    onOpen: (id: string[], selectedPlaylistId: string) => void;
    onClose: () => void;
}

export const useBatchAddToPlaylistModal = create<useBatchAddToPlaylistModalStore>((set) => ({
    isOpen: false,
    songId: [],
    selectedPlaylistId: null,
    onOpen: (id: string[], selectedPlaylistId: string) => set({ isOpen: true, songId: id, selectedPlaylistId }),
    onClose: () => set({ isOpen: false, songId: [] }),
}));