"use client";

import { LikeButton } from "@/components/like-button";
import MediaItem from "@/components/media-item";
import PlaylistButton from "@/components/PlaylistButton";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";

type Props = {
  songs: Song[];
  userId: string | undefined;
};

export const SongSearchContent = ({ songs, userId }: Props) => {
  const onPlay = useOnPlay(songs);
  const { activeId } = usePlayer();

  if (songs.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        No songs found.
      </div>
    );
  }

  return (
    <div className="flex flex-col  w-full px-6 py-4">
      {songs.map((song) => (
        <div
          key={song.id}
          className="
            flex items-center gap-x-4 w-full
            border-white/20
            rounded-xl
            p-3
            transition-all duration-300
            scale-1.2

          "
        >
          <div className="flex-1 truncate">
            <MediaItem
            className=" bg-white/10 hover:bg-white/20 hover:border-white-40 hover:scale-1 h-24"
              isOwner={song.user_id === userId}
              onClick={(id: string) => onPlay(id)}
              data={song}
              reactive={activeId === song.id}
              hasAlbumName
            />
          </div>

          <div className="flex items-center gap-x-2">
            <PlaylistButton songId={song.id} />
            <LikeButton songId={song.id} creatorId={song.user_id} />
          </div>
        </div>
      ))}
    </div>
  );
};
