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

  const res = await spotifyFetch(user.id, `/playlists/${id}`);
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  const p = await res.json();
  const tracks = (p.tracks?.items ?? [])
    .map((item: any) => {
      const t = item.track;
      if (!t) return null;
      return {
        id: t.id,
        uri: t.uri,
        name: t.name,
        artists: (t.artists ?? []).map((ar: any) => ar.name).join(", "),
        durationMs: t.duration_ms ?? 0,
        image:
          t.album?.images?.[t.album.images.length - 1]?.url ??
          t.album?.images?.[0]?.url ??
          null,
        url: t.external_urls?.spotify ?? null,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    kind: "playlist",
    id: p.id,
    uri: p.uri,
    name: p.name,
    image: p.images?.[0]?.url ?? null,
    subtitle: `By ${p.owner?.display_name ?? "Unknown"}`,
    totalTracks: p.tracks?.total ?? tracks.length,
    url: p.external_urls?.spotify ?? null,
    tracks,
  });
}
