import getSongsWithLikeCounts from "@/actions/getMostLiked";
import getPlaylistsByUser from "@/actions/getPlaylistsByUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { PlayListList } from "@/components/users/playlists/Playlist-List";
import { SongList } from "@/components/users/songs/SongList";

type Props = {
    params: {
        id: string;
    }
}

const UserPage = async ({ params }: Props) => {
    const user = await getUserById(params.id);
    if (!user) {
        return new Error("User not found");
    }

    const isProfileIncomplete = !user.username || !user.bio;

    if (isProfileIncomplete) {
        return (
            <div className="text-white">
                <Header>
                    <h1 className="text-3xl font-bold">Incomplete Profile</h1>
                    <p className="text-gray-400">This user still needs to complete their profile to proceed.</p>
                </Header>
                <div className="flex flex-col gap-5 items-center mt-10">
                    <p className="text-neutral-400 text-light">No additional information available.</p>
                </div>
            </div>
        );
    }

    const songsWithLikes = await getSongsWithLikeCounts(user.id as string);
    const playlists = await getPlaylistsByUser(user.id as string);

    return (
        <div className="text-white">
            <Header>
                <h1 className="text-3xl font-bold">User overview</h1>
                <p className="text-gray-400">See more of the creator!</p>
            </Header>
            <div className="flex flex-col gap-5 items-center">
                {user.avatar_url && (
                    <img 
                        src={user.avatar_url} 
                        width={200} 
                        height={200} 
                        className="rounded-full" 
                       
                    />
                )}
                <div className="flex flex-col gap-2 items-center">
                    <h2 className="text-2xl font-semibold">{user.username}</h2>
                    <p className="text-neutral-400 text-light">{user.bio}</p>
                </div>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 ml-[4rem] mt-10 m-5 mb-10">
                <SongList songs={songsWithLikes} />
                <PlayListList playlists={playlists} />
            </div>
        </div>
    );
}

export default UserPage;
