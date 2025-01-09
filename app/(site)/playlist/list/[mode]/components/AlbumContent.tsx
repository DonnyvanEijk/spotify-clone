"use client"

import PlaylistItem from "@/components/PlaylistItem";
import { Playlist } from "@/types";

interface PlaylistContentProps {
    playlists: Playlist[];
    userId: string | undefined;
    isPublic?: boolean;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({
    playlists,
    userId,
    isPublic
}) => {
    if (playlists.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No {isPublic && (<span>Public</span>)} Playlists Available
            </div>
        )
    }
    return (
        <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 lx:grid-cols-5 2xl:grid-cols-8 gap-4 ml-4"
        >
            {playlists.map((item) => (
                <PlaylistItem
                    key={item.id}
                    data={item}
                    isOwner={item.user_id === userId}
                />
            ))}
        </div>
    );
}

export default PlaylistContent;