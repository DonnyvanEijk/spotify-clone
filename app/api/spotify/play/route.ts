import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const { uri, deviceId } = await req.json().catch(() => ({}));
  if (!uri) return NextResponse.json({ error: "missing_uri" }, { status: 400 });

  const path = deviceId
    ? `/me/player/play?device_id=${encodeURIComponent(deviceId)}`
    : "/me/player/play";

  const res = await spotifyFetch(user.id, path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uris: [uri] }),
  });

  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  if (res.status === 403)
    return NextResponse.json({ error: "premium_required" }, { status: 403 });
  if (res.status === 404)
    return NextResponse.json({ error: "no_active_device" }, { status: 404 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  return NextResponse.json({ ok: true });
}
