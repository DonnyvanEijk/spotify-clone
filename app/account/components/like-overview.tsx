"use client"
import MediaItem from "@/components/media-item";
import { AiFillHeart } from "react-icons/ai";
type Props = {
    songs: any[];
    user: any;

}
const LikeOverview =  ({ songs, user}: Props) => {;
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-2 ml-5">Song likes</h1>
            <div className="h-64 overflow-y-auto w-fit rounded flex flex-col  pr-5 ml-3">
                {songs.length > 0 ? (
                    songs.map((song, index) => (
                        <div
                            key={index}
                            className="flex items-center w-fit cursor-pointer"
                        >
                            <MediaItem data={song.song} isOwner={song.song.user_id === user?.id} disablePlay />
                            <span className="ml-3 flex flex-row gap-1 items-center font-bold text-xl">
                                <AiFillHeart color="#8F00FF" />
                                {song.like_count}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-white">No songs available</p>
                )}
            </div>
        </div>
    );
};

export default LikeOverview;
