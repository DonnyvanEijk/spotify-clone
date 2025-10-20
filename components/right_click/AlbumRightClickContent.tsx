'use client';

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { FaTrashAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { Album } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";

interface AlbumRightClickContentProps {
  isOwner: boolean;
  album: Album;
}

const AlbumRightClickContent: React.FC<AlbumRightClickContentProps> = ({ isOwner, album }) => {
  const supabaseClient = useSupabaseClient();
  const editAlbumModal = useEditAlbumModal();
  const deleteAlbumModal = useDeleteAlbumModal();
  const { subscription } = useUser();

  const handleDownload = async () => {
    if (!subscription) return;
    const { data, error } = await supabaseClient.storage.from("albums").download(album.image_path);
    if (error) return console.error("Download error:", error);

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${album.name}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleEditAlbum = () => editAlbumModal.onOpen(album.id);
  const handleDeleteAlbum = () => deleteAlbumModal.onOpen(album.id);

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
          {subscription ? "Download Album" : "Upgrade to pro to Download"}
        </ContextMenu.Item>

        {/* Owner Options */}
        {isOwner && (
          <>
            <ContextMenu.Separator className="my-2 h-px bg-white/20" />

            <ContextMenu.Item
              className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-white/10 hover:text-white"
              onClick={handleEditAlbum}
            >
              <MdOutlineModeEditOutline /> Edit Album
            </ContextMenu.Item>

            <ContextMenu.Item
              className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-200 cursor-pointer transition-colors hover:bg-red-600 hover:text-white"
              onClick={handleDeleteAlbum}
            >
              <FaTrashAlt /> Delete Album
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default AlbumRightClickContent;
