import React from "react";
import getAlbum from "@/actions/getAlbum";

import { getImage } from "@/lib/getImage";
import Image from "next/image";
import getAlbumSongs from "@/actions/getAlbumSongs";
import AlbumContent from "./components/AlbumContent";
import ShuffleControl from "./components/Controls";
import getUser from "@/actions/getUser";
import { Header } from "@/components/header";
import { getUserById } from "@/actions/getUsers";

export const revalidate = 0;

type Props = {
    params: {
        albumId: string;
    };
}

const AlbumPage = async ({ params }: Props) => {
    const user = await getUser();
    const albumId = params.albumId;
    const album = await getAlbum(albumId);
    console.log("Album: " +JSON.stringify(album))
    const imagePath = await getImage(album.image_path);
    console.log("path: " + imagePath)
    const songs = await getAlbumSongs(albumId);
    const isOwner = user ? album.user_id === user.id : false;
    const currentUserData = await getUserById(user?.id as string);
    const avatarImage  = await getImage(currentUserData?.avatar_url || "")

    return (
        <div
            className="
        bg-neutral-900
        rounded-lg
        h-full
        w-full
        overflow-hidden
        overflow-y-auto
        "
        >
            <Header image={avatarImage || ""}>
                <div
                    className="mt-20"
                >
                    <div
                        className="
                    flex
                    flex-col
                    md:flex-row
                    gap-x-5
                    "
                    >
                        <div className="relative h-32 w-32 lg:h-44 lg:w-44 flex-shrink-0 min-w-[8rem] lg:min-w-[11rem]">
                            <Image
                                fill
                                alt="Album"
                                className="object-cover"
                                src={imagePath || '/images/liked.png'}
                            />
                        </div>
                        <div
                            className="
                        flex
                        flex-col
                        gap-y-2
                        mt-4
                        md:mt-0
                        "
                        >
                            <p className="hudden md:block font-semibold text-sm">Album</p>
                            <h1 className="
                            text-white
                            text-4xl
                            sm:text-5xl
                            lg:text-7xl
                            font-bold
                            ">
                                {album.name}
                            </h1>
                            <p className="text-sm">
                                By {album.author}
                            </p>

                        </div>
                    </div>
                </div>
                <p className="mt-2 text-neutral-400 font-semibold">
                        {songs.length} songs
                </p>
            </Header>
            <ShuffleControl songs={songs} isOwner={isOwner} albumId={albumId} />
            <div className="h-4"/>
            <AlbumContent songs={songs} AlbumId={albumId} isOwner={isOwner} userId={user?.id} />
            <div className="mb-[10vh]"/>
        </div>
    );
}

export default AlbumPage;