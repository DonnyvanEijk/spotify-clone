"use client";

import React from "react";
import ShuffleButton from "@/components/ShuffleButton";
import { Song } from "@/types";
import UsablePlayButton from "@/components/UsablePlayButton";
import LikedPopover from "./LikedPopover";

interface ShuffleControlProps {
  songs: Song[];
}

const ShuffleControl: React.FC<ShuffleControlProps> = ({ songs }) => {
  return (
    <div className="flex flex-row gap-x-3 ml-5 w-full items-center">
      <UsablePlayButton songs={songs} />
      <ShuffleButton size={30} />
      <LikedPopover />
    </div>
  );
};

export default ShuffleControl;
