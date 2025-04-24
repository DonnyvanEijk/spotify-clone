'use client';

import Image from 'next/image';
import useLoadImage from '@/hooks/useLoadImage';
import { Song } from '@/types';
import PlayButton from './playbutton';
import { twMerge } from 'tailwind-merge';
import * as ContextMenu from "@radix-ui/react-context-menu"
import SongRightClickContent from './right_click/SongRightClickContent';
import { differenceInHours } from 'date-fns';

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
  reactive?: boolean;
  isOwner: boolean;
  uploader?: string;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick, reactive, isOwner, uploader}) => {
  const imagePath = useLoadImage(data);
  const isNew = differenceInHours(new Date(), new Date(data.created_at)) <= 24;

  return (
    <ContextMenu.Root modal={false}>
    <ContextMenu.Trigger>
    <div
      onClick={() => onClick(data.id)}
      className={`
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
      border-purple-500
      hover:animate-wave
      `}
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
      {isNew && (
        <div className='absolute top-2 right-2'>
        <Image
          src='/images/new_badge.png'
          width={50}
          height={50}
          alt='New Badge'
        />
        </div>
      )}
      </div>
      <div className='flex flex-col items-start w-full pt-4 gap-y-1'>
      <p className={twMerge(`font-semibold truncate w-full`, reactive && "text-purple-500 font-semibold")}>{data.title}</p>
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
      {uploader && (
        <p
        className='
        text-neutral-400 
        text-sm 
        pb-4 
        w-full 
        truncate
        '
      >
        Uploaded by {uploader}
      </p>
        )}
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