import { create } from "zustand";

interface EditAlbumModalStore {
    isOpen: boolean;
    albumId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useEditAlbumModal = create<EditAlbumModalStore>((set) => ({
    isOpen: false,
    albumId: null,
    onOpen: (id: string) => set({ isOpen: true, albumId: id }),
    onClose: () => set({ isOpen: false, albumId: null }),
}))