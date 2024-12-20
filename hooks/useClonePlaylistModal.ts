import { create } from "zustand";

interface useClonePlaylistModalStore {
    isOpen: boolean;
    songId: string[] | [];
    originPlaylistId: string | null;
    onOpen: (id: string[], originPlaylistId: string) => void;
    onClose: () => void;
}

export const useClonePlaylistModal = create<useClonePlaylistModalStore>((set) => ({
    isOpen: false,
    songId: [],
    originPlaylistId: null,
    onOpen: (id: string[], originPlaylistId: string) => set({ isOpen: true, songId: id, originPlaylistId }),
    onClose: () => set({ isOpen: false, songId: [] }),
}));