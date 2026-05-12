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
      const sortedSongs = [...songs].sort((a, b) =>
    String(a.created_at).localeCompare(String(b.created_at))
  );
    return (
        <div className="flex flex-row gap-x-3 ml-5 w-full items-center">
            <UsablePlayButton songs={sortedSongs} />
            <ShuffleButton size={30} />
            <PlaylistPopover playlistId={id} isOwner={isOwner} />
        </div>
    );
}

export default ShuffleControl;