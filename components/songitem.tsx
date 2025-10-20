'use client';

import useLoadImage from '@/hooks/useLoadImage';
import { Song } from '@/types';
import PlayButton from './playbutton';
import { twMerge } from 'tailwind-merge';
import * as ContextMenu from "@radix-ui/react-context-menu";
import SongRightClickContent from './right_click/SongRightClickContent';
import { differenceInHours } from 'date-fns';

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
  reactive?: boolean;
  isOwner: boolean;
  uploader?: string;
  user_id?: string;
}

const SongItem: React.FC<SongItemProps> = ({
  data,
  onClick,
  reactive,
  isOwner,
  uploader,
  user_id,
}) => {
  const imagePath = useLoadImage(data);
  const isNew = differenceInHours(new Date(), new Date(data.created_at)) <= 24;

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <div
          onClick={() => onClick(data.id)}
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
            before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:via-white/5 before:to-white/10 before:opacity-0 group-hover:before:opacity-40 before:rounded-3xl
          `, reactive && "ring-2 ring-purple-500/70 shadow-purple-500/30")}
        >
          {imagePath && (
            <div className="relative w-full pt-[100%] rounded-2xl overflow-hidden shadow-inner shadow-white/10">
              <img
                src={imagePath}
                alt={data.title}
                onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
              />

              {isNew && (
                <div className="absolute top-2 right-2">
                  <img src="/images/New.png" width={50} height={50} alt="New Badge" />
                </div>
              )}
            </div>
          )}

          {reactive && (
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
                reactive ? "text-purple-400" : "text-white"
              )}
            >
              {data.title}
            </p>
            <p className="text-neutral-300 text-xs truncate">
              By {data.author}
            </p>
            {uploader && (
              <p className="text-neutral-400 text-xs truncate">
                Uploaded by {uploader}
              </p>
            )}
          </div>

          {/* Play button appears on hover */}
          <div
            className="
              absolute 
              bottom-24 
              right-5 
              opacity-0 
              group-hover:opacity-100 
              transition-opacity duration-300
            "
          >
            <PlayButton />
          </div>

          {/* subtle shine overlay */}
          <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:animate-shine rounded-3xl" />
        </div>
      </ContextMenu.Trigger>
      <SongRightClickContent isOwner={isOwner} song={data} user_id={user_id} />
    </ContextMenu.Root>
  );
};

export default SongItem;
