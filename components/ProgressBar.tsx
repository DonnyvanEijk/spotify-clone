import React from "react";
import * as Progress from "@radix-ui/react-progress";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    console.log(progress);
    return (
        <Progress.Root
            className="relative h-[25px] w-[300px] overflow-hidden rounded-full bg-black"
            style={{
                // Fix overflow clipping in Safari
                // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
                transform: "translateZ(0)",
            }}
            value={progress}
        >
            <Progress.Indicator
                className="ease-[cubic-bezier(0.65, 0, 0.35, 1)] size-full bg-green-500 transition-transform duration-[660ms]"
                style={{ transform: `translateX(-${100 - progress}%)` }}
            />
        </Progress.Root>
    );
};

export default ProgressBar;