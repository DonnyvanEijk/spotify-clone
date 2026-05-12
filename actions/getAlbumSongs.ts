import { Song } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
  const supabase = await createClient();

  try {
    const [songsResult, albumResult] = await Promise.all([
      supabase.from('songs').select('*').eq('album_id', albumId),
      supabase
        .from('albums')
        .select('custom_order')
        .eq('id', albumId)
        .single(),
    ]);

    if (songsResult.error || !songsResult.data) {
      console.error('Error fetching album songs:', songsResult.error);
      return [];
    }

    const songs = [...songsResult.data] as Song[];

    const customOrder = (albumResult.data as any)?.custom_order as string[] | null;
    if (customOrder && Array.isArray(customOrder) && customOrder.length > 0) {
      const songIdSet = new Set(songs.map((s) => String(s.id)));
      const cleanOrder = customOrder.filter((id) => songIdSet.has(String(id)));
      const orderMap = new Map(cleanOrder.map((id, idx) => [String(id), idx]));
      songs.sort((a, b) => {
        const aIdx = orderMap.get(String(a.id)) ?? Infinity;
        const bIdx = orderMap.get(String(b.id)) ?? Infinity;
        return aIdx - bIdx;
      });
    } else {
      songs.sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at))
      );
    }

    return songs;
  } catch (err) {
    console.error('Fetch failed:', err);
    return [];
  }
};

export default getAlbumSongs;
