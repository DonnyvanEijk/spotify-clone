import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getSpotifyProfile, saveTokens } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const base = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const cookieState = req.cookies.get("spotify_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(`${base}/spotify?error=${encodeURIComponent(reason)}`);

  if (oauthError) return fail(oauthError);
  if (!code || !state || state !== cookieState) return fail("state_mismatch");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("not_logged_in");

  try {
    const tokens = await exchangeCodeForTokens(code);
    console.log("Spotify granted scopes:", tokens.scope);
    const profile = await getSpotifyProfile(tokens.access_token);
    await saveTokens(user.id, tokens, profile);
  } catch (e) {
    console.error("Spotify callback failed:", e);
    return fail("exchange_failed");
  }

  const res = NextResponse.redirect(`${base}/spotify?connected=1`);
  res.cookies.delete("spotify_oauth_state");
  return res;
}
