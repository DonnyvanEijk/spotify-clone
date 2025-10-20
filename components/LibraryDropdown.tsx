"use client";

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AiOutlinePlus, AiOutlineUp, AiOutlineUpload } from "react-icons/ai";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUploadModal } from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useCreateAlbumModal } from "@/hooks/useCreateAlbumModal";
import { useUploadAlbumModal } from "@/hooks/useUploadAlbumModal";

const LibraryDropdown = () => {
    const subscribeModal = useSubscribeModal();
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const createPlaylistModal = useCreatePlaylistModal();
    const uploadAlbumModal = useUploadAlbumModal();
    const createAlbumModal = useCreateAlbumModal();
    const { user, subscription } = useUser();

    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => setIsOpen(!isOpen);

    const ClickNewSong = async () => {
        if (!user) return authModal.onOpen();
        if (!subscription) return subscribeModal.onOpen();
        return uploadModal.onOpen();
    }

    const ClickUploadAlbum = async () => {
        if (!user) return authModal.onOpen();
        if (!subscription) return subscribeModal.onOpen();
        return uploadAlbumModal.onOpen();
    }

    const ClickNewPlaylist = async () => {
        if (!user) return authModal.onOpen();
        return createPlaylistModal.onOpen();
    }

    const ClickNewAlbum = async () => {
        if (!user) return authModal.onOpen();
        if (!subscription) return subscribeModal.onOpen();
        return createAlbumModal.onOpen();
    }

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className="focus:outline-none"
                    aria-label="Library actions"
                >
                    <AiOutlineUp
                        size={20}
                        onClick={handleToggle}
                        className={`text-neutral-400 cursor-pointer hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="
                        py-2 min-w-[220px] rounded-xl
                        bg-gradient-to-br from-neutral-800/40 to-neutral-700/20
                        backdrop-blur-md border border-neutral-700/40
                        shadow-lg shadow-purple-500/20
                        will-change-[opacity,transform]
                        data-[side=bottom]:animate-slideUpAndFade
                        data-[side=left]:animate-slideRightAndFade
                        data-[side=right]:animate-slideLeftAndFade
                        data-[side=top]:animate-slideDownAndFade
                    "
                    sideOffset={5}
                >
                    <DropdownMenu.Item
                        className="flex justify-between items-center cursor-pointer px-4 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700/30 transition"
                        onClick={ClickNewSong}
                    >
                        Upload New Song <AiOutlineUpload size={20} />
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex justify-between items-center cursor-pointer px-4 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700/30 mt-1.5 transition"
                        onClick={ClickNewPlaylist}
                    >
                        Create New Playlist <AiOutlinePlus size={20} />
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex justify-between items-center cursor-pointer px-4 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700/30 mt-1.5 transition"
                        onClick={ClickNewAlbum}
                    >
                        Create New Album <AiOutlinePlus size={20} />
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex justify-between items-center cursor-pointer px-4 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700/30 mt-1.5 transition"
                        onClick={ClickUploadAlbum}
                    >
                        Upload Album <AiOutlineUpload size={20} />
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default LibraryDropdown;
