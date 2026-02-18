"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSharesSongModal } from "@/hooks/useSharedSongModal";
import usePlayer from "@/hooks/usePlayer";
import { Song, UserDetails } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Modal } from "../modal";

interface SharedSongData {
  songId: string;
  sentId: string;
}

const ShareSongModal = () => {
  const sharesModal = useSharesSongModal();
  const [sharedData, setSharedData] = useState<SharedSongData | null>(null);
  const player = usePlayer();
  const supabaseClient = useSupabaseClient();

  const [songData, setSongData] = useState<Song | null>(null);
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [songImageUrl, setSongImageUrl] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sharedData) return;

    const fetchData = async () => {
      try {
        const { data: song, error: songError } = await supabaseClient
          .from("songs")
          .select("*")
          .eq("id", sharedData.songId)
          .single();
        if (songError) throw songError;
        setSongData(song);

        if (song?.image_path) {
          const { data } = supabaseClient.storage.from("images").getPublicUrl(song.image_path);
          setSongImageUrl(data.publicUrl);
        }

        const { data: user, error: userError } = await supabaseClient
          .from("users")
          .select("*")
          .eq("id", sharedData.sentId)
          .single();
        if (userError) throw userError;
        setUserData(user);

        if (user?.avatar_url) {
          const { data } = supabaseClient.storage.from("images").getPublicUrl(user.avatar_url);
          setUserAvatarUrl(data.publicUrl);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch song or user data");
      }
    };

    fetchData();
  }, [sharedData, supabaseClient]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get("songId");
    const sentId = urlParams.get("sentId");

    if (songId && sentId) {
      setSharedData({ songId, sentId });
      sharesModal.onOpen();
    }
  }, []);

  const handleClose = () => {
    sharesModal.onClose();
    const url = new URL(window.location.href);
    url.searchParams.delete("songId");
    url.searchParams.delete("sentId");
    window.history.replaceState({}, "", url.toString());
  };

  const handlePlay = () => {
    if (!songData) return;
    player.setId(songData.id);
    toast.success(`Playing "${songData.title}" by ${songData.author}`);
    handleClose();
  };

  return (
    <Modal
      title="Song Shared With You"
      description={
        sharedData
          ? `User ${userData?.username || "Unknown User"} shared a song with you!`
          : ""
      }
      isOpen={sharesModal.isOpen}
      onChange={handleClose}
    >
      {sharedData && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-4 items-center">
            {userAvatarUrl && (
              <img
                src={userAvatarUrl}
                alt="User Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-white font-semibold">{userData?.username || "Unknown User"}</p>
              <p className="text-white">Sent you a song!</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {songImageUrl && (
              <img
                src={songImageUrl}
                alt="Song Cover"
                className="w-24 h-24 rounded object-cover"
              />
            )}
            <div>
              <p className="text-white font-semibold">{songData?.title || "Unknown Song"}</p>
              <p className="text-white">By: {songData?.author || "Unknown Artist"}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
              onClick={handlePlay}
            >
              Play
            </button>
            <button
              className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-700"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ShareSongModal;
