"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import {Modal} from "./Modal";
import { useState } from "react";
import {Button} from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

import TextArea from "./TextArea";
import { useAddLyricsModal } from "@/hooks/useAddLyricsModal";

const AddLyricsModal = () => {
    const router = useRouter();
    const addLyricsModal = useAddLyricsModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const songId = addLyricsModal.songId;

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            lyrics: '',
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            addLyricsModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            if (!user) {
                toast.error("user Missing");
                return;
            }


            const {
                error: supabaseError
            } = await supabaseClient
            .from(`song_lyrics`)
            .insert({
                user_id: user.id,
                song_id: songId,
                lyrics: values.lyrics,             
            });

            if (supabaseError){
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully");
            reset();
            addLyricsModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            title="Upload Content"
            description="Upload your content to the platform"
            isOpen={addLyricsModal.isOpen}
            onChange={onChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <TextArea
                    id="lyrics"
                    disabled={isLoading}
                    {...register('lyrics', { required: true })}
                    placeholder="Song Lyrics"
                    className="h-[20vh]"
                />
                <Button disabled={isLoading} type="submit">
                    Add lyrics
                </Button>
            </form>
        </Modal>
    );
}

export default AddLyricsModal;