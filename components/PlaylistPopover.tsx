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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { RiPlayListFill } from "react-icons/ri";
import { MdOutlineModeEditOutline, MdPlaylistAdd } from "react-icons/md";

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
        console.log("Delete Playlist");
        deletePlaylistModal.onOpen(playlistId);
    }

    const handleDownload = async () => {
        const { data: playlistData, error: playlistError } = await supabaseClient
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single();

        if (playlistError) {
            console.error('Error fetching playlist:', playlistError);
            toast.error('Error fetching playlist');
            return;
        }

        const { data: PsData, error: PsError } = await supabaseClient
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', playlistId);

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
        const folder = zip.folder(playlistData.name);

        if (playlistData.image_path) {
            const { data: imageData, error: imageError } = await supabaseClient.storage.from('images').download(playlistData.image_path);

            if (imageError) {
                console.error('Error downloading playlist image:', imageError);
                toast.error('Error downloading playlist image');
                return;
            }

            if (folder) {
                folder.file(`${playlistData.name}.png`, imageData);
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
        a.download = `${playlistData.name}.zip`;
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
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', playlistId);

        if (error) {
            console.error('Error fetching playlist songs:', error);
            return;
        }

        const songIds = data.map((song) => song.song_id);

        clonePlaylistModal.onOpen(songIds, playlistId);
    }

    const handleBatchAddToPlaylist = async () => {
        const { data, error } = await supabaseClient
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', playlistId);

        if (error) {
            console.error('Error fetching playlist songs:', error);
            return;
        }

        const songIds = data.map((song) => song.song_id);

        batchAddToPlaylistModal.onOpen(songIds, playlistId);
    }

    const handleEditPlaylist = async () => {
        editPlaylistModal.onOpen(playlistId);
    }

    return (
      <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex justify-center items-center">
                    <FaEllipsisH className="text-neutral-400 hover:text-white transition" size={24} />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="bg-neutral-900 rounded-xl p-2 shadow-lg min-w-[220px] space-y-1 animate-slide-up-fade"
                >
                    {isOwner && (
                        <>
                            <DropdownMenu.Item
                                className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                                onClick={handleDeletePlaylist}
                            >
                                Delete <HiOutlineTrash size={18} />
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition"
                                onClick={handleEditPlaylist}
                            >
                                Edit <MdOutlineModeEditOutline size={18} />
                            </DropdownMenu.Item>
                        </>
                    )}

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-green-400 hover:bg-green-500/20 hover:text-green-300 transition"
                        onClick={handleDownload}
                        disabled={!subscription}
                    >
                        {subscription ? "Download" : "Upgrade to Pro"} {subscription ? <TbDownload size={18} /> : <TbDownloadOff size={18} />}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition"
                        onClick={handleBatchAddToPlaylist}
                    >
                        Add to Playlist <MdPlaylistAdd size={18} />
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 transition"
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