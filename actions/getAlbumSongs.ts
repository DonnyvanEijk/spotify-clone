import { Song } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('album_id', albumId);

    if (error) {
      console.error('Error fetching album songs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Fetch failed:', err);
    return [];
  }
};

export default getAlbumSongs;
