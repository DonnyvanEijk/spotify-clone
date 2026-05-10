import { Playlist } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getPlaylistsByUser = async (user_id: string): Promise<Playlist[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  return (data as any) || [];
};

export default getPlaylistsByUser;
