'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Song } from '@/types';
import usePlayer from '@/hooks/usePlayer';
import useLoadImage from '@/hooks/useLoadImage';
import useGetAlbumName from '@/hooks/useGetAlbumName';
import SongRightClickContent from './right_click/SongRightClickContent';

interface MediaItemProps {
  data: Song;
  onClick?: (id: string) => void;
  className?: string;
  isOwner: boolean;
  reactive?: boolean;   
  isPlayer?: boolean;
  hasAlbumName?: boolean;
  disablePlay?: boolean;
  hideBackground?: boolean; // new prop
}

const MediaItem: React.FC<MediaItemProps> = ({
  data,
  onClick,
  className,
  reactive,
  isOwner,
  hasAlbumName = false,
  disablePlay = false,
  hideBackground = false, // default false
}) => {
  const player = usePlayer();
  const imageUrl = useLoadImage(data);
  const { albumName } = useGetAlbumName(data.album_id);

  const handleClick = () => {
    if (disablePlay) return;
    if (onClick) return onClick(data.id);
    player.setId(data.id);
  };

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <div
          onClick={handleClick}
          className={twMerge(`
            relative flex items-center gap-x-3 cursor-pointer
            w-full p-2 rounded-xl overflow-hidden
            ${hideBackground ? "bg-transparent border-none" : "bg-white/5 border border-white/20 backdrop-blur-[20px]"}
            transition-all duration-300
            hover:scale-[1.03] 
          `, reactive && "ring-2 ring-purple-500/70", className)}
        >
          {imageUrl && (
            <div className="relative min-h-[48px] min-w-[48px] rounded-2xl overflow-hidden shadow-inner shadow-white/10">
              <Image fill src={imageUrl} alt={data.title} className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl" />
            </div>
          )}

          <div className="flex flex-col gap-y-1 overflow-hidden">
            <p className={twMerge("truncate", reactive ? "font-semibold text-purple-500" : "text-white")}>
              {data.title}
            </p>
            <p className="text-neutral-400 text-sm truncate">{data.author}</p>
            {hasAlbumName && albumName && <p className="text-neutral-400 text-sm truncate">{albumName || ""}</p>}
          </div>

          {!hideBackground && (
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:animate-shine rounded-3xl" />
          )}
        </div>
      </ContextMenu.Trigger>

      <SongRightClickContent isOwner={isOwner} song={data} />
    </ContextMenu.Root>
  );
};

export default MediaItem;
