import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotifyFetch, getStoredScope } from "@/lib/spotify";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ authed: false, connected: false });

  const res = await spotifyFetch(user.id, "/me");
  if (!res || !res.ok) return NextResponse.json({ authed: true, connected: false });

  const profile = await res.json();
  const scope = await getStoredScope(user.id);
  return NextResponse.json({
    authed: true,
    connected: true,
    scope, // granted scopes — check this includes user-read-recently-played
    hasRecentlyPlayedScope: !!scope?.includes("user-read-recently-played"),
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
      image: profile.images?.[0]?.url ?? null,
      product: profile.product, // "premium" | "free" | ...
    },
  });
}
