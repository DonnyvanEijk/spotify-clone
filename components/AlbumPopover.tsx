"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { FaEllipsisH } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { MdOutlineModeEditOutline, MdDragIndicator, MdPlaylistAdd } from "react-icons/md";
import { Song } from "@/types"; // Importing your existing Song interface
import useReorderMode from "@/hooks/useReorderMode";
import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";

interface AlbumPopoverProps {
    albumId: string;
    isOwner?: boolean;
}

const AlbumPopover: React.FC<AlbumPopoverProps> = ({ albumId, isOwner }) => {
    const supabaseClient = useSupabaseClient();
    const editAlbumModal = useEditAlbumModal();
    const deleteAlbumModal = useDeleteAlbumModal();
    const reorderMode = useReorderMode();
    const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
    const { subscription } = useUser();

    const handleDeleteAlbum = async () => {
        deleteAlbumModal.onOpen(albumId);
    }

    const handleDownload = async () => {
        if (!subscription) {
            toast.error("Upgrade to Pro to download albums");
            return;
        }

        const { data: albumData, error: albumError } = await (supabaseClient
            .from('albums' as any)
            .select('*')
            .eq('id', albumId)
            .single() as any);

        if (albumError || !albumData) {
            toast.error('Error fetching album');
            return;
        }

        const { data: SData, error: SError } = await supabaseClient
            .from('songs')
            .select('*')
            .eq('album_id', albumId);

        if (SError || !SData) {
            toast.error('Error fetching songs');
            return;
        }

        const songs = SData as unknown as Song[];

        const zip = new JSZip();
        const folder = zip.folder(albumData.name);

        if (albumData.image_path) {
            const { data: imageData, error: imageError } = await supabaseClient.storage
                .from('images')
                .download(albumData.image_path);

            if (!imageError && imageData && folder) {
                folder.file(`${albumData.name}.png`, imageData);
            }
        }

        for (const song of songs) {
            if (!song.song_path || !song.title) continue;

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
        a.download = `${albumData.name}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('Album downloaded successfully');
    }

    const handleEditAlbum = async () => {
        editAlbumModal.onOpen(albumId);
    }

    const handleBatchAddToPlaylist = async () => {
        const { data, error } = await supabaseClient
            .from('songs')
            .select('id')
            .eq('album_id', albumId);

        if (error || !data) return;

        const songIds = data.map((s: any) => String(s.id));
        batchAddToPlaylistModal.onOpen(songIds, albumId);
    }

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300 focus:outline-none">
                    <FaEllipsisH className="text-neutral-400 hover:text-white transition-all duration-300" size={20} />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    sideOffset={5}
                    className="min-w-52.5 overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50"
                >
                    {isOwner && (
                        <>
                            <DropdownMenu.Item
                                onClick={handleDeleteAlbum}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none"
                            >
                                <HiOutlineTrash size={15} /> Delete Album
                            </DropdownMenu.Item>

                            <DropdownMenu.Item
                                onClick={handleEditAlbum}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                            >
                                <MdOutlineModeEditOutline size={15} /> Edit Album
                            </DropdownMenu.Item>

                            <DropdownMenu.Item
                                onClick={() => reorderMode.onOpen(albumId, "album")}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                            >
                                <MdDragIndicator size={15} /> Adjust order
                            </DropdownMenu.Item>

                            <div className="my-1 h-px bg-white/8 mx-2" />
                        </>
                    )}

                    <DropdownMenu.Item
                        onClick={(e) => {
                            if (!subscription) e.preventDefault();
                            handleDownload();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none data-disabled:opacity-35 data-disabled:pointer-events-none"
                        disabled={!subscription}
                    >
                        {subscription ? <TbDownload size={15} /> : <TbDownloadOff size={15} />}
                        {subscription ? "Download Album" : "Upgrade to Pro"}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        onClick={handleBatchAddToPlaylist}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                    >
                        <MdPlaylistAdd size={15} /> Add to Playlist
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default AlbumPopover;