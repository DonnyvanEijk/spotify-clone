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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { RiPlayListFill } from "react-icons/ri";
import { MdPlaylistAdd } from "react-icons/md";

const LikedPopover = () => {
  const supabaseClient = useSupabaseClient();
  const authModal = useAuthModal();
  const subscribeModal = useSubscribeModal();
  const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
  const clonePlaylistModal = useClonePlaylistModal();
  const { user, subscription } = useUser();

  const handleDownload = async () => {
    if (!subscription) {
      toast.error("Upgrade to pro to download your playlist");
      return;
    }

    const { data: PsData, error: PsError } = await supabaseClient
      .from("liked_songs")
      .select("song_id")
      .eq("user_id", user?.id);

    if (PsError) {
      console.error(PsError);
      toast.error("Error fetching playlist songs");
      return;
    }

    const songIds = PsData.map((song) => song.song_id);

    const { data: SData, error: SError } = await supabaseClient
      .from("songs")
      .select("*")
      .in("id", songIds);

    if (SError) {
      console.error(SError);
      toast.error("Error fetching songs");
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("Liked Songs");

    for (const song of SData) {
      const { data, error } = await supabaseClient.storage
        .from("songs")
        .download(song.song_path);

      if (error) {
        console.error(error);
        toast.error(`Error downloading ${song.title}`);
        return;
      }

      folder?.file(`${song.title}.mp3`, data);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liked_songs.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Playlist downloaded successfully");
  };

  const handleClonePlaylist = async () => {
    if (!user) return authModal.onOpen();
    if (!subscription) return subscribeModal.onOpen();

    const { data, error } = await supabaseClient
      .from("liked_songs")
      .select("song_id")
      .eq("user_id", user?.id);

    if (error || data.length === 0) {
      toast.error("No songs to clone");
      return;
    }

    const songIds = data.map((song) => song.song_id);
    clonePlaylistModal.onOpen(songIds, "liked");
  };

  const handleBatchAddToPlaylist = async () => {
    if (!user) return authModal.onOpen();

    const { data, error } = await supabaseClient
      .from("liked_songs")
      .select("song_id")
      .eq("user_id", user?.id);

    if (error || data.length === 0) {
      toast.error("No songs to add");
      return;
    }

    const songIds = data.map((song) => song.song_id);
    batchAddToPlaylistModal.onOpen(songIds, "liked");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded-full hover:bg-white/10 transition">
          <FaEllipsisH className="text-neutral-400 hover:text-white" size={22} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="
            bg-neutral-800/80 backdrop-blur-md rounded-2xl shadow-lg p-2 min-w-[220px]
            data-[side=bottom]:animate-slideUpAndFade
            data-[side=top]:animate-slideDownAndFade
            data-[side=left]:animate-slideRightAndFade
            data-[side=right]:animate-slideLeftAndFade
          "
        >
          <DropdownMenu.Item
            className="flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-white/10 cursor-pointer disabled:text-neutral-500"
            onClick={handleDownload}
            disabled={!subscription}
          >
            Download Playlist
            {subscription ? <TbDownload size={20} /> : <TbDownloadOff size={20} />}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-white/10 cursor-pointer disabled:text-neutral-500"
            onClick={handleBatchAddToPlaylist}
            disabled={!user}
          >
            Add to other Playlist
            <MdPlaylistAdd size={20} />
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-white/10 cursor-pointer disabled:text-neutral-500"
            onClick={handleClonePlaylist}
            disabled={!subscription}
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
