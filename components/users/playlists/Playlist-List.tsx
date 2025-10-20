import { getImage } from "@/lib/getImage";
import { Playlist } from "@/types";

type Props = {
  playlists: Playlist[];
};

export const PlayListList = async ({ playlists }: Props) => {
  return (
    <div className="flex flex-col gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex-1 max-h-[75vh] overflow-y-auto transition hover:scale-[1.01]">
      <h2 className="text-2xl font-semibold text-white mb-3">Public Playlists</h2>
      {playlists.length === 0 ? (
        <p className="text-neutral-400">No playlists are available</p>
      ) : (
        playlists.map(async (playlist) => {
          const new_path = await getImage(playlist.image_path);
          return (
            <a
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition"
            >
              {new_path && (
                <img
                  src={new_path}
                  alt={playlist.name}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex flex-col truncate">
                <span className="text-white font-medium">{playlist.name}</span>
                <span className="text-neutral-400 text-sm truncate">
                  {playlist.description}
                </span>
              </div>
            </a>
          );
        })
      )}
    </div>
  );
};
