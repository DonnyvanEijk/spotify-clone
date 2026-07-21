import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const res = await spotifyFetch(user.id, "/me/albums?limit=30");
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  const data = await res.json();
  const albums = (data.items ?? []).map((entry: any) => {
    const a = entry.album ?? entry;
    return {
      id: a.id,
      uri: a.uri,
      name: a.name,
      artists: (a.artists ?? []).map((ar: any) => ar.name).join(", "),
      image: a.images?.[0]?.url ?? null,
      totalTracks: a.total_tracks ?? 0,
      url: a.external_urls?.spotify ?? null,
    };
  });

  return NextResponse.json({ albums });
}
