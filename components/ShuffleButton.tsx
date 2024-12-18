"use client"

import { LuShuffle } from "react-icons/lu";

interface ShuffleButtonProps {
    doShuffle: boolean;
    onShuffle: () => void;
    size?: number;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({
    doShuffle,
    onShuffle,
    size
}) => {
    const Icon = LuShuffle;

    return (
        <button
            onClick={onShuffle}
            className="
        hover:opacity-75
        transition
        disabled:opacity-50
        "
            disabled
        >
            <Icon color={doShuffle ? '#22c55e' : 'white'} size={size || 25} />
        </button>
    );
}

export default ShuffleButton;