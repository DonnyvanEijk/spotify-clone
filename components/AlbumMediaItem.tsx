"use client";

import { Album } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import * as ContextMenu from "@radix-ui/react-context-menu";
import useLoadAlbumImage from "@/hooks/useLoadAlbumImage";
import AlbumRightClickContent from "./right_click/AlbumRightClickContent";

interface MediaItemProps {
    data: Album;
    onClick?: (id: string) => void;
    isOwner: boolean;
}

const AlbumMediaItem: React.FC<MediaItemProps> = ({
    data,
    onClick,
    isOwner,
}) => {
    const router = useRouter();
    const imageUrl = useLoadAlbumImage(data);

    const playlistId = data.id;

    const handleClick = () => {
        if (onClick) {
            onClick(data.id);
        }

        router.push(`/album/${playlistId}`);
    }

    return (
        <ContextMenu.Root modal={false}>
            <ContextMenu.Trigger>
                <div
                    onClick={handleClick}
                    className="
        flex
        items-center
        gap-x-3
        cursor-pointer
        hover:bg-neutral-800/50
        w-full
        p-2
        rounded-md
        "
                >
                    {imageUrl && (
                        <div
                            className="
            relative
            rounded-md
            min-h-[48px]
            min-w-[48px]
            "
                        >
                            <Image
                                fill
                                src={imageUrl}
                                alt="mediaItem"
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-y-1 overflow-hidden">
                        <p className={twMerge("text-white truncate")}>{data.name}</p>
                        <p className="text-neutral-400 text-sm truncate">By {data.author}</p>
                    </div>
                </div>
            </ContextMenu.Trigger>
            <AlbumRightClickContent isOwner={isOwner} album={data} />
        </ContextMenu.Root>
    );
}

export default AlbumMediaItem;