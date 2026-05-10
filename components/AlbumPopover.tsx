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
import { MdOutlineModeEditOutline } from "react-icons/md";
import { Song } from "@/types"; // Importing your existing Song interface

interface AlbumPopoverProps {
    albumId: string;
    isOwner?: boolean;
}

const AlbumPopover: React.FC<AlbumPopoverProps> = ({ albumId, isOwner }) => {
    const supabaseClient = useSupabaseClient();
    const editAlbumModal = useEditAlbumModal();
    const deleteAlbumModal = useDeleteAlbumModal();
    const { subscription } = useUser();

    const handleDeleteAlbum = async () => {
        deleteAlbumModal.onOpen(albumId);
    }

    const handleDownload = async () => {
        if (!subscription) {
            toast.error("Upgrade to Pro to download albums");
            return;
        }

        // Use 'as any' to bypass the strict table name check
        const { data: albumData, error: albumError } = await (supabaseClient
            .from('albums' as any)
            .select('*')
            .eq('id', albumId)
            .single() as any);

        if (albumError || !albumData) {
            console.error('Error fetching album:', albumError);
            toast.error('Error fetching album');
            return;
        }

        const { data: PsData, error: PsError } = await (supabaseClient
            .from('album_songs' as any)
            .select('song_id')
            .eq('album_id', albumId) as any);

        if (PsError || !PsData) {
            console.error('Error fetching album songs:', PsError);
            toast.error('Error fetching album songs');
            return;
        }

        // Ensure IDs are treated as numbers for the next query
        const numericSongIds = PsData.map((song: any) => Number(song.song_id));

        const { data: SData, error: SError } = await supabaseClient
            .from('songs')
            .select('*')
            .in('id', numericSongIds);

        if (SError || !SData) {
            console.error('Error fetching songs:', SError);
            toast.error('Error fetching songs');
            return;
        }

        // Cast to your Song interface
        const songs = (SData as unknown as Song[]);

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
                    className="
                        min-w-55 rounded-2xl bg-neutral-800/90 backdrop-blur-md border border-white/10
                        shadow-lg py-2 flex flex-col text-white z-100
                    "
                >
                    {isOwner && (
                        <>
                            <DropdownMenu.Item
                                onClick={handleDeleteAlbum}
                                className="flex justify-between items-center px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer outline-none"
                            >
                                Delete Album <HiOutlineTrash size={20} />
                            </DropdownMenu.Item>

                            <DropdownMenu.Item
                                onClick={handleEditAlbum}
                                className="flex justify-between items-center px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer outline-none"
                            >
                                Edit Album <MdOutlineModeEditOutline size={20} />
                            </DropdownMenu.Item>

                            <div className="my-1 h-px bg-white/10" />
                        </>
                    )}

                    <DropdownMenu.Item
                        onClick={(e) => {
                            if (!subscription) e.preventDefault();
                            handleDownload();
                        }}
                        className="flex justify-between items-center px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer outline-none disabled:text-neutral-500"
                        disabled={!subscription}
                    >
                        {subscription ? (
                            <>
                                Download Album <TbDownload size={20} />
                            </>
                        ) : (
                            <>
                                Upgrade to Pro <TbDownloadOff size={20} />
                            </>
                        )}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default AlbumPopover;