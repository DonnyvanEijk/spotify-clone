import getPlaylists from "@/actions/getPlaylists";
import getPublicPlaylists from "@/actions/getPublicPlaylists";
import getUser from "@/actions/getUser";
import {Header} from "@/components/header";
import PlaylistContent from "./components/AlbumContent";

type Props = {
    params: {
        mode: string;
    };
}

const PlaylistListPage = async ({ params }: Props) => {
    const mode = params.mode;
    const myPlaylists = await getPlaylists();
    const publicPlaylists = await getPublicPlaylists();
    const user = await getUser();

    let playlists = publicPlaylists;

    if (mode === 'all') {
        playlists = myPlaylists.concat(publicPlaylists.filter(publicPlaylist => !myPlaylists.some(myPlaylist => myPlaylist.id === publicPlaylist.id)))
    }

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <Header>
                <div className="mb-2">
                    <h1 className="
          text-white
          text-3xl
          font-semibold
          ">
                        Welcome back
                    </h1>
                </div>
            </Header>
            <div className="mt-2 mb-7 px-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-2xl font-semibold mb-2">
                        All Playlists
                    </h1>
                </div>
                <PlaylistContent playlists={playlists} userId={user?.id} />
            </div>
        </div>
    );
}

export default PlaylistListPage;