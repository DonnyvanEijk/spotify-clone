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
  searchParams: {
    title: string;
    type?: string;
  };
};

export const revalidate = 0;

const SearchPage = async ({ searchParams }: Props) => {
  const { title, type } = searchParams;

  let songs = await getSongsByTitle(title);
  let playlists = await getPlaylistsByTitle(title);
  let albums = await getAlbumsByTitle(title);
  const user = await getUser();
  const currentUser = await getUserById(user?.id as string);
  const avatarImage = await getImage(currentUser?.avatar_url || "");

  if (!type) {
    songs = songs.slice(0, 7);
    playlists = playlists.slice(0, 7);
    albums = albums.slice(0, 7);
  }

  return (
    <div className="relative h-full w-full overflow-hidden overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-5 pointer-events-none" />

      <Header image={avatarImage || ""} className="from-bg-neutral-900">
        <div className="mb-4 flex flex-col gap-y-6">
          <h1 className="text-white text-4xl font-bold tracking-tight drop-shadow-lg">
            Search
          </h1>
          <div className="flex flex-col gap-4">
            <SearchControls />
            <SearchInput />
          </div>
        </div>
      </Header>


      <div className="px-6 pb-24">
        {!type && (
          <div className="flex flex-col gap-y-10">

            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
              <h2 className="text-white text-2xl font-semibold mb-4 w-full">Songs</h2>
              <SongSearchContent userId={user?.id} songs={songs} />
            </section>

            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
              <h2 className="text-white text-2xl font-semibold mb-4">Playlists</h2>
              <PlaylistSearchContent userId={user?.id} playlists={playlists} />
            </section>

            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
              <h2 className="text-white text-2xl font-semibold mb-4">Albums</h2>
              <AlbumSearchContent userId={user?.id} albums={albums} />
            </section>
          </div>
        )}

        {type === "songs" && (
          <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg mt-6">
            <h2 className="text-white text-2xl font-semibold mb-4">Songs</h2>
            <SongSearchContent userId={user?.id} songs={songs} />
          </section>
        )}

        {type === "playlists" && (
          <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg mt-6">
            <h2 className="text-white text-2xl font-semibold mb-4">Playlists</h2>
            <PlaylistSearchContent userId={user?.id} playlists={playlists} />
          </section>
        )}

        {type === "albums" && (
          <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg mt-6">
            <h2 className="text-white text-2xl font-semibold mb-4">Albums</h2>
            <AlbumSearchContent userId={user?.id} albums={albums} />
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
