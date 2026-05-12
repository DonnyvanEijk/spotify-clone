"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Radio } from "@/types";
import { RadioItem } from "@/components/radio-item";
import { AnimatePresence, motion } from "framer-motion";
import NowPlayingHero from "./NowPlayingHero";
import { HiMagnifyingGlass } from "react-icons/hi2";

interface RadioGridProps {
  radios: Radio[];
}

const RadioGrid: React.FC<RadioGridProps> = ({ radios }) => {
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [activeGenre, setActiveGenre] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("radio-volume");
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem("radio-volume", volume.toString());
  }, [volume]);

  const genres = useMemo(() => {
    const all = radios.flatMap(r => r.genres?.split(/[,·]/).map(g => g.trim()).filter(Boolean) ?? []);
    return ["All", ...Array.from(new Set(all))];
  }, [radios]);

  const filtered = useMemo(() => {
    return radios.filter(r => {
      const matchesGenre = activeGenre === "All" || r.genres?.toLowerCase().includes(activeGenre.toLowerCase());
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesGenre && matchesSearch;
    });
  }, [radios, activeGenre, searchQuery]);

  const handlePlay = (radio: Radio) => {
    if (!radio.radio_path) return;
    if (currentRadio?.id === radio.id) {
      audioRef.current?.pause();
      setCurrentRadio(null);
      return;
    }
    setCurrentRadio(radio);
    if (audioRef.current) {
      audioRef.current.src = radio.radio_path;
      audioRef.current.play().catch(console.error);
    }
  };

  const handleStop = () => {
    audioRef.current?.pause();
    setCurrentRadio(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <audio ref={audioRef} autoPlay hidden />

      {/* Now Playing Hero */}
      <AnimatePresence>
        {currentRadio && (
          <motion.div
            key={currentRadio.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <NowPlayingHero
              radio={currentRadio}
              onStop={handleStop}
              onVolumeChange={setVolume}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="relative flex items-center">
        <HiMagnifyingGlass className="absolute left-3 text-neutral-500 pointer-events-none" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search stations..."
          className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-white/25 transition-colors"
        />
      </div>

      {/* Genre filter carousel */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                activeGenre === genre
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-1 w-12 bg-linear-to-l from-black to-transparent pointer-events-none" />
      </div>

      {/* Station list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-neutral-500 text-sm px-1 py-4">No stations match your search.</p>
        ) : (
          filtered.map(radio => (
            <RadioItem
              key={radio.id}
              data={radio}
              onPlay={handlePlay}
              isActive={currentRadio?.id === radio.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RadioGrid;
