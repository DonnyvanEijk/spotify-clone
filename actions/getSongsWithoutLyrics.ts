import { Song } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getSongsWithoutLyrics = async (userId: string): Promise<Song[]> => {
  const supabase = await createClient();
  try {
    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !songs || songs.length === 0) return [];

    const { data: lyricsData } = await supabase
      .from("song_lyrics")
      .select("song_id")
      .in("song_id", songs.map((s) => s.id));

    const lyricsSet = new Set((lyricsData ?? []).map((l) => String(l.song_id)));
    return songs.filter((s) => !lyricsSet.has(String(s.id))) as Song[];
  } catch {
    return [];
  }
};

export default getSongsWithoutLyrics;
