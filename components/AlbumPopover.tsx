"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { FaEllipsisH } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { MdOutlineModeEditOutline } from "react-icons/md";

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
        console.log("Delete Album");
        deleteAlbumModal.onOpen(albumId);
    }

    const handleDownload = async () => {
        const { data: albumData, error: albumError } = await supabaseClient
            .from('albums')
            .select('*')
            .eq('id', albumId)
            .single();

        if (albumError) {
            console.error('Error fetching album:', albumError);
            toast.error('Error fetching album');
            return;
        }

        const { data: PsData, error: PsError } = await supabaseClient
            .from('album_songs')
            .select('song_id')
            .eq('album_id', albumId);

        if (PsError) {
            console.error('Error fetching album songs:', PsError);
            toast.error('Error fetching album songs');
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
        const folder = zip.folder(albumData.name);

        if (albumData.image_path) {
            const { data: imageData, error: imageError } = await supabaseClient.storage.from('images').download(albumData.image_path);

            if (imageError) {
                console.error('Error downloading album image:', imageError);
                toast.error('Error downloading album image');
                return;
            }

            if (folder) {
                folder.file(`${albumData.name}.png`, imageData);
            } else {
                console.error('Folder is null');
                toast.error('Folder is not available');
                return;
            }
        }

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
        a.download = `${albumData.name}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Album downloaded successfully');
    }

    const handleEditAlbum = async () => {
        editAlbumModal.onOpen(albumId);
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
                        {isOwner && (
                            <>
                                <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 transition" onClick={handleDeleteAlbum}>
                                    Delete Album <HiOutlineTrash size={20} className="text-neutral-400" />
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 px-3 transition" onClick={handleEditAlbum}>
                                    Edit Album <MdOutlineModeEditOutline size={20} className="text-neutral-400" />
                                </DropdownMenu.Item>

                                <DropdownMenu.Separator className="m-[5px] h-px bg-neutral-400" />
                            </>
                        )}

                        <DropdownMenu.Item className="flex flex-row justify-between cursor-pointer focus:outline-none text-neutral-400 hover:text-neutral-300 disabled:text-neutral-600 px-3 transition" onClick={handleDownload} disabled={!subscription}>
                            {subscription ? (
                                <>
                                    Donwload Album <TbDownload size={20} className="text-neutral-400" />
                                </>
                            ) : (
                                <>
                                    Upgrade to pro to Download <TbDownloadOff size={20} className="text-neutral-400" />
                                </>
                            )}
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
}

export default AlbumPopover;