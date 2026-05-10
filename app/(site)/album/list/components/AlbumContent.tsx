"use client"

import { useState, useMemo } from "react";
import AlbumItem from "@/components/AlbumItem";
import { Album } from "@/types";
import { HiSearch } from "react-icons/hi";

interface AlbumContentProps {
    albums: Album[];
    userId: string | undefined;
}

const AlbumContent: React.FC<AlbumContentProps> = ({
    albums,
    userId
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAlbums = useMemo(() => {
        return albums.filter((album) =>
            album.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [albums, searchQuery]);

    return (
        <div className="flex flex-col gap-8">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
                <HiSearch 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" 
                    size={20} 
                />
                <input
                    placeholder="Search albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                        w-full 
                        bg-neutral-800/50 
                        border 
                        border-white/5 
                        rounded-full 
                        py-2 
                        pl-10 
                        pr-4 
                        text-sm 
                        text-white 
                        placeholder:text-neutral-500 
                        focus:outline-none 
                        focus:border-white/20 
                        transition
                    "
                />
            </div>

            {/* Section Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-white text-xl font-bold">
                        {searchQuery ? `Results for "${searchQuery}"` : "All Albums"}
                    </h2>
                    <span className="text-xs text-neutral-400 uppercase tracking-widest">
                        {filteredAlbums.length} Albums
                    </span>
                </div>

                {filteredAlbums.length === 0 ? (
                    <div className="mt-4 text-neutral-400">
                        {searchQuery ? "No albums match your search." : "No albums available."}
                    </div>
                ) : (
                    <div
                        className="
                            grid 
                            grid-cols-2 
                            sm:grid-cols-3 
                            md:grid-cols-3 
                            lg:grid-cols-4 
                            xl:grid-cols-5 
                            2xl:grid-cols-8 
                            gap-4
                        "
                    >
                        {filteredAlbums.map((item) => (
                            <AlbumItem
                                key={item.id}
                                data={item}
                                isOwner={item.user_id === userId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AlbumContent;