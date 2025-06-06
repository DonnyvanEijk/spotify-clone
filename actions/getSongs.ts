
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';
import { cookies } from 'next/headers';

const getSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

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