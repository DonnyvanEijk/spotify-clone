"use client"
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";

interface PlaylistButtonProps {
    songId: string;
    color?: string;
}

const PlaylistButton: React.FC<PlaylistButtonProps> = ({
    songId,
    color = 'white'
}) => {
    // const router = useRouter();
    const { supabaseClient } = useSessionContext();

    const authModal = useAuthModal();
    const createPlaylistModal = useCreatePlaylistModal();
    const addToPlaylistModal = useAddToPlaylistModal();
    const { user } = useUser();

    const [isInPlaylist, setIsInPlaylist] = useState(false);
    const [userHasPLaylist, setUserHasPlaylist] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const checkUserPlaylist = async () => {
            const { data, error } = await supabaseClient
                .from("playlists")
                .select("id")
                .eq("user_id", user.id);

            if (error || !data) {
                console.log(error, "data: ", data);
                // toast.error("You need to create a playlist first!");
            }

            if (data) {
                setUserHasPlaylist(true);
            }
        };

        checkUserPlaylist();
    }, [supabaseClient, user?.id]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const fetchData = async () => {
            const { data, error } = await supabaseClient
                .from("playlist_songs")
                .select("playlist_id")
                .eq("song_id", songId)
                .eq("user_id", user.id)

            if (error) {
                console.error("Error fetching playlist song: ", error, "soingId: ", songId);
            }

            if (!error && data) {
                if (data.length !== 0) {
                    setIsInPlaylist(true);
                }
            }
        };

        fetchData();
    }, [songId, supabaseClient, user?.id]);

    const Icon = isInPlaylist ? MdPlaylistAddCheck : MdPlaylistAdd;

    const handleAddToPlaylist = async () => {
        if (!user) {
            return authModal.onOpen();
        }

        // if (!subscription) {
        //     return subscribeModal.onOpen();
        // }
        // console.log("userHasPLaylist: ", userHasPLaylist);

        if (!userHasPLaylist) {
            toast.error("You need to create a playlist first!");
            return createPlaylistModal.onOpen();
        }
        // console.log("Opening addToPlaylistModal with songId: ", songId);
        addToPlaylistModal.onOpen(songId);
    }

    return (
        <button
            onClick={handleAddToPlaylist}
            className="
        hover:opacity-75
        transition
        "
        >
            <Icon color={isInPlaylist ? '#8F00FF' : color} size={25} />
        </button>
    );
}

export default PlaylistButton;