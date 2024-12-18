"use client"

import PlaylistMediaItem from "@/components/PlaylistMediaItem";
import { Playlist } from "@/types";

interface PlaylistSearchContentProps {
    playlists: Playlist[];
}

const PlaylistSearchContent: React.FC<PlaylistSearchContentProps> = ({
    playlists
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
                    <div className="flex-1">
                        <PlaylistMediaItem
                        data={playlist}
                        />
                    </div>
                    {/* <PlaylistButton playlistId={playlist.id}/>
                    <LikeButton playlistId={playlist.id} /> */}
                </div>
            ))}
        </div>
    );
}

export default PlaylistSearchContent;