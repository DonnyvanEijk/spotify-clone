"use client";

import useLoadImage from "@/hooks/useLoadImage";
import { Radio } from "@/types";
import { twMerge } from "tailwind-merge";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { differenceInHours } from "date-fns";
import PlayButton from "./playbutton";
import { BiPauseCircle } from "react-icons/bi";

interface RadioItemProps {
  data: Radio;
  onPlay: (radio: Radio) => void;
  isActive?: boolean;
}

export const RadioItem: React.FC<RadioItemProps> = ({ data, onPlay, isActive }) => {
  const imagePath = useLoadImage(data);

  if (!data) {
    console.error("Data was not found for radios!");
    return null;
  }

  const isNew = differenceInHours(new Date(), new Date(data.created_at)) <= 24;

  const handleClick = () => {
    // Stop all other audio (including music player)
    window.dispatchEvent(new Event("stopAllAudio"));

    // Play this radio
    onPlay(data);
  };

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger>
        <div
          onClick={handleClick}
          className={twMerge(
            `
            relative
            group
            flex
            flex-col
            items-center
            justify-center
            rounded-3xl
            overflow-hidden
            bg-white/10
            backdrop-blur-[20px]
            border border-white/20
            shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
            transition-all duration-300
            hover:scale-[1.05]
            hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.45)]
            cursor-pointer
            p-4
            before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:via-white/5 before:to-white/10 before:opacity-0 group-hover:before:opacity-40 before:rounded-3xl
          `,
            isActive && "ring-2 ring-purple-500/70 shadow-purple-500/30 scale-[1.03]"
          )}
        >
          {imagePath && (
            <div className="relative w-full pt-[100%] rounded-2xl overflow-hidden shadow-inner shadow-white/10">
              <img
                src={imagePath}
                alt={data.name}
                onError={(e) => (e.currentTarget.src = "/images/fallback.png")}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
              />
              {isNew && (
                <div className="absolute top-2 right-2">
                  <img src="/images/New.png" width={75} height={75} alt="New Badge" />
                </div>
              )}
            </div>
          )}

          {isActive && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-md animate-pulse">
                Live
              </span>
            </div>
          )}

          <div className="flex flex-col items-start w-full pt-3 gap-y-1 text-left">
            <p
              className={twMerge(
                "font-semibold text-sm truncate w-full",
                isActive ? "text-purple-400" : "text-white"
              )}
            >
              {data.name}
            </p>
            {data.genres && <p className="text-neutral-300 text-xs truncate">{data.genres}</p>}
          </div>

          <div className="absolute bottom-24 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isActive ? <BiPauseCircle size={45} className="text-purple-400" /> : <PlayButton />}
          </div>

          <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:animate-shine rounded-3xl" />
        </div>
      </ContextMenu.Trigger>
    </ContextMenu.Root>
  );
};
