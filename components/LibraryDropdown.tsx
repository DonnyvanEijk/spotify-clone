"use client";

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AiOutlinePlus, AiOutlineUp } from "react-icons/ai";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUploadModal } from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";

const LibraryDropdown = () => {
    const subscribeModal = useSubscribeModal();
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const createPlaylistModal = useCreatePlaylistModal();

    const { user, subscription } = useUser();

    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const ClickNewSong = () => {
        if (!user) {
            return authModal.onOpen();
        }
        if (!subscription) {
            return subscribeModal.onOpen();
        }

        return uploadModal.onOpen();
    }

    const ClickNewPlaylist = () => {
        if (!user) {
            return authModal.onOpen();
        }
        if (!subscription) {
            return subscribeModal.onOpen();
        }

        return createPlaylistModal.onOpen();
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="focus:outline-none" aria-label="Customise options">
                    <AiOutlineUp
                        size={20}
                        onClick={handleToggle}
                        className={`text-neutral-400 cursor-pointer hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="py-2 min-w-[220px] rounded-md bg-neutral-800 p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                    sideOffset={5}
                >
                    <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 mb-1.5 transition" onClick={ClickNewSong}>
                        Upload New Song <AiOutlinePlus size={20} className="text-neutral-400" />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 mt-1.5 transition" onClick={ClickNewPlaylist}>
                        Create New Playlist <AiOutlinePlus size={20} className="text-neutral-400" />
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default LibraryDropdown;