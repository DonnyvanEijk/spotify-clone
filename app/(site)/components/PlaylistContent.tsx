"use client";

import PlaylistItem from "@/components/PlaylistItem";
import { Playlist } from "@/types";
import { HiOutlineCollection } from "react-icons/hi";
import Carousel from "./Carousel";

interface PlaylistContentProps {
  playlists: Playlist[];
  userId: string | undefined;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ playlists, userId }) => {
  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500">
        <HiOutlineCollection size={36} />
        <p className="text-sm">No playlists yet</p>
      </div>
    );
  }

  return (
    <Carousel>
      {playlists.slice(0, 20).map((item) => (
        <div key={item.id} className="shrink-0 w-40">
          <PlaylistItem
            isOwner={item.user_id === userId}
            data={item}
          />
        </div>
      ))}
    </Carousel>
  );
};

export default PlaylistContent;
