"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useUploadModal } from "@/hooks/useUploadModal";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Input } from "./input";
import { Modal } from "./modal";
import { Button } from "./button";

export const UploadModal = () => {
    const router = useRouter();
    const uploadModal = useUploadModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            author: '',
            title: '',
            song: null,
            image: null,
        }
    })

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }    

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];

            if (!imageFile || !songFile || !user) {
                toast.error("Missing fields");
                return;
            }

            const sanitizedFileName = sanitizeFileName(values.title);
            
            const uniqueID = uniqid();

            // upload song
            const {
                data: songData,
                error: songError
            } = await supabaseClient
            .storage
            .from('songs')
            .upload(`song-${sanitizedFileName}-${uniqueID}`, songFile, {
                cacheControl: '3600',
                upsert: false,
            });

            if (songError){
                setIsLoading(false);
                return toast.error("Failed to upload song");
            }

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

            if (imageError){
                setIsLoading(false);
                return toast.error("Failed to upload image");
            }

            const {
                error: supabaseError
            } = await supabaseClient
            .from(`songs`)
            .insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                image_path: imageData.path,
                song_path: songData.path,                
            });

            if (supabaseError){
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully");
            reset();
            uploadModal.onClose();
        } catch  {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

   

    return (
        <Modal
            title="Upload Content"
            description="Upload your content to the platform"
            isOpen={uploadModal.isOpen}
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
                <div>
                    <div className="pb-1">
                        Select a song file
                    </div>
                    <Input
                        id="song"
                        type="file"
                        disabled={isLoading}
                        accept=".mp3" // change to audio/* if want to
                        {...register('song', { required: true })}
                    />
                </div>
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
                    Create Song
                </Button>
            </form>
        </Modal>
    );
}

