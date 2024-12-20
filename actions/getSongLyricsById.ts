import { SupabaseClient } from "@supabase/supabase-js";

const getSongsLyricsById = async (supabaseClient: SupabaseClient, songId: string | undefined) => {
  try {
      const { data: lyricsData, error: lyricsError } = await supabaseClient
          .from("song_lyrics")
          .select("lyrics")
          .eq("song_id", songId);

      if (lyricsError) {
        return new Error("Something went wrong fetching lyrics");
      }

     return lyricsData;
  } catch {
     return new Error("Something went wrong fetching lyrics");
  }
}

export default getSongsLyricsById;