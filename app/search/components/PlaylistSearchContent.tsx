"use client";

import PlaylistMediaItem from "@/components/PlaylistMediaItem";
import { Playlist } from "@/types";

interface PlaylistSearchContentProps {
  playlists: Playlist[];
  userId: string | undefined;
}

const PlaylistSearchContent: React.FC<PlaylistSearchContentProps> = ({ playlists, userId }) => {
  if (playlists.length === 0) {
    return <p className="text-neutral-400 px-2">No playlists found.</p>;
  }

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="flex items-center group w-full">
          <div className="flex-1">
            <PlaylistMediaItem
              isOwner={playlist.user_id === userId}
              data={playlist}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistSearchContent;
