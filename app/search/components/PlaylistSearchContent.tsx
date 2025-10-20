"use client";

import PlaylistMediaItem from "@/components/PlaylistMediaItem";
import { Playlist } from "@/types";

interface PlaylistSearchContentProps {
  playlists: Playlist[];
  userId: string | undefined;
}

const PlaylistSearchContent: React.FC<PlaylistSearchContentProps> = ({
  playlists,
  userId,
}) => {
  if (playlists.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        <p>No playlists found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3 w-full px-6 py-4">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="
            flex items-center gap-x-4 w-full
            bg-white/10 hover:bg-white/20
            backdrop-blur-xl
            border border-white/10
            rounded-xl
            p-3
            transition-all duration-300
            shadow-md hover:shadow-purple-500/20
          "
        >
          <div className="flex-1 truncate">
            <PlaylistMediaItem
              isOwner={playlist.user_id === userId}
              data={playlist}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistSearchContent;
