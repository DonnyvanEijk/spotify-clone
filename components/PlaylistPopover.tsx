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
import { MdOutlineModeEditOutline, MdPlaylistAdd, MdDragIndicator } from "react-icons/md";
import { Song } from "@/types";
import useReorderMode from "@/hooks/useReorderMode";

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
    const reorderMode = useReorderMode();
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
                    className="min-w-52.5 overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50"
                    sideOffset={5}
                >
                    {isOwner && (
                        <>
                            <DropdownMenu.Item
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none"
                                onClick={handleDeletePlaylist}
                            >
                                <HiOutlineTrash size={15} /> Delete
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                                onClick={handleEditPlaylist}
                            >
                                <MdOutlineModeEditOutline size={15} /> Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                                onClick={() => reorderMode.onOpen(playlistId, "playlist")}
                            >
                                <MdDragIndicator size={15} /> Adjust order
                            </DropdownMenu.Item>
                            <div className="my-1 h-px bg-white/8 mx-2" />
                        </>
                    )}

                    <DropdownMenu.Item
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none data-disabled:opacity-35 data-disabled:pointer-events-none"
                        onClick={handleDownload}
                        disabled={!subscription}
                    >
                        {subscription ? <TbDownload size={15} /> : <TbDownloadOff size={15} />}
                        {subscription ? "Download" : "Upgrade to Pro"}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                        onClick={handleBatchAddToPlaylist}
                    >
                        <MdPlaylistAdd size={15} /> Add to Playlist
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                        onClick={handleClonePlaylist}
                    >
                        <RiPlayListFill size={15} /> Clone
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default PlaylistPopover;