"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BsSpotify } from "react-icons/bs";
import { LuPlay } from "react-icons/lu";
import { HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";

interface DetailTrack {
  id: string;
  uri: string;
  name: string;
  artists: string;
  durationMs: number;
  image: string | null;
  url: string | null;
}

interface Detail {
  kind: "album" | "playlist";
  id: string;
  uri: string;
  name: string;
  image: string | null;
  subtitle: string;
  totalTracks: number;
  url: string | null;
  tracks: DetailTrack[];
}

function fmtMs(ms: number) {
  const s = Math.floor((ms || 0) / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

const SpotifyDetail: React.FC<{ kind: "album" | "playlist"; id: string }> = ({ kind, id }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/spotify/${kind}/${id}`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  const handlePlayError = async (res: Response) => {
    const d = await res.json().catch(() => ({}));
    if (d.error === "premium_required") toast.error("Spotify Premium is required for playback");
    else if (d.error === "no_active_device")
      toast.error("No active device — open Spotify (or pick a device on the Spotify tab)");
    else toast.error("Couldn't start playback");
  };

  const play = async (body: { uri?: string; contextUri?: string }, label: string) => {
    const res = await fetch("/api/spotify/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return handlePlayError(res);
    toast.success(`Playing ${label}`);
  };

  if (loading) {
    return <div className="p-6 text-neutral-400 text-sm animate-pulse">Loading…</div>;
  }

  if (error || !detail) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
        >
          <HiArrowLeft size={18} /> Back
        </button>
        <p className="mt-6 text-neutral-400">Couldn&apos;t load this {kind}.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto pb-24">
      {/* Ambient art backdrop */}
      <div className="relative">
        {detail.image && (
          <div
            className="pointer-events-none absolute inset-0 h-72 opacity-30 blur-3xl"
            style={{ backgroundImage: `url(${detail.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        )}

        <div className="relative px-4 sm:px-6 md:px-12 pt-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-neutral-200 hover:text-white transition-colors"
          >
            <HiArrowLeft size={16} /> Back
          </button>

          <div className="mt-6 flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
            <div className="relative h-40 w-40 md:h-52 md:w-52 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-white/10">
              {detail.image ? (
                <img src={detail.image} alt={detail.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BsSpotify className="text-green-500/50" size={48} />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left min-w-0">
              <span className="text-green-400 font-semibold text-xs uppercase tracking-widest">
                {detail.kind}
              </span>
              <h1 className="text-white font-bold text-3xl sm:text-4xl lg:text-5xl break-words">
                {detail.name}
              </h1>
              <p className="text-neutral-300 font-medium text-sm">{detail.subtitle}</p>
              <p className="text-neutral-400 text-sm">{detail.totalTracks} tracks</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => play({ contextUri: detail.uri }, detail.name)}
              className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 transition-colors"
            >
              <LuPlay size={18} className="ml-0.5" /> Play
            </button>
            {detail.url && (
              <a
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <BsSpotify size={16} /> Open in Spotify
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="px-4 sm:px-6 md:px-12 mt-8 flex flex-col gap-0.5">
        {detail.tracks.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            onClick={() => play({ uri: t.uri }, t.name)}
            className="group flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-6 shrink-0 text-center">
              <span className="text-xs text-neutral-500 group-hover:hidden">{i + 1}</span>
              <LuPlay size={13} className="text-white mx-auto ml-0.5 hidden group-hover:block" />
            </div>
            <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden bg-white/10">
              {t.image && <img src={t.image} alt={t.name} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{t.name}</p>
              <p className="text-neutral-400 text-xs truncate">{t.artists}</p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-neutral-500">
              {fmtMs(t.durationMs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpotifyDetail;
