import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAuthorizeUrl } from "@/lib/spotify";

export async function GET() {
  const state = randomUUID();
  const res = NextResponse.redirect(getAuthorizeUrl(state));
  res.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
