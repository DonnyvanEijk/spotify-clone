"use client";

import {Modal} from "./Modal";
import { useEffect, useState } from "react";
import {Button} from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useDeleteSong } from "@/hooks/useDeleteSongModal";


const DeleteSongModal = () => {
    const router = useRouter();
    const deleteSongModal = useDeleteSong();

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    const supabaseClient = useSupabaseClient();

    const songId = deleteSongModal.songId;

    const [songName, setSongtName] = useState(songId);

    const fetchSongName = async () => {
        try {
            const { data: song, error } = await supabaseClient
                .from('songs')
                .select('title')
                .eq('id', songId)
                .single();

            if (error) {
                console.error("Error fetching song name: ", error);
                toast.error("Failed to fetch song name");
                return;
            }

            setSongtName(song?.title);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!songId) {
            return;
        }

        fetchSongName();
    }, [songId]);

    const onChange = (open: boolean) => {
        if (!open) {
            deleteSongModal.onClose();
        }
    }

    const DeleteSong = async () => {
        try {
            const { error: SongDeleteError } = await supabaseClient
                .from('songs')
                .delete()
                .eq('id', songId)
                .eq('user_id', user?.id)

            if (SongDeleteError) {
                console.error("Error deleting song: ", SongDeleteError);
                toast.error("Failed to delete song");
                return;
            }
            toast.success("Song deleted successfully");
            router.push('/');
            deleteSongModal.onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            title={`Delete Song ${songName}`}
            description=""
            isOpen={deleteSongModal.isOpen}
            onChange={onChange}
        >
            <form className="w-full flex flex-row justify-evenly items-center">
                <Button disabled={isLoading} onClick={DeleteSong} className="w-[170px]">
                    Delete Song
                </Button>
                <Button disabled={isLoading} onClick={() => {
                    deleteSongModal.onClose()
                }} className="bg-neutral-500 w-[170px]">
                    Cancel
                </Button>
            </form>
        </Modal >
    );
}

export default DeleteSongModal;