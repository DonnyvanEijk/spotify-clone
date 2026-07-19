import { create } from "zustand";

interface EditRadioModalStore {
    isOpen: boolean;
    radioId: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useEditRadioModal = create<EditRadioModalStore>((set) => ({
    isOpen: false,
    radioId: null,
    onOpen: (id: string) => set({ isOpen: true, radioId: id }),
    onClose: () => set({ isOpen: false, radioId: null }),
}));
