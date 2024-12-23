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
import { useEditSongModal } from "@/hooks/useEditSongModal";
import CheckBox from "../CheckBox";

const SongEditModal = () => {
    const router = useRouter();
    const editSongModal = useEditSongModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const songId = editSongModal.songId;

    interface Song {
        id: string;
        user_id: string;
        title: string;
        author: string;
        is_private: boolean;
    }

    const [song, setSong] = useState<Song | null>(null);

    const fetchSong = async () => {
        try {
            const { data: song, error } = await supabaseClient
                .from('songs')
                .select('*')
                .eq('id', songId)
                .eq('user_id', user?.id)
                .single();

            if (error) {
                console.error("Error fetching song: ", error);
                toast.error("Failed to fetch song");
                return;
            }

            setSong(song);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!songId) {
            return;
        }

        fetchSong();
    }, [songId]);

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            id: song?.id || songId,
            user_id: song?.user_id || '',
            author: song?.author || '',
            title: song?.title || '',
            is_private: song?.is_private || false,
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            editSongModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const {
                error: supabaseError
            } = await supabaseClient
                .from(`songs`)
                .update({
                    title: values.title,
                    author: values.author,
                    is_private: values.is_private
                })
                .eq('id', songId)

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully");
            reset();
            editSongModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        reset({
            id: song?.id || songId,
            user_id: song?.user_id || '',
            author: song?.author || '',
            title: song?.title || '',
            is_private: song?.is_private || false,
        });
    }, [song])

    return (
        <Modal
            title="Edit Song"
            description="Edit a song you uploaded to the platform"
            isOpen={editSongModal.isOpen}
            onChange={onChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input
                    id="title"
                    disabled={isLoading}
                    {...register('title', { required: true })}
                    placeholder="Song Title"
                />
                <Input
                    id="author"
                    disabled={isLoading}
                    {...register('author', { required: true })}
                    placeholder="Song Author"
                />
                <CheckBox
                    id="is_private"
                    label="private Song"
                    disabled={isLoading}
                    {...register('is_private')}
                />
                <Button disabled={isLoading} type="submit">
                    Edit Song
                </Button>
            </form>
        </Modal>
    );
}

export default SongEditModal;