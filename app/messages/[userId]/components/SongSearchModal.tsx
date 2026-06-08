"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Song } from "@/types";
import { HiMusicNote, HiOutlineSearch, HiX } from "react-icons/hi";

interface Props {
  onSelect: (song: Song) => void;
  onClose: () => void;
}

export function SongSearchModal({ onSelect, onClose }: Props) {
  const supabase = useSupabaseClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("songs")
        .select("id, title, author, image_path, song_path, user_id, album_id, created_at")
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(12);
      setResults((data as Song[]) || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, supabase]);

  const getSongImageUrl = (path: string) =>
    supabase.storage.from("images").getPublicUrl(path).data.publicUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(2px)" }}>
      <div
        ref={panelRef}
        className="w-full max-w-sm bg-neutral-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-3 border-b border-white/10 flex items-center gap-2">
          <HiOutlineSearch size={14} className="text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <HiX size={14} />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto no-scrollbar">
          {loading && (
            <div className="flex flex-col gap-1 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-2.5 w-28 rounded bg-white/10 animate-pulse" />
                    <div className="h-2 w-16 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-6">No songs found</p>
          )}

          {!loading && !query.trim() && (
            <p className="text-xs text-neutral-500 text-center py-6">Type to search songs</p>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-0.5 p-2">
              {results.map((song) => (
                <button
                  key={song.id}
                  onClick={() => onSelect(song)}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/8 transition-colors text-left w-full"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 shrink-0">
                    {song.image_path ? (
                      <img
                        src={getSongImageUrl(song.image_path)}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiMusicNote size={12} className="text-neutral-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-medium text-white truncate">{song.title}</span>
                    <span className="text-xs text-neutral-400 truncate">{song.author}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
