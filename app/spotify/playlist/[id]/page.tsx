import SpotifyDetail from "../../components/SpotifyDetail";

export default async function SpotifyPlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SpotifyDetail kind="playlist" id={id} />;
}
