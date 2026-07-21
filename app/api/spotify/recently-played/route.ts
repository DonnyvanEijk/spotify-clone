import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const res = await spotifyFetch(user.id, "/me/player/recently-played?limit=30");
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Spotify /me/player/recently-played ${res.status}: ${detail}`);
    return NextResponse.json({ error: "spotify_error" }, { status: res.status });
  }

  const data = await res.json();
  const seen = new Set<string>();
  const tracks: any[] = [];
  for (const item of data.items ?? []) {
    const t = item.track;
    if (!t || seen.has(t.id)) continue; // recently-played repeats tracks
    seen.add(t.id);
    tracks.push({
      id: t.id,
      uri: t.uri,
      name: t.name,
      artists: (t.artists ?? []).map((a: any) => a.name).join(", "),
      album: t.album?.name ?? null,
      image: t.album?.images?.[t.album.images.length - 1]?.url ?? t.album?.images?.[0]?.url ?? null,
      previewUrl: t.preview_url ?? null,
      durationMs: t.duration_ms ?? 0,
      url: t.external_urls?.spotify ?? null,
      playedAt: item.played_at ?? null,
    });
  }

  return NextResponse.json({ tracks });
}
