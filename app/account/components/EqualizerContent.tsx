"use client";

import { useEffect, useRef } from "react";
import useEqualizer, { EQ_PRESETS } from "@/hooks/useEqualizer";
import { EQ_LABELS } from "@/utils/equalizerEngine";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import usePlayer from "@/hooks/usePlayer";

interface Props {
  userId: string;
}

export function EqualizerContent({ userId }: Props) {
  const supabase = useSupabaseClient();
  const player = usePlayer();
  const {
    enabled, preset, bands, dynamicBands,
    setEnabled, setBand, applyPreset, hydrate,
  } = useEqualizer();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialized = useRef(false);

  const isDynamic = preset === "dynamic";
  const displayBands = isDynamic && player.activeId ? dynamicBands : bands;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    supabase
      .from("equalizer_settings")
      .select("enabled, preset, bands")
      .eq("user_id", userId)
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
  }, [userId]);

  const scheduleSave = (nextEnabled: boolean, nextPreset: string, nextBands: number[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase
        .from("equalizer_settings")
        .upsert(
          { user_id: userId, enabled: nextEnabled, preset: nextPreset, bands: nextBands, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .then(() => {});
    }, 500);
  };

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    scheduleSave(next, preset, bands);
  };

  const handlePreset = (name: string) => {
    const p = EQ_PRESETS[name];
    if (!p) return;
    applyPreset(name);
    scheduleSave(enabled, name, [...p.bands]);
  };

  const handleBand = (i: number, gain: number) => {
    if (isDynamic) return; 
    setBand(i, gain);
    const nextBands = [...bands];
    nextBands[i] = gain;
    scheduleSave(enabled, "custom", nextBands);
  };

  const presetKeys = Object.keys(EQ_PRESETS);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-0.5">Audio</p>
          <div className="flex items-center gap-2">
            <h2 className="text-white text-base font-semibold">Equalizer</h2>
            {isDynamic && enabled && player.activeId && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`relative flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
            enabled ? "bg-purple-600" : "bg-white/10"
          }`}
          aria-label={enabled ? "Disable equalizer" : "Enable equalizer"}
        >
          <span
            className={`absolute left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className={`flex flex-col gap-5 transition-opacity duration-200 ${enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        <div className="flex flex-wrap gap-1.5">
          {presetKeys.map((key) => {
            const isActive = preset === key;
            const isDynamicKey = EQ_PRESETS[key].dynamic;
            return (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? isDynamicKey
                      ? "bg-purple-600 text-white ring-1 ring-purple-400/50"
                      : "bg-purple-600 text-white"
                    : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {isDynamicKey && isActive && enabled && player.activeId ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-purple-300 animate-ping" />
                    {EQ_PRESETS[key].label}
                  </span>
                ) : EQ_PRESETS[key].label}
              </button>
            );
          })}
          {preset === "custom" && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-neutral-300">
              Custom
            </span>
          )}
        </div>

        {isDynamic && (
          <p className="text-xs text-neutral-500 -mt-2">
            {player.activeId
              ? "Automatically adjusting to balance the frequency response in real time."
              : "Play a song to activate real-time frequency compensation."}
          </p>
        )}

        <div className="flex items-end justify-between gap-1 px-1">
          {displayBands.map((gain, i) => {
            const rounded = Math.round(gain * 2) / 2; // display at 0.5 precision
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className={`text-[10px] tabular-nums h-3.5 leading-none ${
                  isDynamic ? "text-purple-400" : "text-neutral-400"
                }`}>
                  {rounded > 0 ? `+${rounded}` : rounded === 0 ? "" : rounded}
                </span>

                <div
                  className="relative flex items-center justify-center"
                  style={{ height: 120, width: "100%" }}
                >
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={gain}
                    onChange={(e) => handleBand(i, parseFloat(e.target.value))}
                    readOnly={isDynamic}
                    style={{
                      // Native vertical slider so drag tracks vertical motion.
                      // `direction: rtl` puts the max (top) at the top.
                      writingMode: "vertical-lr",
                      direction: "rtl",
                      height: 112,
                      width: 20,
                      accentColor: isDynamic ? "#a855f7" : "#9333ea",
                      cursor: isDynamic ? "default" : "pointer",
                    }}
                  />
                  <div className="absolute w-full h-px bg-white/10 pointer-events-none" style={{ top: "50%" }} />
                </div>

                <span className="text-[10px] text-neutral-500 leading-none">{EQ_LABELS[i]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between px-1 -mt-3">
          <span className="text-[9px] text-neutral-600">-12 dB</span>
          <span className="text-[9px] text-neutral-600">0</span>
          <span className="text-[9px] text-neutral-600">+12 dB</span>
        </div>
      </div>

      {!enabled && (
        <p className="text-xs text-neutral-500 text-center -mt-1">
          Equalizer is off — enable it to customize your sound
        </p>
      )}
    </div>
  );
}
