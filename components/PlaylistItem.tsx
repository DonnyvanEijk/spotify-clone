
"use client"

import { Playlist } from "@/types";
import Image from "next/image";
// import PlayButton from "./PlayButton";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import useLoadPlaylistImage from "@/hooks/useLoadPlaylistImage";
import Link from "next/link";

interface PlaylistItemProps {
    data: Playlist;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
    data,
}) => {
    const imagePath = useLoadPlaylistImage(data);

    const playlistId = data.id;
    const { activateId } = usePlayer();

    const playing = playlistId === activateId;

    return (
        <Link href={`/playlist/${playlistId}`}>
            <div
                className="relative
        group
        flex
        flex-col
        items-center
        justify-center
        rounded-md
        overflow-hidden
        gap-x-4
        bg-neutral-400/5
        cursor-pointer
        hover:bg-neutral-400/10
        transition
        p-3
        "
            >
                <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
                    <Image
                        className="object-cover"
                        src={imagePath || '/images/liked.png'}
                        fill
                        alt="Image"
                    />
                </div>
                <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                    <p className={twMerge("font-semibold truncate w-full", playing && "text-green-500")}>
                        {data.name}
                    </p>
                    <p className="text-neutral-400 text-sm pb-4 w-full truncate">
                        {data.description}
                    </p>
                </div>
                {/* <div
                className='
          absolute 
          bottom-24 
          right-5
        '
            >
                <PlayButton />
            </div> */}
            </div>
        </Link>
    );
}

export default PlaylistItem;
