import getSongsByTitle from "@/actions/getSongsByTitle";
import { Header } from "@/components/header";
import { SearchInput } from "@/components/search-input";
import { SongSearchContent } from "./components/SongSearchContent";
import getPlaylistsByTitle from "@/actions/getPlaylistsByTitle";
import SearchControls from "./components/SearchControls";
import PlaylistSearchContent from "./components/PlaylistSearchContent";
import getUser from "@/actions/getUser";
import getAlbumsByTitle from "@/actions/getAlbumsByTitle";
import AlbumSearchContent from "./components/AlbumSearchContent";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";

type Props = {
  searchParams: Promise<{
    title: string;
    type?: string;
  }>;
};

export const revalidate = 0;

const SearchPage = async ({ searchParams }: Props) => {
  const { title, type } = await searchParams;

  let songs = await getSongsByTitle(title);
  let playlists = await getPlaylistsByTitle(title);
  let albums = await getAlbumsByTitle(title);
  const user = await getUser();
  const currentUser = user?.id ? await getUserById(user.id) : null;
  const avatarImage = await getImage(currentUser?.avatar_url || "");

  if (!type) {
    songs = songs.slice(0, 7);
    playlists = playlists.slice(0, 7);
    albums = albums.slice(0, 7);
  }

  return (
    <div className="relative h-full w-full overflow-hidden overflow-y-auto">
      <Header image={avatarImage || ""}>
        <div className="mb-4 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">Search</h1>
          <div className="flex flex-col gap-3">
            <SearchInput />
            <SearchControls />
          </div>
        </div>
      </Header>

      <div className="px-6 pb-24">
        {(!type || type === "songs") && (
          <section className="mb-8">
            <h2 className="text-white text-xl font-semibold mb-3">Songs</h2>
            <SongSearchContent userId={user?.id} songs={songs} />
          </section>
        )}

        {(!type || type === "playlists") && (
          <section className="mb-8">
            <h2 className="text-white text-xl font-semibold mb-3">Playlists</h2>
            <PlaylistSearchContent userId={user?.id} playlists={playlists} />
          </section>
        )}

        {(!type || type === "albums") && (
          <section className="mb-8">
            <h2 className="text-white text-xl font-semibold mb-3">Albums</h2>
            <AlbumSearchContent userId={user?.id} albums={albums} />
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
