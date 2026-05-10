'use client';

import { useState, useMemo } from 'react';
import { Song } from '@/types';
import SongItem from '@/components/songitem';
import useOnPlay from '@/hooks/useOnPlay';
import usePlayer from '@/hooks/usePlayer';
import { Input } from '@/components/input'; // Assuming you have an Input component
import { HiSearch } from 'react-icons/hi';

interface PageContentProps {
  songs: Song[];
  users: any; // Using any to match your getUsersIndex return type
  userId: string | undefined;
}

const PageContent: React.FC<PageContentProps> = ({ songs, users, userId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { activeId } = usePlayer();
  const onPlay = useOnPlay(songs);

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    return songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search Bar Section */}
      <div className="relative w-full max-w-md">
        <HiSearch 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" 
          size={20} 
        />
        <input
          placeholder="Search by song name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full 
            bg-neutral-800/50 
            border 
            border-white/5 
            rounded-full 
            py-2 
            pl-10 
            pr-4 
            text-sm 
            text-white 
            placeholder:text-neutral-500 
            focus:outline-none 
            focus:border-white/20 
            transition
          "
        />
      </div>

      {/* Styled Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : "All Songs"}
          </h2>
          <span className="text-xs text-neutral-400 uppercase tracking-widest">
            {filteredSongs.length} Songs
          </span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="mt-4 text-neutral-400">
            {searchQuery ? "No songs match your search." : "No songs available."}
          </div>
        ) : (
          <div
            className="
              grid 
              grid-cols-2 
              sm:grid-cols-3 
              md:grid-cols-3 
              lg:grid-cols-4 
              xl:grid-cols-5 
              2xl:grid-cols-8 
              gap-4
            "
          >
            {filteredSongs.map((item) => (
              <SongItem
                isOwner={item.user_id === userId}
                onClick={(id: string) => onPlay(id)}
                key={item.id}
                data={item}
                reactive={activeId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageContent;