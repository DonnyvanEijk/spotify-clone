"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { FaEllipsisH } from "react-icons/fa";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";
import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { RiPlayListFill } from "react-icons/ri";
import { MdPlaylistAdd } from "react-icons/md";

const LikedPopover = () => {
    const supabaseClient = useSupabaseClient();
    const authModal = useAuthModal();
    const subscribeModal = useSubscribeModal();
    const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
    const clonePlaylistModal = useClonePlaylistModal();
    const { user, subscription } = useUser();

    const handleDownload = async () => {
        const { data: PsData, error: PsError } = await supabaseClient
            .from('liked_songs')
            .select('song_id')
            .eq('user_id', user?.id);

        if (PsError) {
            console.error('Error fetching playlist songs:', PsError);
            toast.error('Error fetching playlist songs');
            return;
        }

        const songIds = PsData.map((song) => song.song_id);

        const { data: SData, error: SError } = await supabaseClient
            .from('songs')
            .select('*')
            .in('id', songIds);

        if (SError) {
            console.error('Error fetching songs:', SError);
            toast.error('Error fetching songs');
            return;
        }

        const songs = SData.map((song) => song);

        const zip = new JSZip();
        const folder = zip.folder("liked Songs");

        for (const song of songs) {
            const { data, error } = await supabaseClient.storage.from('songs').download(song.song_path);

            if (error) {
                console.error('Error downloading file:', error);
                toast.error('Error downloading file');
                return;
            }

            if (folder) {
                folder.file(`${song.title}.mp3`, data);
            } else {
                console.error('Folder is null');
                toast.error('Folder is not available');
                return;
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `liked_songs.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Playlist downloaded successfully');
    }

    const handleClonePlaylist = async () => {
        if (!user) {
            authModal.onOpen();
            return;
        }

        if (!subscription) {
            subscribeModal.onOpen();
            return;
        }

        const { data, error } = await supabaseClient
            .from('liked_songs')
            .select('song_id')
            .eq('user_id', user?.id);

        if (error) {
            console.error('Error fetching playlist songs:', error);
            return;
        }

        const songIds = data.map((song) => song.song_id);

        clonePlaylistModal.onOpen(songIds, 'liked');
    }

    const handleBatchAddToPlaylist = async () => {
        const { data, error } = await supabaseClient
            .from('liked_songs')
            .select('song_id')
            .eq('user_id', user?.id);

        if (error) {
            console.error('Error fetching playlist songs:', error);
            return;
        }

        const songIds = data.map((song) => song.song_id);

        batchAddToPlaylistModal.onOpen(songIds, 'liked');
    }

    return (
        <div>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className="flex flex-col justify-center">
                        <FaEllipsisH className="text-neutral-400 hover:text-neutral-300 transition hover:outline-none" size={25} />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className="py-2 min-w-[220px] rounded-md bg-neutral-800 p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                    >
                        <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 disabled:text-neutral-600 px-3 transition" onClick={handleDownload} disabled={!subscription}>
                            {subscription ? (
                                <>
                                    Donwload Playlist <TbDownload size={20} className="text-neutral-400" />
                                </>
                            ) : (
                                <>
                                    Upgrade to pro to Downloa <TbDownloadOff size={20} className="text-neutral-400" />
                                </>
                            )}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 transition" onClick={handleBatchAddToPlaylist} disabled={!user}>
                            {!user ? (
                                <>Login to add to other Playlist <MdPlaylistAdd size={20} className="text-neutral-400" /></>
                            ) : (
                                <>
                                    Add to other Playlist <MdPlaylistAdd size={20} className="text-neutral-400" />
                                </>
                            )}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 transition" onClick={handleClonePlaylist} disabled={!subscription}>
                            {!subscription ? (
                                <>Upgrade to pro to clone Playlist <RiPlayListFill size={20} className="text-neutral-400" /></>
                            ) : (
                                <>
                                    Clone Playlist <RiPlayListFill size={20} className="text-neutral-400" />
                                </>
                            )}
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
}

export default LikedPopover;
