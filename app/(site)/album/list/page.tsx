

import { useEffect, useState } from "react";
import PageContent from "./components/AlbumContent";
import getAlbums from "@/actions/getAlbums";
import getUser from "@/actions/getUser";
import { Header } from "@/components/header";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";

const AlbumListPage = async() => {
  


    
        const userData = await getUser();
        const albumsData = await getAlbums();
        const currentUserData = await getUserById(userData?.id as string);
        const avatarImage  = await getImage(currentUserData?.avatar_url || "")
        


    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <Header image={avatarImage || ""}>
                <div className="mb-2">
                    <h1 className="text-white text-3xl font-semibold">
                        Welcome back
                    </h1>
                </div>
            </Header>
            <div  className="mt-2 mb-[10vh] px-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-2xl font-semibold mb-2">
                        All Albums
                    </h1>
                </div>
                <PageContent albums={albumsData} userId={userData?.id} />
            </div>
        </div>
    );
}

export default AlbumListPage;
