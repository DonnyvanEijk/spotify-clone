"use client";

import { Modal } from "./modal";
import { useEffect, useState } from "react";
import {Button} from "./button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylistModal";


const DeletePlaylistModal = () => {
    const router = useRouter();
    const deletePlaylistModal = useDeletePlaylist();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const playlistId = deletePlaylistModal.playlistId;

    const [playListName, setPlayListName] = useState(playlistId);

    const fetchPlaylistName = async () => {
        try {
            const { data: playlist, error } = await supabaseClient
                .from('playlists')
                .select('name')
                .eq('id', playlistId)
                .single();

            if (error) {
                console.error("Error fetching playlist name: ", error);
                toast.error("Failed to fetch playlist name");
                return;
            }

            setPlayListName(playlist?.name);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!playlistId) {
            return;
        }

        fetchPlaylistName();
    }, [playlistId, fetchPlaylistName]);

    const onChange = (open: boolean) => {
        if (!open) {
            deletePlaylistModal.onClose();
        }
    }

    const DeletePlaylist = async () => {
        try {
            const { error: PlaylistSongDeleteError } = await supabaseClient
                .from('playlist_songs')
                .delete()
                .eq('playlist_id', playlistId)
                .eq('user_id', user?.id)

            if (PlaylistSongDeleteError) {
                console.error("Error deleting playlist songs: ", PlaylistSongDeleteError);
                toast.error("Failed to delete playlist songs");
                return;
            }

            const { error: PlaylistDeleteError } = await supabaseClient
                .from('playlists')
                .delete()
                .eq('id', playlistId)
                .eq('user_id', user?.id)

            if (PlaylistDeleteError) {
                console.error("Error deleting playlist: ", PlaylistDeleteError);
                toast.error("Failed to delete playlist");
                return;
            }
            toast.success("Playlist deleted successfully");
            router.push('/');
            deletePlaylistModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            title={`Delete Playlist ${playListName}`}
            description=""
            isOpen={deletePlaylistModal.isOpen}
            onChange={onChange}
        >
            <form className="w-full flex flex-row justify-evenly items-center">
                <Button disabled={isLoading} onClick={DeletePlaylist} className="w-[170px]">
                    Delete Playlist
                </Button>
                <Button disabled={isLoading} onClick={() => {
                    deletePlaylistModal.onClose()
                }} className="bg-neutral-500 w-[170px]">
                    Cancel
                </Button>
            </form>
        </Modal >
    );
}

export default DeletePlaylistModal;