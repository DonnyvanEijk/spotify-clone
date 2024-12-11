'use client';

import { Song } from '@/types';
import  SongItem  from '@/components/songitem';
import useOnPlay from '@/hooks/useOnPlay';
import usePlayer from '@/hooks/usePlayer';

interface PageContentProps {
  songs: Song[];
}

const PageContent: React.FC<PageContentProps> = ({ songs }) => {

  const onPlay = useOnPlay(songs);
  const {activeId} = usePlayer();

  
  if (songs.length === 0) {
    return <div className='mt-4 text-neutral-400'>No songs available.</div>;
  }



  return (
    <div
      className='
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-3 
        lg:grid-cols-4 
        xl:grid-cols-5 
        2xl:grid-cols-8 
        gap-4 
        mt-4
      '
    >
      {songs.map((item) => (
        <SongItem
          onClick={(id: string) => {onPlay(id)}}
          key={item.id}
          data={item}
          reactive={activeId === item.id}
        />
      ))}
    </div>
  );
};

export default PageContent;