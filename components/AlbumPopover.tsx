"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { FaEllipsisH } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { MdOutlineModeEditOutline } from "react-icons/md";

interface AlbumPopoverProps {
    albumId: string;
    isOwner?: boolean;
}

const AlbumPopover: React.FC<AlbumPopoverProps> = ({ albumId, isOwner }) => {
    const supabaseClient = useSupabaseClient();
    const editAlbumModal = useEditAlbumModal();
    const deleteAlbumModal = useDeleteAlbumModal();
    const { subscription } = useUser();

    const handleDeleteAlbum = async () => {
        console.log("Delete Album");
        deleteAlbumModal.onOpen(albumId);
    }

    const handleDownload = async () => {
        const { data: albumData, error: albumError } = await supabaseClient
            .from('albums')
            .select('*')
            .eq('id', albumId)
            .single();

        if (albumError) {
            console.error('Error fetching album:', albumError);
            toast.error('Error fetching album');
            return;
        }

        const { data: PsData, error: PsError } = await supabaseClient
            .from('album_songs')
            .select('song_id')
            .eq('album_id', albumId);

        if (PsError) {
            console.error('Error fetching album songs:', PsError);
            toast.error('Error fetching album songs');
            return;
        }

        const songIds = PsData.map((song) => song.song_id);

        const { data: SData, error: SError } = await supabaseClient
            .from('songs')
            .select('*')
            .in('id', songIds);

        if (SError) {
            console.error('Error fetching songs:', SError);
            toast.error('Error fetching songs');
            return;
        }

        const songs = SData.map((song) => song);

        const zip = new JSZip();
        const folder = zip.folder(albumData.name);

        if (albumData.image_path) {
            const { data: imageData, error: imageError } = await supabaseClient.storage.from('images').download(albumData.image_path);

            if (imageError) {
                console.error('Error downloading album image:', imageError);
                toast.error('Error downloading album image');
                return;
            }

            if (folder) {
                folder.file(`${albumData.name}.png`, imageData);
            } else {
                console.error('Folder is null');
                toast.error('Folder is not available');
                return;
            }
        }

        for (const song of songs) {
            const { data, error } = await supabaseClient.storage.from('songs').download(song.song_path);

            if (error) {
                console.error('Error downloading file:', error);
                toast.error('Error downloading file');
                return;
            }

            if (folder) {
                folder.file(`${song.title}.mp3`, data);
            } else {
                console.error('Folder is null');
                toast.error('Folder is not available');
                return;
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${albumData.name}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Album downloaded successfully');
    }

    const handleEditAlbum = async () => {
        editAlbumModal.onOpen(albumId);
    }

    return (
    
           <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300 focus:outline-none">
          <FaEllipsisH className="text-neutral-400 hover:text-white transition-all duration-300" size={20} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="
            min-w-[220px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20
            shadow-lg py-2 flex flex-col gap-2 text-white
            will-change-[opacity,transform]
            data-[side=bottom]:animate-slideUpAndFade
            data-[side=top]:animate-slideDownAndFade
            data-[side=left]:animate-slideRightAndFade
            data-[side=right]:animate-slideLeftAndFade
          "
        >
          {isOwner && (
            <>
              <DropdownMenu.Item
                onClick={handleDeleteAlbum}
                className="flex justify-between items-center px-4 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                Delete Album <HiOutlineTrash size={20} />
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={handleEditAlbum}
                className="flex justify-between items-center px-4 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                Edit Album <MdOutlineModeEditOutline size={20} />
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-white/20" />
            </>
          )}

          <DropdownMenu.Item
            onClick={handleDownload}
            disabled={!subscription}
            className="flex justify-between items-center px-4 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:text-neutral-500"
          >
            {subscription ? (
              <>
                Download Album <TbDownload size={20} />
              </>
            ) : (
              <>
                Upgrade to Pro <TbDownloadOff size={20} />
              </>
            )}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>

    );
}

export default AlbumPopover;