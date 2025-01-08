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
import SearchSelect from "../SearchSelect";

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
    const [albumData, setAlbumData] = useState<{ id: string; name: string }[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<string | undefined>(undefined);
    const [selectOpen, setSelectOpen] = useState(false);

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
            setSelectedAlbum(song.album_id || undefined);
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
    }, [songId
    ]);

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
            album_id: selectedAlbum || ''
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            setSelectOpen(false);
            reset();
            editSongModal.onClose();
        }
    }

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('albums')
                    .select('id, name');

                if (error) {
                    console.error(error);
                    return;
                }

                console.log(data);

                setAlbumData(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchAlbums();
    }, [supabaseClient]);

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
                    is_private: values.is_private,
                    album_id: selectedAlbum ? parseInt(selectedAlbum) : null
                })
                .eq('id', songId)

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Song edited successfully");
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
            album_id: selectedAlbum || ''
        });
    }, [song, selectedAlbum, reset, songId])

    return (
        <Modal
            title="Edit Song"
            description="Edit a song you uploaded to the platform"
            isOpen={editSongModal.isOpen}
            onChange={onChange}
        >
            <SearchSelect
                disabled={isLoading}
                isOpen={selectOpen}
                onOpenChange={() => setSelectOpen(!selectOpen)}
                data={albumData.map(album => ({ id: album.id, name: album.name }))}
                onSelect={(selected) => setSelectedAlbum(selected)}
                selected={selectedAlbum}
                placeholder="Select an Album"
                className="mb-4"
            />
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
                    label="Private Song"
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