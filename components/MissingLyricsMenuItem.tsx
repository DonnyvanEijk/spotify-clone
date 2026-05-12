"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TbMicrophone } from "react-icons/tb";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";

const MissingLyricsMenuItem = () => {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCount = async () => {
      const { data: songs } = await supabase
        .from("songs")
        .select("id")
        .eq("user_id", user.id);

      if (!songs?.length) { setCount(0); return; }

      const { data: lyrics } = await supabase
        .from("song_lyrics")
        .select("song_id")
        .in("song_id", songs.map((s: { id: string }) => s.id));

      const lyricsSet = new Set((lyrics ?? []).map((l: { song_id: string }) => String(l.song_id)));
      setCount(songs.filter((s: { id: string }) => !lyricsSet.has(String(s.id))).length);
    };

    fetchCount();
  }, [user?.id]);

  if (!count) return null;

  return (
    <DropdownMenu.Item
      onClick={() => router.push("/missing-lyrics")}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
    >
      <TbMicrophone size={15} /> Missing Lyrics
    </DropdownMenu.Item>
  );
};

export default MissingLyricsMenuItem;
