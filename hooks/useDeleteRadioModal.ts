import { create } from "zustand";

interface DeleteRadioModalStore {
    isOpen: boolean;
    radioId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useDeleteRadioModal = create<DeleteRadioModalStore>((set) => ({
    isOpen: false,
    radioId: null,
    onOpen: (id: string) => set({ isOpen: true, radioId: id }),
    onClose: () => set({ isOpen: false, radioId: null }),
}));
