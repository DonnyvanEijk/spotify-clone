"use client";

import { Playlist } from "@/types";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import useLoadPlaylistImage from "@/hooks/useLoadPlaylistImage";
import Link from "next/link";
import * as ContextMenu from "@radix-ui/react-context-menu";
import PlaylistRightClickContent from "./right_click/PlaylistRightClickContent";

interface PlaylistItemProps {
  data: Playlist;
  isOwner: boolean;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ data, isOwner }) => {
  const imagePath = useLoadPlaylistImage(data);
  const playlistId = data.id;
  const { activeId } = usePlayer();
  const playing = playlistId === activeId;

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <Link href={`/playlist/${playlistId}`}>
          <div
            className={twMerge(`
              relative
              group
              flex
              flex-col
              items-center
              justify-center
              rounded-3xl
              overflow-hidden
              bg-white/10
              backdrop-blur-[20px]
              border border-white/20
              shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
              transition-all duration-300
              hover:scale-[1.05] hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.45)]
              cursor-pointer
              p-4
              w-full
            `, playing && "ring-2 ring-purple-500/70 shadow-purple-500/30")}
          >
            {imagePath && (
              <div className="relative w-full pt-[100%] rounded-2xl overflow-hidden shadow-inner shadow-white/10">
                <img
                  src={imagePath}
                  alt={data.name}
                  onError={(e) => (e.currentTarget.src = "/images/fallback.png")}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
                />
              </div>
            )}

            {playing && (
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-md animate-pulse">
                  Playing
                </span>
              </div>
            )}

            <div className="flex flex-col items-start w-full pt-3 gap-y-1 text-left">
              <p
                className={twMerge(
                  "font-semibold text-sm truncate w-full",
                  playing ? "text-purple-400" : "text-white"
                )}
              >
                {data.name}
              </p>

              {/* Horizontal scroll description on card hover */}
              <div className="relative w-full overflow-hidden">
                <p className="text-neutral-300 text-xs whitespace-nowrap transition-transform duration-[15s] ease-linear group-hover:translate-x-[-100%]">
                  {data.description || "No description"}
                </p>
              </div>
            </div>

            {/* subtle shine overlay */}
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:animate-shine rounded-3xl" />
          </div>
        </Link>
      </ContextMenu.Trigger>

      <PlaylistRightClickContent isOwner={isOwner} playlist={data} />
    </ContextMenu.Root>
  );
};

export default PlaylistItem;
