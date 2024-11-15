"use client"
import { LikeButton } from "@/components/like-button"
import MediaItem from "@/components/media-item"
import useOnPlay from "@/hooks/useOnPlay"
import usePlayer from "@/hooks/usePlayer"
import { useUser } from "@/hooks/useUser"
import { Song } from "@/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type Props = {
    songs: Song[]
}

export const LikedContent  = ({songs}:Props) => {
    const onPlay = useOnPlay(songs)
    const router = useRouter();
    const {isLoading, user} = useUser();
    const {activeId} = usePlayer();

    useEffect(() => {
        if(!user && !isLoading) {
            router.replace('/')
        }
    }, [isLoading, user, router])

    if (songs.length === 0) {
        return (
            <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
                No liked songs..
            </div>
        )
    }
    return(
        <div className="flex flex-col gap-y-2 w-full p-6">
            {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-x-4 w-full">
                    <div className="flex-1">
                        <MediaItem onClick={(id:string) => {onPlay(id)}} data={song} reactive={activeId === song.id}/>
                    </div>
                    <LikeButton songId={song.id}/>
                </div>
            ))}
        </div>
    )
}