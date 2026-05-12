import { Song } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getPlaylistSongs = async (playlistId: string): Promise<Song[]> => {
  const supabase = await createClient();

  try {
    const [songsResult, playlistResult] = await Promise.all([
      supabase
        .from('playlist_songs')
        .select('*, songs(*)')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true }),
      supabase
        .from('playlists')
        .select('custom_order')
        .eq('id', playlistId)
        .single(),
    ]);

    if (songsResult.error || !songsResult.data) {
      console.error('Error fetching playlist songs:', songsResult.error);
      return [];
    }

    const songs = songsResult.data.map((item) => ({ ...item.songs })) as Song[];

    const customOrder = (playlistResult.data as any)?.custom_order as string[] | null;
    if (customOrder && Array.isArray(customOrder) && customOrder.length > 0) {
      const songIdSet = new Set(songs.map((s) => String(s.id)));
      const cleanOrder = customOrder.filter((id) => songIdSet.has(String(id)));
      const orderMap = new Map(cleanOrder.map((id, idx) => [String(id), idx]));
      songs.sort((a, b) => {
        const aIdx = orderMap.get(String(a.id)) ?? Infinity;
        const bIdx = orderMap.get(String(b.id)) ?? Infinity;
        return aIdx - bIdx;
      });
    }

    return songs;
  } catch (err) {
    console.error('Fetch failed:', err);
    return [];
  }
};

export default getPlaylistSongs;
