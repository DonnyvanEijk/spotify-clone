import { create } from "zustand";

interface DeleteAlbumModalStore {
    isOpen: boolean;
    albumId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useDeleteAlbumModal = create<DeleteAlbumModalStore>((set) => ({
    isOpen: false,
    albumId: null,
    onOpen: (id: string) => set({ isOpen: true, albumId: id }),
    onClose: () => set({ isOpen: false, albumId: null }),
}));