'use client';

import { Song, UserDetails } from '@/types';
import SongItem from '@/components/songitem';
import useOnPlay from '@/hooks/useOnPlay';
import usePlayer from '@/hooks/usePlayer';

interface PageContentProps {
  songs: {
    songs: Song[];
    users: UserDetails[];
  };
  userId: string | undefined;
}

const SongContent: React.FC<PageContentProps> = ({ songs, userId }) => {
  const onPlay = useOnPlay(songs.songs);
  const { activeId } = usePlayer();

  if (songs.songs.length === 0) {
    return <div className='mt-4 text-neutral-400'>No songs available.</div>;
  }

  return (
    <div>
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
        {songs.songs.slice(0, 16).map((item) => {
          const uploader = songs.users.find((user) => user.id === item.user_id)?.username 

          return (
            <SongItem
              isOwner={item.user_id === userId}
              onClick={(id: string) => {
                onPlay(id);
              }}
              key={item.id}
              data={item}
              reactive={activeId === item.id}
              uploader={uploader}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SongContent;