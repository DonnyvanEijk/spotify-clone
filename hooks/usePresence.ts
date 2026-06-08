"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSessionContext } from "@/hooks/useSessionContext";
import usePlayer from "@/hooks/usePlayer";

const AWAY_MS = 5 * 60 * 1000;

export function usePresence() {
  const { supabaseClient, session } = useSessionContext();
  const player = usePlayer();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentRef = useRef<string>("offline");
  const prevSongIdRef = useRef<string | undefined>(undefined);
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const userId = session?.user?.id;

  const setPresence = useCallback(
    async (value: string) => {
      if (!userId) return;
      currentRef.current = value;
      await supabaseClient
        .from("users")
        .update({ presence: value } as any)
        .eq("id", userId);
    },
    [userId, supabaseClient]
  );

  const startAwayTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPresence("away"), AWAY_MS);
  }, [setPresence]);

  const onActivity = useCallback(() => {
    if (currentRef.current === "away") {
      if (prevSongIdRef.current) {
        supabaseClient
          .from("songs")
          .select("title, author")
          .eq("id", prevSongIdRef.current)
          .single()
          .then(({ data }: { data: { title: string; author: string } | null }) => {
            if (data) setPresence(`listening:${prevSongIdRef.current}:${data.title} by ${data.author}`);
            else setPresence("online");
          });
      } else {
        setPresence("online");
      }
    }
    startAwayTimer();
  }, [setPresence, startAwayTimer, supabaseClient]);

  // Track song changes
  useEffect(() => {
    if (!userId) return;
    if (player.activeId === prevSongIdRef.current) return;
    prevSongIdRef.current = player.activeId;

    if (!player.activeId) {
      if (currentRef.current !== "away") setPresence("online");
      return;
    }

    supabaseClient
      .from("songs")
      .select("title, author")
      .eq("id", player.activeId)
      .single()
      .then(({ data }: { data: { title: string; author: string } | null }) => {
        if (data) setPresence(`listening:${player.activeId}:${data.title} by ${data.author}`);
      });
  }, [player.activeId, userId, supabaseClient, setPresence]);

  // Set online on mount, offline on unload
  useEffect(() => {
    if (!userId) return;

    setPresence("online");
    startAwayTimer();

    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    events.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true })
    );

    const handleUnload = () => {
      const token = sessionRef.current?.access_token;
      if (!token) return;
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${token}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ presence: "offline" }),
          keepalive: true,
        }
      );
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener("beforeunload", handleUnload);
      clearTimeout(timerRef.current);
    };
  }, [userId]);
}
