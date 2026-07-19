"use client";

import useLoadImage from "@/hooks/useLoadImage";
import { Radio } from "@/types";
import { twMerge } from "tailwind-merge";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { differenceInHours } from "date-fns";
import { LuPlay, LuPause } from "react-icons/lu";
import { motion } from "framer-motion";
import RadioRightClickContent from "./right_click/RadioRightClickContent";

interface RadioItemProps {
  data: Radio;
  onPlay: (radio: Radio) => void;
  isActive?: boolean;
}

export const RadioItem: React.FC<RadioItemProps> = ({ data, onPlay, isActive }) => {
  const imagePath = useLoadImage(data);
  if (!data) return null;

  const isNew = differenceInHours(new Date(), new Date(data.created_at)) <= 24;
  const genres = data.genres?.split(/[,·]/).map(g => g.trim()).filter(Boolean) ?? [];

  const handleClick = () => {
    window.dispatchEvent(new Event("stopAllAudio"));
    onPlay(data);
  };

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger asChild>
        <div
          onClick={handleClick}
          className={twMerge(
            "group flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all duration-200",
            isActive
              ? "bg-white/10 border-white/20"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
          )}
        >
          {/* Thumbnail */}
          <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/10">
            <img
              src={imagePath || "/images/fallback.png"}
              alt={data.name}
              onError={e => (e.currentTarget.src = "/images/fallback.png")}
              className="w-full h-full object-cover"
            />
            {isActive && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3">
                  {[0, 0.15, 0.3].map(delay => (
                    <motion.div
                      key={delay}
                      className="w-0.5 rounded-full bg-white"
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay }}
                      style={{ originY: 1, height: "100%" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={twMerge("text-sm font-semibold truncate", isActive ? "text-white" : "text-neutral-200")}>
                {data.name}
              </p>
              {isNew && (
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white uppercase tracking-wide">
                  New
                </span>
              )}
            </div>
            {genres.length > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {genres.map((g, i) => (
                  <span key={g} className="text-xs text-neutral-500">
                    {g}{i < genres.length - 1 && <span className="ml-1.5">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Live indicator / play button */}
          <div className="shrink-0 flex items-center gap-3">
            {isActive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                LIVE
              </span>
            )}
            <div className={twMerge(
              "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200",
              isActive
                ? "bg-white text-black border-white"
                : "bg-white/5 text-neutral-400 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white"
            )}>
              {isActive ? <LuPause size={13} /> : <LuPlay size={13} className="ml-0.5" />}
            </div>
          </div>
        </div>
      </ContextMenu.Trigger>

      <RadioRightClickContent radio={data} />
    </ContextMenu.Root>
  );
};
