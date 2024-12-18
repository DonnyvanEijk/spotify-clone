"use client";

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
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";


interface PlaylistItemDropdownProps {
    songId: string;
    playlistId: string;
    isOwner: boolean;
}

const PlaylistItemDropdown = ({ songId, playlistId, isOwner }: PlaylistItemDropdownProps) => {
    const authModal = useAuthModal();
    const subscribeModal = useSubscribeModal();
    const supabaseClient = useSupabaseClient();
    const createPlaylistModal = useCreatePlaylistModal();
    const addToPlaylistModal = useAddToPlaylistModal();
    const router = useRouter();

    const { user, subscription } = useUser();

    const [isOpen, setIsOpen] = useState(false);

    const [userHasPLaylist, setUserHasPlaylist] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const checkUserPlaylist = async () => {
            const { data, error } = await supabaseClient
                .from("playlists")
                .select("id")
                .eq("user_id", user.id);

            if (error || !data) {
                console.log(error, "data: ", data);
                // toast.error("You need to create a playlist first!");
            }

            if (data) {
                setUserHasPlaylist(true);
            }
        };

        checkUserPlaylist();
    }, [supabaseClient, user?.id]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const ClickRemovefromPlaylist = async () => {
        if (!user) {
            return authModal.onOpen();
        }

        const { error } = await supabaseClient
            .from('playlist_songs')
            .delete()
            .eq('song_id', songId)
            .eq('playlist_id', playlistId)
            .eq('user_id', user.id);

        if (error) {
            toast.error("Failed to remove song from playlist");
            console.error("Error removing song from playlist:", error);
        } else {
            toast.success("Song removed from playlist");
            router.refresh()
        }
    }

    const ClickAddToPlaylist = async () => {
        if (!user) {
            return authModal.onOpen();
        }

        if (!subscription) {
            return subscribeModal.onOpen();
        }
        // console.log("userHasPLaylist: ", userHasPLaylist);

        if (!userHasPLaylist) {
            toast.error("You need to create a playlist first!");
            return createPlaylistModal.onOpen();
        }
        console.log("Opening addToPlaylistModal with songId: ", songId);
        addToPlaylistModal.onOpen(songId);
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="focus:outline-none" aria-label="Customise options">
                    <FaEllipsisH
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
                    {isOwner && (
                        <DropdownMenu.Item
                            className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 mb-1.5 transition"
                            onClick={ClickRemovefromPlaylist}
                        >
                            Remove From Playlist <BiTrash size={20} className="text-neutral-400" />
                        </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                        className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 mt-1.5 transition"
                        onClick={ClickAddToPlaylist}
                    >
                        Add to playlist <MdPlaylistAddCheck size={20} className="text-neutral-400" />
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default PlaylistItemDropdown;