import { Playlist } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getPublicPlaylists = async (): Promise<Playlist[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  return (data as any) || [];
};

export default getPublicPlaylists;
