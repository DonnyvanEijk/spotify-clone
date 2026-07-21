"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BsSpotify } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { LuPlay, LuPause } from "react-icons/lu";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  display_name: string;
  email?: string;
  image: string | null;
  product?: string;
}

interface Status {
  authed: boolean;
  connected: boolean;
  profile?: Profile | null;
}

interface Track {
  id: string;
  uri: string;
  name: string;
  artists: string;
  album: string | null;
  image: string | null;
  previewUrl: string | null;
  durationMs: number;
  url: string | null;
}

interface Playlist {
  id: string;
  name: string;
  image: string | null;
  owner: string | null;
  tracks: number;
  url: string | null;
}

const SpotifyContent = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/spotify/status");
    const data = await res.json();
    setStatus(data);
    return data as Status;
  }, []);

  useEffect(() => {
    loadStatus().then((s) => {
      if (s.connected) {
        fetch("/api/spotify/playlists")
          .then((r) => r.json())
          .then((d) => setPlaylists(d.playlists ?? []))
          .catch(() => {});
      }
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) toast.success("Spotify connected!");
    const err = params.get("error");
    if (err) toast.error(`Spotify: ${err.replace(/_/g, " ")}`);
    if (params.get("connected") || err) {
      window.history.replaceState(null, "", "/spotify");
    }
  }, [loadStatus]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setTracks([]);
      return;
    }
    setSearching(true);
    fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setTracks(d.tracks ?? []))
      .catch(() => setTracks([]))
      .finally(() => setSearching(false));
  }, []);

  const onQueryChange = (v: string) => {
    setQuery(v);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => runSearch(v), 350);
  };

  const togglePreview = (track: Track) => {
    if (!track.previewUrl) {
      toast.error("No preview available for this track");
      return;
    }
    if (previewId === track.id) {
      audioRef.current?.pause();
      setPreviewId(null);
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = track.previewUrl;
    audioRef.current.play().catch(() => {});
    audioRef.current.onended = () => setPreviewId(null);
    setPreviewId(track.id);
  };

  const disconnect = async () => {
    await fetch("/api/spotify/disconnect", { method: "POST" });
    audioRef.current?.pause();
    setPreviewId(null);
    setPlaylists([]);
    setTracks([]);
    setStatus({ authed: true, connected: false });
    toast.success("Spotify disconnected");
  };

  // --- Loading ---
  if (status === null) {
    return <div className="text-neutral-400 text-sm animate-pulse">Loading…</div>;
  }

  // --- Not signed in to DonBeat ---
  if (!status.authed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <BsSpotify size={40} className="mx-auto text-green-500 mb-3" />
        <p className="text-white font-semibold">Sign in to DonBeat first</p>
        <p className="text-neutral-400 text-sm mt-1">
          You need a DonBeat account before linking Spotify.
        </p>
      </div>
    );
  }

  // --- Not connected: show connect CTA ---
  if (!status.connected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center max-w-lg mx-auto">
        <BsSpotify size={48} className="mx-auto text-green-500 mb-4" />
        <p className="text-white text-lg font-semibold">Connect your Spotify</p>
        <p className="text-neutral-400 text-sm mt-1 mb-6">
          Link your account to browse your playlists and search Spotify from inside DonBeat.
          Full-track playback requires Spotify Premium.
        </p>
        <a
          href="/api/spotify/login"
          className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 transition-colors"
        >
          <BsSpotify size={20} /> Connect Spotify
        </a>
      </div>
    );
  }

  const profile = status.profile;
  const isPremium = profile?.product === "premium";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3 min-w-0">
          {profile?.image ? (
            <img src={profile.image} alt={profile.display_name} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-green-500/20 flex items-center justify-center">
              <BsSpotify className="text-green-500" size={22} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-semibold truncate flex items-center gap-2">
              {profile?.display_name ?? "Spotify user"}
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                  isPremium ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {isPremium ? "Premium" : "Free"}
              </span>
            </p>
            <p className="text-neutral-400 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="shrink-0 text-sm text-neutral-300 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>

      {!isPremium && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs text-amber-300">
          Your Spotify account is Free — you can browse and preview (30s), but full-track playback
          in DonBeat will require Spotify Premium.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="relative flex items-center max-w-xl">
          <HiMagnifyingGlass className="absolute left-3 text-neutral-500 pointer-events-none" size={16} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search Spotify tracks…"
            className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-green-500/40 transition-colors"
          />
        </div>

        {searching && <p className="text-neutral-500 text-sm">Searching…</p>}

        {tracks.length > 0 && (
          <div className="flex flex-col gap-1">
            {tracks.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="relative w-11 h-11 shrink-0 rounded-md overflow-hidden bg-white/10">
                  {t.image && <img src={t.image} alt={t.name} className="w-full h-full object-cover" />}
                  <button
                    onClick={() => togglePreview(t)}
                    title={t.previewUrl ? "Preview (30s)" : "No preview available"}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {previewId === t.id ? (
                      <LuPause className="text-white" size={16} />
                    ) : (
                      <LuPlay className="text-white ml-0.5" size={16} />
                    )}
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{t.name}</p>
                  <p className="text-neutral-400 text-xs truncate">{t.artists}</p>
                </div>
                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-green-500 hover:text-green-400 transition-colors"
                    title="Open in Spotify"
                  >
                    <BsSpotify size={18} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {playlists.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-white text-xl font-bold">Your Spotify playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((p) => (
              <a
                key={p.id}
                href={p.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="relative w-full pt-[100%] rounded-xl overflow-hidden bg-white/10">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BsSpotify className="text-green-500/50" size={32} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-neutral-400 text-xs truncate">{p.tracks} tracks</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyContent;
