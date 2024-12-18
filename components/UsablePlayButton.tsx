"use client"
import useOnPlay from "@/hooks/useOnPlay";
import { Song } from "@/types";
import { FaPlay } from "react-icons/fa";

interface UsablePlayButtonProps {
    songs: Song[];
}

const UsablePlayButton: React.FC<UsablePlayButtonProps> = ({songs}) => {
    const onPlay = useOnPlay(songs);

    return (
        <button
            className="
        transition 
        rounded-full
        flex
        items-center
        bg-green-500
        p-4
        drop-shadow-md
        "
            onClick={() => onPlay(songs[0].id)}
        >
            <FaPlay className="text-black" />
        </button>
    );
}

export default UsablePlayButton;