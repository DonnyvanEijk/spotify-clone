import { create } from "zustand";

interface CreateExistingRadioModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useCreateExistingRadioModal = create<CreateExistingRadioModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))