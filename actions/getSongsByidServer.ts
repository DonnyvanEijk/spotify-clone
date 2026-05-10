import { Song } from '@/types';
import { createClient } from '@/lib/supabase/server';

const getSongByid = async (song_id: string): Promise<Song | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', song_id)
    .single();

  if (error) {
    console.error(error.message);
    throw new Error('Failed to fetch song');
  }

  return (data as Song) || null;
};

export default getSongByid;
