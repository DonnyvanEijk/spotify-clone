import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { Song } from '@/types';

const getSongs = async (): Promise<Song[]> => {
    const cookiesNext = await cookies()
  const supabase = createServerComponentClient({
    cookies: cookiesNext,
  });

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export default getSongs;