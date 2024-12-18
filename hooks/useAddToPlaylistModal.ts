import { create } from "zustand";

interface useAddToPlaylistModalStore {
    isOpen: boolean;
    songId: string | null; // Add songId to the store
    onOpen: (id: string) => void; // Update onOpen to accept an id
    onClose: () => void;
}

export const useAddToPlaylistModal = create<useAddToPlaylistModalStore>((set) => ({
    isOpen: false,
    songId: null, // Initialize songId as null
    onOpen: (id: string) => set({ isOpen: true, songId: id }), // Set songId when opening
    onClose: () => set({ isOpen: false, songId: null }), // Reset songId when closing
}));