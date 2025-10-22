"use client";

import Slider from "@/components/slider";
import { useEffect, useState } from "react";
import { LuVolume2, LuVolumeX } from "react-icons/lu";


interface RadioVolumeSliderProps {
  onVolumeChange?: (volume: number) => void;
}

export const RadioVolumeSlider: React.FC<RadioVolumeSliderProps> = ({ onVolumeChange }) => {
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("radio-volume");
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  useEffect(() => {
    localStorage.setItem("radio-volume", volume.toString());
    onVolumeChange?.(volume);
  }, [volume, onVolumeChange]);

  const toggleMute = () => {
    setVolume((v) => (v > 0 ? 0 : 0.5));
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <button
        onClick={toggleMute}
        className="text-white hover:text-purple-400 transition"
      >
        {volume === 0 ? <LuVolumeX size={20} /> : <LuVolume2 size={20} />}
      </button>

      <div className="flex-1">
        <Slider value={volume} onChange={setVolume} />
      </div>
    </div>
  );
};
