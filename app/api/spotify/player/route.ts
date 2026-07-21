import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch } from "@/lib/spotify";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authed" }, { status: 401 });

  const res = await spotifyFetch(user.id, "/me/player");
  if (!res) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  if (res.status === 204) return NextResponse.json({ active: false });
  if (!res.ok) return NextResponse.json({ active: false });

  const data = await res.json();
  if (!data || !data.item) return NextResponse.json({ active: false });

  return NextResponse.json({
    active: true,
    isPlaying: !!data.is_playing,
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item?.duration_ms ?? 0,
    track: {
      id: data.item?.id,
      uri: data.item?.uri,
      name: data.item?.name,
      artists: (data.item?.artists ?? []).map((a: any) => a.name).join(", "),
      image: data.item?.album?.images?.[0]?.url ?? null,
    },
    device: data.device
      ? {
          id: data.device.id,
          name: data.device.name,
          type: data.device.type,
          volumePercent: data.device.volume_percent,
        }
      : null,
  });
}
