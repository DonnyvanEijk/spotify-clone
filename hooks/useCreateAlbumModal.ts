import { create } from "zustand";

interface CreateAlbumModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useCreateAlbumModal = create<CreateAlbumModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))