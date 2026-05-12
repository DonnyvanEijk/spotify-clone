'use client';

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiOutlineTrash } from "react-icons/hi";
import { MdOutlineModeEditOutline, MdPlaylistAdd } from "react-icons/md";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { Album, Song } from "@/types";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";
import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";
import toast from "react-hot-toast";

const content = "min-w-[210px] overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50";
const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none data-[disabled]:opacity-35 data-[disabled]:pointer-events-none";
const danger = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none";
const sep = "my-1 h-px bg-white/8 mx-2";

interface AlbumRightClickContentProps {
  isOwner: boolean;
  album: Album;
}

const AlbumRightClickContent: React.FC<AlbumRightClickContentProps> = ({ isOwner, album }) => {
  const supabaseClient = useSupabaseClient();
  const editAlbumModal = useEditAlbumModal();
  const deleteAlbumModal = useDeleteAlbumModal();
  const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
  const { subscription } = useUser();

  const handleBatchAddToPlaylist = async () => {
    const { data, error } = await supabaseClient
      .from("songs")
      .select("id")
      .eq("album_id", album.id);

    if (error || !data) return;

    const songIds = data.map((s: any) => String(s.id));
    batchAddToPlaylistModal.onOpen(songIds, album.id);
  };

  const handleDownload = async () => {
    if (!subscription) return;

    const { data: songsData, error: songsError } = await supabaseClient
      .from("songs")
      .select("*")
      .eq("album_id", album.id);

    if (songsError || !songsData) return toast.error("Error fetching songs");

    const songs = songsData as unknown as Song[];
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(album.name);

    if (album.image_path) {
      const { data: imageData } = await supabaseClient.storage
        .from("images")
        .download(album.image_path);
      if (imageData && folder) folder.file(`${album.name}.png`, imageData);
    }

    for (const song of songs) {
      if (!song.song_path || !song.title) continue;
      const { data } = await supabaseClient.storage.from("songs").download(song.song_path);
      if (data && folder) folder.file(`${song.title}.mp3`, data);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${album.name}.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success("Album downloaded successfully");
  };

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className={content}>
        <ContextMenu.Item className={item} onClick={handleDownload} disabled={!subscription}>
          {subscription ? <TbDownload size={15} /> : <TbDownloadOff size={15} />}
          {subscription ? "Download" : "Pro required to download"}
        </ContextMenu.Item>

        <ContextMenu.Item className={item} onClick={handleBatchAddToPlaylist}>
          <MdPlaylistAdd size={15} /> Add to Playlist
        </ContextMenu.Item>

        {isOwner && (
          <>
            <ContextMenu.Separator className={sep} />

            <ContextMenu.Item className={item} onClick={() => editAlbumModal.onOpen(album.id)}>
              <MdOutlineModeEditOutline size={15} /> Edit album
            </ContextMenu.Item>

            <ContextMenu.Item className={danger} onClick={() => deleteAlbumModal.onOpen(album.id)}>
              <HiOutlineTrash size={15} /> Delete album
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default AlbumRightClickContent;
