import { Song } from '@/types';
import { createClient } from '@/lib/supabase/server';
import getSongs from './getSongs';

const getSongsByTitle = async (title: string): Promise<Song[]> => {
  if (!title) {
    return getSongs();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('title', `%${title}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export default getSongsByTitle;
