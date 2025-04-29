import getCurrentlyFollowing from "@/actions/getCurrentlyFollowing";
import getFollowerAmount from "@/actions/getFollowerAmount";
import getSongsWithLikeCounts from "@/actions/getMostLiked";
import getPlaylistsByUser from "@/actions/getPlaylistsByUser";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { FollowControls } from "@/components/users/FollowControls";

import { PlayListList } from "@/components/users/playlists/Playlist-List";
import { SongList } from "@/components/users/songs/SongList";
import { getImage } from "@/lib/getImage";


type Props = {
    params: {
        id: string;
    }
}

const UserPage = async ({ params }: Props) => {
    const user = await getUserById(params.id);
    const userNOW = await getUser();
    const currentUser = await getUserById(userNOW?.id as string);
    const currentFollows = await getCurrentlyFollowing(userNOW?.id as string);
    const followerAmount = await getFollowerAmount(params.id);
    console.log(currentFollows)
    const avatarImage  = await getImage(currentUser?.avatar_url || "")
    if (!user) {
        return new Error("User not found");
    }

    const isProfileIncomplete = !user.username;

    if (isProfileIncomplete) {
        return (
            <div className="text-white">
                <Header image={avatarImage || ""}>
                    <h1 className="text-3xl font-bold">Incomplete Profile</h1>
                    <p className="text-gray-400">This user still needs to complete their profile to proceed.</p>
                </Header>
                <div className="flex flex-col gap-5 items-center mt-10">
                    <p className="text-neutral-400 text-light">No additional information available.</p>
                </div>
            </div>
        );
    }

    const avatarPath = await getImage(user.avatar_url || "");
    const songsWithLikes = await getSongsWithLikeCounts(user.id as string);
    const playlists = await getPlaylistsByUser(user.id as string);

    return (
        <div className="text-white">
            <Header image={avatarImage || ""}>
                <h1 className="text-3xl font-bold">User overview</h1>
                <p className="text-gray-400">See more of the creator!</p>
            </Header>
            <div className="flex flex-col gap-5 items-center">
                {avatarPath && (
                    <img 
                        src={avatarPath} 
                        width={200} 
                        height={200} 
                        className="rounded-full object-cover aspect-square" 
                        alt="User Avatar"
                    />
                )}
                <div className="flex flex-col gap-2 items-center">
                    <h2 className="text-2xl font-semibold">{user.username}</h2>
                    <p className="text-neutral-400 text-light">{user.bio}</p>
                    <p className="text-neutral-400 text-light">Followers: {followerAmount}</p>
                </div>
                { currentUser?.id !== user.id && (
                    <FollowControls 
                        userId={currentUser?.id || ""} 
                        followingId={params.id} 
                        isInitiallyFollowing={currentFollows.some(follow => follow.followed_id === params.id)}
                    />
                )}
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 ml-[4rem] mt-10 m-5 mb-10">
                <SongList songs={songsWithLikes} />
                <PlayListList playlists={playlists} />
            </div>
        </div>
    );
}

export default UserPage;
