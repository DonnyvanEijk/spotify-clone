"use client";

import MediaItem from "@/components/media-item";
import { Song } from "@/types";
import PlaylistButton from "@/components/PlaylistButton";
import { LikeButton } from "@/components/like-button";
import usePlayer from "@/hooks/usePlayer";

interface Props {
    songs: Song[];
    userId: string | undefined;
}

const LikedContent: React.FC<Props> = ({ songs, userId }) => {
    const { activeId } = usePlayer();

    if (songs.length === 0) {
        return (
            <div className="flex flex-col gap-3 w-full px-6 py-4 bg-white/5 backdrop-blur-[20px] rounded-2xl shadow-lg shadow-purple-500/20">
                <p className="text-white text-center">You haven&apos;t liked any songs yet.</p>
            </div>
        );
    }

    // Sort by creation date (oldest first)
    const sortedSongs = [...songs].sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at))
    );

    return (
        <div className="flex flex-col gap-3 w-full px-6 py-4">
            {sortedSongs.map((song) => (
                <div
                    key={song.id}
                    className="flex items-center gap-2 w-full group transition hover:bg-white/10 rounded-2xl  backdrop-blur-md"
                >
                    <div className="flex-1 ">
                        <MediaItem
                            data={song}
                            isOwner={song.user_id === userId}
                            reactive={song.id === activeId}
                            disablePlay={false}
                            className="hover:scale-1"
                        />
                    </div>

                    <PlaylistButton songId={song.id} />
                    <LikeButton songId={song.id} creatorId={song.user_id} />
                </div>
            ))}
        </div>
    );
};

export default LikedContent;
