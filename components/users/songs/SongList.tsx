import { LikeButton } from "@/components/like-button";
import PlaylistButton from "@/components/PlaylistButton";
import { getImage } from "@/lib/getImage";
import { Song } from "@/types";
import { HiOutlineMusicNote } from "react-icons/hi";

type Props = {
  songs: { song: Song; like_count: number }[];
};

export const SongList = async ({ songs }: Props) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col max-h-[60vh] overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Songs</h2>
        <span className="text-xs text-neutral-500 bg-white/5 rounded-full px-2 py-0.5">{songs.length}</span>
      </div>

      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-500">
          <HiOutlineMusicNote size={28} />
          <p className="text-xs">No songs yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-y-auto pr-1">
          {await Promise.all(songs.map(async ({ song, like_count }) => {
            const imagePath = await getImage(song.image_path);
            return (
              <div key={song.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                  {imagePath && <img src={imagePath} alt={song.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-white truncate">{song.title}</span>
                  <span className="text-xs text-neutral-500 truncate">{song.author}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-xs text-neutral-500">
                  <span>{like_count}</span>
                  <LikeButton songId={song.id} creatorId={song.user_id} />
                  <PlaylistButton songId={song.id} />
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};
