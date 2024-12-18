import { Playlist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getPlaylists = async (): Promise<Playlist[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const {
        data: {
            session
        }
    } = await supabase.auth.getSession();

    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    }

    return (data as any) || [];
}

export default getPlaylists;