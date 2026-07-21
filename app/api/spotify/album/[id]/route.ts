import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const res = await spotifyFetch(user.id, `/albums/${id}`);
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  const a = await res.json();
  const cover = a.images?.[a.images.length - 1]?.url ?? a.images?.[0]?.url ?? null;
  const tracks = (a.tracks?.items ?? []).map((t: any) => ({
    id: t.id,
    uri: t.uri,
    name: t.name,
    artists: (t.artists ?? []).map((ar: any) => ar.name).join(", "),
    durationMs: t.duration_ms ?? 0,
    image: cover,
    url: t.external_urls?.spotify ?? null,
  }));

  return NextResponse.json({
    kind: "album",
    id: a.id,
    uri: a.uri,
    name: a.name,
    image: a.images?.[0]?.url ?? null,
    subtitle: (a.artists ?? []).map((ar: any) => ar.name).join(", "),
    totalTracks: a.total_tracks ?? tracks.length,
    url: a.external_urls?.spotify ?? null,
    tracks,
  });
}
