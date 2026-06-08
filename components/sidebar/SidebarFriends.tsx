"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@/hooks/useSessionContext";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { PresenceBadge } from "@/components/PresenceBadge";
import usePlayer from "@/hooks/usePlayer";
import { HiOutlineUsers, HiOutlineUser, HiOutlineChatAlt } from "react-icons/hi";

type Friend = {
  id: string;
  username?: string;
  avatar_url?: string;
  presence: string;
};

interface Props {
  unreadByUserId?: Record<string, number>;
}

export function SidebarFriends({ unreadByUserId = {} }: Props) {
  const { user } = useUser();
  const { supabaseClient } = useSessionContext();
  const supabase = useSupabaseClient();
  const player = usePlayer();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchFriends = async () => {
      const [{ data: youFollow }, { data: followYou }] = await Promise.all([
        supabase.from("followers").select("followed_id").eq("follower_id", user.id),
        supabase.from("followers").select("follower_id").eq("followed_id", user.id),
      ]);

      const youFollowIds = new Set((youFollow || []).map((f: any) => f.followed_id));
      const mutualIds = (followYou || [])
        .map((f: any) => f.follower_id)
        .filter((id: string) => youFollowIds.has(id));

      if (mutualIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: users } = await supabase
        .from("users")
        .select("id, username, avatar_url, presence")
        .in("id", mutualIds);

      const resolved: Friend[] = (users || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        presence: u.presence ?? "offline",
      }));

      setFriends(resolved);
      setPresenceMap(Object.fromEntries(resolved.map((f) => [f.id, f.presence])));
      setLoading(false);
    };

    fetchFriends();
  }, [user?.id, supabase]);

  useEffect(() => {
    if (!friends.length) return;
    const ids = friends.map((f) => f.id);

    const channel = supabaseClient
      .channel("sidebar-friends-presence")
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
  }, [friends, supabaseClient]);

  const getAvatarUrl = (path?: string) =>
    path ? supabase.storage.from("images").getPublicUrl(path).data.publicUrl : null;

  if (!user?.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-600">
        <HiOutlineUsers size={24} />
        <p className="text-xs">Sign in to see friends</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-1 px-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
              <div className="h-2 w-14 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-600">
        <HiOutlineUsers size={24} />
        <p className="text-xs text-center px-4">No friends yet — follow each other to appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-2 overflow-y-auto flex-1 no-scrollbar">
      {friends.map((friend) => {
        const presence = presenceMap[friend.id] ?? "offline";
        const avatarUrl = getAvatarUrl(friend.avatar_url);
        const unread = unreadByUserId[friend.id] ?? 0;
        return (
          <div key={friend.id} className="flex items-center gap-1 rounded-xl hover:bg-white/5 transition-colors group/friend">
            <Link
              href={`/users/${friend.id}`}
              className="flex items-center gap-3 px-2 py-2 flex-1 min-w-0"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={friend.username} className="w-full h-full object-cover" />
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
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white truncate flex-1">{friend.username ?? "Unknown"}</span>
                  {unread > 0 && (
                    <span className="shrink-0 bg-white text-black text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <PresenceBadge
                  presence={presence}
                  showText={true}
                  truncate={true}
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
            <Link
              href={`/messages/${friend.id}`}
              title={`Message ${friend.username ?? "friend"}`}
              className="shrink-0 mr-2 p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/10 opacity-0 group-hover/friend:opacity-100 transition-all"
            >
              <HiOutlineChatAlt size={14} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
