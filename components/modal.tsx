import * as Dialog from '@radix-ui/react-dialog';
import { IoMdClose } from 'react-icons/io';

type Props = {
    isOpen: boolean;
    onChange: (open: boolean) => void;
    title: string;
    description: string;
    children: React.ReactNode;
};

export const Modal = ({ isOpen, onChange, title, description, children }: Props) => {
    return (
        <Dialog.Root open={isOpen} defaultOpen={isOpen} onOpenChange={onChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

                <Dialog.Content
                    className="
                        fixed top-1/2 left-1/2
                        max-h-[85vh] w-[90vw] max-w-[450px]
                        md:h-auto
                        -translate-x-1/2 -translate-y-1/2
                        rounded-xl
                        bg-white/5 backdrop-blur-[20px] 
                        border border-white/10
                        shadow-lg shadow-black/40
                        p-6
                        focus:outline-none
                        overflow-y-auto
                        animate-slide-up-fade
                    "
                >
                    <Dialog.Title className="text-xl font-bold text-center text-white mb-3">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-center text-sm text-neutral-300 mb-5">
                        {description}
                    </Dialog.Description>

                    <div>{children}</div>

                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-white transition">
                            <IoMdClose size={20} />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
