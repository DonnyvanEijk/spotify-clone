"use client";

import { Album } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import * as ContextMenu from "@radix-ui/react-context-menu";
import useLoadAlbumImage from "@/hooks/useLoadAlbumImage";
import AlbumRightClickContent from "./right_click/AlbumRightClickContent";

interface AlbumMediaItemProps {
    data: Album;
    onClick?: (id: string) => void;
    isOwner: boolean;
    className?: string;
}

const AlbumMediaItem: React.FC<AlbumMediaItemProps> = ({ data, onClick, isOwner, className }) => {
    const router = useRouter();
    const imageUrl = useLoadAlbumImage(data);

    const handleClick = () => {
        if (onClick) onClick(data.id);
        router.push(`/album/${data.id}`);
    };

    return (
        <ContextMenu.Root modal={false}>
            <ContextMenu.Trigger asChild>
                <div
                    onClick={handleClick}
                    className={twMerge(
                        "group relative flex items-center gap-x-3 w-full rounded-xl cursor-pointer transition-all duration-200",
                        "p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
                        className
                    )}
                >
                    <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-white/10">
                        {imageUrl ? (
                            <Image fill sizes="44px" src={imageUrl} alt={data.name} className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-white/10" />
                        )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-neutral-200 group-hover:text-white transition-colors duration-200">
                            {data.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">By {data.author}</p>
                    </div>
                </div>
            </ContextMenu.Trigger>
            <AlbumRightClickContent isOwner={isOwner} album={data} />
        </ContextMenu.Root>
    );
};

export default AlbumMediaItem;
