"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Modal } from "../modal";
import { useEffect, useState } from "react";
import { Input } from "../input";
import { Button } from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEditSongModal } from "@/hooks/useEditSongModal";
import CheckBox from "../CheckBox";
import SearchSelect from "../SearchSelect";
import uniqid from "uniqid";

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
        image_path?: string;
        album_id?: string;
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
            album_id: selectedAlbum || '',
            image: null,
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
            if (!user?.id) {
                return;
            }
            try {
                const { data, error } = await supabaseClient
                    .from('albums')
                    .select('id, name')
                    .eq('user_id', user.id);
    
                console.log("Albums: " + data);
    
                if (error) {
                    console.error("Error in albums" + error);
                    return;
                }
    
                console.log(data);
    
                setAlbumData([{ id: 'no-album', name: 'No Album' }, ...data]);
            } catch (error) {
                console.error(error);
            }
        }
        fetchAlbums();
    }, [supabaseClient, user?.id]);

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];
            let imagePath = song?.image_path;

            if (imageFile) {
                const sanitizedFileName = sanitizeFileName(values.title);
                const uniqueID = uniqid();

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

                imagePath = imageData.path;

                // Check if the old image is used by other songs or playlists
                if (song?.image_path) {
                    const { data: playlists, error: PlaylistError } = await supabaseClient
                        .from("playlists")
                        .select("image_path")
                        .eq("image_path", song.image_path);

                    if (PlaylistError) {
                        console.error("Error checking playlists: ", PlaylistError);
                        toast.error("Failed to check playlists");
                        return;
                    }

                    const { data: songImageDatas, error: SongImageError } = await supabaseClient
                        .from('songs')
                        .select('*')
                        .eq('image_path', song.image_path);

                    if (SongImageError) {
                        console.error("Error fetching song images: ", SongImageError);
                        toast.error("Failed to fetch song images");
                        return;
                    }

                    const { data: albumImageDatas, error: AlbumImageError } = await supabaseClient
                        .from('albums')
                        .select('*')
                        .eq('image_path', song.image_path);

                    if (AlbumImageError) {
                        console.error("Error fetching album images: ", AlbumImageError);
                        toast.error("Failed to fetch album images");
                        return;
                    }

                    if (playlists.length === 0 && songImageDatas.length === 0 && albumImageDatas.length === 0) {
                        const { error: ImageStorageDeleteError } = await supabaseClient.storage
                            .from("images")
                            .remove([song.image_path]);

                        if (ImageStorageDeleteError) {
                            console.error(
                                "Error deleting image from storage: ",
                                ImageStorageDeleteError
                            );
                            toast.error("Failed to delete image from storage");
                            return;
                        }
                    }
                }
            }

            const {
                error: supabaseError
            } = await supabaseClient
                .from(`songs`)
                .update({
                    title: values.title,
                    author: values.author,
                    is_private: values.is_private,
                    album_id: selectedAlbum === 'no-album' ? null : selectedAlbum ? parseInt(selectedAlbum) : null,
                    image_path: imagePath,
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
            album_id: selectedAlbum || '',
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
                onSelect={(selected) => setSelectedAlbum(selected === 'no-album' ? undefined : selected)}
                selected={selectedAlbum}
                placeholder={selectedAlbum ? albumData.find(album => album.id === selectedAlbum)?.name || "Select an Album" : "Select an Album"}
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
                        Select an image
                    </div>
                    <Input
                        id="image"
                        type="file"
                        disabled={isLoading}
                        accept="image/*"
                        className="mb-5"
                        {...register('image')}
                    />
                    {song?.image_path && (
                        <div className="mb-2">
                            <img src={supabaseClient.storage.from('images').getPublicUrl(song.image_path).data.publicUrl} alt="Current Song Image" className="mb-2 w-[100px]" />
                            <div className="text-sm text-gray-500">Current Image: {song.image_path.split('/').pop()}</div>
                        </div>
                    )}
                  
                </div>
                <Button disabled={isLoading} type="submit">
                    Edit Song
                </Button>
            </form>
        </Modal>
    );
}

export default SongEditModal;
