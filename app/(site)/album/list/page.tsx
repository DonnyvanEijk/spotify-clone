import PageContent from "./components/AlbumContent";
import getAlbums from "@/actions/getAlbums";
import getUser from "@/actions/getUser";
import { Header } from "@/components/header";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";

export const revalidate = 0;

const AlbumListPage = async () => {
    const userData = await getUser();
    const albumsData = await getAlbums();
    const currentUserData = userData?.id ? await getUserById(userData.id) : null;
    const avatarImage = await getImage(currentUserData?.avatar_url || "");

    return (
        <div className="h-full w-full overflow-hidden overflow-y-auto ">
            <Header image={avatarImage || ""}>
                <div className="mt-20 px-6 md:px-12">
                    <h1 className="text-white text-3xl font-bold">
                        Browse Albums
                    </h1>
                </div>
            </Header>

            <div className="px-6 md:px-12 mt-8 pb-24">
                <PageContent 
                    albums={albumsData || []} 
                    userId={userData?.id} 
                />
            </div>
        </div>
    );
}

export default AlbumListPage;