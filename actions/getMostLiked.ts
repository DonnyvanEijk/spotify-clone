import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';
import { cookies } from 'next/headers';

const getSongsWithLikeCounts = async (id:string): Promise<{ song: Song; like_count: number }[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });



  // Step 1: Fetch all songs created by the user
  const { data: userSongs, error: userSongsError } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', id);
    
  if (userSongsError) {
    console.error(userSongsError.message);
    throw new Error('Failed to fetch user songs');
  }

  if (!userSongs || userSongs.length === 0) {
    return []; // No songs created by the user
  }

  // Step 2: Fetch all liked songs for the user's songs
  const songIds = userSongs.map((song: Song) => song.id);
  const { data: likedSongs, error: likedSongsError } = await supabase
    .from('liked_songs')
    .select('song_id')
    .in('song_id', songIds);

  if (likedSongsError) {
    console.error(likedSongsError.message);
    throw new Error('Failed to fetch liked songs');
  }

  // Step 3: Count likes for each song
  const likeCounts = likedSongs.reduce((acc: Record<string, number>, item: { song_id: string }) => {
    acc[item.song_id] = (acc[item.song_id] || 0) + 1; // Increment the like count
    return acc;
  }, {});

  // Step 4: Combine song details with like counts
  const songsWithLikeCounts = userSongs.map(song => {
    const likeCount = likeCounts[song.id] || 0; // Get the like count or default to 0
    return { song, like_count: likeCount };
  });

  // Step 5: Sort songs by like count in descending order
  songsWithLikeCounts.sort((a, b) => {
    const dateA = new Date(a.song.created_at).getTime();
    const dateB = new Date(b.song.created_at).getTime();
    return dateB - dateA;
  });

  return songsWithLikeCounts;
};

export default getSongsWithLikeCounts;