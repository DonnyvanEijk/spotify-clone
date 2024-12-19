
import { create } from "zustand";

interface useDeletePlaylistStore {
    isOpen: boolean;
    playlistId: string | null; 
    onOpen: (id: string) => void; // Update onOpen to accept an id
    onClose: () => void;
}

export const useDeletePlaylist = create<useDeletePlaylistStore>((set) => ({
    isOpen: false,
    playlistId: null, 
    onOpen: (id: string) => set({ isOpen: true, playlistId: id }), 
    onClose: () => set({ isOpen: false, playlistId: null }),
}));