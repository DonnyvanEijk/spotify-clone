"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";


import {Modal} from "./Modal";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import CheckBox from "./CheckBox";
import { Playlist } from "@/types";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { Button } from "./Button";


const AddToPlaylistModal = () => {
    const router = useRouter();
    const addToPlaylistModal = useAddToPlaylistModal();
    const createPlaylistModal = useCreatePlaylistModal();
    const { user } = useUser();
    const { handleSubmit } = useForm();
    const supabaseClient = useSupabaseClient();
    let use = 0
    const [isLoading, setIsLoading] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
    const [initialSelectedPlaylists, setInitialSelectedPlaylists] = useState<string[]>([]);

    const { isOpen } = addToPlaylistModal;
    const songId = addToPlaylistModal.songId;

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

                const { data: playlistSongsData, error: playlistSongsError } = await supabaseClient
                    .from('playlist_songs')
                    .select('playlist_id')
                    .eq('song_id', songId)
                    .eq('user_id', user.id);

                if (playlistSongsError) {
                    toast.error("Failed to fetch playlists containing the song");
                    console.error("Error fetching playlists containing the song:", playlistSongsError);
                } else {
                    console.log("PlaylistSongsData", playlistSongsData);
                    const playlistIds = playlistSongsData.map((item: { playlist_id: string }) => item.playlist_id);
                    setSelectedPlaylists(playlistIds);
                    setInitialSelectedPlaylists(playlistIds);
                    console.log("PlaylistIds", playlistIds);
                }
            }
        };

        fetchPlaylists();
    }, [user, supabaseClient, createPlaylistModal, isOpen, songId, use]);

    const onChange = (open: boolean) => {
        if (!open) {
            setSelectedPlaylists([]);
            addToPlaylistModal.onClose();
        }
    };

    const handleCheckboxChange = (playlistId: string) => {
        setSelectedPlaylists((prev) => {
            if (prev.includes(playlistId)) {
                return prev.filter((id: string) => id !== playlistId);
            } else {
                return [...prev, playlistId];
            }
        });
    };

    const onSubmit: SubmitHandler<FieldValues> = async () => {
        console.log("Added songId ", songId, "to Playlist", selectedPlaylists);
        try {
            setIsLoading(true);

            if (selectedPlaylists.length === 0) {
                toast.error("Please select at least one playlist");
                return;
            }

            if (!user) {
                toast.error("Please login to add songs to playlist");
                return;
            }

            const { data: existingEntries, error: existingEntriesError } = await supabaseClient
                .from('playlist_songs')
                .select('playlist_id, song_id')
                .in('playlist_id', selectedPlaylists)
                .eq('song_id', songId)
                .eq('user_id', user.id);

            if (existingEntriesError) {
                toast.error("Failed to check existing songs in playlists");
                console.error(existingEntriesError);
                return;
            }

            const existingPlaylistIds = new Set(existingEntries.map(entry => entry.playlist_id));

            const playlistsToInsert = selectedPlaylists.filter(playlistId => !existingPlaylistIds.has(playlistId));

            if (playlistsToInsert.length === 0) {
                toast("The selected playlists already contain this song");
                return;
            }

            const insertPromises = playlistsToInsert.map(playlistId => {
                return supabaseClient
                    .from('playlist_songs')
                    .insert({
                        user_id: user.id,
                        playlist_id: playlistId,
                        song_id: songId, // Use songId from hook
                    });
            });

            const results = await Promise.all(insertPromises);

            const hasError = results.some(result => result.error);
            if (hasError) {
                toast.error("Failed to add song to playlists");
                console.error(results);
            } else {
                toast.success("Song added to playlists successfully");
                router.refresh();
                addToPlaylistModal.onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
            setSelectedPlaylists([]);
            use = use + 1
        }
    };

    return (
        <Modal
            title="Add to Playlist"
            description="Select playlists to add the song"
            isOpen={addToPlaylistModal.isOpen}
            onChange={onChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                {playlists.map(playlist => (
                    <CheckBox
                        key={playlist.id}
                        id={playlist.id}
                        label={playlist.name}
                        checked={selectedPlaylists.includes(playlist.id)}
                        onChange={() => handleCheckboxChange(playlist.id)}
                        disabled={isLoading || initialSelectedPlaylists.includes(playlist.id)}
                    />
                ))}
                <Button disabled={isLoading} type="submit">
                    Add to Playlist
                </Button>
            </form>
        </Modal>
    );
};

export default AddToPlaylistModal;