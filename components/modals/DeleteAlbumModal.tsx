"use client";

import {Modal} from "../modal";
import { useEffect, useState } from "react";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";
import CheckBox from "../CheckBox";

const DeleteAlbumModal = () => {
    const router = useRouter();
    const deleteAlbumModal = useDeleteAlbumModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const albumId = deleteAlbumModal.albumId;

    const [albumName, setAlbumtName] = useState(albumId);

    const [deleteSongs, setDeleteSongs] = useState(false);

    const fetchAlbumName = async () => {
        try {
            const { data: album, error } = await supabaseClient
                .from('albums')
                .select('name')
                .eq('id', albumId)
                .single();

            if (error) {
                console.error("Error fetching album name: ", error);
                toast.error("Failed to fetch album name");
                return;
            }

            setAlbumtName(album?.name);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!albumId) {
            return;
        }

        fetchAlbumName();
    }, [albumId]);

    const onChange = (open: boolean) => {
        if (!open) {
            deleteAlbumModal.onClose();
        }
    }

    const DeleteAlbum = async () => {
        try {
            if (deleteSongs) {
                const { data: songs, error: GetSongsError } = await supabaseClient
                    .from('songs')
                    .select('*')
                    .eq('album_id', albumId);

                if (GetSongsError) {
                    console.error("Error fetching songs: ", GetSongsError);
                    toast.error("Failed to fetch songs");
                    return;
                }

                console.log(songs);

                for (const song of songs) {
                    const { error: SongDeleteError } = await supabaseClient
                        .from('songs')
                        .delete()
                        .eq('id', song.id);

                    if (SongDeleteError) {
                        console.error("Error deleting song: ", SongDeleteError);
                        toast.error("Failed to delete song");
                        return;
                    }

                    const { error: StorageDeleteError } = await supabaseClient
                        .storage
                        .from('songs')
                        .remove([song.song_path]);

                    if (StorageDeleteError) {
                        console.error("Error deleting song from storage: ", StorageDeleteError);
                        toast.error("Failed to delete song from storage");
                        return;
                    }
                }
            }

            const { data, error: GetAlbumError } = await supabaseClient
                .from('albums')
                .select('*')
                .eq('id', albumId)
                .eq('user_id', user?.id)
                .single();

            if (GetAlbumError || !data) {
                console.error("Error fetching album: ", GetAlbumError);
                toast.error("Failed to fetch album");
                return;
            }

            const { error: AlbumDeleteError } = await supabaseClient
                .from('albums')
                .delete()
                .eq('id', albumId)
                .eq('user_id', user?.id)

            if (AlbumDeleteError) {
                console.error("Error deleting album: ", AlbumDeleteError);
                toast.error("Failed to delete album");
                return;
            }

            const { data: songImageDatas, error: SongImageError } = await supabaseClient
                .from('songs')
                .select('*')
                .eq('image_path', data.image_path);

            if (SongImageError) {
                console.error("Error fetching song images: ", SongImageError);
                toast.error("Failed to fetch song images");
                return;
            }

            if (songImageDatas.length === 0) {
                const { error: ImageDeleteError } = await supabaseClient
                    .storage
                    .from('images')
                    .remove([data.image_path]);

                if (ImageDeleteError) {
                    console.error("Error deleting image: ", ImageDeleteError);
                    toast.error("Failed to delete image");
                    return;
                }
            }

            toast.success("Album deleted successfully");
            router.push('/');
            deleteAlbumModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            title={`Delete Album ${albumName}`}
            description=""
            isOpen={deleteAlbumModal.isOpen}
            onChange={onChange}
        >
            <CheckBox
                id="deleteSongs"
                label="Delete Songs with the album"
                checked={deleteSongs}
                onChange={() => setDeleteSongs(!deleteSongs)}
                disabled={isLoading}
              />
            <form className="w-full flex flex-row justify-evenly items-center">
                <Button disabled={isLoading} onClick={DeleteAlbum} className="w-[170px] mt-10">
                    Delete Album
                </Button>
                <Button disabled={isLoading} onClick={() => {
                    deleteAlbumModal.onClose()
                }} className="bg-neutral-500 w-[170px] mt-10">
                    Cancel
                </Button>
            </form>
        </Modal >
    );
}

export default DeleteAlbumModal;