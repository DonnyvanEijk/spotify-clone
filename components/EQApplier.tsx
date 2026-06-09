"use client";

import { useEffect, useRef } from "react";
import useEqualizer from "@/hooks/useEqualizer";
import usePlayer from "@/hooks/usePlayer";
import { syncEQ } from "@/utils/equalizerEngine";
import { startDynamicEQ, stopDynamicEQ } from "@/utils/dynamicEQ";
import { useSessionContext } from "@/hooks/useSessionContext";

export function EQApplier() {
  const { enabled, preset, bands, hydrate, setDynamicBands } = useEqualizer();
  const { activeId } = usePlayer();
  const { supabaseClient, session } = useSessionContext();
  const hydrated = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || hydrated.current) return;
    hydrated.current = true;

    supabaseClient
      .from("equalizer_settings")
      .select("enabled, preset, bands")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }: { data: { enabled: boolean; preset: string; bands: number[] | string } | null }) => {
        if (data) {
          hydrate(
            data.enabled,
            data.preset,
            Array.isArray(data.bands) ? data.bands : JSON.parse(data.bands as string)
          );
        }
      });
  }, [session?.user?.id]);

  useEffect(() => {
    if (!activeId || preset === "dynamic") return;
    syncEQ(bands, enabled);
  }, [enabled, bands, activeId, preset]);

  useEffect(() => {
    if (!activeId || !enabled || preset !== "dynamic") {
      stopDynamicEQ();
      setDynamicBands([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      return;
    }

    startDynamicEQ((gains) => {
      setDynamicBands(gains);
    });

    return () => stopDynamicEQ();
  }, [activeId, enabled, preset]);

  return null;
}
