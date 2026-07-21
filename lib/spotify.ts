import { createClient } from "@supabase/supabase-js";

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
export const SPOTIFY_API = "https://api.spotify.com/v1";

// Scopes: read profile/playlists/library now; the streaming + playback-state
// scopes are needed for the in-browser Web Playback SDK in Phase 2.
export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

// Service-role client (bypasses RLS) — tokens live server-side only.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

function clientCreds() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!id || !secret || !redirectUri) {
    throw new Error(
      "Spotify env vars missing (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REDIRECT_URI)"
    );
  }
  return { id, secret, redirectUri };
}

export function getAuthorizeUrl(state: string) {
  const { id, redirectUri } = clientCreds();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: id,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
  });
  return `${SPOTIFY_ACCOUNTS}/authorize?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>) {
  const { id, secret } = clientCreds();
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) {
    throw new Error(`Spotify token error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function exchangeCodeForTokens(code: string) {
  const { redirectUri } = clientCreds();
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
}

export async function getSpotifyProfile(accessToken: string) {
  const res = await fetch(`${SPOTIFY_API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok ? res.json() : null;
}

export async function saveTokens(
  userId: string,
  tokens: { access_token: string; refresh_token?: string; expires_in?: number; scope?: string },
  profile?: { id?: string; display_name?: string } | null
) {
  const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();
  await admin.from("spotify_accounts").upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scope: tokens.scope ?? null,
      spotify_user_id: profile?.id ?? null,
      display_name: profile?.display_name ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function disconnect(userId: string) {
  await admin.from("spotify_accounts").delete().eq("user_id", userId);
}

// Returns a valid access token for the user, refreshing if needed, or null if
// the user hasn't linked Spotify.
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const { data } = await admin
    .from("spotify_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  const expiresAt = new Date(data.expires_at).getTime();
  // Refresh a minute early to avoid edge-of-expiry failures.
  if (Date.now() < expiresAt - 60_000) return data.access_token;

  const tokens = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: data.refresh_token,
  });

  const update: Record<string, unknown> = {
    access_token: tokens.access_token,
    expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Spotify sometimes returns a rotated refresh token — keep it if present.
  if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;
  if (tokens.scope) update.scope = tokens.scope;

  await admin.from("spotify_accounts").update(update).eq("user_id", userId);
  return tokens.access_token;
}

// Authenticated fetch against the Spotify Web API for a given user.
export async function spotifyFetch(
  userId: string,
  path: string,
  init?: RequestInit
): Promise<Response | null> {
  const token = await getValidAccessToken(userId);
  if (!token) return null;
  return fetch(`${SPOTIFY_API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
