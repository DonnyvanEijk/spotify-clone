'use client';

import React, { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline, MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";
import { RiPlayListFill } from "react-icons/ri";
import { Playlist } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylistModal";
import { useEditPlaylistModal } from "@/hooks/useEditPlaylistModal";
import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import toast from "react-hot-toast";
import { TbDownload, TbDownloadOff } from "react-icons/tb";

interface PlaylistRightClickContentProps {
  isOwner: boolean;
  playlist: Playlist;
}

const PlaylistRightClickContent: React.FC<PlaylistRightClickContentProps> = ({ isOwner, playlist }) => {
  const supabaseClient = useSupabaseClient();
  const authModal = useAuthModal();
  const createPlaylistModal = useCreatePlaylistModal();
  const addToPlaylistModal = useAddToPlaylistModal();
  const editPlaylistModal = useEditPlaylistModal();
  const deletePlaylistModal = useDeletePlaylist();
  const clonePlaylistModal = useClonePlaylistModal();
  const { user, subscription } = useUser();

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
        .eq("playlist_id", playlist.id)
        .eq("user_id", user.id);

      if (data?.length) setIsInPlaylist(true);
    };

    checkUserPlaylist();
    fetchData();
  }, [playlist.id, supabaseClient, user?.id]);

  const Icon = isInPlaylist ? MdPlaylistAddCheck : MdPlaylistAdd;

  const handleDownload = async () => {
    if (!subscription) return;
    // TODO: implement playlist download logic
  };

  const handleAddToPlaylist = () => {
    if (!user) return authModal.onOpen();
    if (!userHasPlaylist) {
      toast.error("You need to create a playlist first!");
      return createPlaylistModal.onOpen();
    }
    addToPlaylistModal.onOpen(playlist.id);
  };

 const handleClonePlaylist = () => {
  if (!user || !subscription) return;
  clonePlaylistModal.onOpen([playlist.id], playlist.id);
};


  const handleEditPlaylist = () => editPlaylistModal.onOpen(playlist.id);
  const handleDeletePlaylist = () => deletePlaylistModal.onOpen(playlist.id);

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
          {subscription ? "Download Playlist" : "Upgrade to pro to Download"}
        </ContextMenu.Item>

        {/* Add to other Playlist */}
        <ContextMenu.Item
          className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
          onClick={handleAddToPlaylist}
          disabled={!user}
        >
          <Icon /> {user ? "Add to Playlist" : "Login to add to Playlist"}
        </ContextMenu.Item>

        {/* Clone Playlist */}
        <ContextMenu.Item
          className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
          onClick={handleClonePlaylist}
          disabled={!subscription}
        >
          <RiPlayListFill /> {subscription ? "Clone Playlist" : "Upgrade to pro to Clone"}
        </ContextMenu.Item>

        {isOwner && (
          <>
            <ContextMenu.Separator className="my-2 h-px bg-white/20" />

            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white">
                <div className="flex items-center gap-2">
                  <MdOutlineModeEditOutline /> Edit Playlist
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
                    onClick={handleEditPlaylist}
                  >
                    <MdOutlineModeEditOutline /> Edit Playlist
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>

            <ContextMenu.Item
              className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-red-600 hover:text-white"
              onClick={handleDeletePlaylist}
            >
              <FaTrashAlt /> Delete Playlist
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default PlaylistRightClickContent;
