import { Playlist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import getPlaylists from "./getPlaylists";
import getPublicPlaylists from "./getPublicPlaylists";

const getPlaylistsByTitle = async (title: string): Promise<Playlist[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    if (!title)
    {
        const allPlaylists1 = await getPlaylists();
        const allPlaylists2 = await getPublicPlaylists();
        const allPlaylists = allPlaylists1.concat(allPlaylists2.filter(p2 => !allPlaylists1.some(p1 => p1.id === p2.id)));
        return allPlaylists;
    }

    const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .like('name', `%${title}%`)
    .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    }

    return (data as any) || [];
}

export default getPlaylistsByTitle;