import { SupabaseClient } from '@supabase/supabase-js';
import { Song } from '@/types';

const getSongById = async (
  supabaseClient: SupabaseClient,
  song_id: string | undefined
): Promise<Song[] | Error> => {
  try {
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .eq('id', song_id);

    if (error) {
      console.error(error.message);
      return new Error('Failed to fetch song');
    }

    return data as Song[];
  } catch (err) {
    console.error(err);
    return new Error('Something went wrong fetching the song');
  }
};

export default getSongById;
