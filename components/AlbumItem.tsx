"use client"

import { Album } from "@/types";
import Image from "next/image";
// import PlayButton from "./PlayButton";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import useLoadAlbumImage from "@/hooks/useLoadAlbumImage";
import Link from "next/link";
import * as ContextMenu from "@radix-ui/react-context-menu";
import AlbumRightClickContent from "./right_click/AlbumRightClickContent";

interface AlbumItemProps {
    data: Album;
    isOwner: boolean;
}

const AlbumItem: React.FC<AlbumItemProps> = ({
    data,
    isOwner,
}) => {
    const imagePath = useLoadAlbumImage(data);

    const albumId = data.id;
    const { activeId } = usePlayer();

    const playing = albumId === activeId;

    return (
        <ContextMenu.Root modal={false}>
            <ContextMenu.Trigger>
                <Link href={`/album/${albumId}`}>
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
                        {imagePath ? (
                            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
                                <Image
                                    className="object-cover"
                                    src={imagePath}
                                    fill
                                    alt="Image"
                                />
                            </div>
                        ) : null}
                        <div className="flex flex-col items-start w-full pt-4 gap-y-1">
                            <p className={twMerge("font-semibold truncate w-full", playing && "text-purple-500")}>
                                {data.name}
                            </p>
                            <p className="text-neutral-400 text-sm pb-4 w-full truncate">
                                By {data.author}
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
            <AlbumRightClickContent isOwner={isOwner} album={data} />
        </ContextMenu.Root>
    );
}

export default AlbumItem;