"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import {Modal} from "../modal";
import { useEffect, useState } from "react";
import {Input} from "../input";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEditPlaylistModal } from "@/hooks/useEditPlaylistModal";
import CheckBox from "../CheckBox";

const PlaylistEditModal = () => {
    const router = useRouter();
    const editPlaylistModal = useEditPlaylistModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const playlistId = editPlaylistModal.playlistId;

    interface Playlist {
        id: string;
        user_id: string;
        name: string;
        description: string;
        is_public: boolean;
    }

    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    const fetchPlaylist = async () => {
        try {
            const { data: playlist, error } = await supabaseClient
                .from('playlists')
                .select('*')
                .eq('id', playlistId)
                .eq('user_id', user?.id)
                .single();

            if (error) {
                console.error("Error fetching playlist: ", error);
                toast.error("Failed to fetch playlist");
                return;
            }

            setPlaylist(playlist);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!playlistId) {
            return;
        }

        fetchPlaylist();
    }, [playlistId]);

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            id: playlist?.id || playlistId,
            user_id: playlist?.user_id || '',
            description: playlist?.description || '',
            name: playlist?.name || '',
            is_public: playlist?.is_public || false,
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            editPlaylistModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const {
                error: supabaseError
            } = await supabaseClient
                .from(`playlists`)
                .update({
                    name: values.name,
                    description: values.description,
                    is_public: values.is_public
                })
                .eq('id', playlistId)

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Playlist uploaded successfully");
            reset();
            editPlaylistModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        reset({
            id: playlist?.id || playlistId,
            user_id: playlist?.user_id || '',
            description: playlist?.description || '',
            name: playlist?.name || '',
            is_public: playlist?.is_public || false,
        });
    }, [playlist, playlistId
    ])

    return (
        <Modal
            title="Edit Playlist"
            description="Edit a playlist you uploaded to the platform"
            isOpen={editPlaylistModal.isOpen}
            onChange={onChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input
                    id="name"
                    disabled={isLoading}
                    {...register('name', { required: true })}
                    placeholder="Playlist Name"
                />
                <Input
                    id="description"
                    disabled={isLoading}
                    {...register('description', { required: true })}
                    placeholder="Playlist Description"
                />
                <CheckBox
                    id="is_public"
                    label="Public Playlist"
                    disabled={isLoading}
                    {...register('is_public')}
                />
                <Button disabled={isLoading} type="submit">
                    Edit Playlist
                </Button>
            </form>
        </Modal>
    );
}

export default PlaylistEditModal;