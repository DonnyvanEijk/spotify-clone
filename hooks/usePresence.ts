"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSessionContext } from "@/hooks/useSessionContext";
import usePlayer from "@/hooks/usePlayer";
import useCustomStatus from "@/hooks/useCustomStatus";

const AWAY_MS = 5 * 60 * 1000;

export function usePresence() {
  const { supabaseClient, session } = useSessionContext();
  const player = usePlayer();
  const { customStatus } = useCustomStatus();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentRef = useRef<string>("offline");
  const prevSongIdRef = useRef<string | undefined>(undefined);
  const sessionRef = useRef(session);
  const customStatusRef = useRef(customStatus);

  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { customStatusRef.current = customStatus; }, [customStatus]);

  const userId = session?.user?.id;

  // "custom:STATUS" or "online"
  const baseState = useCallback(
    () => customStatusRef.current ? `custom:${customStatusRef.current}` : "online",
    []
  );

  // "custom:STATUS;listening:ID:Title" or plain "listening:ID:Title"
  const listeningState = useCallback(
    (songId: string, title: string, author: string) => {
      const listening = `listening:${songId}:${title} by ${author}`;
      return customStatusRef.current
        ? `custom:${customStatusRef.current};${listening}`
        : listening;
    },
    []
  );

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
            if (data) setPresence(listeningState(prevSongIdRef.current!, data.title, data.author));
            else setPresence(baseState());
          });
      } else {
        setPresence(baseState());
      }
    }
    startAwayTimer();
  }, [setPresence, startAwayTimer, supabaseClient, baseState]);

  // Re-evaluate presence whenever custom status is set or cleared
  useEffect(() => {
    if (!userId || currentRef.current === "away" || currentRef.current === "offline") return;
    if (prevSongIdRef.current) {
      supabaseClient
        .from("songs")
        .select("title, author")
        .eq("id", prevSongIdRef.current)
        .single()
        .then(({ data }: { data: { title: string; author: string } | null }) => {
          if (data) setPresence(listeningState(prevSongIdRef.current!, data.title, data.author));
          else setPresence(baseState());
        });
    } else {
      setPresence(baseState());
    }
  }, [customStatus, userId]);

  // Track song changes
  useEffect(() => {
    if (!userId) return;
    if (player.activeId === prevSongIdRef.current) return;
    prevSongIdRef.current = player.activeId;

    if (!player.activeId) {
      if (currentRef.current !== "away") setPresence(baseState());
      return;
    }

    supabaseClient
      .from("songs")
      .select("title, author")
      .eq("id", player.activeId)
      .single()
      .then(({ data }: { data: { title: string; author: string } | null }) => {
        if (data) setPresence(listeningState(player.activeId!, data.title, data.author));
      });
  }, [player.activeId, userId, supabaseClient, setPresence, baseState, listeningState]);

  // Set base state on mount, offline on unload
  useEffect(() => {
    if (!userId) return;

    setPresence(baseState());
    startAwayTimer();

    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

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

    // Re-assert when tab becomes visible again (handles returning to tab,
    // recovering from another tab setting offline, or a failed initial set)
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && currentRef.current !== "offline") {
        setPresence(currentRef.current);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(timerRef.current);
    };
  }, [userId]);

  // Heartbeat: re-assert current presence every 30s to recover from
  // silent network failures, another-tab-closed offline overwrites, etc.
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      if (currentRef.current !== "offline") {
        supabaseClient
          .from("users")
          .update({ presence: currentRef.current } as any)
          .eq("id", userId);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [userId, supabaseClient]);
}
