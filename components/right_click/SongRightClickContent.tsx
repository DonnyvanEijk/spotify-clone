'use client';

import React, { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";
import { MdAccountCircle, MdOutlineModeEditOutline, MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";
import { Song } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff, TbMicrophone } from "react-icons/tb";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import toast from "react-hot-toast";
import { CiTextAlignCenter } from "react-icons/ci";
import { useDeleteSong } from "@/hooks/useDeleteSongModal";
import { useEditSongModal } from "@/hooks/useEditSongModal";
import { useAddLyricsModal } from "@/hooks/useAddLyricsModal";
import { useRouter } from "next/navigation";

interface SongRightClickContentProps {
  isOwner: boolean;
  song: Song
  user_id?: string;
}

const SongRightClickContent: React.FC<SongRightClickContentProps> = ({ isOwner, song, user_id }) => {
  const supabaseClient = useSupabaseClient();
  const authModal = useAuthModal();
  const createPlaylistModal = useCreatePlaylistModal();
  const addToPlaylistModal = useAddToPlaylistModal();
  const editSongModal = useEditSongModal();
  const deleteSongModal = useDeleteSong();
  const addLyricsModal = useAddLyricsModal();
  const { user, subscription } = useUser();
  const router = useRouter();

  const [isInPlaylist, setIsInPlaylist] = useState(false);
  const [userHasPlaylist, setUserHasPlaylist] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const checkUserPlaylist = async () => {
      const { data } = await supabaseClient
        .from("playlists")
        .select("id")
        .eq("user_id", user.id);

      if (data?.length) setUserHasPlaylist(true);
    };

    const fetchData = async () => {
      const { data } = await supabaseClient
        .from("playlist_songs")
        .select("playlist_id")
        .eq("song_id", song.id)
        .eq("user_id", user.id);

      if (data?.length) setIsInPlaylist(true);
    };

    checkUserPlaylist();
    fetchData();
  }, [song.id, supabaseClient, user?.id]);

  const Icon = isInPlaylist ? MdPlaylistAddCheck : MdPlaylistAdd;

  const handleDownload = async () => {
    const { data, error } = await supabaseClient.storage.from('songs').download(song.song_path);
    if (error) return console.error('Download error:', error);

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleAddToPlaylist = () => {
    if (!user) return authModal.onOpen();
    if (!userHasPlaylist) {
      toast.error("You need to create a playlist first!");
      return createPlaylistModal.onOpen();
    }
    addToPlaylistModal.onOpen(song.id);
  };

  const handleDeleteSong = () => deleteSongModal.onOpen(song.id);
  const handleEditSong = () => editSongModal.onOpen(song.id);
  const handleAddLyrics = () => addLyricsModal.onOpen(song.id);

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content
        className="
          min-w-[220px] overflow-hidden rounded-2xl p-2
          bg-white/10 backdrop-blur-[18px]
          border border-white/20
          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
          flex flex-col
        "
      >
        {/* Download */}
        <ContextMenu.Item
          className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
          onClick={handleDownload}
          disabled={!subscription}
        >
          {subscription ? <TbDownload /> : <TbDownloadOff />}
          {subscription ? "Download Song" : "Upgrade to pro to Download"}
        </ContextMenu.Item>

        {/* Add to Playlist */}
        <ContextMenu.Item
          className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
          onClick={handleAddToPlaylist}
          disabled={!user}
        >
          <Icon /> {user ? "Add To Playlist" : "Login to add To Playlist"}
        </ContextMenu.Item>

        {/* View Lyrics */}
        <ContextMenu.Item
          className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => router.push(`/lyrics/${song.id}`)}
          disabled={!user}
        >
          <TbMicrophone /> View Lyrics
        </ContextMenu.Item>

        {/* Go to uploader */}
        {user_id && (
          <ContextMenu.Item
            className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => router.push(`/users/${user_id}`)}
            disabled={!user}
          >
            <MdAccountCircle /> Go to uploader
          </ContextMenu.Item>
        )}

        {/* Owner Options */}
        {isOwner && (
          <>
            <ContextMenu.Separator className="my-2 h-px bg-white/20" />

            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white">
                <div className="flex items-center gap-2">
                  <MdOutlineModeEditOutline /> Edit Song
                </div>
                <HiChevronRight />
              </ContextMenu.SubTrigger>

              <ContextMenu.Portal>
                <ContextMenu.SubContent
                  className="
                    min-w-[200px] overflow-hidden rounded-2xl p-2
                    bg-white/10 backdrop-blur-[18px]
                    border border-white/20
                    shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                    flex flex-col
                  "
                  sideOffset={2}
                  alignOffset={-5}
                >
                  <ContextMenu.Item
                    className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
                    onClick={handleEditSong}
                  >
                    <MdOutlineModeEditOutline /> Edit Song
                  </ContextMenu.Item>
                  <ContextMenu.Separator className="my-2 h-px bg-white/20" />
                  <ContextMenu.Item
                    className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
                    onClick={handleAddLyrics}
                  >
                    <CiTextAlignCenter /> Edit Lyrics
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>

            <ContextMenu.Item
              className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-red-600 hover:text-white"
              onClick={handleDeleteSong}
            >
              <FaTrashAlt /> Delete Song
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default SongRightClickContent;
