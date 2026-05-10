import { getImage } from "@/lib/getImage";
import { Playlist } from "@/types";
import Link from "next/link";
import { HiOutlineCollection } from "react-icons/hi";

type Props = {
  playlists: Playlist[];
};

export const PlayListList = async ({ playlists }: Props) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col max-h-[60vh] overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Playlists</h2>
        <span className="text-xs text-neutral-500 bg-white/5 rounded-full px-2 py-0.5">{playlists.length}</span>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-500">
          <HiOutlineCollection size={28} />
          <p className="text-xs">No public playlists</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-y-auto pr-1">
          {await Promise.all(playlists.map(async (playlist) => {
            const imagePath = await getImage(playlist.image_path);
            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                  {imagePath && <img src={imagePath} alt={playlist.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-white truncate group-hover:text-white transition-colors">{playlist.name}</span>
                  <span className="text-xs text-neutral-500 truncate">{playlist.description || "Playlist"}</span>
                </div>
              </Link>
            );
          }))}
        </div>
      )}
    </div>
  );
};
