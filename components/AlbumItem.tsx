"use client"

import { Album } from "@/types";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import useLoadAlbumImage from "@/hooks/useLoadAlbumImage";
import Link from "next/link";
import * as ContextMenu from "@radix-ui/react-context-menu";
import AlbumRightClickContent from "./right_click/AlbumRightClickContent";

interface AlbumItemProps {
  data: Album;
  isOwner: boolean;
}

const AlbumItem: React.FC<AlbumItemProps> = ({ data, isOwner }) => {
  const imagePath = useLoadAlbumImage(data);
  const albumId = data.id;
  const { activeId } = usePlayer();
  const playing = albumId === activeId;

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <Link href={`/album/${albumId}`}>
          <div
            className={twMerge(`
              relative
              group
              flex
              flex-col
              items-center
              justify-center
              rounded-2xl
              overflow-hidden
              bg-white/5
              backdrop-blur-md
              border border-white/10
              transition-all duration-300
              hover:scale-[1.03]
              hover:bg-white/10
              hover:border-white/20
              cursor-pointer
              p-3
            `, playing && "ring-2 ring-white/20")}
          >
            <div className="relative w-full pt-[100%] rounded-xl overflow-hidden bg-white/10">
              <img
                src={imagePath || "/images/fallback.png"}
                alt={data.name}
                onError={(e) => (e.currentTarget.src = "/images/fallback.png")}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col items-start w-full pt-3 gap-y-1">
              <p className={twMerge("font-semibold text-sm truncate w-full", playing && "text-purple-400")}>
                {data.name}
              </p>
              <p className="text-neutral-400 text-xs truncate">
                By {data.author}
              </p>
            </div>
          </div>
        </Link>
      </ContextMenu.Trigger>
      <AlbumRightClickContent isOwner={isOwner} album={data} />
    </ContextMenu.Root>
  );
}

export default AlbumItem;
