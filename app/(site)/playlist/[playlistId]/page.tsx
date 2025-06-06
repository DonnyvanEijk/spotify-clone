import React from "react";
import getPlaylist from "@/actions/getPlaylist";
import {Header} from "@/components/header";
import { getImage } from "@/lib/getImage";
import Image from "next/image";
import getPlaylistSongs from "@/actions/getPlaylistSongs";
import PlaylistContent from "./components/PlaylistContent";
import ShuffleControl from "./components/Controls";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";

export const revalidate = 0;

type Props = {
    params: {
        playlistId: string;
    };
}

const PlaylistPage = async ({ params }: Props) => {
    const user = await getUser();
    const playlistId = params.playlistId;
    const playlist = await getPlaylist(playlistId);
    const imagePath = await getImage(playlist.image_path);
    const songs = await getPlaylistSongs(playlistId);
    const isOwner = user ? playlist.user_id === user.id : false;
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
                        <div className="relative h-32 w-32 lg:h-44 lg:w-44">
                            <Image
                                fill
                                alt="Playlist"
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
                            <p className="hudden md:block font-semibold text-sm">Playlist</p>
                            <h1 className="
                            text-white
                            text-4xl
                            sm:text-5xl
                            lg:text-7xl
                            font-bold
                            ">
                                {playlist.name}
                            </h1>
                            <p className="text-sm">
                                {playlist.description}
                            </p>

                        </div>
                    </div>
                </div>
                <p className="mt-2 text-neutral-400 font-semibold">
                        {songs.length} songs
                </p>
            </Header>
            <ShuffleControl songs={songs} id={playlistId} isOwner={isOwner} />     
            <div className="h-4"/>
            <PlaylistContent songs={songs} PlaylistId={playlistId} isOwner={isOwner} userId={user?.id}/>
        </div>
    );
}

export default PlaylistPage;