'use client';

import Image from 'next/image';
import useLoadImage from '@/hooks/useLoadImage';
import { Song } from '@/types';
import PlayButton from './playbutton';
import { twMerge } from 'tailwind-merge';
import * as ContextMenu from "@radix-ui/react-context-menu"
interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
  reactive?: boolean;
  isOwner: boolean;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick, reactive, isOwner}) => {
  const imagePath = useLoadImage(data);

  return (
    <ContextMenu.Root>
    <ContextMenu.Trigger>
    <div
      onClick={() => onClick(data.id)}
      className='
        relative 
        group 
        flex 
        flex-col 
        items-center 
        justify-center 
        rounded-md 
        overflow-hidden 
        gap-x-4 
        bg-neutral-400/5 
        cursor-pointer 
        hover:bg-neutral-400/10 
        transition 
        p-3
      '
    >
      <div
        className='
          relative 
          aspect-square 
          w-full
          h-full 
          rounded-md 
          overflow-hidden
        '
      >
        <Image
          className='object-cover'
          src={imagePath || '/images/music-placeholder.png'}
          fill
          alt='Image'
        />
      </div>
      <div className='flex flex-col items-start w-full pt-4 gap-y-1'>
        <p className={twMerge(`font-semibold truncate w-full`, reactive && "text-green-500 font-semibold")}>{data.title}</p>
        <p
          className='
            text-neutral-400 
            text-sm 
            pb-4 
            w-full 
            truncate
          '
        >
          By {data.author}
        </p>
      </div>
      <div
        className='
          absolute 
          bottom-24 
          right-5
        '
      >
        <PlayButton />
      </div>
    </div>
    </ContextMenu.Trigger>
    <SongRightClickContent isOwner={isOwner} song={data} />
    </ContextMenu.Root>
  );
};

export default SongItem;