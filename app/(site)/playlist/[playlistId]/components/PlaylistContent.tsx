"use client";

import { useRouter } from "next/navigation";
import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import MediaItem from "@/components/media-item";
import { LikeButton } from "@/components/like-button";
import useOnPlay from "@/hooks/useOnPlay";
import Link from "next/link";
import usePlayer from "@/hooks/usePlayer";
import PlaylistItemDropdown from "@/components/PlaylistitemDropdown";

interface PlaylistContentProps {
  songs: Song[];
  PlaylistId: string;
  isOwner: boolean;
  userId: string | undefined;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({
  songs,
  PlaylistId,
  isOwner,
  userId,
}) => {
  const { activeId } = usePlayer();
  const router = useRouter();
  const { isLoading, user } = useUser();
    const sortedSongs = [...songs].sort((a, b) =>
    String(a.created_at).localeCompare(String(b.created_at))
  );
  const onPlay = useOnPlay(sortedSongs);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        <p className="flex flex-row">
          No songs in this playlist. You can add them
          <Link href="/search" className="hover:underline ml-[0.3rem]">
            here
          </Link>
        </p>
      </div>
    );
  }



  return (
    <div className="flex flex-col gap-y-4 w-full p-6">
      {songs.map((song) => (
        <div
          key={song.id}
          className="flex items-center gap-x-8 group w-full"
        >
          {/* MediaItem */}
          <div className="flex-1">
            <MediaItem
              onClick={() => onPlay(song.id)}
              data={song}
              isOwner={song.user_id === userId}
              reactive={song.id === activeId}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
              hasAlbumName
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <PlaylistItemDropdown
              songId={song.id}
              playlistId={PlaylistId}
              isOwner={isOwner}
            />
            <LikeButton songId={song.id} creatorId={song.user_id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistContent;
