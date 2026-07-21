'use client';

import ImageWithFallback from "@/components/ImageWithFallback";
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
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
  hideBackground?: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({
  data,
  onClick,
  className,
  reactive,
  isOwner,
  hasAlbumName = false,
  disablePlay = false,
  hideBackground = false,
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
      <ContextMenu.Trigger asChild>
        <div
          onClick={handleClick}
          className={twMerge(
            "group relative flex items-center gap-x-3 w-full rounded-xl cursor-pointer transition-all duration-200",
            hideBackground
              ? "p-1 hover:bg-white/5"
              : "p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
            reactive && "bg-white/10 border-white/20",
            className
          )}
        >
          {/* Thumbnail */}
          <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-white/10">
            {imageUrl ? (
              <ImageWithFallback
                fill
                sizes="44px"
                src={imageUrl}
                alt={data.title}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10" />
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col min-w-0 flex-1">
            <p className={twMerge(
              "text-sm font-medium truncate",
              reactive ? "text-white" : "text-neutral-200 group-hover:text-white transition-colors duration-200"
            )}>
              {data.title}
            </p>
            <p className="text-xs text-neutral-400 truncate">{data.author}</p>
            {hasAlbumName && albumName && (
              <p className="text-xs text-neutral-500 truncate">{albumName}</p>
            )}
          </div>

          {/* Equalizer bars — playing indicator */}
          {reactive && (
            <div className="shrink-0 flex items-end gap-0.75 h-4">
              {[0, 0.15, 0.3].map((delay) => (
                <motion.div
                  key={delay}
                  className="w-0.75 rounded-full bg-white"
                  animate={{ scaleY: [0.25, 1, 0.25] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay }}
                  style={{ originY: 1, height: '100%' }}
                />
              ))}
            </div>
          )}
        </div>
      </ContextMenu.Trigger>

      <SongRightClickContent isOwner={isOwner} song={data} />
    </ContextMenu.Root>
  );
};

export default MediaItem;
