"use client"

import AlbumMediaItem from "@/components/AlbumMediaItem";
import { Album } from "@/types";

interface AlbumSearchContentProps {
    albums: Album[];
    userId: string | undefined;
}

const AlbumSearchContent: React.FC<AlbumSearchContentProps> = ({
    albums,
    userId
}) => {
    // const onPlay = useOnPlay(albums);

    if (albums.length === 0) {
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
                <p>No albums found</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-2 w-full px-6">
            {albums.map((album) => (
                <div
                    key={album.id}
                    className="flex items center gap-x-4 w-full"
                >
                    <div className="flex-1 truncate">
                        <AlbumMediaItem
                            isOwner={album.user_id === userId}
                            data={album}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AlbumSearchContent;