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
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in z-50" />

                <Dialog.Content
                    className="
                        fixed top-1/2 left-1/2 z-50
                        max-h-[85vh] w-[90vw] max-w-115
                        md:h-auto
                        -translate-x-1/2 -translate-y-1/2
                        rounded-2xl
                        bg-neutral-950/95 backdrop-blur-xl
                        border border-white/10
                        shadow-2xl shadow-black/60
                        p-6
                        focus:outline-none
                        overflow-y-auto
                        animate-slide-up-fade
                    "
                >
                    <div className="pr-8 mb-5">
                        <Dialog.Title className="text-lg font-semibold text-white leading-tight">
                            {title}
                        </Dialog.Title>
                        {description && (
                            <Dialog.Description className="text-sm text-neutral-400 mt-1">
                                {description}
                            </Dialog.Description>
                        )}
                    </div>

                    <div>{children}</div>

                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/8 transition-all duration-150">
                            <IoMdClose size={18} />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
