// Player.tsx
'use client';

import usePlayer from '@/hooks/usePlayer';
import useLoadSongUrl from '@/hooks/useLoadSongUrl';
import useGetSongById from '@/hooks/useGetSongById';
import PlayerContent from './player-content';

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const songUrl = useLoadSongUrl(song!);

  if (!song || !songUrl || !player.activeId) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-9xl h-[90px] bg-white/10 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 px-5 py-2 z-50">
      <PlayerContent key={songUrl} song={song} songUrl={songUrl} />
    </div>
  );
};

export default Player;
