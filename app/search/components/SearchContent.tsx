"use client"
import { LikeButton } from "@/components/like-button";
import MediaItem from "@/components/media-item";
import { Song } from "@/types"

type Props = {
    songs: Song[];
}

export const SearchContent = ({songs}:Props) => {
    if (songs.length === 0) {
        return (
            <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
                No songs found..
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-y-2 w-full px-6">   
            {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-x-4 w-full">
                    <div className="flex-1">
                        <MediaItem onClick={() => {}} data={song}/>
                    </div>
                    <LikeButton songId={song.id}/>
                </div>
            ))}
        </div>
    )
}