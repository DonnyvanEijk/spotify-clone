import { Playlist } from "@/types";
import { createClient } from "@/lib/supabase/server";
import getPlaylists from "./getPlaylists";
import getPublicPlaylists from "./getPublicPlaylists";

const getPlaylistsByTitle = async (title: string): Promise<Playlist[]> => {
  if (!title) {
    const [own, pub] = await Promise.all([getPlaylists(), getPublicPlaylists()]);
    return own.concat(pub.filter(p2 => !own.some(p1 => p1.id === p2.id)));
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .like('name', `%${title}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  return (data as any) || [];
};

export default getPlaylistsByTitle;
