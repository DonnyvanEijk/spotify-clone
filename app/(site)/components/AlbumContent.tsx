"use client"

import AlbumItem from "@/components/AlbumItem";
import { Album } from "@/types";

interface PageContentProps {
    albums: Album[];
    userId: string | undefined;
}

const AlbumContent: React.FC<PageContentProps> = ({
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
            className="grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-3 
          lg:grid-cols-4 
          xl:grid-cols-5 
          2xl:grid-cols-8 
          gap-4 
          mt-4"
        >
            {albums.slice(0, 8).map((item) => (
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