import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ tracks: [] });

  const res = await spotifyFetch(
    user.id,
    `/search?type=track&limit=20&q=${encodeURIComponent(q)}`
  );
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  const data = await res.json();
  const tracks = (data.tracks?.items ?? []).map((t: any) => ({
    id: t.id,
    uri: t.uri,
    name: t.name,
    artists: (t.artists ?? []).map((a: any) => a.name).join(", "),
    album: t.album?.name ?? null,
    image: t.album?.images?.[t.album.images.length - 1]?.url ?? t.album?.images?.[0]?.url ?? null,
    previewUrl: t.preview_url ?? null,
    durationMs: t.duration_ms ?? 0,
    url: t.external_urls?.spotify ?? null,
  }));

  return NextResponse.json({ tracks });
}
