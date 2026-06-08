"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { HiOutlineUsers, HiOutlineSearch } from "react-icons/hi";
import { useSessionContext } from "@/hooks/useSessionContext";
import { PresenceBadge } from "@/components/PresenceBadge";
import usePlayer from "@/hooks/usePlayer";

type ResolvedUser = {
  id: string;
  username?: string;
  bio?: string;
  presence: string;
  avatarUrl: string | null;
  isFollowed: boolean;
  isCurrentUser: boolean;
};

type Props = {
  users: ResolvedUser[];
};

export const UsersGrid = ({ users }: Props) => {
  const [query, setQuery] = useState("");
  const [followingOnly, setFollowingOnly] = useState(false);
  const [presenceMap, setPresenceMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.presence]))
  );
  const { supabaseClient } = useSessionContext();
  const player = usePlayer();

  // Realtime subscription for presence changes
  useEffect(() => {
    const channel = supabaseClient
      .channel("users-presence-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users" },
        (payload: { new: { id: string; presence?: string } }) => {
          const { id, presence } = payload.new;
          if (id && presence !== undefined) {
            setPresenceMap((prev) => ({ ...prev, [id]: presence }));
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.username?.toLowerCase().includes(query.toLowerCase()) ?? false;
      const matchesFilter = followingOnly
        ? u.isFollowed || u.isCurrentUser
        : true;
      return matchesQuery && matchesFilter;
    });
  }, [users, query, followingOnly]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <button
          onClick={() => setFollowingOnly((v) => !v)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
            followingOnly
              ? "bg-white text-black border-white"
              : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
          }`}
        >
          Following
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-500">
          <HiOutlineUsers size={40} />
          <p className="text-sm">
            {query || followingOnly ? "No results" : "No members yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((user) => {
            const presence = presenceMap[user.id] ?? "offline";
            return (
              <Link key={user.id} href={`/users/${user.id}`}>
                <div className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-white/10">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500 text-lg font-semibold">
                          {user.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                    {/* Presence dot overlay on avatar */}
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <PresenceBadge presence={presence} showText={false} />
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.username}
                      </p>
                      {user.isCurrentUser && (
                        <span className="text-xs text-neutral-400 bg-white/10 rounded-full px-2 py-0.5 shrink-0">
                          You
                        </span>
                      )}
                      {user.isFollowed && !user.isCurrentUser && (
                        <span className="text-xs text-neutral-400 bg-white/10 rounded-full px-2 py-0.5 shrink-0">
                          Following
                        </span>
                      )}
                    </div>
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
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
