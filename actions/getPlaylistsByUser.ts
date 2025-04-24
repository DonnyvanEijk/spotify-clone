import { Playlist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getPlaylistsByUser = async (user_id:string): Promise<Playlist[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });



    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    }

    return (data as any) || [];
}

export default getPlaylistsByUser;