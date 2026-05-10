"use client";

import MediaItem from "@/components/media-item";
import { Song } from "@/types";
import PlaylistButton from "@/components/PlaylistButton";
import { LikeButton } from "@/components/like-button";
import usePlayer from "@/hooks/usePlayer";
import useOnPlay from "@/hooks/useOnPlay";

interface Props {
    songs: Song[];
    userId: string | undefined;
}

const LikedContent: React.FC<Props> = ({ songs, userId }) => {
    const { activeId } = usePlayer();
    const onPlay = useOnPlay(songs);

    if (songs.length === 0) {
        return (
            <div className="px-6 py-4 text-neutral-400">
                You haven&apos;t liked any songs yet.
            </div>
        );
    }

    const sortedSongs = [...songs].sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at))
    );

    return (
        <div className="flex flex-col gap-y-4 w-full p-6">
            {sortedSongs.map((song) => (
                <div
                    key={song.id}
                    className="flex items-center gap-x-8 group w-full"
                >
                    <div className="flex-1">
                        <MediaItem
                            onClick={() => onPlay(song.id)}
                            data={song}
                            isOwner={song.user_id === userId}
                            reactive={song.id === activeId}
                            hasAlbumName
                            className="transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <PlaylistButton songId={song.id} />
                        <LikeButton songId={song.id} creatorId={song.user_id} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LikedContent;
