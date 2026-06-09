import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const key = process.env.GIPHY_KEY;
  if (!key) return NextResponse.json({ error: "GIPHY_KEY not set" }, { status: 500 });

  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(q)}&limit=24&rating=g`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return NextResponse.json({ error: "Giphy error" }, { status: res.status });

  const json = await res.json();

  const results = (json.data ?? []).map((g: any) => ({
    id: g.id,
    title: g.title as string,
    // Small preview for the grid (fixed_height ~200px tall)
    previewUrl: (g.images?.fixed_height_small?.url ?? g.images?.fixed_height?.url ?? "") as string,
    // Direct .gif URL — already handled by your gifDetector
    url: `https://media.giphy.com/media/${g.id}/giphy.gif`,
  }));

  return NextResponse.json({ results });
}
