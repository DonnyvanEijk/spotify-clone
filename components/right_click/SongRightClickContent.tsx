'use client';

import React, { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight } from "react-icons/hi";
import { Song } from "@/types";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useDeleteSong } from "@/hooks/useDeleteSongModal";
import { useEditSongModal } from "@/hooks/useEditSongModal";
import { useAddLyricsModal } from "@/hooks/useAddLyricsModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  TbDownload, TbDownloadOff, TbMicrophone, TbShare3,
} from "react-icons/tb";
import {
  MdAccountCircle, MdOutlineModeEditOutline,
  MdPlaylistAdd, MdPlaylistAddCheck,
} from "react-icons/md";
import { CiTextAlignCenter } from "react-icons/ci";
import { HiOutlineTrash } from "react-icons/hi";

const content = "min-w-[210px] overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50";
const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none data-[disabled]:opacity-35 data-[disabled]:pointer-events-none";
const danger = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none";
const sep = "my-1 h-px bg-white/8 mx-2";

interface SongRightClickContentProps {
  isOwner: boolean;
  song: Song;
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

    // Explicitly typed { data } to any to resolve binding element implicit any error
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
      .eq("song_id", song.id)
      .eq("user_id", user.id)
      .then(({ data }: any) => { 
        if (data?.length) setIsInPlaylist(true); 
      });
  }, [song.id, supabaseClient, user?.id]);

  const PlaylistIcon = isInPlaylist ? MdPlaylistAddCheck : MdPlaylistAdd;

  const handleDownload = async () => {
    // Explicitly typed the result to bypass the loose client typing
    const { data, error }: { data: any; error: any } = await supabaseClient
      .storage
      .from('songs')
      .download(song.song_path);

    if (error || !data) {
      toast.error("Failed to download song");
      return console.error('Download error:', error);
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `${song.title}.mp3`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
    
    // Revoke the URL to avoid memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleAddToPlaylist = () => {
    if (!user) return authModal.onOpen();
    if (!userHasPlaylist) { 
      toast.error("Create a playlist first!"); 
      return createPlaylistModal.onOpen(); 
    }
    addToPlaylistModal.onOpen(song.id);
  };

  const handleShare = async () => {
    if (!user) return authModal.onOpen();
    try {
      await navigator.clipboard.writeText(`https://don-beat.vercel.app?songId=${song.id}&sentId=${user.id}`);
      toast.success("Link copied!");
    } catch { 
      toast.error("Failed to copy link."); 
    }
  };

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className={content}>
        <ContextMenu.Item 
          className={item} 
          onClick={handleDownload} 
          disabled={!subscription}
        >
          {subscription ? <TbDownload size={15} /> : <TbDownloadOff size={15} />}
          {subscription ? "Download" : "Pro required to download"}
        </ContextMenu.Item>

        <ContextMenu.Item 
          className={item} 
          onClick={handleAddToPlaylist} 
          disabled={!user}
        >
          <PlaylistIcon size={15} />
          {user ? "Add to playlist" : "Sign in to add to playlist"}
        </ContextMenu.Item>

        <ContextMenu.Item 
          className={item} 
          onClick={() => router.push(`/lyrics/${song.id}`)} 
          disabled={!user}
        >
          <TbMicrophone size={15} /> View lyrics
        </ContextMenu.Item>

        <ContextMenu.Item 
          className={item} 
          onClick={handleShare} 
          disabled={!user}
        >
          <TbShare3 size={15} /> Share
        </ContextMenu.Item>

        {user_id && (
          <ContextMenu.Item 
            className={item} 
            onClick={() => router.push(`/users/${user_id}`)}
          >
            <MdAccountCircle size={15} /> Go to uploader
          </ContextMenu.Item>
        )}

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
                <ContextMenu.SubContent 
                  className={content} 
                  sideOffset={4} 
                  alignOffset={-4}
                >
                  <ContextMenu.Item 
                    className={item} 
                    onClick={() => editSongModal.onOpen(song.id)}
                  >
                    <MdOutlineModeEditOutline size={15} /> Edit song
                  </ContextMenu.Item>
                  <ContextMenu.Separator className={sep} />
                  <ContextMenu.Item 
                    className={item} 
                    onClick={() => addLyricsModal.onOpen(song.id)}
                  >
                    <CiTextAlignCenter size={15} /> Edit lyrics
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>

            <ContextMenu.Item 
              className={danger} 
              onClick={() => deleteSongModal.onOpen(song.id)}
            >
              <HiOutlineTrash size={15} /> Delete song
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default SongRightClickContent;