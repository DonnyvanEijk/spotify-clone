"use client";

import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";
import { Modal } from "./modal";
import { useEffect, useState } from "react";
import {Button} from "./button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Playlist } from "@/types";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";

const BatchAddToPlaylistModal = () => {
    const router = useRouter();
    const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
    const createPlaylistModal = useCreatePlaylistModal();
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    let use = 0
    const [isLoading, setIsLoading] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const { isOpen } = batchAddToPlaylistModal;
    const songId = batchAddToPlaylistModal.songId;
    const selectedPlaylistId = batchAddToPlaylistModal.selectedPlaylistId;

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (user && isOpen) {
                const { data: playlistsData, error: playlistsError } = await supabaseClient
                    .from('playlists')
                    .select('*')
                    .eq('user_id', user.id);

                if (playlistsError) {
                    toast.error("Failed to fetch playlists");
                } else {
                    if (playlistsData.length === 0) {
                        toast("You need to create a playlist first!");
                        createPlaylistModal.onOpen();
                    }
                    setPlaylists(playlistsData);
                }
            }
        };

        fetchPlaylists();
    }, [user, supabaseClient, songId, use]);

    const onChange = (open: boolean) => {
        if (!open) {
            batchAddToPlaylistModal.onClose();
        }
    };

    const onSubmit = async (playlistId: string) => {
        try {
            setIsLoading(true);

            if (!user) {
                toast.error("Please login to add songs to playlist");
                return;
            }

            const { data: existingPlaylistSongs, error: existingPlaylistSongsError } = await supabaseClient
                .from('playlist_songs')
                .select('song_id')
                .eq('playlist_id', playlistId);

            if (existingPlaylistSongsError) {
                toast.error("Failed to add songs to playlist");
                console.error(existingPlaylistSongsError);
                return;
            }

            const existingSongIds = existingPlaylistSongs.map(playlistSong => playlistSong.song_id);

            const filteredSongId = songId.filter(songId => !existingSongIds.includes(songId));
            
            const { error } = await supabaseClient
                .from('playlist_songs')
                .insert(filteredSongId.map(song_id => ({ 
                    playlist_id: playlistId, 
                    song_id,
                    user_id: user.id
                })));

            if (error) {
                toast.error("Failed to add songs to playlist");
                console.error(error);
                return;
            }

            toast.success("Added songs to playlist");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
            use = use + 1
            router.refresh();
        }
    };

    return (
        <Modal
            title="Add to Playlist"
            description="Select playlists to add the song"
            isOpen={batchAddToPlaylistModal.isOpen}
            onChange={onChange}
        >
            <form className="flex flex-col gap-y-4">
                {playlists
                    .filter(playlist => playlist.id !== selectedPlaylistId)
                    .map(playlist => (
                        <Button
                            key={playlist.id}
                            onClick={() => onSubmit(playlist.id)}
                            disabled={isLoading}
                            className="bg-neutral-400"
                        >
                            Add all songs to playlist: {playlist.name}
                        </Button>
                    ))}
            </form>
        </Modal>
    );
};

export default BatchAddToPlaylistModal;