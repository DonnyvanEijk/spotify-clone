"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { FaEllipsisH } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylistModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";
import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import { useEditPlaylistModal } from "@/hooks/useEditPlaylistModal";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { RiPlayListFill } from "react-icons/ri";
import { MdOutlineModeEditOutline, MdPlaylistAdd } from "react-icons/md";
import { Song } from "@/types";

interface PlaylistPopoverProps {
    playlistId: string;
    isOwner?: boolean;
}

const PlaylistPopover: React.FC<PlaylistPopoverProps> = ({ playlistId, isOwner }) => {
    const supabaseClient = useSupabaseClient();
    const authModal = useAuthModal();
    const subscribeModal = useSubscribeModal();
    const editPlaylistModal = useEditPlaylistModal();
    const deletePlaylistModal = useDeletePlaylist();
    const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
    const clonePlaylistModal = useClonePlaylistModal();
    const { user, subscription } = useUser();

    const handleDeletePlaylist = async () => {
        deletePlaylistModal.onOpen(playlistId);
    }

    const handleDownload = async () => {
        if (!subscription) {
            toast.error("Upgrade to pro to download");
            return;
        }

        const { data: playlistData, error: playlistError } = await (supabaseClient
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single() as any);

        if (playlistError || !playlistData) {
            toast.error('Error fetching playlist');
            return;
        }

        const { data: PsData, error: PsError } = await (supabaseClient
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', playlistId) as any);

        if (PsError || !PsData) {
            toast.error('Error fetching playlist songs');
            return;
        }

        // Explicitly type 'song' and convert to number for the songs table query
        const numericSongIds = PsData.map((song: { song_id: any }) => Number(song.song_id));

        const { data: SData, error: SError } = await supabaseClient
            .from('songs')
            .select('*')
            .in('id', numericSongIds);

        if (SError || !SData) {
            toast.error('Error fetching songs');
            return;
        }

        // Use your Song interface for the zip loop
        const songs = SData as unknown as Song[];

        const zip = new JSZip();
        const folder = zip.folder(playlistData.name);

        if (playlistData.image_path) {
            const { data: imageData, error: imageError } = await supabaseClient.storage
                .from('images')
                .download(playlistData.image_path);

            if (!imageError && imageData && folder) {
                folder.file(`${playlistData.name}.png`, imageData);
            }
        }

        for (const song of songs) {
            if (!song.song_path) continue;
            
            const { data, error } = await supabaseClient.storage
                .from('songs')
                .download(song.song_path);

            if (!error && data && folder) {
                folder.file(`${song.title}.mp3`, data);
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${playlistData.name}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('Playlist downloaded successfully');
    }

    const handleClonePlaylist = async () => {
        if (!user) return authModal.onOpen();
        if (!subscription) return subscribeModal.onOpen();

        const { data, error } = await (supabaseClient
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', playlistId) as any);

        if (error || !data) return;

        // Convert to strings for the modal
        const stringSongIds = data.map((song: { song_id: any }) => String(song.song_id));
        clonePlaylistModal.onOpen(stringSongIds, playlistId);
    }

    const handleBatchAddToPlaylist = async () => {
        const { data, error } = await (supabaseClient
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', playlistId) as any);

        if (error || !data) return;

        // Convert to strings for the modal
        const stringSongIds = data.map((song: { song_id: any }) => String(song.song_id));
        batchAddToPlaylistModal.onOpen(stringSongIds, playlistId);
    }

    const handleEditPlaylist = async () => {
        editPlaylistModal.onOpen(playlistId);
    }

    return (
      <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex justify-center items-center focus:outline-none">
                    <FaEllipsisH className="text-neutral-400 hover:text-white transition" size={24} />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="bg-neutral-900/95 backdrop-blur-md rounded-xl p-2 shadow-lg min-w-[220px] space-y-1 z-[100]"
                    sideOffset={5}
                >
                    {isOwner && (
                        <>
                            <DropdownMenu.Item
                                className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 transition outline-none"
                                onClick={handleDeletePlaylist}
                            >
                                Delete <HiOutlineTrash size={18} />
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition outline-none"
                                onClick={handleEditPlaylist}
                            >
                                Edit <MdOutlineModeEditOutline size={18} />
                            </DropdownMenu.Item>
                            <div className="h-px bg-white/10 my-1" />
                        </>
                    )}

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-green-400 hover:bg-green-500/10 hover:text-green-300 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleDownload}
                        disabled={!subscription}
                    >
                        <span>{subscription ? "Download" : "Upgrade to Pro"}</span>
                        {subscription ? <TbDownload size={18} /> : <TbDownloadOff size={18} />}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-purple-400 hover:bg-white/5 hover:text-white transition outline-none"
                        onClick={handleBatchAddToPlaylist}
                    >
                        Add to Playlist <MdPlaylistAdd size={18} />
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 transition outline-none"
                        onClick={handleClonePlaylist}
                    >
                        Clone <RiPlayListFill size={18} />
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default PlaylistPopover;