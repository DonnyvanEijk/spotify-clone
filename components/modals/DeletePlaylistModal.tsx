"use client";

import { Modal } from "../modal";
import { useEffect, useState } from "react";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
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
            const { data, error: GetSongError } = await supabaseClient
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .eq('user_id', user?.id)
            .single();

        if (GetSongError || !data) {
            console.error("Error fetching song: ", GetSongError);
            toast.error("Failed to fetch song");
            return;
        }

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

            const { error: ImageStorageDeleteError } = await supabaseClient
            .storage
            .from('images')
            .remove([data.image_path]);

        if (ImageStorageDeleteError) {
            console.error("Error deleting image from storage: ", ImageStorageDeleteError);
            toast.error("Failed to delete image from storage");
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
            title="Delete Playlist"
            description={`Are you sure you want to delete "${playListName}"? This cannot be undone.`}
            isOpen={deletePlaylistModal.isOpen}
            onChange={onChange}
        >
            <div className="flex gap-3 mt-2">
                <Button
                    disabled={isLoading}
                    onClick={() => deletePlaylistModal.onClose()}
                    className="bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white rounded-lg"
                >
                    Cancel
                </Button>
                <Button
                    disabled={isLoading}
                    onClick={DeletePlaylist}
                    className="bg-red-500/15 border border-red-500/20 text-red-300 hover:bg-red-500/25 hover:text-red-200 rounded-lg"
                >
                    Delete Playlist
                </Button>
            </div>
        </Modal>
    );
}

export default DeletePlaylistModal;