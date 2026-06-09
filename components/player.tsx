// Player.tsx
'use client';

import usePlayer from '@/hooks/usePlayer';
import useLoadSongUrl from '@/hooks/useLoadSongUrl';
import useGetSongById from '@/hooks/useGetSongById';
import PlayerContent from './player-content';
import { EQApplier } from './EQApplier';

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const songUrl = useLoadSongUrl(song!);

  return (
    <>
      <EQApplier />
      {song && songUrl && player.activeId && (
        <div className="fixed bottom-4 left-4 right-6 md:left-74 h-22.5 bg-white/10 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 px-5 py-2 z-50">
          <PlayerContent key={songUrl} song={song} songUrl={songUrl} />
        </div>
      )}
    </>
  );
};

export default Player;
