"use client"
import { LikeButton } from "@/components/like-button";
import MediaItem from "@/components/media-item";
import PlaylistButton from "@/components/PlaylistButton";

import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types"

type Props = {
    songs: Song[];
    userId: string | undefined
}

export const SongSearchContent = ({songs, userId}:Props) => {
    const onPlay = useOnPlay(songs)
    const {activeId} = usePlayer()
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
                        <MediaItem isOwner={song.id === userId} onClick={(id:string) => {onPlay(id)}} data={song} reactive={activeId === song.id}/>
                    </div>
                    <PlaylistButton songId={song.id}/>
                    <LikeButton songId={song.id}/>
                </div>
            ))}
        </div>
    )
}