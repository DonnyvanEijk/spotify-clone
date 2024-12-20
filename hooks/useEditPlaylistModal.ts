import { create } from "zustand";

interface EditPlaylistModalStore {
    isOpen: boolean;
    playlistId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useEditPlaylistModal = create<EditPlaylistModalStore>((set) => ({
    isOpen: false,
    playlistId: null,
    onOpen: (id: string) => set({ isOpen: true, playlistId: id }),
    onClose: () => set({ isOpen: false, playlistId: null }),
}))