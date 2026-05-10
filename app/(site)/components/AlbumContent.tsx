"use client";

import AlbumItem from "@/components/AlbumItem";
import { Album } from "@/types";
import { HiOutlineCollection } from "react-icons/hi";
import Carousel from "./Carousel";

interface PageContentProps {
  albums: Album[];
  userId: string | undefined;
}

const AlbumContent: React.FC<PageContentProps> = ({ albums, userId }) => {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500">
        <HiOutlineCollection size={36} />
        <p className="text-sm">No albums yet</p>
      </div>
    );
  }

  return (
    <Carousel>
      {albums.slice(0, 20).map((item) => (
        <div key={item.id} className="shrink-0 w-40">
          <AlbumItem
            key={item.id}
            data={item}
            isOwner={item.user_id === userId}
          />
        </div>
      ))}
    </Carousel>
  );
};

export default AlbumContent;
