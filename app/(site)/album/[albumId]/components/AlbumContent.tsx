"use client"

import { useRouter } from "next/navigation";

import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";

import useOnPlay from "@/hooks/useOnPlay";
import MediaItem from "@/components/media-item";
import { LikeButton } from "@/components/like-button";
import usePlayer from "@/hooks/usePlayer";
import PlaylistButton from "@/components/PlaylistButton";

interface AlbumContentProps {
    songs: Song[];
    AlbumId: string;
    isOwner: boolean;
    userId: string | undefined;
}

const AlbumContent: React.FC<AlbumContentProps> = ({
    songs,
    userId
}) => {
    const { activeId } = usePlayer();
    const router = useRouter();
    const { isLoading, user } = useUser();

    const onPlay = useOnPlay(songs);

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/');
        }
    }, [isLoading, user, router]);

    if (songs.length === 0) {
        return (
            <div className="
            flex
            flex-col
            gap-y-2
            w-full
            px-6
            text-neutral-400
            ">
                <p className="flex flex-row">
                    No Songs In this Album.
                </p>
            </div>
        )
    }

    // Sort songs by id
    const sortedSongs = [...songs].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

    return (
        <div className="flex flex-col gap-y-2 w-full p-6">
            {sortedSongs.map((song) => (
                <div
                    key={song.id}
                    className="flex items-center gap-x-4 wq-full"
                >
                    <div className="flex-1 truncate">
                        <MediaItem
                            onClick={(id: string) => { onPlay(id) }}
                            data={song}
                            isOwner={song.user_id === userId}
                            reactive={song?.id === activeId}
                        />
                    </div>
                    {/* <AlbumItemDropdown songId={song.id} albumId={AlbumId} isOwner={isOwner} /> */}
                    {/* <AlbumButton songId={song.id} /> */}
                    <PlaylistButton songId={song.id} />
                    <LikeButton songId={song.id} creatorId={song.user_id} />
                </div>
            ))}
        </div>
    );
}

export default AlbumContent;