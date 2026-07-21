import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const res = await spotifyFetch(user.id, "/me/playlists?limit=50");
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  const data = await res.json();
  const playlists = (data.items ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url ?? null,
    owner: p.owner?.display_name ?? null,
    tracks: p.tracks?.total ?? 0,
    url: p.external_urls?.spotify ?? null,
  }));

  return NextResponse.json({ playlists });
}
