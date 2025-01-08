"use client"

import PageContent from "./components/AlbumContent";
import getAlbums from "@/actions/getAlbums";
import getUser from "@/actions/getUser";
import { Header } from "@/components/header";

const AlbumListPage = async () => {
    const albums = await getAlbums();
    const user = await getUser();

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
                        All Albums
                    </h1>
                </div>
                <PageContent albums={albums} userId={user?.id}/>
            </div>
        </div>
    );
}

export default AlbumListPage;