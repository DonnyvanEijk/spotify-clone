"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Song } from "@/types";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import useLoadImage from "@/hooks/useLoadImage";
import toast from "react-hot-toast";
import Image from "next/image";
import { TbMicrophone } from "react-icons/tb";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";

interface LyriclessRowProps {
  song: Song;
}

const LyriclessRow: React.FC<LyriclessRowProps> = ({ song }) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const imageUrl = useLoadImage(song);

  const [expanded, setExpanded] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return toast.error("You must be logged in");
    if (!lyrics.trim()) return toast.error("Lyrics cannot be empty");

    setIsSaving(true);
    const { error } = await supabaseClient.from("song_lyrics").insert({
      user_id: user.id,
      song_id: song.id,
      lyrics: lyrics.trim(),
    });
    setIsSaving(false);

    if (error) {
      toast.error("Failed to save lyrics");
      return;
    }

    toast.success("Lyrics saved!");
    router.refresh();
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 bg-white/5">
        <div className="relative shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-white/10">
          {imageUrl ? (
            <Image src={imageUrl} alt={song.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TbMicrophone size={16} className="text-neutral-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{song.title}</p>
          <p className="text-xs text-neutral-400 truncate">{song.author}</p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white text-xs font-semibold transition-colors"
        >
          {expanded ? (
            <>Hide <HiChevronUp size={13} /></>
          ) : (
            <>Add Lyrics <HiChevronDown size={13} /></>
          )}
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 px-4 py-4 bg-neutral-900/60 border-t border-white/8">
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder={"Paste or type the lyrics here…\n\nVerse 1\n..."}
            rows={10}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-white/25 resize-y transition-colors font-mono"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !lyrics.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-full text-sm font-semibold transition-colors"
            >
              {isSaving ? "Saving…" : "Save Lyrics"}
            </button>
            <button
              onClick={() => { setExpanded(false); setLyrics(""); }}
              className="px-4 py-2 hover:bg-white/8 text-neutral-400 hover:text-white rounded-full text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LyriclessRow;
