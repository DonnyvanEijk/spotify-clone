'use client';

import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiOutlineDotsHorizontal, HiOutlineTrash } from "react-icons/hi";
import { MdPlaylistAddCheck } from "react-icons/md";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const item = "flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none";
const danger = "flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none";

interface PlaylistItemDropdownProps {
  songId: string;
  playlistId: string;
  isOwner: boolean;
}

const PlaylistItemDropdown = ({ songId, playlistId, isOwner }: PlaylistItemDropdownProps) => {
  const authModal = useAuthModal();
  const supabaseClient = useSupabaseClient();
  const createPlaylistModal = useCreatePlaylistModal();
  const addToPlaylistModal = useAddToPlaylistModal();
  const router = useRouter();
  const { user } = useUser();
  const [userHasPlaylist, setUserHasPlaylist] = useState(false);

useEffect(() => {
    if (!user?.id) return;
        supabaseClient
      .from("playlists")
      .select("id")
      .eq("user_id", user.id)
      .then(({ data }: any) => { 
        if (data?.length) setUserHasPlaylist(true); 
      });
  }, [supabaseClient, user?.id]);

  const handleRemove = async () => {
    if (!user) return authModal.onOpen();
    const { error } = await supabaseClient
      .from('playlist_songs').delete()
      .eq('song_id', songId).eq('playlist_id', playlistId).eq('user_id', user.id);
    if (error) toast.error("Failed to remove song");
    else { toast.success("Removed from playlist"); router.refresh(); }
  };

  const handleAddToPlaylist = () => {
    if (!user) return authModal.onOpen();
    if (!userHasPlaylist) { toast.error("Create a playlist first!"); return createPlaylistModal.onOpen(); }
    addToPlaylistModal.onOpen(songId);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button className="focus:outline-none p-1 rounded-md text-neutral-500 hover:text-white hover:bg-white/8 transition-colors duration-100">
          <HiOutlineDotsHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-48 overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50"
          sideOffset={6}
          align="end"
        >
          <DropdownMenu.Item className={item} onClick={handleAddToPlaylist}>
            Add to playlist <MdPlaylistAddCheck size={15} className="text-neutral-500" />
          </DropdownMenu.Item>

          {isOwner && (
            <DropdownMenu.Item className={danger} onClick={handleRemove}>
              Remove <HiOutlineTrash size={15} />
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default PlaylistItemDropdown;
