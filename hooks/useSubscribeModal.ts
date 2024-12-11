import {create} from "zustand"
type Props = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useSubscribeModal = create<Props>((set) => ({
isOpen: false,
onOpen: () => set({isOpen: true}),
onClose: () => set({isOpen: false}),
}))