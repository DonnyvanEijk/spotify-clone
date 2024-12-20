import { Playlist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

const getPlaylist = async (id: string): Promise<Playlist> => {
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
        .eq('id', id)
        .order('created_at', { ascending: false })
        .single();

    if (error) {
        console.error(error);
    }
    if(!data) {
       throw new Error('Playlist not found');
    }

    if (data.user_id !== session?.user.id && !data.is_public) {
        return redirect('/');
    }

    return (data as any) || [];
}

export default getPlaylist;