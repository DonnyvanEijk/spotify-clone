"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import {Modal} from "../modal";
import { useState } from "react";
import {Input} from "../input";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import CheckBox from "../CheckBox";
import { useUploadAlbumModal } from "@/hooks/useUploadAlbumModal";
import JSZip from "jszip";
import { getMimeType } from "@/lib/getMimeType";
import ProgressBar from "../ProgressBar";

const UploadAlbumModal = () => {
    const router = useRouter();
    const uploadAlbumModal = useUploadAlbumModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const [progress, setProgress] = useState(0);

    const [totalSongs, setTotalSongs] = useState(0);

    const [isuploading, setIsUploading] = useState(false);

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            author: '',
            name: '',
            ispublic: true,
            albumZip: null,
            image: null,
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadAlbumModal.onClose();
        }
    }

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];
            const albumZipFile = values.albumZip?.[0];

            if (!imageFile || !albumZipFile || !user) {
                toast.error("Missing fields");
                return;
            }


            const zip = new JSZip();
            const albumZipContent = await zip.loadAsync(albumZipFile);

            const songFiles = [];

            for (const relativePath in albumZipContent.files) {
                const file = albumZipContent.files[relativePath];
                if (file.name.endsWith(".mp3")) {
                    const fileBlob = await file.async("blob"); // Get the file as a Blob
                    // Create a new Blob with the correct MIME type
                    const correctBlob = new Blob([fileBlob], { type: 'audio/mpeg' });
                    songFiles.push({ name: file.name, blob: correctBlob });
                }
            }


            if (songFiles.length === 0) {
                setIsLoading(false);
                return toast.error("No mp3 files found in the zip");
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
                console.error(imageError);
                return toast.error("Failed to upload image");
            }

            console.log(imageData);

            const {
                error: supabaseError
            } = await supabaseClient
                .from(`albums`)
                .insert({
                    user_id: user.id,
                    name: values.name,
                    author: values.author,
                    ispublic: values.ispublic,
                    image_path: imageData.path,
                });

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            const {
                data: albumData,
                error: albumError
            } = await supabaseClient
                .from(`albums`)
                .select('*')
                .eq('image_path', imageData.path)
                .single();

            if (albumError) {
                setIsLoading(false);
                return toast.error(albumError.message);
            }

            const albumId = albumData.id;

            setTotalSongs(songFiles.length);

            setIsUploading(true);

            // Upload each song
            for (const songFile of songFiles) {
                const songName = songFile.name.replace('.mp3', '');
                const sanitizedSongFileName = sanitizeFileName(songName) + ".mp3";

                const mimeType = getMimeType(songFile.name);

                console.log(`Uploading song: ${sanitizedSongFileName}, MIME Type: ${mimeType}`);

                // Log the Blob properties
                console.log(`Blob size: ${songFile.blob.size}, Blob type: ${songFile.blob.type}`);

                const { data: songData, error: songError } = await supabaseClient
                    .storage
                    .from('songs')
                    .upload(`song-${sanitizedSongFileName}-${uniqueID}`, songFile.blob, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: mimeType
                    });

                if (songError) {
                    setIsLoading(false);
                    console.error("Failed to upload song: ", songName, " :", songError);
                    return toast.error("Failed to upload song: " + songName);
                }

                setProgress((prevProgress) => prevProgress + 1);

                console.log(songData);

                const { error: supabaseSongError } = await supabaseClient
                    .from(`songs`)
                    .insert({
                        user_id: user.id,
                        title: songName,
                        author: values.author,
                        is_private: !values.ispublic,
                        image_path: imageData.path,
                        song_path: songData.path,
                        album_id: albumId
                    });

                if (supabaseSongError) {
                    setIsLoading(false);
                    return toast.error(supabaseSongError.message);
                }

            }

            setIsUploading(false);

            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully");
            reset();
            setProgress(0);
            setTotalSongs(0);
            setIsUploading(false);
            uploadAlbumModal.onClose();
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
            isOpen={uploadAlbumModal.isOpen}
            onChange={onChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input
                    id="name"
                    disabled={isLoading}
                    {...register('name', { required: true })}
                    placeholder="Album Name"
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
                <div>
                    <div className="pb-1">
                        Select a zip file
                    </div>
                    <Input
                        id="album"
                        type="file"
                        disabled={isLoading}
                        accept=".zip"
                        {...register('albumZip', { required: true })}
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
                    Create Album
                </Button>
                {isuploading && (
                    <div className="flex flex-row items-center gap-x-4">
                        Uploading {progress} of {totalSongs} songs
                        <ProgressBar progress={(progress / totalSongs) * 100} />
                    </div>
                )}
            </form>
        </Modal>
    );
}

export default UploadAlbumModal;