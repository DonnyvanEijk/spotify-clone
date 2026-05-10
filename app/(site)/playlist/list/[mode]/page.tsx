import getPlaylists from "@/actions/getPlaylists";
import getPublicPlaylists from "@/actions/getPublicPlaylists";
import getUser from "@/actions/getUser";
import { Header } from "@/components/header";
import PlaylistContent from "./components/AlbumContent";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";

type Props = {
    params: Promise<{
        mode: string;
    }>;
}

const PlaylistListPage = async ({ params }: Props) => {
    const { mode } = await params;
    const myPlaylists = await getPlaylists();
    const publicPlaylists = await getPublicPlaylists();
    const user = await getUser();
    const currentUserData = user?.id ? await getUserById(user.id) : null;
    const avatarImage = await getImage(currentUserData?.avatar_url || "");

    let playlists = publicPlaylists;

    if (mode === 'all') {
        // Merge playlists and remove duplicates
        playlists = [
            ...myPlaylists,
            ...publicPlaylists.filter(pub => !myPlaylists.some(my => my.id === pub.id))
        ];
    }

    return (
        <div className="h-full w-full overflow-hidden overflow-y-auto ">
            <Header image={avatarImage || ""}>
                <div className="mt-20 px-6 md:px-12">
                    <h1 className="text-white text-3xl font-bold">
                        {mode === 'all' ? 'Discovery' : 'Public Playlists'}
                    </h1>
                </div>
            </Header>

            <div className="px-6 md:px-12 mt-8 pb-24">
                <PlaylistContent 
                    playlists={playlists} 
                    userId={user?.id} 
                    mode={mode}
                />
            </div>
        </div>
    );
}

export default PlaylistListPage;