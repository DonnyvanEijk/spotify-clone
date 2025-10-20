"use client";

import AlbumMediaItem from "@/components/AlbumMediaItem";
import { Album } from "@/types";

interface AlbumSearchContentProps {
  albums: Album[];
  userId: string | undefined;
}

const AlbumSearchContent: React.FC<AlbumSearchContentProps> = ({
  albums,
  userId,
}) => {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        <p>No albums found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3 w-full px-6 py-4">
      {albums.map((album) => (
        <div
          key={album.id}
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
            <AlbumMediaItem
              isOwner={album.user_id === userId}
              data={album}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumSearchContent;
