'use client';

import { Song, UserDetails } from '@/types';
import SongItem from '@/components/songitem';
import useOnPlay from '@/hooks/useOnPlay';
import usePlayer from '@/hooks/usePlayer';
import { motion } from 'framer-motion';

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
      <div className="mt-10 text-center text-neutral-400 text-lg">
        No songs available.
      </div>
    );
  }

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-7
          gap-6
          mt-4
          px-2
        "
      >
        {songs.songs.slice(0, 16).map((item, i) => {
          const uploader = songs.users.find((u) => u.id === item.user_id)?.username;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <SongItem
                isOwner={item.user_id === userId}
                onClick={(id: string) => onPlay(id)}
                data={item}
                reactive={activeId === item.id}
                uploader={uploader}
                user_id={item.user_id}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SongContent;
