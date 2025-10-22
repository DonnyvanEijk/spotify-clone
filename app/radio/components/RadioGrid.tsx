"use client";

import { useRef, useState, useEffect } from "react";
import { Radio } from "@/types";
import { RadioVolumeSlider } from "./RadioVolumeSlider";
import { RadioItem } from "@/components/radio-item";

interface RadioGridProps {
  radios: Radio[];
}

const RadioGrid: React.FC<RadioGridProps> = ({ radios }) => {
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("radio-volume");
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  // Sync audio volume whenever it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem("radio-volume", volume.toString());
  }, [volume]);

  const handlePlay = (radio: Radio) => {
    if (!radio.radio_path) return;

    // If clicking the same station, pause it
    if (currentRadio?.id === radio.id) {
      audioRef.current?.pause();
      setCurrentRadio(null);
      return;
    }

    setCurrentRadio(radio);
    if (audioRef.current) {
      audioRef.current.src = radio.radio_path;
      audioRef.current.play().catch((err) => console.error(err));
    }
  };

  return (
    <div>
      <audio ref={audioRef} autoPlay hidden />

  <div className="w-full max-w-xs p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] mb-10">
  <h3 className="text-white font-semibold text-sm mb-2">Volume</h3>
  <RadioVolumeSlider onVolumeChange={setVolume} />
</div>


      {/* Grid of radios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {radios.map((radio) => (
          <RadioItem
            key={radio.id}
            data={radio}
            onPlay={handlePlay}
            isActive={currentRadio?.id === radio.id}
          />
        ))}
      </div>
    </div>
  );
};

export default RadioGrid;
