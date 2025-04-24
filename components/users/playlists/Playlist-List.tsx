import { getImage } from "@/lib/getImage";
import { Playlist } from "@/types";

type Props = {
    playlists: Playlist[];
};

export const PlayListList = async ({ playlists }: Props) => {
    return (
        <div className="flex flex-col items-center bg-neutral-900 rounded w-[90%] lg:mb-0 mb-10">
            <h2 className="font-semibold text-2xl p-5">Public Playlists</h2>
            {playlists.length === 0 ? (
                <p className="text-neutral-400 p-5">No playlists are available</p>
            ) : (
                <ul className="w-full max-h-[75vh] overflow-y-auto">
                    {playlists.map(async (playlist) => {
                        const new_path = await getImage(playlist.image_path);
                        return (
                            <li key={playlist.id} className="p-2 hover:bg-neutral-800 rounded">
                                <a href={`/playlist/${playlist.id}`} className="flex items-center space-x-4">
                                    <img
                                        src={new_path || '/images/liked.png'}
                                        alt={playlist.name}
                                        className="w-12 h-12 rounded"
                                    />
                                    <div className="flex flex-col justify-start items-start gap-1 w-full">
                                        <span className="text-white font-medium">{playlist.name}</span>
                                        <span className="text-md font-light text-neutral-400">{playlist.description}</span>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};