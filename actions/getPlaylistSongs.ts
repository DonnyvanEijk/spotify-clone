import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getPlaylistSongs = async (playlistId: string): Promise<Song[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    try {
        const { data, error } = await supabase
            .from('playlist_songs')
            .select('*, songs(*)')
            .eq('playlist_id', playlistId);

        if (error) {
            console.error('Error fetching playlist songs:', error);
            return [];
        }

        if (!data) {
            console.warn('No data returned for playlist songs');
            return [];
        }

        return data.map((item) => ({
            ...item.songs,
        }));
    } catch (err) {
        console.error('Fetch failed:', err);
        return [];
    }
}

export default getPlaylistSongs;