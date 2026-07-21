import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

// Transport + device control for the user's active Spotify Connect session.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const { action, deviceId, positionMs, volumePercent } = await req
    .json()
    .catch(() => ({}));
  const dq = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";

  const withDevice = (params: Record<string, string | number>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) sp.set(k, String(v));
    if (deviceId) sp.set("device_id", deviceId);
    return `?${sp.toString()}`;
  };

  let res: Response | null = null;
  switch (action) {
    case "pause":
      res = await spotifyFetch(user.id, `/me/player/pause${dq}`, { method: "PUT" });
      break;
    case "play":
      res = await spotifyFetch(user.id, `/me/player/play${dq}`, { method: "PUT" });
      break;
    case "next":
      res = await spotifyFetch(user.id, `/me/player/next${dq}`, { method: "POST" });
      break;
    case "previous":
      res = await spotifyFetch(user.id, `/me/player/previous${dq}`, { method: "POST" });
      break;
    case "seek":
      if (typeof positionMs !== "number")
        return NextResponse.json({ error: "missing_position" }, { status: 400 });
      res = await spotifyFetch(
        user.id,
        `/me/player/seek${withDevice({ position_ms: Math.max(0, Math.round(positionMs)) })}`,
        { method: "PUT" }
      );
      break;
    case "volume":
      if (typeof volumePercent !== "number")
        return NextResponse.json({ error: "missing_volume" }, { status: 400 });
      res = await spotifyFetch(
        user.id,
        `/me/player/volume${withDevice({
          volume_percent: Math.min(100, Math.max(0, Math.round(volumePercent))),
        })}`,
        { method: "PUT" }
      );
      break;
    case "transfer":
      if (!deviceId)
        return NextResponse.json({ error: "missing_device" }, { status: 400 });
      res = await spotifyFetch(user.id, "/me/player", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
      });
      break;
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (res.status === 403)
    return NextResponse.json({ error: "premium_required" }, { status: 403 });
  if (res.status === 404)
    return NextResponse.json({ error: "no_active_device" }, { status: 404 });
  if (!res.ok) return NextResponse.json({ error: "spotify_error" }, { status: res.status });

  return NextResponse.json({ ok: true });
}
