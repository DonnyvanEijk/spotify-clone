'use client';

import Image from 'next/image';

import useLoadImage from '@/hooks/useLoadImage';
import { Song } from '@/types';
import usePlayer from '@/hooks/usePlayer';
import { twMerge } from 'tailwind-merge';
import SongItem from './songitem';


interface MediaItemProps {
  data: Song;
  onClick?: (id: string) => void;
  className?: string;
  color?: string;
  reactive?: boolean;   
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick, className, color = "white", reactive }) => {
//   const player = usePlayer();
  const imageUrl = useLoadImage(data);
   
    
  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }


  };

  return (
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
  );
};

export default MediaItem;