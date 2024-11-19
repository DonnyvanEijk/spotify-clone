"use client";

import * as RadixSlider from "@radix-ui/react-slider";

interface PlayerSliderProps {
    duration: number | null;
    currentTime: number | null;
    onSeek: (value: number) => void; // Add an `onSeek` prop
}

const PlayerSlider: React.FC<PlayerSliderProps> = ({
    duration,
    currentTime,
    onSeek,
}) => {
    if (!duration) duration = 1; // Avoid division by zero
    if (!currentTime) currentTime = 0;

    const percentage = (currentTime / duration) * 100; // Calculate the percentage of the current time

    const handleValueChange = (value: number[]) => {
        const newTime = (value[0] / 100) * duration!; // Calculate the new time based on slider value
        onSeek(newTime); // Call the `onSeek` handler with the new time
    };

    return (
        <RadixSlider.Root
            className="
                relative
                flex
                items-center
                select-none
                touch-none
                w-[30vw]
                mx-2
                h-10
            "
            value={[percentage]}
            onValueChange={handleValueChange} // Attach handler
            max={100}
            step={0.1}
            aria-label="Duration"
        >
            <RadixSlider.Track
                className="
                    bg-neutral-600
                    relative
                    grow
                    rounded-full
                    h-[3px]
                "
            >
                <RadixSlider.Range
                    className="absolute bg-white rounded-full h-full"
                />
            </RadixSlider.Track>
        </RadixSlider.Root>
    );
};

export default PlayerSlider;
