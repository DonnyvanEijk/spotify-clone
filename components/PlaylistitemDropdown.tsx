'use client';

import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { BiTrash } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MdPlaylistAddCheck } from "react-icons/md";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";

interface PlaylistItemDropdownProps {
    songId: string;
    playlistId: string;
    isOwner: boolean;
}

const PlaylistItemDropdown = ({ songId, playlistId, isOwner }: PlaylistItemDropdownProps) => {
    const authModal = useAuthModal();
    const supabaseClient = useSupabaseClient();
    const createPlaylistModal = useCreatePlaylistModal();
    const addToPlaylistModal = useAddToPlaylistModal();
    const router = useRouter();
    const { user } = useUser();

    const [isOpen, setIsOpen] = useState(false);
    const [userHasPlaylist, setUserHasPlaylist] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        const checkUserPlaylist = async () => {
            const { data } = await supabaseClient
                .from("playlists")
                .select("id")
                .eq("user_id", user.id);

            if (data) setUserHasPlaylist(true);
        };

        checkUserPlaylist();
    }, [supabaseClient, user?.id]);

    const ClickRemoveFromPlaylist = async () => {
        if (!user) return authModal.onOpen();

        const { error } = await supabaseClient
            .from('playlist_songs')
            .delete()
            .eq('song_id', songId)
            .eq('playlist_id', playlistId)
            .eq('user_id', user.id);

        if (error) toast.error("Failed to remove song from playlist");
        else {
            toast.success("Song removed from playlist");
            router.refresh();
        }
    };

    const ClickAddToPlaylist = async () => {
        if (!user) return authModal.onOpen();
        if (!userHasPlaylist) {
            toast.error("You need to create a playlist first!");
            return createPlaylistModal.onOpen();
        }
        addToPlaylistModal.onOpen(songId);
    };

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <button className="focus:outline-none">
                    <FaEllipsisH
                        size={20}
                        onClick={() => setIsOpen(!isOpen)}
                        className={`text-neutral-400 hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="bg-neutral-900 rounded-xl p-2 shadow-lg min-w-[200px] space-y-1 animate-slide-up-fade"
                    sideOffset={5}
                >
                    {isOwner && (
                        <DropdownMenu.Item
                            className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                            onClick={ClickRemoveFromPlaylist}
                        >
                            Remove <BiTrash size={18} />
                        </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-green-400 hover:bg-green-500/20 hover:text-green-300 transition"
                        onClick={ClickAddToPlaylist}
                    >
                        Add to Playlist <MdPlaylistAddCheck size={18} />
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default PlaylistItemDropdown;
