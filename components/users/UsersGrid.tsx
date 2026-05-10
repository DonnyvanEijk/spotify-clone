"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { HiOutlineUsers, HiOutlineSearch } from "react-icons/hi";

type ResolvedUser = {
  id: string;
  username?: string;
  bio?: string;
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

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery = u.username?.toLowerCase().includes(query.toLowerCase()) ?? false;
      const matchesFilter = followingOnly ? u.isFollowed || u.isCurrentUser : true;
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
          <p className="text-sm">{query || followingOnly ? "No results" : "No members yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((user) => (
            <Link key={user.id} href={`/users/${user.id}`}>
              <div className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
                <div className="shrink-0 w-11 h-11 rounded-full overflow-hidden bg-white/10">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-lg font-semibold">
                      {user.username?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                    {user.isCurrentUser && (
                      <span className="text-xs text-neutral-400 bg-white/10 rounded-full px-2 py-0.5 shrink-0">You</span>
                    )}
                    {user.isFollowed && !user.isCurrentUser && (
                      <span className="text-xs text-neutral-400 bg-white/10 rounded-full px-2 py-0.5 shrink-0">Following</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{user.bio || "No bio"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
