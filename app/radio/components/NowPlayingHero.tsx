"use client";

import { Radio } from "@/types";
import { RadioVolumeSlider } from "./RadioVolumeSlider";
import { motion } from "framer-motion";
import { LuPause } from "react-icons/lu";
import useLoadImage from "@/hooks/useLoadImage";

interface Props {
  radio: Radio;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
}

const NowPlayingHero: React.FC<Props> = ({ radio, onStop, onVolumeChange }) => {
  const imageUrl = useLoadImage(radio);
  const src = imageUrl || "/images/fallback.png";
  const genres = radio.genres?.split(/[,·]/).map(g => g.trim()).filter(Boolean) ?? [];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10">
      {/* Blurred background */}
      <div className="absolute inset-0">
        <img src={src} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-30" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-0 p-6">
        {/* Art + pulse rings — fixed-width column so rings have room */}
        <div className="shrink-0 w-40 h-40 flex items-center justify-center">
          <div className="relative w-24 h-24">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-2xl border border-white/15"
                style={{ inset: -i * 12 }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.65, ease: "easeInOut" }}
              />
            ))}
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
              <img src={src} alt={radio.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Info + controls */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 items-center sm:items-start text-center sm:text-left pl-4">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
            ON AIR
          </span>
          <p className="text-white text-xl font-bold truncate w-full">{radio.name}</p>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {genres.map(g => (
                <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 text-xs">{g}</span>
              ))}
            </div>
          )}
          <div className="w-full max-w-xs mt-1">
            <RadioVolumeSlider onVolumeChange={onVolumeChange} />
          </div>
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all"
        >
          <LuPause size={16} />
        </button>
      </div>
    </div>
  );
};

export default NowPlayingHero;
