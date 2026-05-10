import { Song } from '@/types';
import { createClient } from '@/lib/supabase/server';

const getSongs = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error.message);
    throw new Error('Failed to fetch songs');
  }

  return (data as any) || [];
};

export default getSongs;
