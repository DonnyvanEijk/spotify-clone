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

    return (
        <div className="flex flex-row gap-x-3 ml-5 w-full items-center">
            <UsablePlayButton songs={songs} />
            <ShuffleButton size={30} />
            <AlbumPopover albumId={albumId} isOwner={isOwner} />
        </div>
    );
}

export default ShuffleControl;