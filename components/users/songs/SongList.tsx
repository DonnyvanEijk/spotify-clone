import { LikeButton } from "@/components/like-button";
import PlaylistButton from "@/components/PlaylistButton";
import { getImage } from "@/lib/getImage";
import { Song } from "@/types"
import { BiHeart } from "react-icons/bi";

type Props = {
    songs: {
        song: Song;
        like_count: number;
    }[]
}

export const SongList = async ({ songs }: Props) => {
    return (
        <div className="flex justify-center flex-col items-center bg-neutral-900 rounded w-[90%] lg:mb-0 mb-10">
            <h2 className="font-semibold text-2xl p-5">Song list</h2>
            {songs.length === 0 ? (
                <p className="text-neutral-400 p-5">No songs available</p>
            ) : (
                <ul className="w-full max-h-[75vh] overflow-y-auto">
                    {songs.map(async ({ song, like_count }, index) => {
                        const imagePath = await getImage(song.image_path);
                        return (
                            <li key={index} className="flex items-center p-3 border-b border-neutral-800">
                                <img src={imagePath || '/images/liked.png'} alt="Song Cover" className="w-16 h-16 rounded" />
                                <div className="flex flex-row justify-between w-full">
                                    <div className="ml-5 flex flex-col justify-start items-start gap-1 w-1/2">
                                        <span className="text-md font-semibold">{song.title}</span>
                                        <span className="text-md font-light text-neutral-400">{song.author}</span>
                                    </div>
                                    <div className="flex justify-end items-end">
                                        <span className="flex flex-row justify-end items-center gap-2">
                                            {like_count} Likes <LikeButton songId={song.id} /> <PlaylistButton songId={song.id} />
                                        </span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};