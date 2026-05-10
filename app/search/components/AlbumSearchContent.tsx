"use client";

import AlbumMediaItem from "@/components/AlbumMediaItem";
import { Album } from "@/types";

interface AlbumSearchContentProps {
  albums: Album[];
  userId: string | undefined;
}

const AlbumSearchContent: React.FC<AlbumSearchContentProps> = ({ albums, userId }) => {
  if (albums.length === 0) {
    return <p className="text-neutral-400 px-2">No albums found.</p>;
  }

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {albums.map((album) => (
        <div key={album.id} className="flex items-center group w-full">
          <div className="flex-1">
            <AlbumMediaItem
              isOwner={album.user_id === userId}
              data={album}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumSearchContent;
