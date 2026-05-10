'use client';

import React, { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight, HiOutlineTrash } from "react-icons/hi";
import { MdOutlineModeEditOutline, MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";
import { RiPlayListFill } from "react-icons/ri";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { Playlist } from "@/types";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylistModal";
import { useEditPlaylistModal } from "@/hooks/useEditPlaylistModal";
import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import toast from "react-hot-toast";

const content = "min-w-[210px] overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50";
const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none data-[disabled]:opacity-35 data-[disabled]:pointer-events-none";
const danger = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none";
const sep = "my-1 h-px bg-white/8 mx-2";

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

    // Fixed: Added explicit ': any' to destructured 'data'
    supabaseClient
      .from("playlists")
      .select("id")
      .eq("user_id", user.id)
      .then(({ data }: any) => { 
        if (data?.length) setUserHasPlaylist(true); 
      });

    supabaseClient
      .from("playlist_songs")
      .select("playlist_id")
      .eq("playlist_id", playlist.id)
      .eq("user_id", user.id)
      .then(({ data }: any) => { 
        if (data?.length) setIsInPlaylist(true); 
      });
  }, [playlist.id, supabaseClient, user?.id]);

  const PlaylistIcon = isInPlaylist ? MdPlaylistAddCheck : MdPlaylistAdd;

  const handleAddToPlaylist = () => {
    if (!user) return authModal.onOpen();
    if (!userHasPlaylist) { 
      toast.error("Create a playlist first!"); 
      return createPlaylistModal.onOpen(); 
    }
    addToPlaylistModal.onOpen(playlist.id);
  };

  const handleClonePlaylist = () => {
    if (!user) return authModal.onOpen();
    if (!subscription) return;
    clonePlaylistModal.onOpen([playlist.id], playlist.id);
  };

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className={content}>
        <ContextMenu.Item className={item} disabled={!subscription}>
          {subscription ? <TbDownload size={15} /> : <TbDownloadOff size={15} />}
          {subscription ? "Download" : "Pro required to download"}
        </ContextMenu.Item>

        <ContextMenu.Item className={item} onClick={handleAddToPlaylist} disabled={!user}>
          <PlaylistIcon size={15} />
          {user ? "Add to playlist" : "Sign in to add to playlist"}
        </ContextMenu.Item>

        <ContextMenu.Item className={item} onClick={handleClonePlaylist} disabled={!subscription}>
          <RiPlayListFill size={15} />
          {subscription ? "Clone playlist" : "Pro required to clone"}
        </ContextMenu.Item>

        {isOwner && (
          <>
            <ContextMenu.Separator className={sep} />

            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className={`${item} justify-between`}>
                <span className="flex items-center gap-2.5">
                  <MdOutlineModeEditOutline size={15} /> Edit
                </span>
                <HiChevronRight size={13} className="text-neutral-500" />
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent className={content} sideOffset={4} alignOffset={-4}>
                  <ContextMenu.Item className={item} onClick={() => editPlaylistModal.onOpen(playlist.id)}>
                    <MdOutlineModeEditOutline size={15} /> Edit playlist
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>

            <ContextMenu.Item className={danger} onClick={() => deletePlaylistModal.onOpen(playlist.id)}>
              <HiOutlineTrash size={15} /> Delete playlist
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default PlaylistRightClickContent;