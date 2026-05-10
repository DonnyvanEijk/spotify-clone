import { Playlist } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getPlaylists = async (): Promise<Playlist[]> => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) return [];

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  return (data as any) || [];
};

export default getPlaylists;
