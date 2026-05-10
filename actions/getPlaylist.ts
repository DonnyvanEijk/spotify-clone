import { Playlist } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

const getPlaylist = async (id: string): Promise<Playlist> => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .order('created_at', { ascending: false })
    .single();

  if (error) {
    console.error(error);
  }

  if (!data) {
    throw new Error('Playlist not found');
  }

  if (data.user_id !== user?.id && !data.is_public) {
    toast.error("You need to be authenticated to access playlists");
    return redirect('/');
  }

  return (data as any) || [];
};

export default getPlaylist;
