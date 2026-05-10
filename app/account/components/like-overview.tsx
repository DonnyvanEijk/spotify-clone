'use client';

import MediaItem from "@/components/media-item";
import { SongWithLikes } from "@/types";
import { AiFillHeart } from "react-icons/ai";
import { useState, useMemo } from "react";

type SortMode = "likes" | "az" | "za";

type Props = {
  songs: SongWithLikes[];
  userId: string;
};

const LikeOverview = ({ songs, userId }: Props) => {
  const [sort, setSort] = useState<SortMode>("likes");

  const sorted = useMemo(() => {
    const copy = [...songs];
    if (sort === "likes") return copy.sort((a, b) => b.like_count - a.like_count);
    if (sort === "az") return copy.sort((a, b) => a.song.title.localeCompare(b.song.title));
    return copy.sort((a, b) => b.song.title.localeCompare(a.song.title));
  }, [songs, sort]);

  const options: { label: string; value: SortMode }[] = [
    { label: "Most liked", value: "likes" },
    { label: "A → Z", value: "az" },
    { label: "Z → A", value: "za" },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Your Songs</h2>
          <span className="text-xs text-neutral-500 bg-white/5 rounded-full px-2 py-0.5">{songs.length}</span>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                sort === opt.value
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {sorted.map((song) => (
          <div key={song.song.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <MediaItem
                data={song.song}
                isOwner={song.song.user_id === userId}
                disablePlay
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-neutral-400 text-sm font-medium min-w-10 justify-end">
              <AiFillHeart size={13} className="text-red-400" />
              {song.like_count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikeOverview;
