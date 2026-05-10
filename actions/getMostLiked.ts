import { Song } from '@/types';
import { createClient } from '@/lib/supabase/server';

const getSongsWithLikeCounts = async (id: string): Promise<{ song: Song; like_count: number }[]> => {
  const supabase = await createClient();

  const { data: userSongs, error: userSongsError } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', id);

  if (userSongsError) {
    console.error(userSongsError.message);
    throw new Error('Failed to fetch user songs');
  }

  if (!userSongs || userSongs.length === 0) {
    return [];
  }

  const songIds = userSongs.map((song: Song) => song.id);
  const { data: likedSongs, error: likedSongsError } = await supabase
    .from('liked_songs')
    .select('song_id')
    .in('song_id', songIds);

  if (likedSongsError) {
    console.error(likedSongsError.message);
    throw new Error('Failed to fetch liked songs');
  }

  const likeCounts = likedSongs.reduce((acc: Record<string, number>, item: { song_id: string }) => {
    acc[item.song_id] = (acc[item.song_id] || 0) + 1;
    return acc;
  }, {});

  const songsWithLikeCounts = userSongs.map(song => ({
    song,
    like_count: likeCounts[song.id] || 0,
  }));

  songsWithLikeCounts.sort((a, b) => {
    const dateA = new Date(a.song.created_at).getTime();
    const dateB = new Date(b.song.created_at).getTime();
    return dateB - dateA;
  });

  return songsWithLikeCounts;
};

export default getSongsWithLikeCounts;
