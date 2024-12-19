'use client';

import Image from 'next/image';

import useLoadImage from '@/hooks/useLoadImage';
import { Song } from '@/types';
import { twMerge } from 'tailwind-merge';
import usePlayer from '@/hooks/usePlayer';
import * as ContextMenu from "@radix-ui/react-context-menu"
import SongRightClickContent from './SongRightClickContent';


interface MediaItemProps {
  data: Song;
  onClick?: (id: string) => void;
  className?: string;
  isOwner: boolean;
  reactive?: boolean;   
  isPlayer?: boolean
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick, className, reactive, isPlayer, isOwner

 }) => {
  const player = usePlayer();
  const imageUrl = useLoadImage(data);
   
    
  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }

    return player.setId(data.id);
  };

  if (isPlayer) {
    return (
        <div
            onClick={handleClick}
            className="
flex
items-center
gap-x-3
cursor-pointer
hover:bg-neutral-800/50
w-full
p-2
rounded-md
"
        >
            <div
                className="
relative
rounded-md
min-h-[48px]
min-w-[48px]
"
            >
                <Image
                    fill
                    src={imageUrl || "/images/liked.png"}
                    alt="mediaItem"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col gap-y-1 overflow-hidden">
                <p className={twMerge("text-white truncate", reactive && "text-green-500")}>{data.title}</p>
                <p className="text-neutral-400 text-sm truncate">{data.author}</p>
            </div>
        </div>
    )
}

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
    <div
      onClick={handleClick}
      className={twMerge(` flex 
        items-center 
        gap-x-3 
        cursor-pointer 
        hover:bg-neutral-800/50 
        w-full 
        p-2 
        rounded-md`, className)}
       

      
    >
      <div
        className='
          relative 
          rounded-md 
          min-h-[48px] 
          min-w-[48px] 
          overflow-hidden
        '
      >
        <Image
          fill
          src={imageUrl || '/images/music-placeholder.png'}
          alt='MediaItem'
          className='object-cover'
        />
      </div>
      <div className='flex flex-col gap-y-1 overflow-hidden'>
        <p className={twMerge(` truncate`, reactive && "font-semibold text-green-500")}>{data.title}</p>
        <p className='text-neutral-400 text-sm truncate'>By {data.author}</p>
      </div>
    </div>
    </ContextMenu.Trigger>
    <SongRightClickContent isOwner={isOwner} song={data} />
    </ContextMenu.Root>
  );
};

export default MediaItem;