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
    return <p className="text-neutral-400 px-2">No songs found.</p>;
  }

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {songs.map((song) => (
        <div key={song.id} className="flex items-center gap-x-8 group w-full">
          <div className="flex-1">
            <MediaItem
              isOwner={song.user_id === userId}
              onClick={(id: string) => onPlay(id)}
              data={song}
              reactive={activeId === song.id}
              hasAlbumName
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex items-center gap-x-2 shrink-0">
            <PlaylistButton songId={song.id} />
            <LikeButton songId={song.id} creatorId={song.user_id} />
          </div>
        </div>
      ))}
    </div>
  );
};
