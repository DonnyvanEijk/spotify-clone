"use client";

import {Modal} from "../modal";
import { useEffect, useState } from "react";
import {Button} from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";

const DeleteAlbumModal = () => {
    const router = useRouter();
    const deleteAlbumModal = useDeleteAlbumModal();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const albumId = deleteAlbumModal.albumId;

    const [albumName, setAlbumtName] = useState(albumId);

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

            const { error: StorageDeleteError } = await supabaseClient
                .storage
                .from('albums')
                .remove([data.album_path]);

            if (StorageDeleteError) {
                console.error("Error deleting album from storage: ", StorageDeleteError);
                toast.error("Failed to delete album from storage");
                return;
            }

            const { data: playlists, error: PlaylistError } = await supabaseClient
                .from('albums')
                .select('image_path')
                .eq('image_path', data.image_path);

            if (PlaylistError) {
                console.error("Error checking albums: ", PlaylistError);
                toast.error("Failed to check albums");
                return;
            }

            if (playlists.length === 0) {
                const { error: ImageStorageDeleteError } = await supabaseClient
                    .storage
                    .from('images')
                    .remove([data.image_path]);

                if (ImageStorageDeleteError) {
                    console.error("Error deleting image from storage: ", ImageStorageDeleteError);
                    toast.error("Failed to delete image from storage");
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
            <form className="w-full flex flex-row justify-evenly items-center">
                <Button disabled={isLoading} onClick={DeleteAlbum} className="w-[170px]">
                    Delete Album
                </Button>
                <Button disabled={isLoading} onClick={() => {
                    deleteAlbumModal.onClose()
                }} className="bg-neutral-500 w-[170px]">
                    Cancel
                </Button>
            </form>
        </Modal >
    );
}

export default DeleteAlbumModal;