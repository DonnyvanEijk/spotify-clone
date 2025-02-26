"use client"

import { LuShuffle } from "react-icons/lu";
import usePlayer from "@/hooks/usePlayer";

interface ShuffleButtonProps {
    size?: number;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ size }) => {
    const player = usePlayer();
    const { shuffle, toggleShuffle } = player;

    return (
        <button
            onClick={toggleShuffle}
            className="
        hover:opacity-75
        transition
        disabled:opacity-50
        "
        >
            <LuShuffle color={shuffle ? '#8F00FF' : 'white'} size={size || 25} />
        </button>
    );
}

export default ShuffleButton;