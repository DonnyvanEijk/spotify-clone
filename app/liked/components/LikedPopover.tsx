"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FaEllipsisH } from "react-icons/fa";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";
import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { RiPlayListFill } from "react-icons/ri";
import { MdPlaylistAdd } from "react-icons/md";
import { Song } from "@/types";

const LikedPopover = () => {
  // Since you updated your Provider/Context to 'any', 
  // this client is now "loose" and won't throw 'never' errors.
  const supabaseClient = useSupabaseClient();
  const authModal = useAuthModal();
  const subscribeModal = useSubscribeModal();
  const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
  const clonePlaylistModal = useClonePlaylistModal();
  const { user, subscription } = useUser();

  const handleDownload = async () => {
    if (!user) return authModal.onOpen();
    if (!subscription) {
      toast.error("Upgrade to pro to download your playlist");
      return;
    }

    const { data: PsData, error: PsError } = await supabaseClient
      .from("liked_songs")
      .select("song_id")
      .eq("user_id", user.id);

    if (PsError || !PsData) {
      console.error(PsError);
      toast.error("Error fetching playlist songs");
      return;
    }

    if (PsData.length === 0) {
      toast.error("No songs found to download");
      return;
    }

    // Convert to numbers for the Supabase 'songs' table query
    const numericSongIds = PsData.map((song: any) => Number(song.song_id));

    const { data: SData, error: SError } = await supabaseClient
      .from("songs")
      .select("*")
      .in("id", numericSongIds);

    if (SError || !SData) {
      console.error(SError);
      toast.error("Error fetching songs");
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("Liked Songs");

    // Double cast used to bridge to your string-id Song interface
    const songs = (SData as unknown as Song[]) || [];

    for (const song of songs) {
      if (!song.song_path || !song.title) continue;

      const { data, error } = await supabaseClient.storage
        .from("songs")
        .download(song.song_path);

      if (error) {
        console.error(error);
        toast.error(`Error downloading ${song.title}`);
        continue; 
      }

      if (data && folder) {
        folder.file(`${song.title}.mp3`, data);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liked_songs.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Playlist downloaded successfully");
  };

  const handleClonePlaylist = async () => {
    if (!user) return authModal.onOpen();
    if (!subscription) return subscribeModal.onOpen();

    const { data, error } = await supabaseClient
      .from("liked_songs")
      .select("song_id")
      .eq("user_id", user.id);

    if (error || !data || data.length === 0) {
      toast.error("No songs to clone");
      return;
    }

    const stringSongIds = data.map((song: any) => String(song.song_id));
    clonePlaylistModal.onOpen(stringSongIds, "liked");
  };

  const handleBatchAddToPlaylist = async () => {
    if (!user) return authModal.onOpen();

    const { data, error } = await supabaseClient
      .from("liked_songs")
      .select("song_id")
      .eq("user_id", user.id);

    if (error || !data || data.length === 0) {
      toast.error("No songs to add");
      return;
    }

    const stringSongIds = data.map((song: any) => String(song.song_id));
    batchAddToPlaylistModal.onOpen(stringSongIds, "liked");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded-full hover:bg-white/10 transition outline-none">
          <FaEllipsisH className="text-neutral-400 hover:text-white" size={22} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="
            bg-neutral-800/80 backdrop-blur-md rounded-2xl shadow-lg p-2 min-w-[220px] z-[100]
            data-[side=bottom]:animate-slideUpAndFade
            data-[side=top]:animate-slideDownAndFade
          "
        >
          <DropdownMenu.Item
            disabled={!subscription}
            onClick={(e) => {
               if (!subscription) {
                 e.preventDefault();
                 return;
               }
               handleDownload();
            }}
            className="flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-white/10 cursor-pointer outline-none data-[disabled]:text-neutral-500 data-[disabled]:pointer-events-none"
          >
            Download Playlist
            {subscription ? <TbDownload size={20} /> : <TbDownloadOff size={20} />}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            disabled={!user}
            onClick={handleBatchAddToPlaylist}
            className="flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-white/10 cursor-pointer outline-none data-[disabled]:text-neutral-500 data-[disabled]:pointer-events-none"
          >
            Add to other Playlist
            <MdPlaylistAdd size={20} />
          </DropdownMenu.Item>

          <DropdownMenu.Item
            disabled={!subscription}
            onClick={handleClonePlaylist}
            className="flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-white/10 cursor-pointer outline-none data-[disabled]:text-neutral-500 data-[disabled]:pointer-events-none"
          >
            Clone Playlist
            <RiPlayListFill size={20} />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default LikedPopover;