"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useSessionContext } from "@/hooks/useSessionContext";
import { useUser } from "@/hooks/useUser";

export function useUnreadMessages() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const { supabaseClient } = useSessionContext();
  const [unreadByUserId, setUnreadByUserId] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    if (!user?.id) return;

    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!conversations?.length) {
      setUnreadByUserId({});
      return;
    }

    const { data: reads } = await supabase
      .from("conversation_reads")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    const readMap: Record<string, string> = Object.fromEntries(
      (reads || []).map((r: any) => [r.conversation_id, r.last_read_at])
    );

    const counts = await Promise.all(
      conversations.map(async (conv: any) => {
        const partnerId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        const lastRead = readMap[conv.id];

        let query = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id);

        if (lastRead) {
          query = query.gt("created_at", lastRead);
        }

        const { count } = await query;
        return { partnerId, count: count || 0 };
      })
    );

    const result: Record<string, number> = {};
    for (const { partnerId, count } of counts) {
      result[partnerId] = count;
    }
    setUnreadByUserId(result);
  }, [user?.id, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-fetch on new messages or read updates
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabaseClient
      .channel("global-unread-watch")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          if (payload.new.sender_id !== user.id) refresh();
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_reads" },
        () => refresh())
      .subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [user?.id, supabaseClient, refresh]);

  const totalUnread = Object.values(unreadByUserId).reduce((a, b) => a + b, 0);
  return { unreadByUserId, totalUnread };
}
