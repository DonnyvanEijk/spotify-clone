'use client';

import MediaItem from "@/components/media-item";
import { SongWithLikes } from "@/types";
import { AiFillHeart } from "react-icons/ai";

type Props = {
  songs: SongWithLikes[];
  userId: string;
};

const LikeOverview = ({ songs, userId }: Props) => {
  return (
    <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-2xl p-6 mb-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] w-1/2">
      <h2 className="text-2xl font-bold text-white mb-4">Song Likes</h2>

      {songs.length > 0 ? (
        <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-2">
          {songs.map((song) => (
            <div
              key={song.song.id}
              className="flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <MediaItem
                data={song.song}
                isOwner={song.song.user_id === userId}
                disablePlay
              />
              <div className="flex items-center gap-1 text-purple-400 font-semibold text-lg">
                <AiFillHeart />
                {song.like_count}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">No liked songs available</p>
      )}
    </div>
  );
};

export default LikeOverview;
