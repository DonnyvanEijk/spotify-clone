"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { useUploadModal } from "@/hooks/useUploadModal";
import {Modal} from "../modal";
import { useEffect, useState } from "react";
import {Input} from "../input";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import CheckBox from "../CheckBox";
import SearchSelect from "../SearchSelect";
import { sendDiscordMessage } from "@/actions/discord";



const UploadModal = () => {
    const router = useRouter();
    const uploadModal = useUploadModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const [albumData, setAlbumData] = useState<{ id: string; name: string }[]>([]);

    const [selectedAlbum, setSelectedAlbum] = useState<string | undefined>(undefined);

    const [selectOpen, setSelectOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            author: '',
            title: '',
            is_private: false,
            song: null,
            image: null,
            lyrics: '',
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadModal.onClose();
            setSelectOpen(false);
        }
    }

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
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

            if (songError) {
                setIsLoading(false);
                console.error(songError);
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

            if (imageError) {
                setIsLoading(false);
                console.error(imageError);
                return toast.error("Failed to upload image");
            }

   
        
         const {
            data: songInsertData,
            error: supabaseError
        } = await supabaseClient
            .from(`songs`)
            .insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                is_private: values.is_private,
                image_path: imageData.path,
                song_path: songData.path,
                album_id: selectedAlbum ? parseInt(selectedAlbum) : null
            })
            .select()
            .single();

        if (supabaseError) {
            setIsLoading(false);
            return toast.error(supabaseError.message);
        }

        // Insert lyrics if provided
        if (values.lyrics && songInsertData?.id) {
            const { error: lyricsError } = await supabaseClient
                .from('song_lyrics')
                .insert({
                    user_id: user.id,
                    song_id: songInsertData.id,
                    lyrics: values.lyrics,
                });

            if (lyricsError) {
                toast.error("Lyrics could not be saved, but song was uploaded.");
            }
        }

          

          
            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully");
            if (values.is_private) {
                const message = `##  🎵  New private song uploaded: "*${values.title}*" by "*${values.author}*"  🎵 `;
                await sendDiscordMessage(message);
            }
            const message = `##  🎵  New song uploaded: "*${values.title}*" by "*${values.author}*"  🎵 `;
            await sendDiscordMessage(message);
            reset();
            uploadModal.onClose();
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
            isOpen={uploadModal.isOpen}
            onChange={onChange}
        >
            <div className="max-w-3xl w-full mx-auto">
            <SearchSelect
                disabled={isLoading}
                isOpen={selectOpen}
                onOpenChange={() => setSelectOpen(!selectOpen)}
                data={albumData.map(album => ({ id: album.id, name: album.name }))}
                onSelect={(selected) => setSelectedAlbum(selected)}
                selected={selectedAlbum}
                placeholder="Select an album"
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
                 <div>
        <div className="pb-1">
            Add lyrics (optional)
        </div>
        <textarea
            id="lyrics"
            disabled={isLoading}
            {...register('lyrics')}
            placeholder="Song Lyrics"
            className="w-full p-2 rounded bg-neutral-800 text-white"
            rows={5}
        />
    </div>
                <Button disabled={isLoading} type="submit">
                    Create Song
                </Button>
            </form>
            </div>
        </Modal>
    );
}

export default UploadModal;