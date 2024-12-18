"use client";


import useLoadPlaylistImage from "@/hooks/useLoadPlaylistImage";
import { Playlist } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

interface MediaItemProps {
    data: Playlist;
    onClick?: (id: string) => void;
}

const PlaylistMediaItem: React.FC<MediaItemProps> = ({
    data,
    onClick,
}) => {
    const router = useRouter();
    const imageUrl = useLoadPlaylistImage(data);

    const playlistId = data.id;

    const handleClick = () => {
        if (onClick) {
            onClick(data.id);
        }

        router.push(`/playlist/${playlistId}`);
    }

    return (
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
                    src={imageUrl || "/images/liked.png"}
                    alt="mediaItem"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col gap-y-1 overflow-hidden">
                <p className={twMerge("text-white truncate")}>{data.name}</p>
                <p className="text-neutral-400 text-sm truncate">{data.description}</p>
            </div>
        </div>
    );
}

export default PlaylistMediaItem;