"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BsSpotify } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { LuPlay, LuPause, LuSkipBack, LuSkipForward } from "react-icons/lu";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import {
  MdDevices,
  MdComputer,
  MdSmartphone,
  MdSpeaker,
  MdCast,
  MdCheck,
} from "react-icons/md";
import Slider from "@/components/slider";
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

interface Album {
  id: string;
  uri: string;
  name: string;
  artists: string;
  image: string | null;
  totalTracks: number;
  url: string | null;
}

interface Device {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volumePercent: number;
}

interface Playback {
  active: boolean;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  track: { id: string; uri: string; name: string; artists: string; image: string | null } | null;
  device: { id: string; name: string; type: string; volumePercent?: number } | null;
}

function deviceIcon(type: string, size = 16) {
  const t = (type || "").toLowerCase();
  if (t.includes("computer")) return <MdComputer size={size} />;
  if (t.includes("smartphone") || t.includes("phone")) return <MdSmartphone size={size} />;
  if (t.includes("speaker")) return <MdSpeaker size={size} />;
  if (t.includes("tv") || t.includes("cast")) return <MdCast size={size} />;
  return <MdDevices size={size} />;
}

function fmtMs(ms: number) {
  const s = Math.floor((ms || 0) / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

const SpotifyContent = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [recent, setRecent] = useState<Track[]>([]);
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [devicesError, setDevicesError] = useState<"scope" | "error" | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const volumeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const deviceMenuRef = useRef<HTMLDivElement>(null);
  const inactivePollsRef = useRef(0);
  const seekAbortRef = useRef<AbortController | null>(null);
  const volumeAbortRef = useRef<AbortController | null>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/spotify/status");
    const data = await res.json();
    setStatus(data);
    return data as Status;
  }, []);

  const loadDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const res = await fetch("/api/spotify/devices");
      if (!res.ok) {
        // 403 almost always means the linked token lacks the playback scope.
        setDevicesError(res.status === 403 ? "scope" : "error");
        return;
      }
      const data = await res.json();
      const list: Device[] = data.devices ?? [];
      setDevices(list);
      setDevicesError(null);
      setSelectedDeviceId((prev) =>
        prev && list.some((d) => d.id === prev)
          ? prev
          : list.find((d) => d.isActive)?.id ?? list[0]?.id ?? null
      );
    } catch {
      setDevicesError("error");
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const loadPlayer = useCallback(async () => {
    let res: Response;
    try {
      res = await fetch("/api/spotify/player");
    } catch {
      return; // network hiccup — keep whatever we're showing
    }
    if (!res.ok) return; // transient error — don't clear the bar

    const data = await res.json().catch(() => null);

    if (data && data.active && data.track) {
      inactivePollsRef.current = 0;
      setPlayback(data);
      if (data.device?.id) setSelectedDeviceId((prev) => prev ?? data.device.id);
      return;
    }

    // Spotify's /me/player is flaky and returns 204/empty even mid-playback.
    // Only hide the bar after several consecutive inactive polls so it doesn't
    // flicker in and out.
    inactivePollsRef.current += 1;
    if (inactivePollsRef.current >= 3) setPlayback(null);
  }, []);

  useEffect(() => {
    loadStatus().then((s) => {
      if (s.connected) {
        fetch("/api/spotify/playlists")
          .then((r) => r.json())
          .then((d) => setPlaylists(d.playlists ?? []))
          .catch(() => {});
        fetch("/api/spotify/recently-played")
          .then((r) => r.json())
          .then((d) => setRecent(d.tracks ?? []))
          .catch(() => {});
        fetch("/api/spotify/albums")
          .then((r) => r.json())
          .then((d) => setAlbums(d.albums ?? []))
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

  // Poll live playback + devices while connected.
  useEffect(() => {
    if (!status?.connected) return;
    loadDevices();
    loadPlayer();
    const iv = setInterval(loadPlayer, 4000);
    return () => clearInterval(iv);
  }, [status?.connected, loadDevices, loadPlayer]);

  useEffect(() => {
    if (!deviceMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target as Node)) {
        setDeviceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [deviceMenuOpen]);

  // Advance the progress bar locally between polls so it reads as live.
  useEffect(() => {
    if (!playback?.active || !playback.isPlaying) return;
    const iv = setInterval(() => {
      setPlayback((prev) =>
        prev && prev.active
          ? { ...prev, progressMs: Math.min(prev.progressMs + 1000, prev.durationMs) }
          : prev
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [playback?.active, playback?.isPlaying]);

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

  const handlePlayError = async (res: Response) => {
    const d = await res.json().catch(() => ({}));
    if (d.error === "premium_required") toast.error("Spotify Premium is required for playback");
    else if (d.error === "no_active_device")
      toast.error("That device isn't available — open Spotify on it first");
    else toast.error("Couldn't control playback");
  };

  const startPlayback = async (
    body: { uri?: string; contextUri?: string },
    label: string
  ) => {
    if (!selectedDeviceId) {
      toast.error("Pick a device to play on first");
      loadDevices();
      setDeviceMenuOpen(true);
      return;
    }
    const res = await fetch("/api/spotify/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, deviceId: selectedDeviceId }),
    });
    if (!res.ok) return handlePlayError(res);
    const dev = devices.find((d) => d.id === selectedDeviceId);
    toast.success(`Playing ${label} on ${dev?.name ?? "your device"}`);
    inactivePollsRef.current = 0;
    setTimeout(loadPlayer, 800);
    setTimeout(loadPlayer, 2000);
  };

  const playTrack = (track: Track) => startPlayback({ uri: track.uri }, track.name);
  const playContext = (contextUri: string, label: string) =>
    startPlayback({ contextUri }, label);

  const control = async (action: "play" | "pause" | "next" | "previous") => {
    // Optimistic feedback so the buttons feel instant instead of waiting for a poll.
    if (action === "play" || action === "pause") {
      setPlayback((prev) =>
        prev && prev.active ? { ...prev, isPlaying: action === "play" } : prev
      );
    }
    const res = await fetch("/api/spotify/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, deviceId: selectedDeviceId }),
    });
    if (!res.ok) {
      handlePlayError(res);
      loadPlayer(); // revert optimistic state to reality
      return;
    }
    // Reconcile from Spotify; skips change the track so poll twice.
    inactivePollsRef.current = 0;
    setTimeout(loadPlayer, 350);
    if (action === "next" || action === "previous") setTimeout(loadPlayer, 1200);
  };

  const seekTo = async (positionMs: number) => {
    const clamped = Math.max(0, Math.round(positionMs));
    setPlayback((prev) =>
      prev && prev.active
        ? { ...prev, progressMs: Math.min(clamped, prev.durationMs) }
        : prev
    );
    // Cancel any in-flight seek — the latest drag/click wins.
    seekAbortRef.current?.abort();
    const ac = new AbortController();
    seekAbortRef.current = ac;
    try {
      const res = await fetch("/api/spotify/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seek", positionMs: clamped, deviceId: selectedDeviceId }),
        signal: ac.signal,
      });
      if (!res.ok) {
        handlePlayError(res);
        loadPlayer();
        return;
      }
      setTimeout(loadPlayer, 500);
    } catch (e) {
      // A superseded (aborted) request is expected — ignore it.
      if ((e as Error)?.name !== "AbortError") loadPlayer();
    }
  };

  const setDeviceVolume = (percent: number) => {
    // Update the slider instantly; debounce + supersede the API call while dragging.
    setPlayback((prev) =>
      prev && prev.active && prev.device
        ? { ...prev, device: { ...prev.device, volumePercent: percent } }
        : prev
    );
    clearTimeout(volumeTimeout.current);
    volumeTimeout.current = setTimeout(async () => {
      volumeAbortRef.current?.abort();
      const ac = new AbortController();
      volumeAbortRef.current = ac;
      try {
        const res = await fetch("/api/spotify/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "volume", volumePercent: percent, deviceId: selectedDeviceId }),
          signal: ac.signal,
        });
        if (!res.ok) {
          handlePlayError(res);
          loadPlayer();
        }
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") loadPlayer();
      }
    }, 180);
  };

  const selectDevice = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setDeviceMenuOpen(false);
    // If something is already playing, move it to the chosen device.
    if (playback?.active) {
      const res = await fetch("/api/spotify/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer", deviceId }),
      });
      if (res.ok) {
        toast.success("Switched device");
        setTimeout(() => {
          loadPlayer();
          loadDevices();
        }, 700);
      } else {
        handlePlayError(res);
      }
    }
  };

  const disconnect = async () => {
    await fetch("/api/spotify/disconnect", { method: "POST" });
    setPlaylists([]);
    setTracks([]);
    setDevices([]);
    setPlayback(null);
    setSelectedDeviceId(null);
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
          Link your account to browse your playlists and play tracks on any of your Spotify
          devices. Playback requires Spotify Premium.
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

  // --- Connected ---
  const profile = status.profile;
  const isPremium = profile?.product === "premium";
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null;
  const currentTrackId = playback?.active ? playback.track?.id : null;

  const trackRow = (t: Track, keyPrefix = "") => {
    const isCurrent = currentTrackId === t.id;
    const isPlayingThis = isCurrent && playback?.isPlaying;
    return (
      <div
        key={`${keyPrefix}${t.id}`}
        className={`group flex items-center gap-3 p-2 rounded-xl transition-colors ${
          isCurrent ? "bg-green-500/10" : "hover:bg-white/5"
        }`}
      >
        <div className="relative w-11 h-11 shrink-0 rounded-md overflow-hidden bg-white/10">
          {t.image && <img src={t.image} alt={t.name} className="w-full h-full object-cover" />}
          <button
            onClick={() => (isCurrent ? control(isPlayingThis ? "pause" : "play") : playTrack(t))}
            title="Play on selected device"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isPlayingThis ? (
              <LuPause className="text-white" size={16} />
            ) : (
              <LuPlay className="text-white ml-0.5" size={16} />
            )}
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium truncate ${isCurrent ? "text-green-300" : "text-white"}`}>
            {t.name}
          </p>
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
    );
  };

  const devicePicker = (
    <div className="relative" ref={deviceMenuRef}>
      <button
        onClick={() => {
          loadDevices();
          setDeviceMenuOpen((v) => !v);
        }}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
      >
        {selectedDevice ? deviceIcon(selectedDevice.type, 16) : <MdDevices size={16} />}
        <span className="max-w-40 truncate">
          {selectedDevice ? selectedDevice.name : "Choose a device"}
        </span>
      </button>

      {deviceMenuOpen && (
        <div className="absolute right-0 mt-2 w-72 z-50 rounded-xl bg-neutral-900 border border-white/15 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Play on device
            </p>
            <button
              onClick={() => loadDevices()}
              className="text-[11px] text-green-400 hover:text-green-300 transition-colors"
            >
              {devicesLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {devicesError === "scope" ? (
            <p className="px-3 py-3 text-xs text-amber-300">
              Playback permission is missing. Click <span className="font-semibold">Disconnect</span>{" "}
              then reconnect Spotify to grant device control.
            </p>
          ) : devicesError === "error" ? (
            <p className="px-3 py-3 text-xs text-red-300">
              Couldn&apos;t load devices. Try Refresh.
            </p>
          ) : devices.length === 0 ? (
            <p className="px-3 py-3 text-xs text-neutral-500 leading-relaxed">
              No devices found. Open the Spotify app (same account you linked), play/pause once to
              wake it, then hit Refresh.
            </p>
          ) : (
            devices.map((d) => (
              <button
                key={d.id}
                onClick={() => selectDevice(d.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm text-neutral-200 hover:bg-white/8 hover:text-white transition-colors"
              >
                <span className="text-green-400">{deviceIcon(d.type, 18)}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{d.name}</span>
                  <span className="block text-[11px] text-neutral-500 capitalize">
                    {d.type}
                    {d.isActive ? " · active" : ""}
                  </span>
                </span>
                {d.id === selectedDeviceId && <MdCheck size={16} className="text-green-400" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Account header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
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
        <div className="flex items-center gap-3">
          {devicePicker}
          <button
            onClick={disconnect}
            className="shrink-0 text-sm text-neutral-300 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {!isPremium && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs text-amber-300">
          Your Spotify account is Free — remote playback control requires Spotify Premium.
        </div>
      )}

      {/* Now playing remotely bar */}
      {playback?.active && playback.track && (
        <div className="flex flex-col gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-300">
            <MdCast size={13} /> Playing remotely
          </span>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-white/10">
              {playback.track.image && (
                <img src={playback.track.image} alt={playback.track.name} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{playback.track.name}</p>
              <p className="text-neutral-400 text-xs truncate">{playback.track.artists}</p>
              {playback.device && (
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-green-300/90">
                  {deviceIcon(playback.device.type, 13)}
                  on {playback.device.name}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="w-8 text-right text-[10px] tabular-nums text-neutral-400">
                  {fmtMs(playback.progressMs)}
                </span>
                <div
                  role="slider"
                  aria-label="Seek"
                  aria-valuenow={Math.round(playback.progressMs / 1000)}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                    seekTo(ratio * playback.durationMs);
                  }}
                  className="group/seek relative h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden cursor-pointer hover:h-2 transition-[height]"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-green-400 group-hover/seek:bg-green-300"
                    style={{
                      width: `${
                        playback.durationMs
                          ? Math.min(100, (playback.progressMs / playback.durationMs) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="w-8 text-[10px] tabular-nums text-neutral-400">
                  {fmtMs(playback.durationMs)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => control("previous")}
                  className="text-neutral-300 hover:text-white transition-colors"
                  aria-label="Previous"
                >
                  <LuSkipBack size={20} />
                </button>
                <button
                  onClick={() => control(playback.isPlaying ? "pause" : "play")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
                  aria-label={playback.isPlaying ? "Pause" : "Play"}
                >
                  {playback.isPlaying ? <LuPause size={18} /> : <LuPlay size={18} className="ml-0.5" />}
                </button>
                <button
                  onClick={() => control("next")}
                  className="text-neutral-300 hover:text-white transition-colors"
                  aria-label="Next"
                >
                  <LuSkipForward size={20} />
                </button>
              </div>
              {typeof playback.device?.volumePercent === "number" && (
                <div className="flex w-32 items-center gap-2">
                  <button
                    onClick={() => setDeviceVolume(playback.device!.volumePercent! > 0 ? 0 : 60)}
                    className="shrink-0 text-neutral-400 hover:text-white transition-colors"
                    aria-label={playback.device.volumePercent > 0 ? "Mute" : "Unmute"}
                  >
                    {playback.device.volumePercent > 0 ? (
                      <HiSpeakerWave size={16} />
                    ) : (
                      <HiSpeakerXMark size={16} />
                    )}
                  </button>
                  <Slider
                    value={(playback.device.volumePercent ?? 0) / 100}
                    onChange={(v) => setDeviceVolume(Math.round(v * 100))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
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
            {tracks.map((t) => trackRow(t, "search-"))}
          </div>
        )}
      </div>

      {/* Recently played */}
      {!query && recent.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-white text-xl font-bold">Recently played</h2>
          <div className="flex flex-col gap-1">
            {recent.map((t) => trackRow(t, "recent-"))}
          </div>
        </div>
      )}

      {/* Saved albums */}
      {albums.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-white text-xl font-bold">Saved albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-5">
            {albums.map((a) => (
              <div
                key={a.id}
                className="group relative flex flex-col gap-3 p-3 rounded-2xl bg-white/3 border border-white/10 hover:bg-white/8 hover:border-white/20 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative w-full pt-[100%] rounded-xl overflow-hidden bg-white/10 shadow-lg shadow-black/30">
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BsSpotify className="text-green-500/40" size={36} />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={() => playContext(a.uri, a.name)}
                    title="Play album on selected device"
                    aria-label={`Play ${a.name}`}
                    className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-black/40 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 hover:bg-green-400 transition-all duration-300"
                  >
                    <LuPlay size={22} className="ml-0.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{a.name}</p>
                  <p className="text-neutral-400 text-xs truncate">{a.artists}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-white text-xl font-bold">Your Spotify playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-5">
            {playlists.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col gap-3 p-3 rounded-2xl bg-white/3 border border-white/10 hover:bg-white/8 hover:border-white/20 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative w-full pt-[100%] rounded-xl overflow-hidden bg-white/10 shadow-lg shadow-black/30">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BsSpotify className="text-green-500/40" size={36} />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={() => playContext(`spotify:playlist:${p.id}`, p.name)}
                    title="Play playlist on selected device"
                    aria-label={`Play ${p.name}`}
                    className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-black/40 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 hover:bg-green-400 transition-all duration-300"
                  >
                    <LuPlay size={22} className="ml-0.5" />
                  </button>
                </div>
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-neutral-400 text-xs truncate">{p.tracks} tracks</p>
                  </div>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 mt-0.5 text-neutral-500 hover:text-green-400 transition-colors"
                      title="Open in Spotify"
                    >
                      <BsSpotify size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyContent;
