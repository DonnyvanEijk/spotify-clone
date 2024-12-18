"use client";

import React from "react";
import ShuffleButton from "@/components/ShuffleButton";
import PlaylistPopover from "@/components/PlaylistPopover";
import { Song } from "@/types";
import UsablePlayButton from "@/components/UsablePlayButton";

interface ShuffleControlProps {
    songs: Song[];
    isOwner: boolean;
    id: string;
}

const ShuffleControl: React.FC<ShuffleControlProps> = ({ songs, isOwner, id }) => {
    return (
        <div className="flex flex-row gap-x-3 ml-5 w-full items-center">
            <UsablePlayButton songs={songs} />
            <ShuffleButton size={30} />
            {isOwner && (
                <PlaylistPopover playlistId={id} />
            )}
        </div>
    );
}

export default ShuffleControl;