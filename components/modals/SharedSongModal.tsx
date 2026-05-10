"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSharesSongModal } from "@/hooks/useSharedSongModal";
import usePlayer from "@/hooks/usePlayer";
import { Song, UserDetails } from "@/types";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Modal } from "../modal";
import { LuLoader } from "react-icons/lu";

interface SharedSongData {
  songId: string;
  sentId: string;
}

const ShareSongModal = () => {
  const sharesModal = useSharesSongModal();
  const [sharedData, setSharedData] = useState<SharedSongData | null>(null);
  const player = usePlayer();
  const supabaseClient = useSupabaseClient();
  const [loading, setLoading] = useState(false);

  const [songData, setSongData] = useState<Song | null>(null);
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [songImageUrl, setSongImageUrl] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sharedData) return;

    const fetchData = async () => {
      setLoading(true);
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
        setLoading(false);
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
    {loading && <div className="flex justify-center items-center h-16"><LuLoader className="animate-spin text-white"/></div>}
      {sharedData && !loading && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            {userAvatarUrl && (
              <img src={userAvatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userData?.username || "Unknown User"}</p>
              <p className="text-xs text-neutral-400">Shared a song with you</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            {songImageUrl && (
              <img src={songImageUrl} alt="Song Cover" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{songData?.title || "Unknown Song"}</p>
              <p className="text-xs text-neutral-400 truncate">{songData?.author || "Unknown Artist"}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-all duration-150"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              className="flex-1 px-4 py-2.5 bg-white rounded-lg text-sm font-semibold text-black hover:bg-neutral-200 active:scale-95 transition-all duration-150"
              onClick={handlePlay}
            >
              Play
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ShareSongModal;
