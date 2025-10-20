import { LikeButton } from "@/components/like-button";
import PlaylistButton from "@/components/PlaylistButton";
import { getImage } from "@/lib/getImage";
import { Song } from "@/types";

type Props = {
  songs: {
    song: Song;
    like_count: number;
  }[];
};

export const SongList = async ({ songs }: Props) => {
  return (
    <div className="flex flex-col gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex-1 max-h-[75vh] overflow-y-auto transition hover:scale-[1.01]">
      <h2 className="text-2xl font-semibold text-white mb-3">Song list</h2>
      {songs.length === 0 ? (
        <p className="text-neutral-400">No songs available</p>
      ) : (
        songs.map(async ({ song, like_count }) => {
          const imagePath = await getImage(song.image_path);
          return (
            <div
              key={song.id}
              className="group flex items-center gap-4 w-full p-3 rounded-xl hover:bg-white/10 transition"
            >
              {imagePath && (
                <img
                  src={imagePath}
                  alt="Song Cover"
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex flex-1 justify-between items-center">
                <div className="flex flex-col truncate">
                  <span className="text-white font-semibold">{song.title}</span>
                  <span className="text-neutral-400 text-sm">{song.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  {like_count} <LikeButton songId={song.id} creatorId={song.user_id} />
                  <PlaylistButton songId={song.id} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
