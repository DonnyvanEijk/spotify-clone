import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    try {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('album_id', albumId);

        if (error) {
            console.error('Error fetching album songs:', error);
            return [];
        }

        if (!data) {
            console.warn('No data returned for album songs');
            return [];
        }

        return data;
    } catch (err) {
        console.error('Fetch failed:', err);
        return [];
    }
}

export default getAlbumSongs;