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
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import CheckBox from "../CheckBox";

const AlbumEditModal = () => {
    const router = useRouter();
    const editAlbumModal = useEditAlbumModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const albumId = editAlbumModal.albumId;

    interface Album {
        id: string;
        user_id: string;
        name: string;
        ispublic: boolean;
        author: string;
    }

    const [album, setAlbum] = useState<Album | null>(null);

    const fetchAlbum = async () => {
        try {
            const { data: album, error } = await supabaseClient
                .from('albums')
                .select('*')
                .eq('id', albumId)
                .eq('user_id', user?.id)
                .single();

            if (error) {
                console.error("Error fetching album: ", error);
                toast.error("Failed to fetch album");
                return;
            }

            setAlbum(album);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!albumId) {
            return;
        }

        fetchAlbum();
    }, [albumId, ]);

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            id: album?.id || albumId,
            user_id: album?.user_id || '',
            author: album?.author || '',
            ispublic: album?.ispublic || true,
            name: album?.name || '',
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            editAlbumModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const {
                error: supabaseError
            } = await supabaseClient
                .from(`albums`)
                .update({
                    name: values.name,
                    author: values.author,
                    ispublic: values.ispublic
                })
                .eq('id', albumId)

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Album editted successfully");
            reset();
            editAlbumModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        reset({
            id: album?.id || albumId,
            user_id: album?.user_id || '',
            author: album?.author || '',
            ispublic: album?.ispublic || true,
            name: album?.name || '',
        });
    }, [album, albumId]);

    return (
        <Modal
            title="Edit Album"
            description="Edit a album you uploaded to the platform"
            isOpen={editAlbumModal.isOpen}
            onChange={onChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input
                    id="name"
                    disabled={isLoading}
                    {...register('name', { required: true })}
                    placeholder="Album Title"
                />
                <Input
                    id="author"
                    disabled={isLoading}
                    {...register('author', { required: true })}
                    placeholder="Album Author"
                />
                <CheckBox
                    id="ispublic"
                    label="Public Album"
                    disabled={isLoading}
                    {...register('ispublic')}
                />
                <Button disabled={isLoading} type="submit">
                    Edit Album
                </Button>
            </form>
        </Modal>
    );
}

export default AlbumEditModal;
