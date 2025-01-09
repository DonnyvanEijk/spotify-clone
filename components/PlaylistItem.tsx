
"use client"

import { Playlist } from "@/types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import Link from "next/link";
import useLoadPlaylistImage from "@/hooks/useLoadPlaylistImage";
import * as ContextMenu from "@radix-ui/react-context-menu"
import PlaylistRightClickContent from "./right_click/PlaylistRightClickContent";

interface PlaylistItemProps {
    data: Playlist;
    isOwner:boolean;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
    data,
    isOwner
}) => {
    const imagePath = useLoadPlaylistImage(data);

    const playlistId = data.id;
    const { activeId } = usePlayer();

    const playing = playlistId === activeId;

    return (
        <ContextMenu.Root modal={false}>
            <ContextMenu.Trigger>
                
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
        </ContextMenu.Trigger>
        <PlaylistRightClickContent isOwner={isOwner} playlist={data}/>
        </ContextMenu.Root>
    );
}

export default PlaylistItem;
