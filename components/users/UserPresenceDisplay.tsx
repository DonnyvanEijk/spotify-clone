"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@/hooks/useSessionContext";
import { PresenceBadge } from "@/components/PresenceBadge";
import usePlayer from "@/hooks/usePlayer";

type Props = {
  userId: string;
  initialPresence: string;
};

export function UserPresenceDisplay({ userId, initialPresence }: Props) {
  const [presence, setPresence] = useState(initialPresence);
  const { supabaseClient } = useSessionContext();
  const player = usePlayer();

  useEffect(() => {
    const channel = supabaseClient
      .channel(`user-presence-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` },
        (payload: { new: { presence?: string } }) => {
          if (payload.new.presence !== undefined) {
            setPresence(payload.new.presence);
          }
        }
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(channel); };
  }, [userId, supabaseClient]);

  return (
    <PresenceBadge
      presence={presence}
      showText={true}
      onPlay={(songId) => {
        if (player.activeId === songId) {
          window.dispatchEvent(new Event("restartCurrentSong"));
        } else {
          player.insertAfterCurrent(songId);
        }
      }}
    />
  );
}
