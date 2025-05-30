import getLikedSongs from "@/actions/getLikedSongs";
import { Header } from "@/components/header";
import Image from "next/image";
import { LikedContent } from "./components/liked_content";
import getUser from "@/actions/getUser";
import ShuffleControl from "./components/Controls";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";

export const revalidate = 0 


const LikedPage =  async () => {
    const songs = await getLikedSongs()
    const user = await getUser();
    const currentUser = await getUserById(user?.id as string);
    const avatarImage  = await getImage(currentUser?.avatar_url || "")
return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
        <Header image={avatarImage || ""}>
            <div className="flex flex-col md:flex-row items-center gap-x-5">
                <div className="relative h-32 w-32 lg:h-44 lg:w-44">
                    <Image fill alt="Playlist" className="object-cover" src="/images/liked.png"/>
                </div>
                <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
                    <p className="hidden md:block font-semibold text-sm">
                        Playlist
                    </p>
                    <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">
                        Liked Songs
                    </h1>
                </div>

            </div>
        </Header>
        <ShuffleControl songs={songs}/>
        <div className="h-4"/>
        <LikedContent userId={user?.id} songs={songs}/>
    </div>
)
}


export default LikedPage;