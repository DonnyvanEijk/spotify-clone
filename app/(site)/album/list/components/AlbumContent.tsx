"use client"


import AlbumItem from "@/components/AlbumItem";
import useOnPlay from "@/hooks/useOnPlay";
import { Album } from "@/types";

interface AlbumContentProps {
    albums: Album[];
    userId: string | undefined;
}

const AlbumContent: React.FC<AlbumContentProps> = ({
    albums,
    userId
}) => {
    if (albums.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No Albums Available
            </div>
        )
    }
    return (
        <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 lx:grid-cols-5 2xl:grid-cols-8 gap-4 ml-4"
        >
            {albums.map((item) => (
                <AlbumItem
                    key={item.id}
                    data={item}
                    isOwner={item.user_id === userId}
                />
            ))}
        </div>
    );
}

export default AlbumContent;