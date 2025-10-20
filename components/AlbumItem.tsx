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
             bg-white/10
              border border-white/20
              gap-x-4
              bg-gradient-to-br from-neutral-800/40 to-neutral-700/20
              backdrop-blur-md
              shadow-lg shadow-purple-500/10
              transition-transform duration-300
              hover:scale-[1.04] hover:shadow-purple-500/30
              cursor-pointer
              p-4
            `, playing && "ring-2 ring-purple-500/70 shadow-purple-500/30")}
          >
            {imagePath && (
              <div className="relative w-full pt-[100%] rounded-xl overflow-hidden shadow-md">
                <img
                  src={imagePath}
                  alt={data.name}
                  onError={(e) => (e.currentTarget.src = "/images/fallback.png")}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}

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
