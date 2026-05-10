import { Song } from '@/types';
import { createClient } from '@/lib/supabase/server';

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) return [];

  const { data, error } = await supabase
    .from('liked_songs')
    .select('*, songs(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error.message);
    throw new Error('Failed to fetch songs');
  }

  if (!data) {
    return [];
  }

  return data.map((item) => ({ ...item.songs }));
};

export default getLikedSongs;
