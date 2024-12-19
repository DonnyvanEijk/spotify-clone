"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { Modal } from "./modal";
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import CheckBox from "./CheckBox";

const CreatePlaylistModal = () => {
    const router = useRouter();
    const createPlaylistModal = useCreatePlaylistModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            description: '',
            name: '',
            image: null,
            isPublic: false,
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            createPlaylistModal.onClose();
            reset();
        }
    }

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }    

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];

            if (!imageFile || !user) {
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
                error: supabaseError
            } = await supabaseClient
                .from(`playlists`)
                .insert({
                    user_id: user.id,
                    name: values.name,
                    description: values.description,
                    is_public: values.isPublic,
                    image_path: imageData.path,
                });

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Playlist Created successfully");
            reset();
            createPlaylistModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            title="Create Playlist"
            description="Create a new playlist"
            isOpen={createPlaylistModal.isOpen}
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
                <Button disabled={isLoading} type="submit">
                    Create Playlist
                </Button>
            </form>
        </Modal>
    );
}

export default CreatePlaylistModal;