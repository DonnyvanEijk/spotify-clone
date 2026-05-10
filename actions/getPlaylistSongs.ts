import { Song } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getPlaylistSongs = async (playlistId: string): Promise<Song[]> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select('*, songs(*)')
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching playlist songs:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((item) => ({ ...item.songs }));
  } catch (err) {
    console.error('Fetch failed:', err);
    return [];
  }
};

export default getPlaylistSongs;
