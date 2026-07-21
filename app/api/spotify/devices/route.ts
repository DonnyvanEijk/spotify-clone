import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const res = await spotifyFetch(user.id, "/me/player/devices");
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  const data = await res.json();
  const devices = (data.devices ?? []).map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    isActive: d.is_active,
    volumePercent: d.volume_percent,
  }));

  return NextResponse.json({ devices });
}
