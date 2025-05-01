"use client"

import PlaylistMediaItem from "@/components/PlaylistMediaItem";
import { Playlist } from "@/types";

interface PlaylistSearchContentProps {
    playlists: Playlist[];
    userId: string | undefined;
}

const PlaylistSearchContent: React.FC<PlaylistSearchContentProps> = ({
    playlists,
    userId
}) => {
    // const onPlay = useOnPlay(playlists);

    if (playlists.length === 0) {
        return (
            <div
            className="
            flex
            flex-col
            gap-y-2
            w-full
            px-6
            text-neutral-400
            "
            >
                <p>No playlists found</p>
            </div>
        )
    }

    return (
        <div className="felx felx-col gap-y-2 w-ful px-6">
            {playlists.map((playlist) => (
                <div
                key={playlist.id}
                className="flex items center gap-x-4 w-full"
                >
                    <div className="flex-1, truncate">
                        <PlaylistMediaItem
                        isOwner={playlist.user_id === userId}
                        data={playlist}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PlaylistSearchContent;