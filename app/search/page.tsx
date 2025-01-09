import getSongsByTitle from "@/actions/getSongsByTitle";
import { Header } from "@/components/header";
import { SearchInput } from "@/components/search-input";
import {SongSearchContent } from "./components/SongSearchContent";
import getPlaylistsByTitle from "@/actions/getPlaylistsByTitle";
import SearchControls from "./components/SearchControls";
import PlaylistSearchContent from "./components/PlaylistSearchContent";
import getUser from "@/actions/getUser";
import getAlbumsByTitle from "@/actions/getAlbumsByTitle";
import AlbumSearchContent from "./components/AlbumSearchContent";

type Props =  {
    searchParams: {
        title: string;
        type?: string;
    }
}
export const revalidate = 0 

const SearchPage  = async ({searchParams}:Props) => {
    const {title, type} = searchParams;
    let songs = await getSongsByTitle(title);
    let playlists =  await getPlaylistsByTitle(title);
    let albums = await getAlbumsByTitle(title);
    const user = await getUser();


    if(!type) {
        console.log("No params");
        songs = songs.slice(0,7)
        playlists = playlists.slice(0,7)
        albums = albums.slice(0,7)
    }
    return(
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <Header className="from-bg-neutral-900">
                <div className="mb-2 flex flex-col gap-y-6">
                    <h1 className="text-white text-3xl font-semibold">
                        Search
                    </h1>
                    <SearchControls/>
                    <SearchInput/>
                </div>
            </Header>
            {!type && (
                <>
                    <div className="mb-3">
                        <h2 className="text-white text-xl font-semibold px-6">
                            Songs
                        </h2>
                        <SongSearchContent userId={user?.id} songs={songs} />
                    </div>
                    <div className="mb-3">
                        <h2 className="text-white text-xl font-semibold px-6">
                            Playlists
                        </h2>
                        <PlaylistSearchContent userId={user?.id} playlists={playlists} />
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-semibold px-6">
                            Albums
                        </h2>
                        <AlbumSearchContent userId={user?.id} albums={albums} />
                    </div>
                </>
            )}
            {type === 'songs' && (
                <div className="mb-3">
                    <h2 className="text-white text-xl font-semibold px-6">
                        Songs
                    </h2>
                    <SongSearchContent userId={user?.id} songs={songs} />
                </div>
            )}
            {type === 'playlists' && (
                <div className="mb-3">
                    <h2 className="text-white text-xl font-semibold px-6">
                        Playlists
                    </h2>
                    <PlaylistSearchContent userId={user?.id} playlists={playlists} />
                </div>
            )}
             {type === 'albums' && (
                <div>
                    <h2 className="text-white text-xl font-semibold px-6">
                        Albums
                    </h2>
                    <AlbumSearchContent userId={user?.id} albums={albums} />
                </div>
            )}
            <div className="mb-[10vh]"/>
        </div>
    )
}

export default SearchPage;