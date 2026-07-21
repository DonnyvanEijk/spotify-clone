import SpotifyDetail from "../../components/SpotifyDetail";

export default async function SpotifyAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SpotifyDetail kind="album" id={id} />;
}
