"use client";

import React from "react";
import ShuffleButton from "@/components/ShuffleButton";
import UsablePlayButton from "@/components/UsablePlayButton";
import AlbumPopover from "@/components/AlbumPopover";
import { Song } from "@/types";

interface ShuffleControlProps {
    albumId: string;
    songs: Song[];
    isOwner: boolean;
}

const ShuffleControl: React.FC<ShuffleControlProps> = ({ albumId, songs, isOwner }) => {
 const sortedSongs = [...songs].sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at))
    );
    return (
        <div className="flex flex-row gap-x-3 ml-5 w-full items-center">
            <UsablePlayButton songs={sortedSongs} />
            <ShuffleButton size={30} />
            <AlbumPopover albumId={albumId} isOwner={isOwner} />
        </div>
    );
}

export default ShuffleControl;