'use client';

import { Song, UserDetails } from '@/types';
import SongItem from '@/components/songitem';
import useOnPlay from '@/hooks/useOnPlay';
import usePlayer from '@/hooks/usePlayer';
import { HiOutlineMusicNote } from 'react-icons/hi';
import Carousel from './Carousel';

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
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500">
        <HiOutlineMusicNote size={36} />
        <p className="text-sm">No songs yet</p>
      </div>
    );
  }

  return (
    <Carousel>
      {songs.songs.slice(0, 20).map((item) => {
        const uploader = songs.users.find((u) => u.id === item.user_id)?.username;
        return (
          <div key={item.id} className="shrink-0 w-40">
            <SongItem
              isOwner={item.user_id === userId}
              onClick={(id: string) => onPlay(id)}
              data={item}
              reactive={activeId === item.id}
              uploader={uploader}
              user_id={item.user_id}
            />
          </div>
        );
      })}
    </Carousel>
  );
};

export default SongContent;
