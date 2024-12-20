"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import {Modal} from "../modal";
import { useEffect, useState } from "react";
import {Input} from "../input";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import CheckBox from "../CheckBox";
import { Playlist } from "@/types";
import PlaylistImage from "../PlaylistImage";

const ClonePlaylistModal = () => {
    const router = useRouter();
    const clonePlaylistModal = useClonePlaylistModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const originalPlaylistId = clonePlaylistModal.originPlaylistId;
    const songId = clonePlaylistModal.songId;

    const originalIsLiked = originalPlaylistId === 'liked';

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [useOriginalImage, setUseOriginalImage] = useState(
        originalIsLiked ? true : false
    );

    const fetchPlaylist = async () => {
        try {
            const { data: playlist, error } = await supabaseClient
                .from('playlists')
                .select('*')
                .eq('id', originalPlaylistId)
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
        if (!originalPlaylistId || originalIsLiked) {
            return;
        }

        fetchPlaylist();
    }, [originalPlaylistId]);

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            description: playlist?.description || '',
            name: playlist?.name || '',
            oriImage: playlist?.image_path || '',
            image: null,
            isPublic: playlist?.is_public || false,
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            clonePlaylistModal.onClose();
        }
    }

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            if (!user) {
                setIsLoading(false);
                return toast.error("User not found");
            }

            let supabaseError;

            if (!useOriginalImage) {
                const imageFile = values.image?.[0];

                if (!imageFile) {
                    toast.error("Missing fields");
                    return;
                }

                const uniqueID = uniqid();
                const sanitizedFileName = sanitizeFileName(values.name);

                // upload image
                const {
                    data: imageData,
                    error: imageError
                } = await supabaseClient
                    .storage
                    .from('images')
                    .upload(`image-${sanitizedFileName}-${uniqueID}`, imageFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (imageError) {
                    setIsLoading(false);
                    return toast.error("Failed to upload image");
                }

                const {
                    error: supaError
                } = await supabaseClient
                    .from(`playlists`)
                    .insert({
                        user_id: user.id,
                        name: values.name,
                        description: values.description,
                        is_public: values.isPublic,
                        image_path: imageData.path,
                    });

                supabaseError = supaError;
            } else {
                const {
                    error: supaError
                } = await supabaseClient
                    .from(`playlists`)
                    .insert({
                        user_id: user.id,
                        name: values.name,
                        description: values.description,
                        is_public: values.isPublic,
                        image_path: playlist?.image_path,
                    });

                supabaseError = supaError;
            }


            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            const { data: newPlaylist, error: NewPlaylistError } = await supabaseClient
                .from('playlists')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (NewPlaylistError) {
                setIsLoading(false);
                return toast.error(NewPlaylistError.message);
            }

            const { error: songAddError } = await supabaseClient
                .from('playlist_songs')
                .insert(songId.map(song_id => ({
                    playlist_id: newPlaylist.id,
                    song_id,
                    user_id: user.id
                })));

            if (songAddError) {
                setIsLoading(false);
                console.error(songAddError);
                return toast.error("cloed not add songs to playlist");
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Playlist Cloned successfully");
            reset();
            clonePlaylistModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        reset({
            description: playlist?.description || '',
            name: playlist?.name || '',
            oriImage: playlist?.image_path || '',
            image: null,
            isPublic: playlist?.is_public || false,
        })
    }, [playlist]);

    return (
        <Modal
            title="Clone Playlist"
            description="Clone a new playlist"
            isOpen={clonePlaylistModal.isOpen}
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
                    id="isPublic"
                    label="Public Playlist"
                    disabled={isLoading}
                    {...register('isPublic')}
                />
                {!originalIsLiked && (
                <CheckBox
                    id="useOriginalImage"
                    label="Use image of original playlist"
                    disabled={isLoading}
                    checked={useOriginalImage}
                    onChange={() => setUseOriginalImage(!useOriginalImage)}
                />
                )

}
                {!useOriginalImage ? (
                    <div>
                        <div className="pb-1">
                            Select an image
                        </div>
                        <Input
                            id="image"
                            type="file"
                            disabled={isLoading}
                            accept="image/*"
                            {...register('image', { required: true })}
                        />
                    </div>
                ) : (
                    <PlaylistImage playlist={playlist} />
                )}
                <Button disabled={isLoading} type="submit">
                    Clone Playlist
                </Button>
            </form>
        </Modal>
    );
}

export default ClonePlaylistModal;