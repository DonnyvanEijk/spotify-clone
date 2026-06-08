"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSessionContext } from "@/hooks/useSessionContext";
import { PresenceBadge } from "@/components/PresenceBadge";
import { HiOutlineUser } from "react-icons/hi";
import usePlayer from "@/hooks/usePlayer";

export type ResolvedFollower = {
  id: string;
  username?: string;
  presence: string;
  avatarUrl: string | null;
};

type Props = {
  users: ResolvedFollower[];
  title: string;
  emptyMessage: string;
  count: number;
};

export function FollowerList({ users, title, emptyMessage, count }: Props) {
  const [presenceMap, setPresenceMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.presence]))
  );
  const { supabaseClient } = useSessionContext();
  const player = usePlayer();

  useEffect(() => {
    const ids = users.map((u) => u.id);
    if (!ids.length) return;

    const channel = supabaseClient
      .channel(`follower-list-${title}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users" },
        (payload: { new: { id: string; presence?: string } }) => {
          const { id, presence } = payload.new;
          if (ids.includes(id) && presence !== undefined) {
            setPresenceMap((prev) => ({ ...prev, [id]: presence }));
          }
        }
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(channel); };
  }, [supabaseClient, title]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{title}</h2>
        <span className="text-xs text-neutral-500 bg-white/5 rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div className="flex flex-col max-h-52 overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-sm text-neutral-500 px-2">{emptyMessage}</p>
        ) : (
          users.map((user) => {
            const presence = presenceMap[user.id] ?? "offline";
            return (
              <Link
                key={user.id}
                href={`/users/${user.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiOutlineUser size={14} className="text-neutral-500" />
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-neutral-900 rounded-full">
                    <PresenceBadge presence={presence} showText={false} />
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm text-neutral-300 group-hover:text-white truncate transition-colors">
                    {user.username}
                  </span>
                  <PresenceBadge
                    presence={presence}
                    showText={true}
                    className="max-w-full"
                    onPlay={(songId) => {
                      if (player.activeId === songId) {
                        window.dispatchEvent(new Event("restartCurrentSong"));
                      } else {
                        player.insertAfterCurrent(songId);
                      }
                    }}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
