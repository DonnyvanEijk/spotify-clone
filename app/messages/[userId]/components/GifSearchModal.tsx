"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineSearch, HiX } from "react-icons/hi";

interface GifResult {
  id: string;
  title: string;
  previewUrl: string;
  url: string;
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function GifSearchModal({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on outside click or Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(2px)" }}>
      <div
        ref={panelRef}
        className="w-full max-w-sm bg-neutral-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search bar */}
        <div className="p-3 border-b border-white/10 flex items-center gap-2 shrink-0">
          <HiOutlineSearch size={14} className="text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <HiX size={14} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: 320 }}>
          {loading && (
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white/10 animate-pulse aspect-video" />
              ))}
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-8">No GIFs found</p>
          )}

          {!loading && !query.trim() && (
            <p className="text-xs text-neutral-500 text-center py-8">Type to search GIFs</p>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {results.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => onSelect(gif.url)}
                  className="rounded-xl overflow-hidden aspect-video bg-white/5 hover:ring-2 hover:ring-purple-500 transition-all"
                  title={gif.title}
                >
                  <img
                    src={gif.previewUrl}
                    alt={gif.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-neutral-700 text-center py-2 shrink-0">Powered by GIPHY</p>
      </div>
    </div>
  );
}
